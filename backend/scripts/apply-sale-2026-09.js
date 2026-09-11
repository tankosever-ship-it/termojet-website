/*
 * apply-sale-2026-09.js — знижка −25% на розділ «Акція» (категорія `rozprodazh`).
 * Ідемпотентний, за замовчуванням лише показує. Чистить ЖИВУ БД.
 *
 *   попередній перегляд:  docker compose exec -T app node backend/scripts/apply-sale-2026-09.js
 *   застосувати:          docker compose exec -T app node backend/scripts/apply-sale-2026-09.js --apply
 *   зняти акцію:          docker compose exec -T app node backend/scripts/apply-sale-2026-09.js --revert
 *
 * Знижка ЛИШЕ НА САЙТІ: пишеться в `sale_price`, а `price` (роздрібна) не змінюється.
 * Прайс-лист (`pipelines/price/generate.py`) бере з `/api/products` саме `price`,
 * тож XLSX і CSV для партнерів лишаються роздрібними без жодних додаткових дій.
 * Фіди Merchant віддають обидві ціни (`g:price` роздрібна + `g:sale_price`) —
 * інакше ціна у фіді розійшлася б із ціною на сторінці й позиції зняли б із показу.
 *
 * Чому відсоток, а не фіксована сума в гривні (як у temp-price.cjs): усі 18 позицій
 * у EUR, на сайті показуються в гривні за курсом НБУ +2.2%. Відсоткова знижка
 * лишається рівно 25% за будь-якого курсу, тож переводити товар у UAH не потрібно.
 *
 * Строк: безстроково, до скасування (рішення власника 11.09.2026). Автоповернення
 * немає — знімається вручну прогоном `--revert`.
 */
const path = require('path')
const Database = require('better-sqlite3')

const APPLY = process.argv.includes('--apply')
const REVERT = process.argv.includes('--revert')

// Відсоток знижки. Ціна акції = роздрібна × (1 − PERCENT/100), округлення до копійки.
const PERCENT = 25

// [артикул, роздрібна ціна на момент розрахунку, валюта]
// Роздрібна ціна потрібна як запобіжник: якщо в базі вже інша — товар пропускаємо,
// бо або ціну підняли після цього прогону, або хтось правив картку в адмінці.
const ITEMS = [
  ['41015110', 44, 'EUR'],        // Автоматичний повітровідвідник Termojet Air Vent-DN15 (1/2")
  ['41020110', 47, 'EUR'],        // Автоматичний повітровідвідник Termojet Air Vent-DN20 (3/4")
  ['41025110', 48, 'EUR'],        // Автоматичний повітровідвідник Termojet Air Vent-DN25 (1")
  ['42020170', 78, 'EUR'],        // Сепаратор повітря Termojet DN20 (3/4") TJ-CA-DN20
  ['42025185', 82, 'EUR'],        // Сепаратор повітря Termojet DN25 (1") TJ-CA-DN25
  ['42032200', 90, 'EUR'],        // Сепаратор повітря Termojet DN32 (1 1/4") TJ-CA-DN32
  ['42040240', 105, 'EUR'],       // Сепаратор повітря Termojet DN40 (1 1/2") TJ-CA-DN40
  ['42050246', 190, 'EUR'],       // Сепаратор повітря Termojet DN50 (2") TJ-CA-DN50M
  ['43020145', 68, 'EUR'],        // Сепаратор бруду Termojet DN20 (3/4") TJ-CD-DN20
  ['43025145', 70, 'EUR'],        // Сепаратор бруду Termojet DN25 (1") TJ-CD-DN25
  ['43025155', 16, 'EUR'],        // Магніт Termojet для сепаратора бруду TJ-MAG
  ['43032160', 80, 'EUR'],        // Сепаратор бруду Termojet DN32 (1 1/4") TJ-CD-DN32
  ['43040197', 95, 'EUR'],        // Сепаратор бруду Termojet DN40 (1 1/2")
  ['43050440', 190, 'EUR'],       // Сепаратор бруду Termojet DN50 (2") TJ-CD-DN50M
  ['44025265', 120, 'EUR'],       // Сепаратор повітря і бруду Termojet DN25 (1") TJ-CAD-DN25
  ['44032265', 130, 'EUR'],       // Сепаратор повітря і бруду Termojet DN32 (1 1/4") TJ-CAD-DN32
  ['44040265', 140, 'EUR'],       // Сепаратор повітря і бруду Termojet DN40 (1 1/2")
  ['44050332', 200, 'EUR'],       // Сепаратор повітря і бруду Termojet DN50 (2")
]

