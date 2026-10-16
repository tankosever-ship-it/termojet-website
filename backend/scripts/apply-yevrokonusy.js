/*
 * apply-yevrokonusy.js — окрема категорія «Євроконуси та байпас» (SEO, 16.10.2026).
 * Ідемпотентний, за замовчуванням лише показує план.
 *
 *   попередній перегляд:  docker compose exec -T app node backend/scripts/apply-yevrokonusy.js
 *   застосувати:          docker compose exec -T app node backend/scripts/apply-yevrokonusy.js --apply
 *
 * Перед --apply — бекап (НЕ cp, база у WAL):
 *   docker compose exec app node backend/scripts/backup-db.cjs yevrokonusy
 *
 * Що робить:
 *  1. Євроконуси TJ-EC-162 / TJ-EC-202 і байпас TJ-B-1 — з «Системи підлогового опалення»
 *     (kolektory-pidloha) у yevrokonusy-ta-bajpas. Старі URL товарів віддають 301
 *     (server.js → handleProduct: категорія в URL ≠ категорії товару).
 *  2. TJ-EC-162: характеристики в тому ж вигляді, що в TJ-EC-202 (тип, розмір труби, матеріал,
 *     різьба) — для бейджів на картці; ключі перекладів у тому самому порядку.
 *  3. TJ-EC-202: код у кінці назви (правило назв «тип → Termojet → деталі → код»), усі мови.
 *  4. Посилання на товари в описах усіх товарів, у всіх мовах — одразу на актуальну категорію.
 *
 * Де змінилось українське джерело — переставляємо штамп `_srcHash` тим мовам, що були
 * актуальні, інакше translate-content.js вважав би переклад застарілим і перетер би машинним.
 */
const path = require('path')
const crypto = require('crypto')
const Database = require('better-sqlite3')

const APPLY = process.argv.includes('--apply')
const LANGS = ['uk', 'en', 'pl', 'fr', 'de', 'ro']
const TEXT_FIELDS = ['short_desc', 'description', 'seo_title', 'meta_description', 'specs']

const OLD_CAT = 'kolektory-pidloha'
const NEW_CAT = 'yevrokonusy-ta-bajpas'
const MOVE = ['84040TJ-EC-162', '84040TJ-EC-202', '84040TJ-B-1']

// TJ-EC-162: характеристики як у TJ-EC-202; різьба — «ВР», як було в його даних («¾”x16 мм ВР»)
const EC162_SPECS = {
  uk: { 'Тип': 'Євроконус (обтискний фітинг)', 'Розмір труби': '16×2.0 мм', 'Матеріал': 'Латунь', 'Різьба': '3/4" ВР' },
  en: { 'Type': 'Euroconus (compression fitting)', 'Pipe size': '16×2.0 mm', 'Material': 'Brass', 'Thread': '3/4" female' },
  pl: { 'Typ': 'Eurostożek (złączka zaciskowa)', 'Rozmiar rury': '16×2.0 mm', 'Materiał': 'Mosiądz', 'Gwint': '3/4" GW' },
  fr: { 'Type': 'Eurocône (raccord à compression)', 'Taille du tuyau': '16×2.0 mm', 'Matériau': 'Laiton', 'Filetage': '3/4" femelle' },
  de: { 'Typ': 'Eurokonus (Klemmverschraubung)', 'Rohrgröße': '16×2.0 mm', 'Material': 'Messing', 'Gewinde': '3/4" IG' },
  ro: { 'Tip': 'Eurocon (fiting de compresie)', 'Dimensiunea țevii': '16×2.0 mm', 'Material': 'Alamă', 'Filet': '3/4" FI' },
}
const EC202_CODE = 'TJ-EC-202'

// Штамп _srcHash — так само, як translate-content.js (див. apply-shafa-kolektorna.js)
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
const upd = db.prepare(`UPDATE products SET name = @name, short_desc = @short_desc, description = @description, specs = @specs,
  seo_title = @seo_title, meta_description = @meta_description, category_slug = @category_slug, i18n = @i18n WHERE id = @id`)

const moves = row => row.category_slug === OLD_CAT && MOVE.includes(row.sku)
// Посилання /catalog/<cat>/<slug>, де <cat> ≠ (новій) категорії товару, — одразу на справжню
const FINAL_CAT = new Map(rows.map(r => [r.slug, moves(r) ? NEW_CAT : r.category_slug]))
const fixLinks = s => (typeof s !== 'string' ? s : s.replace(/\/catalog\/([a-z0-9-]+)\/([a-z0-9-]+)/g, (m, cat, slug) => {
  const real = FINAL_CAT.get(slug)
  return real && real !== cat ? `/catalog/${real}/${slug}` : m
}))
const withCode = name => (typeof name === 'string' && name && !name.includes(EC202_CODE) ? `${name.trim()} ${EC202_CODE}` : name)

