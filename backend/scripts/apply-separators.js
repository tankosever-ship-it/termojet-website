/*
 * apply-separators.js — нові сепаратори/клапани + перенесення старих у «Розпродаж».
 * Ідемпотентно: оновлює backend/seed-products.json і живу БД (якщо є).
 *   node backend/scripts/apply-separators.js
 *   docker compose exec -T app node backend/scripts/apply-separators.js
 */
const path = require('path')
const fs = require('fs')
const SEED = path.join(__dirname, '..', 'seed-products.json')
const DBP = path.join(__dirname, '..', 'data', 'termojet.db')
const IMG = '/images/separatory/'

// Описи за типом (TERMOJET, {ART} = артикул)
const DESC = {
  air_vent: a => `Автоматичний повітряний клапан TERMOJET ${a} встановлюється у найвищій точці системи опалення для безперервного видалення вільного повітря. Ефективно усуває повітряні пробки під час заповнення та експлуатації системи. Латунний корпус, проста установка.`,
  air: a => `Сепаратор повітря TERMOJET ${a} видаляє мікропухирці та розчинений газ із системи опалення. Сотова структура зварених мідних дротів створює зону статичного потоку, де газ збирається у верхній камері та автоматично виводиться через клапан.`,
  air_rotary: a => `Поворотний сепаратор повітря TERMOJET ${a} з обертовим з'єднанням для зручного монтажу в будь-якому положенні труби. Видаляє мікропухирці та розчинений газ; сотова структура зварених мідних дротів забезпечує ефективне відведення повітря.`,
  combined: a => `Сепаратор повітря та бруду TERMOJET ${a} одночасно видаляє мікробульбашки повітря та частинки бруду з теплоносія. Автоматичний повітряний клапан і запатентована сотова структура зварених мідних дротів забезпечують чистоту системи; динамічний дренаж дозволяє вимити бруд за кілька секунд без зупинки системи.`,
  dirt: a => `Сепаратор бруду TERMOJET ${a} видаляє магнітні та немагнітні частинки бруду із системи опалення. Знімне магнітне кільце посилює вловлювання шламу, а сотова структура зварених мідних дротів ефективно затримує найдрібніші частинки. Швидке очищення без зупинки системи.`,
  dirt_rotary: a => `Поворотний сепаратор бруду TERMOJET ${a} з обертовим з'єднанням для зручного монтажу. Видаляє магнітні та немагнітні частинки бруду; знімне магнітне кільце посилює вловлювання шламу, очищення виконується швидко без зупинки системи.`,
  heatpump: a => `Сепаратор бруду TERMOJET ${a} для систем із тепловими насосами. Захищає пластинчастий теплообмінник від забруднення: вловлює магнітні та немагнітні частинки, має вбудовані запірні крани та клапан для швидкого очищення.`,
  antifreeze: a => `Антифризний клапан TERMOJET ${a} автоматично зливає частину теплоносія при критичному зниженні температури, захищаючи систему опалення від замерзання. Спрацьовує приблизно при +3°C та повертається у вихідний стан при нагріванні.`,
  stopvalve: a => `Запірний кран TERMOJET ${a} для розширювального бака. Дозволяє перекрити та від'єднати бак для обслуговування чи заміни без зливу теплоносія із системи. Важільне керування, надійне ущільнення.`,
}

