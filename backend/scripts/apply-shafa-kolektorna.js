/*
 * apply-shafa-kolektorna.js — окрема категорія «Колекторна шафа» (SEO, 11.10.2026).
 * Ідемпотентний, за замовчуванням лише показує план.
 *
 *   попередній перегляд:  docker compose exec -T app node backend/scripts/apply-shafa-kolektorna.js
 *   застосувати:          docker compose exec -T app node backend/scripts/apply-shafa-kolektorna.js --apply
 *
 * Перед --apply — бекап (НЕ cp, база у WAL):
 *   docker compose exec app node backend/scripts/backup-db.cjs shafa-kolektorna
 *
 * Що робить:
 *  1. 14 шаф (внутрішні TJ0002xx і зовнішні TJ0020xx) — з «Системи підлогового опалення»
 *     (kolektory-pidloha) у категорію shafa-kolektorna. Старі URL товарів віддають 301
 *     (server.js → handleProduct: категорія в URL ≠ категорії товару).
 *  2. Посилання на шафи в описах інших товарів (колектори радять «шафу №0X») — на нову
 *     адресу, у всіх мовах, щоб не вести через 301.
 *
 * Де змінилось українське джерело (п. 2) — переставляємо штамп `_srcHash`, інакше
 * translate-content.js вважав би переклад застарілим і перетер би його машинним.
 */
const path = require('path')
const crypto = require('crypto')
const Database = require('better-sqlite3')

const APPLY = process.argv.includes('--apply')
const LANGS = ['uk', 'en', 'pl', 'fr', 'de', 'ro']
const TEXT_FIELDS = ['name', 'short_desc', 'description', 'seo_title', 'meta_description', 'specs']

const OLD_CAT = 'kolektory-pidloha'
const NEW_CAT = 'shafa-kolektorna'
const isCabinet = row => row.category_slug === OLD_CAT && /^Шафа колекторна (внутрішня|зовнішня)/.test(row.name || '')

// Префікс адреси перенесених товарів (slug-и шаф починаються з shafa-kolektorna-…);
// мовний префікс (/en/…) лишається перед ним як був.
const FROM = `/catalog/${OLD_CAT}/shafa-kolektorna-`
const TO = `/catalog/${NEW_CAT}/shafa-kolektorna-`
const fixLinks = s => (typeof s === 'string' && s.includes(FROM) ? s.split(FROM).join(TO) : s)

// Штамп _srcHash — так само, як translate-content.js (див. apply-seo-2026-10.js)
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

const rows = db.prepare(`SELECT id, sku, slug, name, category_slug, short_desc, description, specs,
  seo_title, meta_description, subcategory, i18n FROM products`).all()
const upd = db.prepare(`UPDATE products SET short_desc = @short_desc, description = @description, specs = @specs,
  seo_title = @seo_title, meta_description = @meta_description, category_slug = @category_slug, i18n = @i18n WHERE id = @id`)

const plan = []
const stats = { moved: 0, links: 0 }

for (const row of rows) {
  let i18n = {}
  try { i18n = JSON.parse(row.i18n || '{}') } catch { i18n = {} }
  const next = { ...row }
  const notes = []
  let srcChanged = false
  let i18nChanged = false

  if (isCabinet(row)) { next.category_slug = NEW_CAT; stats.moved++; notes.push(`категорія ${OLD_CAT} → ${NEW_CAT}`) }

  for (const f of TEXT_FIELDS) {
    const v = fixLinks(next[f]); if (v !== next[f]) { next[f] = v; srcChanged = true }
  }
  for (const lang of LANGS.filter(l => l !== 'uk')) {
    const t = i18n[lang]; if (!t || typeof t !== 'object') continue
    for (const f of Object.keys(t)) {
      const v = fixLinks(t[f]); if (v !== t[f]) { t[f] = v; i18nChanged = true }
    }
  }
  if (srcChanged || i18nChanged) { stats.links++; notes.push(`посилання на шафи → /catalog/${NEW_CAT}/…${srcChanged ? ' (uk' : ' ('}${i18nChanged ? ' + переклади)' : ')'}`) }

  if (!srcChanged && !i18nChanged && next.category_slug === row.category_slug) continue
  if (srcChanged) {
    // Українське джерело змінилось, переклади оновлено тут же — штамп переставляємо
    const h = srcHash(next)
    i18n._srcHash = i18n._srcHash || {}
    for (const lang of LANGS.filter(l => l !== 'uk')) if (i18n[lang]) i18n._srcHash[lang] = h
  }
  next.i18n = JSON.stringify(i18n)
  plan.push(next)
  console.log(`• ${row.sku || row.id}  ${row.name.slice(0, 70)}`)
  for (const n of notes) console.log(`    ${n}`)
}

const left = rows.filter(r => r.category_slug === OLD_CAT && /^Шафа колекторна/.test(r.name || '') && !isCabinet(r))
console.log(`\nперенесено шаф: ${stats.moved} (очікується 14), товарів із виправленими посиланнями: ${stats.links}`)
if (left.length) console.log(`⚠️  лишились у ${OLD_CAT}: ${left.map(r => r.name).join('; ')}`)

if (!APPLY) {
  console.log('\nЦе лише показ. Щоб записати: додай --apply')
} else if (plan.length) {
  db.transaction(() => { for (const p of plan) upd.run(p) })()
  console.log(`\n✅ оновлено ${plan.length} товарів у ${DBP}`)
} else {
  console.log('\n✅ змінювати нічого')
}
