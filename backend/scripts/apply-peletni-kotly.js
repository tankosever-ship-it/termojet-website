/*
 * apply-peletni-kotly.js — пелетний котел Termojet Ignis Pro 15 Plus у категорію «Пелетні котли».
 * Ідемпотентний, за замовчуванням лише показує. Пише і в seed, і в живу БД.
 *
 *   попередній перегляд:  docker compose exec -T app node backend/scripts/apply-peletni-kotly.js
 *   застосувати:          docker compose exec -T app node backend/scripts/apply-peletni-kotly.js --apply
 *   прибрати картку:      docker compose exec -T app node backend/scripts/apply-peletni-kotly.js --remove --apply
 *
 * ЗВІДКИ ДАНІ. Характеристики й тексти — з інструкції (64 стор.) і брошури A4,
 * зібраних у `~/CODE/pipelines/manuals/ignis-pro-15/`; числа там зведені з протоколів
 * випробувань ZETOM Katowice B/2026/507K і B/2026/509K. Виробник — KHT GLOBAL Sp. z o.o.
 * (Кляй, Польща), у назві моделі марки виробника немає (рішення власника 11.09.2026).
 *
 * РІШЕННЯ ВЛАСНИКА 11.09.2026: заводимо лише виконання Plus (Side Load — коли буде
 * попит і артикул), ціна 139 000 грн, категорія передостання — перед «Акція».
 *
 * Ціна в UAH, а не в EUR: так на сторінці стоїть рівно 139 000 ₴ незалежно від курсу.
 * Зворотний бік — котел імпортний, тож при зміні євро цю цифру доведеться правити руками.
 *
 * У прайс для партнерів котел НЕ йде: артикул у `PRICE_EXCLUDE` в
 * `pipelines/price/generate.py`. У фіди Merchant — йде (`CAT` і `GPC` у merchant.js).
 *
 * Переклади вкладені в дані (6 мов) і кладуться в колонку `i18n` разом зі штампом
 * `_srcHash` — таким самим, як рахує translate-content.js. Без штампа наступний
 * прогін перекладача вважав би рядок неперекладеним і перетер би ручний переклад.
 *
 * У seed-products.json i18n НЕ пишеться: у seed такого поля немає, переклади
 * живуть лише в колонці БД.
 */
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

const APPLY = process.argv.includes('--apply')
const REMOVE = process.argv.includes('--remove')

const SEED = path.join(__dirname, '..', 'seed-products.json')
const DBP = process.env.TERMOJET_DB || path.join(__dirname, '..', 'data', 'termojet.db')
const DATA = path.join(__dirname, 'peletni-kotly-data.json')

const products = JSON.parse(fs.readFileSync(DATA, 'utf8'))

// Штамп _srcHash рахуємо точно так, як translate-content.js: непорожні UA-поля
// в порядку ENTITIES.products.fields, лише значення, sha256 → перші 16 символів.
const HASH_FIELDS = ['name', 'short_desc', 'description', 'specs', 'seo_title',
                     'meta_description', 'subcategory']
function srcHash(row) {
  const src = {}
  for (const key of HASH_FIELDS) {
    const raw = row[key]
    if (raw == null || raw === '' || raw === '{}' || raw === '[]') continue
    src[key] = raw
  }
  return crypto.createHash('sha256').update(JSON.stringify(src)).digest('hex').slice(0, 16)
}

