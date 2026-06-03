/*
 * apply-etap1-data.js — дані Етапу 1 доробок (ідемпотентно: seed-products.json + жива БД).
 *   #21 — видалити 2 зайвих 4-ходових клапани (дублі): RMV04100-100, RMV04100-034.
 *   #6  — НГ-38-А (84142380A): дописати в опис «з приводом AQUA 413» + spec «Привід».
 *
 *   Локально:  node backend/scripts/apply-etap1-data.js
 *   У продакшні: docker compose exec -T app node backend/scripts/apply-etap1-data.js
 */
const path = require('path')
const fs = require('fs')
const SEED = path.join(__dirname, '..', 'seed-products.json')
const DBP = path.join(__dirname, '..', 'data', 'termojet.db')

// ── #21: артикули зайвих 4-ходових клапанів ──
const REMOVE_SKUS = ['RMV04100-100', 'RMV04100-034']

// ── #6: НГ-38-А ──
const NG38_SKU = '84142380A'
const NG38_DESC = 'Насосна група НГ-38 зі змішувачем використовується для контурів, що потребують керування температурою теплоносія. Компактна конструкція, надійна теплоізоляція, кран з термометром на подачі і зворотній лінії. Постачається з електроприводом-контролером AQUA 413 для автоматичного керування температурою подачі (інструкція — у вкладці «Документи»). Насос у комплект не входить.'
const NG38_SPECS = {
  'Діаметр': '3/4" ВР',
  'Ізоляція': 'XPE',
  'Макс. тиск': '10 бар',
  'Макс. температура': '110°C',
  'Привід': 'AQUA 413',
}

// ---------- 1. seed-products.json ----------
const raw = JSON.parse(fs.readFileSync(SEED, 'utf8'))
const arr = Array.isArray(raw) ? raw : raw.products

const before = arr.length
const kept = arr.filter(p => !REMOVE_SKUS.includes(p.sku))
const removedSeed = before - kept.length

const ng38 = kept.find(p => p.sku === NG38_SKU)
if (ng38) {
  ng38.description = NG38_DESC
  ng38.specs = NG38_SPECS
}

const out = Array.isArray(raw) ? kept : { ...raw, products: kept }
fs.writeFileSync(SEED, JSON.stringify(out, null, 2) + '\n')
console.log(`seed: видалено клапанів ${removedSeed}, НГ-38-А ${ng38 ? 'оновлено' : 'НЕ знайдено'}`)

// ---------- 2. жива БД ----------
if (!fs.existsSync(DBP)) { console.log('БД немає — пропуск'); process.exit(0) }
const Database = require('better-sqlite3')
const db = new Database(DBP)
const tx = db.transaction(() => {
  // #21 — видалити дублі
  const del = db.prepare('DELETE FROM products WHERE sku = ?')
  let removedDb = 0
  for (const sku of REMOVE_SKUS) removedDb += del.run(sku).changes
  // #6 — оновити НГ-38-А
  const upd = db.prepare('UPDATE products SET description = ?, specs = ? WHERE sku = ?')
  const ng = upd.run(NG38_DESC, JSON.stringify(NG38_SPECS), NG38_SKU).changes
  console.log(`БД: видалено клапанів ${removedDb}, НГ-38-А ${ng ? 'оновлено' : 'НЕ знайдено'}`)
})
tx()
db.close()
console.log('Готово.')
