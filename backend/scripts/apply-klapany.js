/*
 * apply-klapany.js — синхронізує зонні клапани ABF (SKU 47032230=DN32, 47025230=DN25)
 * у живій БД зі seed-products.json: name, category_slug, short_desc, description, specs.
 * Потрібно, бо seedProducts() заливає лише в порожню таблицю.
 *   docker compose exec -T app node backend/scripts/apply-klapany.js
 */
const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')

const SEED = path.join(__dirname, '..', 'seed-products.json')
const DBP = path.join(__dirname, '..', 'data', 'termojet.db')
const SKUS = ['47032230', '47025230']

const raw = JSON.parse(fs.readFileSync(SEED, 'utf8'))
const arr = Array.isArray(raw) ? raw : raw.products
const db = new Database(DBP)

const stmt = db.prepare(`
  UPDATE products SET name=@name, category_slug=@category_slug,
    short_desc=@short_desc, description=@description, specs=@specs
  WHERE sku=@sku
`)
let n = 0
const tx = db.transaction(() => {
  for (const p of arr) {
    if (!SKUS.includes(String(p.sku))) continue
    const r = stmt.run({
      sku: String(p.sku), name: p.name, category_slug: p.categorySlug || '',
      short_desc: p.shortDesc || '', description: p.description || '',
      specs: JSON.stringify(p.specs || {}),
    })
    n += r.changes
    console.log(`оновлено ${p.sku}: DN=${(p.specs || {}).DN} cat=${p.categorySlug}`)
  }
})
tx()
db.close()
console.log(`Готово. Рядків оновлено: ${n}`)