// [article, name, price, photoKey, typeKey, categorySlug, subcategory]
const ROWS = [
  ['TJ4F15-10/110-15', 'Автоматичний повітряний клапан Dn15 (1/2") Termojet', 38.9, 'sep-air-vent', 'air_vent', 'separatory', 'Сепаратори повітря'],
  ['TJ4F20-10/110-20', 'Автоматичний повітряний клапан Dn20 (3/4") Termojet', 39.4, 'sep-air-vent', 'air_vent', 'separatory', 'Сепаратори повітря'],
  ['TJ4F25-10/110-25', 'Автоматичний повітряний клапан Dn25 (1") Termojet', 40.6, 'sep-air-vent', 'air_vent', 'separatory', 'Сепаратори повітря'],
  ['TJV6G20', 'Сепаратор повітря Dn20 (3/4") 110°C/10bar Termojet', 70.4, 'sep-air', 'air', 'separatory', 'Сепаратори повітря'],
  ['TJV6G25', 'Сепаратор повітря Dn25 (1") 110°C/10bar Termojet', 84.5, 'sep-air', 'air', 'separatory', 'Сепаратори повітря'],
  ['TJV6G32', 'Сепаратор повітря Dn32 (1 1/4") 110°C/10bar Termojet', 92.5, 'sep-air', 'air', 'separatory', 'Сепаратори повітря'],
  ['TJV6G40', 'Сепаратор повітря Dn40 (1 1/2") 110°C/10bar Termojet', 112.4, 'sep-air', 'air', 'separatory', 'Сепаратори повітря'],
  ['TJV6G50', 'Сепаратор повітря Dn50 (2") 110°C/10bar Termojet', 211.8, 'sep-air', 'air', 'separatory', 'Сепаратори повітря'],
  ['TJV7G20', 'Поворотний сепаратор повітря Dn20 (3/4") Termojet', 90, 'sep-air-rotary', 'air_rotary', 'separatory', 'Сепаратори повітря'],
  ['TJV7G25', 'Поворотний сепаратор повітря Dn25 (1") Termojet', 128.7, 'sep-air-rotary', 'air_rotary', 'separatory', 'Сепаратори повітря'],
  ['TJV7G32', 'Поворотний сепаратор повітря Dn32 (1 1/4") Termojet', 176.7, 'sep-air-rotary', 'air_rotary', 'separatory', 'Сепаратори повітря'],
  ['TJV7G40', 'Поворотний сепаратор повітря Dn40 (1 1/2") Termojet', 212.9, 'sep-air-rotary', 'air_rotary', 'separatory', 'Сепаратори повітря'],
  ['TJVT6G20', 'Сепаратор повітря та бруду Dn20 (3/4") Termojet', 140.6, 'sep-combined', 'combined', 'separatory', 'Сепаратори повітря та бруду'],
  ['TJVT6G25', 'Сепаратор повітря та бруду Dn25 (1") Termojet', 147.8, 'sep-combined', 'combined', 'separatory', 'Сепаратори повітря та бруду'],
  ['TJVT6G32', 'Сепаратор повітря та бруду Dn32 (1 1/4") Termojet', 164.8, 'sep-combined', 'combined', 'separatory', 'Сепаратори повітря та бруду'],
  ['TJVT6G40', 'Сепаратор повітря та бруду Dn40 (1 1/2") Termojet', 177.8, 'sep-combined', 'combined', 'separatory', 'Сепаратори повітря та бруду'],
  ['TJVT6G50', 'Сепаратор повітря та бруду Dn50 (2") Termojet', 302.9, 'sep-combined', 'combined', 'separatory', 'Сепаратори повітря та бруду'],
  ['TJT6G20', 'Сепаратор бруду Dn20 (3/4") Termojet', 75.5, 'sep-dirt', 'dirt', 'separatory', 'Сепаратори бруду'],
  ['TJT6G25', 'Сепаратор бруду Dn25 (1") Termojet', 81.9, 'sep-dirt', 'dirt', 'separatory', 'Сепаратори бруду'],
  ['TJT6G32', 'Сепаратор бруду Dn32 (1 1/4") Termojet', 89.3, 'sep-dirt', 'dirt', 'separatory', 'Сепаратори бруду'],
  ['TJT6G40', 'Сепаратор бруду Dn40 (1 1/2") Termojet', 131.8, 'sep-dirt', 'dirt', 'separatory', 'Сепаратори бруду'],
  ['TJT6G50', 'Сепаратор бруду Dn50 (2") Termojet', 216.5, 'sep-dirt', 'dirt', 'separatory', 'Сепаратори бруду'],
  ['TJT7G20', 'Сепаратор бруду поворотний Dn20 (3/4") Termojet', 85.9, 'sep-dirt-rotary', 'dirt_rotary', 'separatory', 'Сепаратори бруду'],
  ['TJT7G25', 'Сепаратор бруду поворотний Dn25 (1") Termojet', 146, 'sep-dirt-rotary', 'dirt_rotary', 'separatory', 'Сепаратори бруду'],
  ['TJT7G32', 'Сепаратор бруду поворотний Dn32 (1 1/4") Termojet', 183.2, 'sep-dirt-rotary', 'dirt_rotary', 'separatory', 'Сепаратори бруду'],
  ['TJT7G40', 'Сепаратор бруду поворотний Dn40 (1 1/2") Termojet', 219.7, 'sep-dirt-rotary', 'dirt_rotary', 'separatory', 'Сепаратори бруду'],
  ['TJ7575055501', 'Сепаратор бруду для теплових насосів Dn25 (G1") Termojet', 86.4, 'sep-heatpump', 'heatpump', 'separatory', 'Сепаратори бруду'],
  ['TJ7590100301', 'Антифризний клапан Dn25 (1"M) Termojet', 79.8, 'sep-antifreeze', 'antifreeze', 'dodatkove', ''],
  ['TJ7590100801', 'Антифризний клапан Dn32 (1 1/4"M) Termojet', 82, 'sep-antifreeze', 'antifreeze', 'dodatkove', ''],
  ['TJ5503702401', 'Запірний кран Dn20 (3/4"M) Termojet', 14.2, 'sep-stopvalve', 'stopvalve', 'dodatkove', ''],
]

