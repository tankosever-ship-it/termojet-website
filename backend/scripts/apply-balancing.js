/*
 * apply-balancing.js — ціни на статичні балансувальні клапани SBV (EUR).
 * Ціни з прайсу 2026-06-08: 1/2"(DN15)=33, 3/4"(DN20)=39, 1"(DN25)=45.
 * Оновлює ЛИШЕ price (не чіпає інші поля). Ідемпотентно: seed + жива БД.
 *   node backend/scripts/apply-balancing.js
 *   docker compose exec -T app node backend/scripts/apply-balancing.js
 */
const path = require('path')
const fs = require('fs')
const SEED = path.join(__dirname, '..', 'seed-products.json')
const DBP = path.join(__dirname, '..', 'data', 'termojet.db')

// id -> price(EUR)
const PRICES = {
  new_SBV012: '33', // DN15, Rp 1/2"
  new_SBV034: '39', // DN20, Rp 3/4"
  new_SBV100: '45', // DN25, Rp 1"
}

// ---------- seed ----------
const raw = JSON.parse(fs.readFileSync(SEED, 'utf8'))
const arr = Array.isArray(raw) ? raw : raw.products
let upd = 0
for (const p of arr) {
  if (PRICES[p.id] != null) { p.price = PRICES[p.id]; p.currency = 'EUR'; upd++ }
}
fs.writeFileSync(SEED, JSON.stringify(Array.isArray(raw) ? arr : raw, null, 2) + '\n')
console.log(`seed: оновлено ${upd}`)

// ---------- жива БД ----------
if (!fs.existsSync(DBP)) { console.log('БД немає — пропуск'); process.exit(0) }
const Database = require('better-sqlite3')
const db = new Database(DBP)
const stmt = db.prepare('UPDATE products SET price=@price, currency=@currency WHERE id=@id')
const tx = db.transaction(() => {
  for (const [id, price] of Object.entries(PRICES)) {
    stmt.run({ id, price: parseFloat(price) || 0, currency: 'EUR' })
  }
})
tx()
db.close()
console.log('БД оновлено. Готово.')
