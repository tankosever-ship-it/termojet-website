/*
 * apply-ape-20-60-diametr.js — APE 20/60/130 (30206013): діаметр RP ¾" (різьба 1"), а не RP 1 (різьба 1½").
 * Правка власниці 05.11.2026. Ідемпотентний, за замовчуванням лише показує план, --apply записує.
 * Перед --apply — бекап: docker compose exec app node backend/scripts/backup-db.cjs ape-20-60
 *
 * Міняє характеристику «Діаметр» у всіх мовах і згадки «1″ ВР» в описі, title й meta.
 */
const path = require('path')
const crypto = require('crypto')
const Database = require('better-sqlite3')

const APPLY = process.argv.includes('--apply')
const LANGS = ['en', 'pl', 'fr', 'de', 'ro']
const SPEC = {
  uk: 'RP ¾" (різьба 1")', en: 'RP ¾" (thread 1")', pl: 'RP ¾" (gwint 1")',
  fr: 'RP ¾" (filetage 1")', de: 'RP ¾" (Gewinde 1")', ro: 'RP ¾" (filet 1")',
}
// «1″ ВР» / «1″ IG» / «1″ BSP» / «1″ GW» / «1″ F» / «1″ FF» / «1″ FI» — підключення насоса
const fixText = s => (typeof s === 'string' ? s.replace(/1″ (?=(?:ВР|IG|BSP|GW|FF|FI|F)(?![A-Za-zА-Яа-яІіЇїЄє]))/g, '¾″ ') : s)
const isDiameter = v => /^RP 1\s*\(/.test(String(v))

// Штамп _srcHash — так само, як translate-content.js (див. apply-klapany-nazvy.js)
const HASH_FIELDS = ['name', 'short_desc', 'description', 'specs', 'seo_title', 'meta_description', 'subcategory']
function srcHash(row) {
  const src = {}
  for (const key of HASH_FIELDS) {
    const raw = row[key]
    if (raw == null || raw === '' || raw === '{}' || raw === '[]') continue
    src[key] = raw
  }
  return crypto.createHash('sha256').update(JSON.stringify(src)).digest('hex').slice(0, 16)
}

const DBP = process.env.TERMOJET_DB || path.join(__dirname, '..', 'data', 'termojet.db')
const db = new Database(DBP)
const row = db.prepare("SELECT * FROM products WHERE sku = '30206013'").get()
if (!row) { console.log('товар 30206013 не знайдено'); process.exit(1) }

const next = { ...row }
const specs = JSON.parse(row.specs || '{}')
for (const k of Object.keys(specs)) if (isDiameter(specs[k])) specs[k] = SPEC.uk
next.specs = JSON.stringify(specs)
for (const f of ['description', 'seo_title', 'meta_description']) next[f] = fixText(row[f])

const i18n = JSON.parse(row.i18n || '{}')
for (const lang of LANGS) {
  const tr = i18n[lang]
  if (!tr || typeof tr !== 'object') continue
  for (const f of ['description', 'seo_title', 'meta_description']) if (tr[f]) tr[f] = fixText(tr[f])
  if (tr.specs) {
    const isStr = typeof tr.specs === 'string'
    const sp = isStr ? JSON.parse(tr.specs) : tr.specs
    for (const k of Object.keys(sp)) if (isDiameter(sp[k])) sp[k] = SPEC[lang]
    tr.specs = isStr ? JSON.stringify(sp) : sp
  }
}
const oldHash = srcHash(row)
const h = srcHash(next)
if (i18n._srcHash) for (const lang of LANGS) if (i18n[lang] && i18n._srcHash[lang] === oldHash) i18n._srcHash[lang] = h
next.i18n = JSON.stringify(i18n)

const changed = ['specs', 'description', 'seo_title', 'meta_description', 'i18n'].filter(f => next[f] !== row[f])
console.log('uk:', specs['Діаметр'], '|', next.seo_title, '|', next.meta_description)
for (const lang of LANGS) console.log(`${lang}:`, Object.values(i18n[lang]?.specs || {}).find(v => /^RP/.test(String(v))), '|', i18n[lang]?.seo_title)
console.log('¾″ в описі uk:', (next.description.match(/.{30}¾″.{60}/g) || []).join(' ; ') || 'немає')
console.log('залишки «1″» в описі uk:', (next.description.match(/.{20}1″.{20}/g) || []).join(' ; ') || 'немає')
console.log('поля зі змінами:', changed.join(', ') || 'немає')
if (APPLY && changed.length) {
  db.prepare('UPDATE products SET specs = @specs, description = @description, seo_title = @seo_title, meta_description = @meta_description, i18n = @i18n WHERE id = @id').run(next)
  console.log('✅ записано')
} else if (!APPLY) console.log('Це лише показ. Щоб записати: додай --apply')
