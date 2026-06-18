/*
 * apply-apmf-specs.js — додає бракуючі характеристики насосів APM-F
 * (40/8, 50/8, 50/15, 50/18) з каталогу виробника Shimge (屏蔽泵, стор. «Electrical
 * And Hydraulic Data» + таблиця мас/габаритів).
 *
 * Ідемпотентно: патчить backend/seed-products.json (джерело правди) і синхронізує
 * живу БД (INSERT OR REPLACE по id). Повторний запуск — той самий результат.
 *
 *   node backend/scripts/apply-apmf-specs.js
 *   docker compose exec -T app node backend/scripts/apply-apmf-specs.js
 */
const path = require('path')
const fs = require('fs')

const SEED = path.join(__dirname, '..', 'seed-products.json')
const DBP = path.join(__dirname, '..', 'data', 'termojet.db')

// Стандартні поля APM-F (як у решти серії)
const COMMON = {
  'Температура рідини': '0°C ~ 110°C',
  'Зовнішня температура': '0°C ~ 40°C',
  'Максимальний тиск у системі': '1,0 МПа',
  'Рівень захисту': 'IP44',
  'Напруга': '230 В ± 10% / 50 Гц',
  'Тепловий клас': 'F',
  'Вимоги до перекачуваної рідини': 'чиста, без твердих часток і мінеральних олій, нетоксична, хімічно нейтральна, близька за характеристиками до води',
  'Встановлення': 'вал двигуна повинен знаходитися в горизонтальному положенні',
}

// full → повна заміна specs (товар мав порожні); merge → додати/оновити ключі
const PATCH = {
  'excel_30400822': { full: {
    'Назва': 'APM-F 40/8',
    'Діаметр': 'Dn 40 фланець',
    'Довжина насоса': '220 мм',
    'Qmax': '12,5 м³/год',
    'Hmax': '8 м',
    'Споживана потужність': '25-320 W',
    'I max': '1.6 А',
    'Розмір': '300*285*215мм',
    'Маса': '8.5кг',
    ...COMMON,
  } },
  'new_30500824': { merge: {
    'Споживана потужність': '25-320 W',
    'I max': '1.6 А',
    'Розмір': '310*305*215мм',
    'Маса': '9.25кг',
  } },
  'new_30501528': { merge: {
    'Споживана потужність': '25-660 W',
    'I max': '3.5 А',
    'Маса': '18кг',
  } },
  'new_30501828': { merge: {
    'Споживана потужність': '25-850 W',
    'I max': '4 А',
    'Маса': '18кг',
  } },
}

const raw = JSON.parse(fs.readFileSync(SEED, 'utf8'))
const arr = Array.isArray(raw) ? raw : raw.products
let changed = 0
for (const id of Object.keys(PATCH)) {
  const p = arr.find(x => x.id === id)
  if (!p) { console.log('!! не знайдено в seed:', id); continue }
  const patch = PATCH[id]
  if (patch.full) p.specs = { ...patch.full }
  else p.specs = { ...(p.specs || {}), ...patch.merge }
  changed++
  console.log(`seed: ${p.sku} ${p.name.split('AUTO')[1] ? p.name.split('AUTO')[1].trim().slice(0, 28) : p.name.slice(-24)} — ${Object.keys(p.specs).length} полів`)
}
fs.writeFileSync(SEED, JSON.stringify(arr, null, 2))
console.log(`seed-products.json оновлено (${changed} товарів)`)

// --- жива БД ---
if (!fs.existsSync(DBP)) { console.log('Локально БД немає — пропускаю (на сервері запуститься).'); process.exit(0) }
const Database = require('better-sqlite3')
const db = new Database(DBP)
const stmt = db.prepare(`
  INSERT OR REPLACE INTO products
    (id, wp_id, name, slug, sku, price, currency, category_slug, subcategory,
     image, images, short_desc, description, specs, features, in_stock, is_visible)
  VALUES
    (@id, @wp_id, @name, @slug, @sku, @price, @currency, @category_slug, @subcategory,
     @image, @images, @short_desc, @description, @specs, @features, @in_stock,
     COALESCE((SELECT is_visible FROM products WHERE id=@id), 1))
`)
let dbn = 0
const tx = db.transaction(() => {
  for (const id of Object.keys(PATCH)) {
    const p = arr.find(x => x.id === id)
    if (!p) continue
    stmt.run({
      id: p.id, wp_id: p.wpId || null, name: p.name, slug: p.slug, sku: String(p.sku || ''),
      price: parseFloat(p.price) || 0, currency: p.currency || 'EUR',
      category_slug: p.categorySlug || '', subcategory: p.subcategory || '',
      image: p.image || '', images: JSON.stringify(p.images || []),
      short_desc: p.shortDesc || '', description: p.description || '',
      specs: JSON.stringify(p.specs || {}), features: JSON.stringify(p.features || []),
      in_stock: p.inStock === false ? 0 : 1,
    })
    dbn++
  }
})
tx()
db.close()
console.log(`Жива БД оновлена (${dbn} товарів)`)
