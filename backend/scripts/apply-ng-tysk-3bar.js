/*
 * apply-ng-tysk-3bar.js — робочий тиск насосних груп: 6 бар → 3 бар.
 *
 * Підстава: інструкція Termojet 2020 року (на сайті id 12 і id 13) у таблиці
 * характеристик дає 6 бар, а в п. 2.7 — «випробування тиском не більше 3 бар».
 * Польські наліпки GPSR друкували 3 bar, українські — 6. Рішення замовника від
 * 26.08.2026: вірні 3 бар, усі документи вирівнюються по ньому.
 *
 * Правляться ЛИШЕ насосні групи НГ-46/47/48/51/52/67 — 24 картки. Повітровідвідники,
 * труба PE-RT і насоси TBE теж мають «6 бар», але це їхній власний тиск, і їх
 * скрипт не чіпає: вибірка йде за назвою товару, а не за пошуком по всій базі.
 *
 * Міняються всі поля картки, а не лише specs: тиск згадується ще в описі,
 * короткому описі, meta-описі й у перекладах (en, pl, fr, de) — інакше на
 * сторінці товару поряд стояли б 3 бар у характеристиках і 6 бар у тексті.
 *
 * Ідемпотентний: другий прогін нічого не знаходить і нічого не пише.
 *
 *   docker compose exec -T app node backend/scripts/apply-ng-tysk-3bar.js
 *   docker compose exec -T app node backend/scripts/apply-ng-tysk-3bar.js --dry
 */
const path = require('path')
const Database = require('better-sqlite3')

const DRY = process.argv.includes('--dry')
const DBP = path.join(__dirname, '..', 'data', 'termojet.db')
const db = new Database(DBP)

// Формулювання тиску в усіх п'яти мовах картки. Ключ — що шукаємо, значення —
// на що міняємо. Порядок важливий: довші варіанти («до 6 бар») мають іти перед
// короткими, інакше короткий з'їсть частину довгого.
const ZAMINY = [
  ['до 6 бар', 'до 3 бар'],
  ['up to 6 bar', 'up to 3 bar'],
  ['do 6 bar', 'do 3 bar'],
  ["jusqu'à 6 bar", "jusqu'à 3 bar"],
  ['bis 6 bar', 'bis 3 bar'],
  ['6 бар', '3 бар'],
  ['6 bar', '3 bar'],
]

const pravyty = s => {
  if (typeof s !== 'string') return s
  let out = s
  for (const [a, b] of ZAMINY) out = out.split(a).join(b)
  return out
}

const POLIA = ['name', 'short_desc', 'description', 'specs', 'i18n',
               'seo_title', 'meta_description', 'features']

const rows = db.prepare(`
  SELECT id, sku, name, short_desc, description, specs, i18n, seo_title,
         meta_description, features
  FROM products
  WHERE name LIKE '%Насосна група%'
`).all().filter(r => /НГ-(46|47|48|51|52|67)/.test(r.name))

console.log(`насосних груп у вибірці: ${rows.length}`)

let zmineno = 0
let bezZmin = 0

for (const row of rows) {
  const patch = {}
  for (const p of POLIA) {
    const було = row[p]
    const стало = pravyty(було)
    if (стало !== було) patch[p] = стало
  }

  if (!Object.keys(patch).length) { bezZmin++; continue }

  const set = Object.keys(patch).map(k => `${k} = ?`).join(', ')
  if (!DRY) {
    db.prepare(`UPDATE products SET ${set} WHERE id = ?`)
      .run(...Object.values(patch), row.id)
  }
  console.log(`✓ ${row.sku.padEnd(11)} поля: ${Object.keys(patch).join(', ')}`)
  zmineno++
}

console.log(`\n${DRY ? '[суха прогонка] ' : ''}виправлено: ${zmineno}, уже було 3 бар: ${bezZmin}`)

// Контроль після запису. Дві перевірки: чи не лишилось «6 бар» у групах і чи
// не зачепило когось стороннього — повітровідвідники, трубу PE-RT і насоси TBE,
// у яких 6 бар свої й правильні.
const lyshylos = rows.filter(r => {
  const cur = db.prepare(
    'SELECT specs, description, short_desc, i18n FROM products WHERE id = ?').get(r.id)
  return /6\s*(бар|bar)/.test(Object.values(cur).join(' '))
})
console.log(`груп, де ще трапляється «6 бар»: ${lyshylos.length}` +
            (lyshylos.length ? ' — ' + lyshylos.map(r => r.sku).join(', ') : ''))

const chuzhi = db.prepare(`
  SELECT sku, name FROM products
  WHERE name NOT LIKE '%Насосна група%' AND (specs LIKE '%3 бар%' OR description LIKE '%3 бар%')
`).all()
console.log(`сторонніх карток із «3 бар» (мають бути лише TMV): ${chuzhi.length}` +
            (chuzhi.length ? ' — ' + chuzhi.map(r => r.sku).join(', ') : ''))
