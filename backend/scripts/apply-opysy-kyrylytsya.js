/*
 * apply-opysy-kyrylytsya.js — прибирає українські слова, що лишились у перекладах описів
 * (en/pl/fr/de) зонального клапана 47025230 і приводу TJ413 (11.11.2026): «Нм», «секунд»,
 * «3-точкове», «м³/год», «Ступінь захисту». Ідемпотентний, без --apply лише показує план.
 *
 *   docker compose exec -T app node backend/scripts/apply-opysy-kyrylytsya.js
 *   docker compose exec -T app node backend/scripts/apply-opysy-kyrylytsya.js --apply
 *
 * Перед --apply — бекап: docker compose exec app node backend/scripts/backup-db.cjs opysy
 * Українське джерело не змінюється, тож штамп _srcHash лишається чинним.
 */
const path = require('path')
const Database = require('better-sqlite3')

const APPLY = process.argv.includes('--apply')
const SKUS = ['47025230', 'TJ413']
const FIX = {
  en: [['3-точкове', '3-point'], ['Нм', 'Nm'], ['секунд', 'seconds'], ['м³/год', 'm³/h'], ['Ступінь захисту', 'Protection degree']],
  pl: [['3-точкове', '3-punktowe'], ['Нм', 'Nm'], ['секунд', 'sekund'], ['м³/год', 'm³/h'], ['Ступінь захисту', 'Stopień ochrony']],
  fr: [['3-точкове', '3 points'], ['Нм', 'Nm'], ['секунд', 'secondes'], ['м³/год', 'm³/h'], ['Ступінь захисту', 'Indice de protection']],
  de: [['3-точкове', '3-Punkt'], ['Нм', 'Nm'], ['секунд', 'Sekunden'], ['м³/год', 'm³/h'], ['Ступінь захисту', 'Schutzart']],
}
const FIELDS = ['description', 'short_desc']

const DBP = process.env.TERMOJET_DB || path.join(__dirname, '..', 'data', 'termojet.db')
const db = new Database(DBP)
const sel = db.prepare('SELECT id, sku, i18n FROM products WHERE sku = ?')
const upd = db.prepare('UPDATE products SET i18n = ? WHERE id = ?')

const plan = []
for (const sku of SKUS) {
  const row = sel.get(sku)
  if (!row) { console.log(`· ${sku}: товару немає`); continue }
  const i18n = JSON.parse(row.i18n || '{}')
  let n = 0
  for (const [lang, pairs] of Object.entries(FIX)) {
    for (const f of FIELDS) {
      let v = i18n[lang]?.[f]
      if (typeof v !== 'string') continue
      for (const [a, b] of pairs) { const c = v.split(a).length - 1; if (c) { v = v.split(a).join(b); n += c } }
      i18n[lang][f] = v
    }
  }
  const left = JSON.stringify(Object.fromEntries(Object.keys(FIX).map(l => [l, FIELDS.map(f => i18n[l]?.[f] || '')])))
    .match(/[А-Яа-яІіЇїЄєҐґ]{2,}/g)
  console.log(`• ${sku}: замін ${n}${left ? ` · лишилась кирилиця: ${[...new Set(left)].join(', ')}` : ''}`)
  if (n) plan.push([JSON.stringify(i18n), row.id])
}
if (!APPLY) console.log('Це лише показ. Щоб записати: додай --apply')
else if (plan.length) { db.transaction(() => plan.forEach(p => upd.run(...p)))(); console.log(`✅ оновлено ${plan.length} товари`) }
else console.log('✅ змінювати нічого')
