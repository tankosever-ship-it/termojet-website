/*
 * apply-k42n-150-300.js — додає відсутній колектор К42Н.150(300) (4+1 вниз), sku 84040463.
 * Ідемпотентно: seed + жива БД. Ціна = ідентичного К42В.150(300) (В/Н парність цін).
 *   node backend/scripts/apply-k42n-150-300.js
 *   docker compose exec -T app node backend/scripts/apply-k42n-150-300.js
 */
const path = require('path')
const fs = require('fs')
const SEED = path.join(__dirname, '..', 'seed-products.json')
const DBP = path.join(__dirname, '..', 'data', 'termojet.db')

const P = {
  id: 'new_84040463', wpId: null,
  name: 'К42Н.150(300) Колектор в теплоізоляції 4+1 вниз',
  slug: 'kolektor-k42n-150-300', sku: '84040463',
  price: '16695.42', currency: 'UAH',
  categorySlug: 'rozpodilchi-kolektory', subcategory: '',
  image: 'https://termojet.com.ua/wp-content/uploads/2023/08/dsc_0598-scaled.jpg',
  images: ['https://termojet.com.ua/wp-content/uploads/2023/08/dsc_0598-scaled.jpg'],
  shortDesc: 'Розподільчий колектор у теплоізоляції 4+1 з виходами вниз, міжосьова 150 мм, до 350 кВт.',
  description: 'Розподільчий колектор К42Н.150(300) з виходами вниз для котелень використовується в системах опалення, де потрібно розподілити теплоносій на декілька споживачів тепла з різними параметрами. Міжосьова відстань приєднувальних патрубків контурів — 150 мм. Кронштейни кріплення в комплекті.',
  specs: {
    'Артикул': '84040463',
    'Кількість виходів': '4+1',
    'Qmax: △Т=10°С': '175 кВт',
    'Qmax: △Т=20°С': '350 кВт',
    'Gmax': '17,5 м³/год',
    'Підключення котла': '2″',
    'Підключення контура опалення': '1 ¼”',
  },
  inStock: true, features: [],
}

// ---------- seed ----------
const raw = JSON.parse(fs.readFileSync(SEED, 'utf8'))
const arr = Array.isArray(raw) ? raw : raw.products
const byId = new Map(arr.map(p => [p.id, p]))
let added = 0
if (byId.has(P.id)) Object.assign(byId.get(P.id), P)
else { arr.push(P); added++ }
fs.writeFileSync(SEED, JSON.stringify(Array.isArray(raw) ? arr : raw, null, 2) + '\n')
console.log(`seed: ${added ? 'додано' : 'оновлено'} К42Н.150(300)`)

// ---------- жива БД ----------
if (!fs.existsSync(DBP)) { console.log('БД немає — пропуск'); process.exit(0) }
const Database = require('better-sqlite3')
const db = new Database(DBP)
const pl = {
  id: P.id, wp_id: P.wpId, name: P.name, slug: P.slug, sku: P.sku,
  price: parseFloat(P.price) || 0, currency: P.currency, category_slug: P.categorySlug, subcategory: P.subcategory,
  image: P.image, images: JSON.stringify(P.images), short_desc: P.shortDesc,
  description: P.description, specs: JSON.stringify(P.specs), features: JSON.stringify(P.features),
}
if (db.prepare('SELECT id FROM products WHERE id=?').get(P.id)) {
  db.prepare(`UPDATE products SET name=@name,slug=@slug,sku=@sku,price=@price,currency=@currency,
    category_slug=@category_slug,subcategory=@subcategory,image=@image,images=@images,
    short_desc=@short_desc,description=@description,specs=@specs,features=@features,in_stock=1,is_visible=1 WHERE id=@id`).run(pl)
  console.log('БД: оновлено')
} else {
  db.prepare(`INSERT INTO products (id,wp_id,name,slug,sku,price,currency,category_slug,subcategory,
    image,images,short_desc,description,specs,features,in_stock,is_visible)
    VALUES (@id,@wp_id,@name,@slug,@sku,@price,@currency,@category_slug,@subcategory,
    @image,@images,@short_desc,@description,@specs,@features,1,1)`).run(pl)
  console.log('БД: додано')
}
db.close()
console.log('Готово.')