for (const p of products) {
  const langs = Object.keys(p.i18n || {})
  console.log(`  ${REMOVE ? 'ПРИБРАТИ' : 'ДОДАТИ'}: ${p.sku}  ${p.name}`)
  console.log(`      ${p.price} ${p.currency} · ${p.categorySlug} · /catalog/${p.categorySlug}/${p.slug}`)
  if (!REMOVE) {
    console.log(`      фото: ${[p.image, ...(p.images || []).slice(1)].join(', ')}`)
    console.log(`      переклади: ${langs.length ? langs.join(', ') : 'НЕМАЄ'}`)
    for (const f of [p.image, ...(p.images || [])]) {
      const disk = path.join(__dirname, '..', '..', 'public', f.replace(/^\//, ''))
      if (!fs.existsSync(disk)) console.log(`      ⚠️  немає файлу ${f} (у контейнері це норма — фото вже в dist)`)
    }
  }
}

if (!APPLY) {
  console.log('\nЦе лише показ. Щоб записати: додай --apply')
  process.exit(0)
}

// ---------- 1. seed-products.json ----------
const raw = JSON.parse(fs.readFileSync(SEED, 'utf8'))
const arr = Array.isArray(raw) ? raw : raw.products
const byId = new Map(arr.map(p => [p.id, p]))

let added = 0, updated = 0, dropped = 0
for (const np of products) {
  if (REMOVE) {
    const i = arr.findIndex(p => p.id === np.id)
    if (i >= 0) { arr.splice(i, 1); dropped++ }
    continue
  }
  const { i18n, ...seedRow } = np           // у seed перекладів немає
  if (byId.has(np.id)) { Object.assign(byId.get(np.id), seedRow); updated++ }
  else { arr.push(seedRow); byId.set(np.id, seedRow); added++ }
}
fs.writeFileSync(SEED, JSON.stringify(Array.isArray(raw) ? arr : raw, null, 2) + '\n')
console.log(`seed: нових ${added}, оновлено ${updated}, прибрано ${dropped}`)

// ---------- 2. жива БД ----------
if (!fs.existsSync(DBP)) { console.log('БД немає — далі нічого не роблю'); process.exit(0) }
const Database = require('better-sqlite3')
const db = new Database(DBP)

const ins = db.prepare(`INSERT INTO products (id, wp_id, name, slug, sku, price, currency,
    category_slug, subcategory, image, images, short_desc, description, specs, features,
    in_stock, is_visible, seo_title, meta_description)
    VALUES (@id,@wp_id,@name,@slug,@sku,@price,@currency,@category_slug,@subcategory,@image,
    @images,@short_desc,@description,@specs,@features,@in_stock,@is_visible,@seo_title,@meta_description)`)
const updt = db.prepare(`UPDATE products SET name=@name, slug=@slug, sku=@sku, price=@price,
    currency=@currency, category_slug=@category_slug, subcategory=@subcategory, image=@image,
    images=@images, short_desc=@short_desc, description=@description, specs=@specs,
    features=@features, in_stock=@in_stock, is_visible=@is_visible, seo_title=@seo_title,
    meta_description=@meta_description WHERE id=@id`)
const del = db.prepare('DELETE FROM products WHERE id = ?')
const selI18n = db.prepare('SELECT id, i18n FROM products WHERE id = ?')
const updI18n = db.prepare('UPDATE products SET i18n = ? WHERE id = ?')

const tx = db.transaction(() => {
  for (const np of products) {
    if (REMOVE) {
      const r = del.run(np.id)
      console.log(`  ${r.changes ? 'видалено' : 'у БД не було'}: ${np.sku}`)
      continue
    }
    const pl = {
      id: np.id, wp_id: np.wpId ?? null, name: np.name, slug: np.slug, sku: np.sku,
      price: parseFloat(np.price) || 0, currency: np.currency || 'UAH',
      category_slug: np.categorySlug, subcategory: np.subcategory || '',
      image: np.image, images: JSON.stringify(np.images || []),
      short_desc: np.shortDesc || '', description: np.description || '',
      specs: JSON.stringify(np.specs || {}), features: JSON.stringify(np.features || []),
      in_stock: np.inStock === false ? 0 : 1,
      is_visible: np.isVisible === false ? 0 : 1,
      seo_title: np.seoTitle || '', meta_description: np.metaDescription || '',
    }
    const exists = db.prepare('SELECT id FROM products WHERE id = ?').get(np.id)
    if (exists) { updt.run(pl); console.log(`  оновлено: ${np.sku}`) }
    else { ins.run(pl); console.log(`  додано: ${np.sku}`) }

    // переклади + штамп під поточне UA-джерело
    const row = selI18n.get(np.id)
    let i18n = {}
    try { i18n = JSON.parse(row.i18n || '{}') } catch { i18n = {} }
    const h = srcHash({ name: pl.name, short_desc: pl.short_desc, description: pl.description,
                        specs: pl.specs, seo_title: pl.seo_title,
                        meta_description: pl.meta_description, subcategory: pl.subcategory })
    i18n._srcHash = i18n._srcHash || {}
    for (const [lang, fields] of Object.entries(np.i18n || {})) {
      // specs у i18n лежать ОБ'ЄКТОМ, не рядком JSON. Рядок не падає з помилкою:
      // withI18n віддає його як є, а ProductDetailPage робить Object.entries() —
      // і таблиця характеристик розсипається на рядок НА КОЖЕН СИМВОЛ. Саме це
      // сталося з румунською в усіх 343 товарах (виправлено 08.09.2026).
      i18n[lang] = Object.assign({}, i18n[lang], fields)
      i18n._srcHash[lang] = h
    }
    updI18n.run(JSON.stringify(i18n), np.id)
    console.log(`      i18n: ${Object.keys(np.i18n || {}).join(', ')} (hash ${h})`)
  }
})
tx()
db.close()
console.log('\n✅ готово')