const plan = []
const stats = { moved: 0, specs: 0, name: 0, links: 0 }
for (const row of rows) {
  let i18n = {}
  try { i18n = JSON.parse(row.i18n || '{}') } catch { i18n = {} }
  const next = { ...row }
  const notes = []
  let srcChanged = false
  let i18nChanged = false

  if (moves(row)) { next.category_slug = NEW_CAT; stats.moved++; notes.push(`категорія ${OLD_CAT} → ${NEW_CAT}`) }

  if (row.sku === '84040TJ-EC-162') {
    const s = JSON.stringify(EC162_SPECS.uk)
    if (row.specs !== s) { next.specs = s; srcChanged = true; stats.specs++; notes.push('характеристики як у TJ-EC-202') }
    for (const lang of LANGS.filter(l => l !== 'uk')) {
      const t = i18n[lang]; if (!t || typeof t !== 'object') continue
      if (JSON.stringify(t.specs) !== JSON.stringify(EC162_SPECS[lang])) { t.specs = EC162_SPECS[lang]; i18nChanged = true }
    }
  }
  if (row.sku === '84040TJ-EC-202') {
    const n = withCode(row.name)
    if (n !== row.name) { next.name = n; srcChanged = true; stats.name++; notes.push(`назва → «${n}»`) }
    for (const lang of LANGS.filter(l => l !== 'uk')) {
      const t = i18n[lang]; if (!t || typeof t !== 'object') continue
      const tn = withCode(t.name); if (tn !== t.name) { t.name = tn; i18nChanged = true }
    }
  }

  let linksChanged = false
  for (const f of TEXT_FIELDS) {
    const v = fixLinks(next[f]); if (v !== next[f]) { next[f] = v; srcChanged = true; linksChanged = true }
  }
  for (const lang of LANGS.filter(l => l !== 'uk')) {
    const t = i18n[lang]; if (!t || typeof t !== 'object') continue
    for (const f of Object.keys(t)) {
      if (typeof t[f] !== 'string') continue
      const v = fixLinks(t[f]); if (v !== t[f]) { t[f] = v; i18nChanged = true; linksChanged = true }
    }
  }
  if (linksChanged) { stats.links++; notes.push('посилання → актуальні адреси') }

  if (!srcChanged && !i18nChanged && next.category_slug === row.category_slug) continue
  if (srcChanged) {
    // Українське джерело змінилось, переклади оновлено тут же — штамп переставляємо актуальним мовам
    const oldHash = srcHash(row)
    const h = srcHash(next)
    i18n._srcHash = i18n._srcHash || {}
    for (const lang of LANGS.filter(l => l !== 'uk')) if (i18n[lang] && i18n._srcHash[lang] === oldHash) i18n._srcHash[lang] = h
  }
  next.i18n = JSON.stringify(i18n)
  plan.push(next)
  console.log(`• ${row.sku || row.id}  ${row.name.slice(0, 70)}`)
  for (const n of notes) console.log(`    ${n}`)
}

// Відгуки до товару зберігають категорію на момент відгуку
const hasReviews = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='product_reviews'").get()
const movedSlugs = rows.filter(moves).map(r => r.slug)
const revSql = `UPDATE product_reviews SET category_slug = ? WHERE category_slug = ? AND product_slug IN (${movedSlugs.map(() => '?').join(',') || "''"})`
if (hasReviews && movedSlugs.length) {
  const n = db.prepare(revSql.replace(/^UPDATE product_reviews SET category_slug = \? WHERE/, 'SELECT COUNT(*) c FROM product_reviews WHERE')).get(OLD_CAT, ...movedSlugs).c
  console.log(`\nвідгуки на перенесених товарах: ${n}`)
}

console.log(`\nперенесено: ${stats.moved} (очікується 3), характеристик TJ-EC-162: ${stats.specs}, назв: ${stats.name}, товарів із виправленими посиланнями: ${stats.links}`)

if (!APPLY) {
  console.log('\nЦе лише показ. Щоб записати: додай --apply')
} else if (plan.length) {
  db.transaction(() => {
    for (const p of plan) upd.run(p)
    if (hasReviews && movedSlugs.length) db.prepare(revSql).run(NEW_CAT, OLD_CAT, ...movedSlugs)
  })()
  console.log(`\n✅ оновлено ${plan.length} товарів у ${DBP}`)
} else {
  console.log('\n✅ змінювати нічого')
}
