/*
 * dedupe-specs.js — прибирає сміттєві ключі specs з HTML-ентіті (напр. "Об&#8217;єм"),
 * що дублювали справжній ключ ("Об'єм"). Ідемпотентно. Чистить ЖИВУ БД.
 *   docker compose exec -T app node backend/scripts/dedupe-specs.js
 */
const path = require('path')
const Database = require('better-sqlite3')
const DBP = path.join(__dirname, '..', 'data', 'termojet.db')
const db = new Database(DBP)

const rows = db.prepare('SELECT id, specs FROM products').all()
const upd = db.prepare('UPDATE products SET specs = @specs WHERE id = @id')
let changed = 0
for (const r of rows) {
  let specs
  try { specs = JSON.parse(r.specs || '{}') } catch { continue }
  const bad = Object.keys(specs).filter(k => /&#/.test(k))
  if (bad.length === 0) continue
  for (const k of bad) delete specs[k]
  upd.run({ id: r.id, specs: JSON.stringify(specs) })
  changed++
}
console.log(`dedupe-specs: оновлено товарів — ${changed}`)
db.close()
