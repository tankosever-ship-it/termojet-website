/*
 * apply-antifreeze-media.js — ідемпотентна заміна фото антифризних клапанів TJ7590
 * на новий рендер версії з чорною Т-ручкою (старе фото було без ручки).
 *
 * Нове імʼя файлу (…-v2.png) — щоб обійти кеш браузера (images віддаються з
 * Cache-Control: max-age=604800).
 *
 * Оновлює backend/seed-products.json (джерело правди для нової БД)
 * і, якщо існує, живу базу backend/data/termojet.db.
 *
 * Запуск:  node backend/scripts/apply-antifreeze-media.js
 * У контейнері: docker compose exec -T app node backend/scripts/apply-antifreeze-media.js
 */
const path = require('path')
const fs = require('fs')

const IMG = '/images/separatory/sep-antifreeze-v2.png'
const SEED = path.join(__dirname, '..', 'seed-products.json')
const DBP = path.join(__dirname, '..', 'data', 'termojet.db')

// Антифризні клапани (категорія dodatkove): Dn25 і Dn32 — спільний рендер серії
const IDS = ['sep_tj7590100301', 'sep_tj7590100801']

function applyToObj(p) {
  p.image = IMG
  p.images = [IMG]
}

// --- seed-products.json ---
const seed = JSON.parse(fs.readFileSync(SEED, 'utf8'))
const list = Array.isArray(seed) ? seed : seed.products
let seedChanged = 0
for (const id of IDS) {
  const p = list.find((x) => x.id === id)
  if (!p) { console.warn('  ! у seed немає товару', id); continue }
  applyToObj(p)
  seedChanged++
}
fs.writeFileSync(SEED, JSON.stringify(seed, null, 2) + '\n')
console.log(`seed-products.json: оновлено ${seedChanged} товарів.`)

// --- жива БД ---
if (!fs.existsSync(DBP)) {
  console.log('БД не знайдено (', DBP, ') — пропускаю.')
  process.exit(0)
}
const Database = require('better-sqlite3')
const db = new Database(DBP)
const upd = db.prepare('UPDATE products SET image=@image, images=@images WHERE id=@id')
let dbChanged = 0
const tx = db.transaction(() => {
  for (const id of IDS) {
    const row = db.prepare('SELECT id FROM products WHERE id=?').get(id)
    if (!row) { console.warn('  ! у БД немає товару', id); continue }
    upd.run({ id, image: IMG, images: JSON.stringify([IMG]) })
    dbChanged++
  }
})
tx()
db.close()
console.log(`БД termojet.db: оновлено ${dbChanged} товарів.`)
console.log('Готово.')
