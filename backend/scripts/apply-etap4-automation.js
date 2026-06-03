/*
 * apply-etap4-automation.js — Етап 4 автоматика (ідемпотентно: seed + жива БД).
 *   #10 — кращі описи/характеристики LIGHT (i-2 PLUS) і PROFI PLUS (i-3 PLUS) з даних TECH.
 *   #9  — нові товари: Termojet One (i-1m) і Wi-Fi RS. Ціна «по запиту» (0) — уточнити пізніше.
 *
 *   Локально:  node backend/scripts/apply-etap4-automation.js
 *   Прод:      docker compose exec -T app node backend/scripts/apply-etap4-automation.js
 */
const path = require('path')
const fs = require('fs')
const SEED = path.join(__dirname, '..', 'seed-products.json')
const DBP = path.join(__dirname, '..', 'data', 'termojet.db')

// ── #10: оновлення наявних ──
const UPDATES = {
  'wp_9024': { // LIGHT
    description: 'Автоматика котельні Termojet LIGHT (на базі контролера TECH i-2 PLUS) — погодозалежний контролер для одночасного керування двома опалювальними контурами зі змішувальними клапанами (наприклад, тепла підлога та радіатори) і контуром ГВС. Підтримує двосторонній зв’язок із газовим котлом по OpenTherm 4.0 (модуляція потужності та економія палива), тижневе програмування, роботу з кімнатними термостатами по шині RS і комплект зовнішнього та внутрішнього датчиків. Розширюється модулем Termojet One (додатковий змішувальний контур) та інтернет-модулем Termojet Wi-Fi RS для керування зі смартфона.',
    specs: {
      'Кількість контурів': '2 (зі змішувачами) + ГВС',
      'Базовий контролер': 'TECH i-2 PLUS',
      'Зв’язок з котлом': 'OpenTherm 4.0',
      'Управління': 'погодозалежне + тижневе',
      'Кімнатні термостати': 'по шині RS',
      'Розширення': 'Termojet One, Wi-Fi RS',
      'Живлення': '230 В / 50 Гц',
      'Клас захисту': 'IP30',
    },
  },
  'wp_9025': { // PROFI PLUS
    description: 'Автоматика котельні Termojet PROFI PLUS (на базі контролера TECH i-3 PLUS) — погодозалежний контролер для керування трьома змішувальними клапанами та контуром ГВС. Великий LCD-дисплей з відображенням усіх параметрів установки, підтримка двох джерел тепла й сонячних колекторів, зв’язок із котлом по OpenTherm 4.0, керування додатковими пристроями (насоси контурів без клапана, освітлення тощо). Розширюється модулями Termojet One (додаткові змішувальні контури) та інтернет-модулем Termojet Wi-Fi RS.',
    specs: {
      'Кількість контурів': '3 (зі змішувачами) + ГВС',
      'Базовий контролер': 'TECH i-3 PLUS',
      'Зв’язок з котлом': 'OpenTherm 4.0',
      'Джерела тепла': 'до 2 + сонячні колектори',
      'Дисплей': 'LCD (усі параметри)',
      'Розширення': 'Termojet One, Wi-Fi RS',
      'Живлення': '230 В / 50 Гц',
      'Клас захисту': 'IP30',
    },
  },
}

// ── #9: нові товари (ціна 0 = «по запиту») ──
const NEW = [
  {
    id: 'new_termojet_one', wpId: null,
    name: 'Контролер змішувального клапана Termojet One',
    slug: 'modul-rozshyrennya-termojet-one', sku: 'TJ-ONE',
    price: '0', currency: 'EUR', categorySlug: 'avtomatyka', subcategory: '',
    image: 'https://termojet.com.ua/wp-content/uploads/2023/08/module-rs-1.webp',
    images: ['https://termojet.com.ua/wp-content/uploads/2023/08/module-rs-1.webp'],
    shortDesc: 'Модуль додаткового змішувального контуру для автоматики Termojet Light/Profi Plus.',
    description: 'TERMOJET One (на базі TECH i-1m) — модуль розширення для автоматики Termojet Light та Profi Plus, що керує додатковим три- або чотириходовим змішувальним клапаном і циркуляційним насосом контуру в погодозалежному режимі. Підключається до основного контролера по шині RS. У комплекті — датчики температури подачі котла, зворотної лінії, зовнішній та датчик подачі регульованого контуру.',
    specs: {
      'Призначення': 'додатковий змішувальний контур',
      'Сумісність': 'Termojet Light / Profi Plus',
      'Тип клапана': '3- або 4-ходовий',
      'Зв’язок': 'шина RS',
      'Базовий модуль': 'TECH i-1m',
    },
    inStock: true, features: [],
  },
  {
    id: 'new_termojet_wifi_rs', wpId: null,
    name: 'Інтернет-модуль Termojet Wi-Fi RS',
    slug: 'modul-termojet-wi-fi-rs', sku: 'TJ-WIFI-RS',
    price: '0', currency: 'EUR', categorySlug: 'avtomatyka', subcategory: '',
    image: 'https://termojet.com.ua/wp-content/uploads/2023/08/unnamed-file-768x576.jpg',
    images: ['https://termojet.com.ua/wp-content/uploads/2023/08/unnamed-file-768x576.jpg'],
    shortDesc: 'Інтернет-модуль для дистанційного керування котельнею Termojet зі смартфона.',
    description: 'TERMOJET Wi-Fi RS (на базі TECH WiFi RS) — об’єднане рішення інтернет-модуля та контролера для дистанційного керування системою опалення через мобільний застосунок. Дозволяє змінювати налаштування котла, переглядати графічну схему роботи, історію температур та аварій. Підключається до блоку керування кабелем RS і працює як зі старими, так і з новими контролерами Termojet.',
    specs: {
      'Призначення': 'дистанційне керування через інтернет',
      'Підключення': 'кабель RS',
      'Зв’язок': 'Wi-Fi',
      'Інтерфейс': 'мобільний застосунок',
      'Базовий модуль': 'TECH WiFi RS',
    },
    inStock: true, features: [],
  },
]

// ---------- 1. seed-products.json ----------
const raw = JSON.parse(fs.readFileSync(SEED, 'utf8'))
const arr = Array.isArray(raw) ? raw : raw.products
const byId = new Map(arr.map(p => [p.id, p]))

let upd = 0
for (const [id, patch] of Object.entries(UPDATES)) {
  const p = byId.get(id)
  if (p) { Object.assign(p, patch); upd++ }
}
let added = 0
for (const np of NEW) {
  if (byId.has(np.id)) { Object.assign(byId.get(np.id), np) }
  else { arr.push(np); byId.set(np.id, np); added++ }
}
fs.writeFileSync(SEED, JSON.stringify(Array.isArray(raw) ? arr : raw, null, 2) + '\n')
console.log(`seed: оновлено ${upd}, додано ${added}`)

// ---------- 2. жива БД ----------
if (!fs.existsSync(DBP)) { console.log('БД немає — пропуск'); process.exit(0) }
const Database = require('better-sqlite3')
const db = new Database(DBP)
const tx = db.transaction(() => {
  const u = db.prepare('UPDATE products SET description=?, specs=? WHERE id=?')
  for (const [id, patch] of Object.entries(UPDATES)) u.run(patch.description, JSON.stringify(patch.specs), id)
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
