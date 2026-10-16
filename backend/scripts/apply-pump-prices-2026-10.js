/*
 * apply-pump-prices-2026-10.js — ціни двох насосів APM-F за прайсом від 08.09.2026 (рішення власниці
 * 16.10.2026: правильні ціни — з прайсу). Фіксовані гривні, не євро: у прайсі вони в UAH, тож і
 * на сайті не мають «плисти» за курсом. Ідемпотентний, за замовчуванням лише показує план.
 *
 *   docker compose exec -T app node backend/scripts/apply-pump-prices-2026-10.js [--apply]
 *
 * Валюту міграції більше не відкочують (migrateCurrency заповнює лише порожнє); seed-products.json
 * оновлено тим самим комітом — для свіжої БД.
 */
const path = require('path')
const Database = require('better-sqlite3')

const APPLY = process.argv.includes('--apply')
const PRICES = [
  { sku: '30651234', price: 73000 }, // APM-F 65/12-340 мм
  { sku: '30401225', price: 63830 }, // APM-F 40/12-250 мм
]

const DBP = process.env.TERMOJET_DB || path.join(__dirname, '..', 'data', 'termojet.db')
const db = new Database(DBP)
const get = db.prepare('SELECT id, sku, name, price, sale_price, currency FROM products WHERE sku = ?')
const upd = db.prepare("UPDATE products SET price = ?, currency = 'UAH' WHERE id = ?")

const plan = []
for (const { sku, price } of PRICES) {
  const row = get.get(sku)
  if (!row) { console.log(`· ${sku}: товар не знайдено`); continue }
  if (row.price === price && row.currency === 'UAH') { console.log(`· ${sku}: уже ${price} UAH`); continue }
  plan.push([price, row.id])
  console.log(`• ${sku} ${row.name}: ${row.price} ${row.currency} → ${price} UAH${row.sale_price > 0 ? ` (⚠️ є акційна ціна ${row.sale_price})` : ''}`)
}
if (!APPLY) console.log(`\nдо оновлення: ${plan.length}. Це лише показ. Щоб записати: додай --apply`)
else if (plan.length) { db.transaction(() => { for (const p of plan) upd.run(...p) })(); console.log(`\n✅ оновлено ${plan.length}`) }
else console.log('\n✅ змінювати нічого')