// Пропускна здатність (м³/год) по DN — паспортний ряд Termojet +35%.
// Тільки для проточних сепараторів (не для повітровідвідників air_vent).
const FLOW = { '20': '1.8', '25': '2.7', '32': '5.0', '40': '6.8', '50': '10.1' }

function buildSpecs(art, name, type) {
  const dn = (name.match(/Dn\s?(\d+)/i) || [])[1] || ''
  const inch = (name.match(/Dn\s?\d+\s*\(([^)]+)\)/i) || [])[1] || ''
  const rozmir = inch ? `DN${dn} (${inch})` : `DN${dn}`
  const s = { 'Артикул': art, 'Розмір': rozmir }
  if (type === 'antifreeze') {
    s['Температура спрацювання'] = '≈ +3°C'; s['Макс. тиск'] = '10 бар'; s['Матеріал'] = 'Латунь'
  } else if (type === 'stopvalve') {
    s['Макс. температура'] = '110°C'; s['Макс. тиск'] = '10 бар'; s['Матеріал'] = 'Латунь / нерж. сталь'
  } else {
    s['Макс. температура'] = '110°C'; s['Макс. тиск'] = '10 бар'
    s['Матеріал'] = type === 'heatpump' ? 'Композит / латунь' : 'Латунь'
    if (type !== 'air_vent' && FLOW[dn]) s['Пропускна здатність (м³/год)'] = FLOW[dn]
  }
  s['Виробник'] = 'TERMOJET'
  return s
}

function slugOf(art) { return art.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }

const products = ROWS.map(([art, name, price, photo, type, cat, sub]) => ({
  id: 'sep_' + slugOf(art),
  wpId: null,
  name: name,
  slug: 'sep-' + slugOf(art),
  sku: art,
  price: String(price),
  currency: 'EUR',
  categorySlug: cat,
  subcategory: sub || '',
  image: IMG + photo + '.png',
  images: [IMG + photo + '.png'],
  shortDesc: DESC[type](art).slice(0, 160),
  description: DESC[type](art),
  specs: buildSpecs(art, name, type),
  inStock: true,
  features: [],
}))

// ---------- 1. seed-products.json ----------
const raw = JSON.parse(fs.readFileSync(SEED, 'utf8'))
const arr = Array.isArray(raw) ? raw : raw.products
const byId = new Map(arr.map(p => [p.id, p]))

// Перенести ВСІ поточні сепаратори у «Розпродаж» (тільки старі, не наші нові sep_*)
let moved = 0
for (const p of arr) {
  if (p.categorySlug === 'separatory' && !String(p.id).startsWith('sep_')) {
    p.categorySlug = 'rozprodazh'; moved++
  }
}
// Додати/оновити нові товари
let added = 0, upd = 0
for (const np of products) {
  if (byId.has(np.id)) { Object.assign(byId.get(np.id), np); upd++ }
  else { arr.push(np); byId.set(np.id, np); added++ }
}
fs.writeFileSync(SEED, JSON.stringify(Array.isArray(raw) ? arr : raw, null, 2) + '\n')
console.log(`seed: перенесено в розпродаж ${moved}, нових ${added}, оновлено ${upd}`)

// ---------- 2. жива БД ----------
if (!fs.existsSync(DBP)) { console.log('БД немає — пропуск'); process.exit(0) }
const Database = require('better-sqlite3')
const db = new Database(DBP)
const tx = db.transaction(() => {
  db.prepare("UPDATE products SET category_slug='rozprodazh' WHERE category_slug='separatory' AND id NOT LIKE 'sep_%'").run()
  const ins = db.prepare(`INSERT INTO products (id, wp_id, name, slug, sku, price, category_slug, subcategory,
      image, images, short_desc, description, specs, features, in_stock, is_visible)
      VALUES (@id,@wp_id,@name,@slug,@sku,@price,@category_slug,@subcategory,@image,@images,
      @short_desc,@description,@specs,@features,1,1)`)
  const updt = db.prepare(`UPDATE products SET name=@name, slug=@slug, sku=@sku, price=@price,
      category_slug=@category_slug, subcategory=@subcategory, image=@image, images=@images,
      short_desc=@short_desc, description=@description, specs=@specs, features=@features,
      in_stock=1, is_visible=1 WHERE id=@id`)
  for (const np of products) {
    const pl = {
      id: np.id, wp_id: np.wpId, name: np.name, slug: np.slug, sku: np.sku,
      price: parseFloat(np.price) || 0, category_slug: np.categorySlug, subcategory: np.subcategory,
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
