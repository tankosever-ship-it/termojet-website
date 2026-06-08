/*
 * apply-tbe.js — #2: насоси серії TBE (інлайн з частотним керуванням, постійний тиск).
 * Дані з «каталог 2.pdf» (Termojet TBE Series). Ціни (EUR) з прайсу 2026-06-08: 1921/2371/2524.
 * Ідемпотентно: seed + жива БД.
 *   node backend/scripts/apply-tbe.js
 *   docker compose exec -T app node backend/scripts/apply-tbe.js
 */
const path = require('path')
const fs = require('fs')
const SEED = path.join(__dirname, '..', 'seed-products.json')
const DBP = path.join(__dirname, '..', 'data', 'termojet.db')
const IMG = '/images/nasosy/tbe.jpg'

const COMMON = {
  'Тип': 'вертикальний інлайн, знімний блок',
  'Керування': 'вбудований частотний перетворювач (постійний тиск)',
  'Живлення': '380 В / 50 Гц (3-фазне)',
  'Оберти': '2900 об/хв',
  'Макс. тиск системи': '16 бар (1,6 МПа)',
  'Температура середовища': '0…+120 °C',
  'pH середовища': '5–9',
}
function desc(model, dn, kw, qmax, hmax, qrat, hrat) {
  return `Насос Termojet ${model} — вертикальний інлайн-насос «backpack» типу зі знімним блоком та вбудованим частотним перетворювачем для систем підтримання постійного тиску водопостачання. Вхід і вихід розташовані на одній осі (inline), що спрощує монтаж у трубопровід; плавне регулювання обертів забезпечує економію електроенергії та стабільний тиск незалежно від водорозбору. Підходить для чистої, неагресивної, невибухонебезпечної води. Підключення DN${dn}, фланець PN16. Потужність ${kw} кВт, живлення 380 В/50 Гц, 2900 об/хв. Робоча точка ≈ ${qrat} м³/год при напорі ${hrat} м (подача до ${qmax} м³/год, напір до ${hmax} м). Макс. тиск системи 16 бар, температура середовища 0–120 °C (pH 5–9).`
}
function specs(dn, kw, qmax, hmax, qrat, hrat) {
  return {
    ...COMMON,
    'Потужність': `${kw} кВт`,
    'Підключення': `DN${dn}, фланець PN16`,
    'Подача (макс.)': `${qmax} м³/год`,
    'Напір (макс.)': `${hmax} м`,
    'Робоча точка': `${qrat} м³/год @ ${hrat} м`,
  }
}

// model, dn, kw, qmax, hmax, qrat, hrat, price(EUR)
const ROWS = [
  ['TBE 50-24/2', 50, 3,   35, 28, 25, 24, 1921],
  ['TBE 50-36/2', 50, 5.5, 40, 42, 30, 36, 2371],
  ['TBE 65-34/2', 65, 7.5, 60, 40, 50, 34, 2524],
]

const NEW = ROWS.map(([model, dn, kw, qmax, hmax, qrat, hrat, price]) => {
  const slug = 'nasos-termojet-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return {
    id: 'new_' + model.replace(/[^A-Za-z0-9]/g, ''), wpId: null,
    name: `Насос інлайн з частотним керуванням Termojet ${model} (${kw} кВт)`,
    slug, sku: model,
    price: String(price), currency: 'EUR',
    categorySlug: 'nasosy', subcategory: 'Інлайн з частотним керуванням',
    image: IMG, images: [IMG],
    shortDesc: `Вертикальний інлайн-насос з частотним керуванням, DN${dn}, ${kw} кВт, до ${qmax} м³/год / ${hmax} м. Постійний тиск.`,
    description: desc(model, dn, kw, qmax, hmax, qrat, hrat),
    specs: specs(dn, kw, qmax, hmax, qrat, hrat),
    inStock: true, features: [],
  }
})

// ---------- seed ----------
const raw = JSON.parse(fs.readFileSync(SEED, 'utf8'))
const arr = Array.isArray(raw) ? raw : raw.products
const byId = new Map(arr.map(p => [p.id, p]))
let added = 0, upd = 0
for (const np of NEW) {
  if (byId.has(np.id)) { Object.assign(byId.get(np.id), np); upd++ }
  else { arr.push(np); byId.set(np.id, np); added++ }
}
fs.writeFileSync(SEED, JSON.stringify(Array.isArray(raw) ? arr : raw, null, 2) + '\n')
console.log(`seed: додано ${added}, оновлено ${upd}`)

// ---------- жива БД ----------
if (!fs.existsSync(DBP)) { console.log('БД немає — пропуск'); process.exit(0) }
const Database = require('better-sqlite3')
const db = new Database(DBP)
const tx = db.transaction(() => {
  const ins = db.prepare(`INSERT INTO products (id, wp_id, name, slug, sku, price, currency, category_slug, subcategory,
      image, images, short_desc, description, specs, features, in_stock, is_visible)
      VALUES (@id,@wp_id,@name,@slug,@sku,@price,@currency,@category_slug,@subcategory,@image,@images,
      @short_desc,@description,@specs,@features,1,1)`)
  const updt = db.prepare(`UPDATE products SET name=@name, slug=@slug, sku=@sku, price=@price, currency=@currency,
      category_slug=@category_slug, subcategory=@subcategory, image=@image, images=@images,
      short_desc=@short_desc, description=@description, specs=@specs, features=@features WHERE id=@id`)
  for (const np of NEW) {
    const pl = {
      id: np.id, wp_id: np.wpId, name: np.name, slug: np.slug, sku: np.sku,
      price: parseFloat(np.price) || 0, currency: np.currency, category_slug: np.categorySlug, subcategory: np.subcategory,
      image: np.image, images: JSON.stringify(np.images), short_desc: np.shortDesc,
      description: np.description, specs: JSON.stringify(np.specs), features: JSON.stringify(np.features),
    }
    if (db.prepare('SELECT id FROM products WHERE id=?').get(np.id)) updt.run(pl)
    else ins.run(pl)
  }
})
tx()
db.close()
console.log('БД оновлено. Готово.')
