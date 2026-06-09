/*
 * apply-apmf50.js — додає нові насоси APM-F 50/8, 50/15, 50/18 у живу БД зі seed-products.json.
 * seedProducts() заливає лише в порожню таблицю, тому нові товари треба вставити окремо.
 * Ідемпотентно (INSERT OR REPLACE по id).
 *   docker compose exec -T app node backend/scripts/apply-apmf50.js
 */
const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')

const SEED = path.join(__dirname, '..', 'seed-products.json')
const DBP = path.join(__dirname, '..', 'data', 'termojet.db')
const SKUS = ['30500824', '30501528', '30501828']

const raw = JSON.parse(fs.readFileSync(SEED, 'utf8'))
const arr = Array.isArray(raw) ? raw : raw.products
const db = new Database(DBP)

const stmt = db.prepare(`
  INSERT OR REPLACE INTO products
    (id, wp_id, name, slug, sku, price, currency, category_slug, subcategory,
     image, images, short_desc, description, specs, features, in_stock, is_visible)
  VALUES
    (@id, @wp_id, @name, @slug, @sku, @price, @currency, @category_slug, @subcategory,
     @image, @images, @short_desc, @description, @specs, @features, @in_stock, 1)
`)
let n = 0
const tx = db.transaction(() => {
  for (const p of arr) {
    if (!SKUS.includes(String(p.sku))) continue
    stmt.run({
      id: p.id, wp_id: p.wpId || null, name: p.name, slug: p.slug, sku: String(p.sku),
      price: parseFloat(p.price) || 0, currency: p.currency || 'EUR',
      category_slug: p.categorySlug || '', subcategory: p.subcategory || '',
      image: p.image || '', images: JSON.stringify(p.images || []),
      short_desc: p.shortDesc || '', description: p.description || '',
      specs: JSON.stringify(p.specs || {}), features: JSON.stringify(p.features || []),
      in_stock: p.inStock === false ? 0 : 1,
    })
    n++
    console.log(`додано/оновлено ${p.sku}: ${p.name.slice(-22)}`)
  }
})
tx()
db.close()
console.log(`Готово. Товарів: ${n}`)
