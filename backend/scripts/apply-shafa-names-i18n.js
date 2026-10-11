/*
 * apply-shafa-names-i18n.js — назви шаф у перекладах під терміни сторінки категорії
 * «Колекторна шафа» (src/data/category-landing.json), 11.10.2026.
 * Ідемпотентний, за замовчуванням лише показує план.
 *
 *   попередній перегляд:  docker compose exec -T app node backend/scripts/apply-shafa-names-i18n.js
 *   застосувати:          docker compose exec -T app node backend/scripts/apply-shafa-names-i18n.js --apply
 *
 * Перед --apply — бекап: docker compose exec app node backend/scripts/backup-db.cjs shafa-names
 *
 * Міняємо лише перекладені name / short_desc / seo_title / meta_description 14 шаф;
 * довгі описи (синоніми там природні) і українське джерело не чіпаємо — тому штамп
 * `_srcHash` лишається чинним і translate-content.js переклади не перетре.
 */
const path = require('path')
const Database = require('better-sqlite3')

const APPLY = process.argv.includes('--apply')
const FIELDS = ['name', 'short_desc', 'seo_title', 'meta_description']

// [regex, заміна] за мовою; порядок важливий
const RULES = {
  en: [
    [/\bFlush manifold cabinet\b/g, 'Flush-mounted manifold cabinet'],
    [/\b(?:Surface-mount|External) manifold cabinet\b/g, 'Surface-mounted manifold cabinet'],
    [/\bRecessed Manifold Cabinet\b/g, 'Flush-Mounted Manifold Cabinet'],
    [/\brecessed manifold cabinet\b/g, 'flush-mounted manifold cabinet'],
  ],
  pl: [
    [/Szafka kolektorowa podtynkowa/g, 'Szafka rozdzielaczowa podtynkowa'],
    [/Szafka (?:kolektorowa natynkowa|rozdzielaczowa zewnętrzna)/g, 'Szafka rozdzielaczowa natynkowa'],
  ],
  fr: [
    [/Armoire de collecteur encastrée/g, 'Coffret de collecteur encastré'],
    [/Armoire de collecteur en saillie|Coffret de collecteur extérieur/g, 'Coffret de collecteur en saillie'],
    [/Coffret collecteur /g, 'Coffret de collecteur '],
  ],
  de: [
    [/Unterputz-Verteilerkasten/g, 'Unterputz-Verteilerschrank'],
    [/(?:Aufputz|Außen)-Verteilerkasten/g, 'Aufputz-Verteilerschrank'],
    [/(Verteilerschrank für [\d–-]+) Abgänge/g, '$1 Ausgänge'],
  ],
  ro: [
    [/Cutie colector încastrată/g, 'Cutie distribuitor încastrată'],
    [/Cutie colector aparentă|Cutie de colector externă/g, 'Cutie distribuitor aplicată'],
    [/(Cutie distribuitor \S+(?: Termojet)?) №\s*(\d)/g, '$1 Nr. $2'],
  ],
}

const DBP = process.env.TERMOJET_DB || path.join(__dirname, '..', 'data', 'termojet.db')
const db = new Database(DBP)
const rows = db.prepare("SELECT id, sku, name, i18n FROM products WHERE category_slug = 'shafa-kolektorna' ORDER BY sku").all()
const upd = db.prepare('UPDATE products SET i18n = @i18n WHERE id = @id')

const plan = []
for (const row of rows) {
  let i18n
  try { i18n = JSON.parse(row.i18n || '{}') } catch { continue }
  let changed = false
  for (const [lang, rules] of Object.entries(RULES)) {
    const t = i18n[lang]; if (!t) continue
    for (const f of FIELDS) {
      if (typeof t[f] !== 'string') continue
      const v = rules.reduce((s, [re, to]) => s.replace(re, to), t[f])
      if (v !== t[f]) { console.log(`• ${row.sku} ${lang}.${f}\n    − ${t[f]}\n    + ${v}`); t[f] = v; changed = true }
    }
  }
  if (changed) plan.push({ id: row.id, i18n: JSON.stringify(i18n) })
}

console.log(`\nтоварів зі змінами: ${plan.length} із ${rows.length}`)
if (!APPLY) console.log('Це лише показ. Щоб записати: додай --apply')
else if (plan.length) { db.transaction(() => { for (const p of plan) upd.run(p) })(); console.log(`✅ оновлено ${plan.length} товарів у ${DBP}`) }
else console.log('✅ змінювати нічого')
