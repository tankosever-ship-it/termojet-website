#!/usr/bin/env node
/**
 * Тимчасова зміна цін із автоматичним поверненням.
 *
 *   node backend/scripts/temp-price.cjs --status    показати стан
 *   node backend/scripts/temp-price.cjs --apply     застосувати кампанію
 *   node backend/scripts/temp-price.cjs --auto      повернути, якщо строк вийшов (для cron)
 *   node backend/scripts/temp-price.cjs --revert    повернути негайно
 *
 * Навіщо окремий скрипт, а не правка через адмінку: ціни в БД лежать у EUR
 * (`currency='EUR'`), а на сайті показуються в гривні за курсом НБУ +2.2%
 * (src/utils/currency.js). Тобто гривнева цифра щодня «пливе» разом із курсом.
 * Щоб на сторінці стояла РІВНО задана сума, товар на час кампанії переводиться
 * на `currency='UAH'` з фіксованою ціною, а потім повертається в EUR.
 *
 * Стан кампанії (що саме і з чого змінено) пишеться у backend/data/ —
 * це змонтований том, тож він переживає `docker compose up --build`.
 *
 * Захист від затирання ручних правок: якщо на момент повернення ціна в БД
 * не та, яку виставив `--apply` (хтось відредагував товар в адмінці), скрипт
 * НЕ чіпає цей товар і каже про це вголос. Перекрити — прапорцем `--force`.
 */
const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')

// ── Кампанія ─────────────────────────────────────────────────────────────────
// Прохання власника 03.09.2026: зафіксувати дві позиції в гривні на два тижні.
const CAMPAIGN = {
  id: 'nasosy-apm-f-uah-2026-09',
  note: 'Тимчасові гривневі ціни на два насоси APM-F (запит власника 03.09.2026)',
  appliedAt: null,          // проставляється під час --apply
  revertAt: '2026-09-17',   // включно до 16.09; 17.09 cron повертає назад
  items: [
    { slug: 'nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-65-12f-340-mm', price: 73000, currency: 'UAH' },
    { slug: 'nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-40-12f-250-mm', price: 63830, currency: 'UAH' },
  ],
}

const DB_PATH = process.env.TERMOJET_DB || path.join(__dirname, '..', 'data', 'termojet.db')
const STATE_PATH = path.join(path.dirname(DB_PATH), `temp-price-${CAMPAIGN.id}.json`)

const args = process.argv.slice(2)
const has = f => args.includes(f)
const FORCE = has('--force')

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

const selRow = db.prepare('SELECT id, slug, name, price, sale_price, currency FROM products WHERE slug = ?')
const updRow = db.prepare('UPDATE products SET price = ?, currency = ? WHERE slug = ?')

const readState = () => (fs.existsSync(STATE_PATH) ? JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')) : null)
const money = (v, c) => `${Number(v).toLocaleString('uk-UA')} ${c === 'UAH' ? 'грн' : c}`

function status() {
  const st = readState()
  console.log(`Кампанія: ${CAMPAIGN.id}`)
  console.log(`  ${CAMPAIGN.note}`)
  console.log(`  повернення: ${CAMPAIGN.revertAt}`)
  console.log(`  стан: ${st ? `АКТИВНА з ${st.appliedAt}` : 'не застосована'}`)
  for (const it of CAMPAIGN.items) {
    const row = selRow.get(it.slug)
    if (!row) { console.log(`  ✗ НЕ ЗНАЙДЕНО: ${it.slug}`); continue }
    const was = st && st.items.find(s => s.slug === it.slug)
    console.log(`  • ${row.name}`)
    console.log(`      зараз: ${money(row.price, row.currency)}${was ? `   (до кампанії: ${money(was.was.price, was.was.currency)})` : ''}`)
  }
}

function apply() {
  if (readState() && !FORCE) {
    console.error(`Кампанію вже застосовано (${STATE_PATH}). Спершу --revert, або --force.`)
    process.exit(1)
  }
  const snapshot = []
  for (const it of CAMPAIGN.items) {
    const row = selRow.get(it.slug)
    if (!row) { console.error(`✗ товар не знайдено: ${it.slug}`); process.exit(1) }
    snapshot.push({ slug: it.slug, name: row.name, was: { price: row.price, currency: row.currency }, set: { price: it.price, currency: it.currency } })
  }
  const run = db.transaction(() => {
    for (const s of snapshot) updRow.run(s.set.price, s.set.currency, s.slug)
  })
  run()
  const state = { ...CAMPAIGN, appliedAt: new Date().toISOString(), items: snapshot }
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2))
  console.log(`✅ застосовано (стан: ${STATE_PATH})`)
  for (const s of snapshot) console.log(`  • ${s.name}\n      ${money(s.was.price, s.was.currency)} → ${money(s.set.price, s.set.currency)}`)
}

function revert() {
  const st = readState()
  if (!st) { console.log('Кампанія не застосована — нічого повертати.'); return }
  const done = []
  const skipped = []
  const run = db.transaction(() => {
    for (const s of st.items) {
      const row = selRow.get(s.slug)
      if (!row) { skipped.push(`${s.slug} — товар зник із БД`); continue }
      // Хтось міг змінити ціну вручну вже після --apply. Тоді відкат затер би
      // свіжу правку старим значенням, тож пропускаємо і повідомляємо.
      if (!FORCE && (row.price !== s.set.price || row.currency !== s.set.currency)) {
        skipped.push(`${s.name} — ціну змінили вручну (${money(row.price, row.currency)}), лишаю як є`)
        continue
      }
      updRow.run(s.was.price, s.was.currency, s.slug)
      done.push(`${s.name}: ${money(s.set.price, s.set.currency)} → ${money(s.was.price, s.was.currency)}`)
    }
  })
  run()
  for (const d of done) console.log(`  ↩︎ ${d}`)
  for (const s of skipped) console.log(`  ⚠️  ${s}`)
  if (skipped.length && !FORCE) {
    console.log(`Стан ЗАЛИШЕНО (${STATE_PATH}) — розберіться з пропущеними, тоді --revert --force.`)
    return
  }
  fs.unlinkSync(STATE_PATH)
  console.log('✅ ціни повернуто, кампанію закрито')
}

// Режим для cron: щодня перевіряє строк і мовчить, поки він не вийшов.
function auto() {
  const st = readState()
  if (!st) return
  const today = new Date().toISOString().slice(0, 10)
  if (today < CAMPAIGN.revertAt) return
  console.log(`[${today}] строк кампанії ${CAMPAIGN.id} вийшов (${CAMPAIGN.revertAt}) — повертаю ціни`)
  revert()
}

if (has('--apply')) apply()
else if (has('--revert')) revert()
else if (has('--auto')) auto()
else status()