// TERMOJET_DB дає прогнати знижку на знімку прод-бази, не чіпаючи робочу.
const DBP = process.env.TERMOJET_DB || path.join(__dirname, '..', 'data', 'termojet.db')
const db = new Database(DBP)

const sel = db.prepare('SELECT id, sku, name, price, sale_price, currency, category_slug FROM products WHERE sku = ?')
const upd = db.prepare('UPDATE products SET sale_price = ? WHERE id = ?')

const money = (v, c) => `${Number(v).toLocaleString('uk-UA')} ${c === 'UAH' ? 'грн' : c}`
const saleOf = price => Math.round(price * (100 - PERCENT)) / 100

let willChange = 0, skipped = 0, same = 0
const plan = []

for (const [sku, expected, currency] of ITEMS) {
  const row = sel.get(sku)
  if (!row) { console.log(`  ✗ НЕ ЗНАЙДЕНО: ${sku}`); skipped++; continue }

  const target = REVERT ? 0 : saleOf(row.price)
  const current = row.sale_price || 0

  if (!REVERT) {
    // Ціна змінилася від тієї, з якої рахували, — рахувати наосліп не можна:
    // або підняття цін уже пройшло (тоді оновити таблицю вище), або правка в адмінці.
    if (Math.abs(row.price - expected) > 0.01 || (row.currency || 'UAH') !== currency) {
      console.log(`  ⚠️  ${row.sku} ${row.name.slice(0, 50)}`)
      console.log(`        ціна в базі ${money(row.price, row.currency)}, а розрахунок робився з ${money(expected, currency)} — ПРОПУСКАЮ`)
      skipped++
      continue
    }
    if (row.category_slug !== 'rozprodazh') {
      console.log(`  ⚠️  ${row.sku} більше не в категорії «Акція» (${row.category_slug}) — ПРОПУСКАЮ`)
      skipped++
      continue
    }
  }

  if (Math.abs(current - target) < 0.01) { same++; continue }
  plan.push({ row, target, current })
  willChange++
}

for (const { row, target, current } of plan) {
  const pct = target > 0 ? Math.round((1 - target / row.price) * 100) : 0
  console.log(`  • ${row.sku} ${row.name.slice(0, 52)}`)
  console.log(`      ${current > 0 ? `акція ${money(current, row.currency)}` : `без акції (${money(row.price, row.currency)})`}` +
              ` → ${target > 0 ? `${money(target, row.currency)} (−${pct}% від ${money(row.price, row.currency)})` : `без акції (${money(row.price, row.currency)})`}`)
}

console.log(`\n${REVERT ? 'ЗНЯТТЯ АКЦІЇ' : `АКЦІЯ −${PERCENT}%`}: до зміни ${willChange}, уже як треба ${same}, пропущено ${skipped} (з ${ITEMS.length})`)

if (!APPLY) {
  console.log(`\nЦе лише показ. Щоб записати: додай ${REVERT ? '--revert --apply' : '--apply'}`)
} else if (willChange) {
  db.transaction(() => { for (const { row, target } of plan) upd.run(target, row.id) })()
  console.log(`\n✅ записано ${willChange} товарів у ${DBP}`)
} else {
  console.log('\n✅ змінювати нічого — база вже в потрібному стані')
}
