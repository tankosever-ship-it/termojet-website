/*
 * apply-kolektor-pidloha.js — окрема категорія «Колектор для теплої підлоги» і нова адреса
 * вузла TJ-MU-40А (SEO, 16.10.2026). Ідемпотентний, за замовчуванням лише показує план.
 *
 *   попередній перегляд:  docker compose exec -T app node backend/scripts/apply-kolektor-pidloha.js
 *   застосувати:          docker compose exec -T app node backend/scripts/apply-kolektor-pidloha.js --apply
 *
 * Перед --apply — бекап (НЕ cp, база у WAL):
 *   docker compose exec app node backend/scripts/backup-db.cjs kolektor-pidloha
 *
 * Що робить:
 *  1. 14 колекторів з витратомірами TJ-W — з «Системи підлогового опалення» (kolektory-pidloha)
 *     у kolektor-dlya-teployi-pidlogy. Колектори з кранами TJ-R-W лишаються. Старі URL
 *     товарів віддають 301 (server.js → handleProduct: категорія в URL ≠ категорії товару).
 *  2. TJ-MU-40А: slug …-tj-mu-10b-2 (спадок WP від TJ-MU-10B) → …-tj-mu-40a. Старий slug —
 *     301 через PRODUCT_SLUG_ALIASES у server.js; відгуки (product_reviews) — на новий slug.
 *  3. Посилання на перенесені товари й старий slug в описах усіх товарів, у всіх мовах —
 *     на нові адреси, щоб не вести через 301. Заодно — будь-яке посилання на товар зі
 *     старою категорією в адресі (вузли TJ-MU, шафи після 11.10.2026).
 *
 * Де змінилось українське джерело (п. 3) — переставляємо штамп `_srcHash`, інакше
 * translate-content.js вважав би переклад застарілим і перетер би його машинним.
 */
const path = require('path')
const crypto = require('crypto')
const Database = require('better-sqlite3')

const APPLY = process.argv.includes('--apply')
const LANGS = ['uk', 'en', 'pl', 'fr', 'de', 'ro']
const TEXT_FIELDS = ['name', 'short_desc', 'description', 'seo_title', 'meta_description', 'specs']

const OLD_CAT = 'kolektory-pidloha'
const NEW_CAT = 'kolektor-dlya-teployi-pidlogy'
const isFlowManifold = row => row.category_slug === OLD_CAT && /^84040TJ-W-\d+$/.test(row.sku || '') && /витратомір/i.test(row.name || '')

const MU_CAT = 'zmishuvalnyj-vuzol-dlya-teployi-pidlogy'
const MU_OLD = 'zmishuvalnyj-vuzol-dlya-teployi-pidlogy-tj-mu-10b-2'
const MU_NEW = 'zmishuvalnyj-vuzol-dlya-teployi-pidlogy-tj-mu-40a'

// Заміни в текстах (мовний префікс /en/… лишається перед адресою як був).
// «84040tj-w-» не зачіпає «84040tj-r-w-» (колектори з кранами лишаються в старій категорії).
const REPL = [
  [`/catalog/${OLD_CAT}/84040tj-w-`, `/catalog/${NEW_CAT}/84040tj-w-`],
  [`/catalog/${OLD_CAT}/${MU_OLD}`, `/catalog/${MU_CAT}/${MU_NEW}`],
  [`/catalog/${MU_CAT}/${MU_OLD}`, `/catalog/${MU_CAT}/${MU_NEW}`],
]
// Після явних замін — будь-яке /catalog/<cat>/<slug>, де <cat> не збігається з (новою) категорією
// товару, ведемо одразу в його категорію (напр. вузли TJ-MU, що досі посилались на kolektory-pidloha).
let FINAL_CAT = new Map()
const fixLinks = s => {
  if (typeof s !== 'string') return s
  let out = s
  for (const [a, b] of REPL) if (out.includes(a)) out = out.split(a).join(b)
  out = out.replace(/\/catalog\/([a-z0-9-]+)\/([a-z0-9-]+)/g, (m, cat, slug) => {
    const real = FINAL_CAT.get(slug)
    return real && real !== cat ? `/catalog/${real}/${slug}` : m
  })
  return out
}

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
const upd = db.prepare(`UPDATE products SET slug = @slug, short_desc = @short_desc, description = @description, specs = @specs,
  seo_title = @seo_title, meta_description = @meta_description, category_slug = @category_slug, i18n = @i18n WHERE id = @id`)

if (rows.some(r => r.slug === MU_NEW && r.slug !== MU_OLD) && rows.some(r => r.slug === MU_OLD)) {
  console.error(`⛔ обидва slug-и вже існують (${MU_OLD} і ${MU_NEW}) — розібратись вручну`)
  process.exit(1)
}

FINAL_CAT = new Map(rows.map(r => [r.slug === MU_OLD ? MU_NEW : r.slug, isFlowManifold(r) ? NEW_CAT : r.category_slug]))

const plan = []
const stats = { moved: 0, slug: 0, links: 0 }

for (const row of rows) {
  let i18n = {}
  try { i18n = JSON.parse(row.i18n || '{}') } catch { i18n = {} }
  const next = { ...row }
  const notes = []
  let srcChanged = false
  let i18nChanged = false

  if (isFlowManifold(row)) { next.category_slug = NEW_CAT; stats.moved++; notes.push(`категорія ${OLD_CAT} → ${NEW_CAT}`) }
  if (row.slug === MU_OLD) { next.slug = MU_NEW; stats.slug++; notes.push(`slug ${MU_OLD} → ${MU_NEW}`) }

  for (const f of TEXT_FIELDS) {
    const v = fixLinks(next[f]); if (v !== next[f]) { next[f] = v; srcChanged = true }
  }
  for (const lang of LANGS.filter(l => l !== 'uk')) {
    const t = i18n[lang]; if (!t || typeof t !== 'object') continue
    for (const f of Object.keys(t)) {
      const v = fixLinks(t[f]); if (v !== t[f]) { t[f] = v; i18nChanged = true }
    }
  }
  if (srcChanged || i18nChanged) { stats.links++; notes.push(`посилання → нові адреси${srcChanged ? ' (uk' : ' ('}${i18nChanged ? ' + переклади)' : ')'}`) }

  if (!srcChanged && !i18nChanged && next.category_slug === row.category_slug && next.slug === row.slug) continue
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

// Відгуки до товару зберігають slug і категорію на момент відгуку
const hasReviews = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='product_reviews'").get()
const revPlan = hasReviews ? [
  ['UPDATE product_reviews SET product_slug = ? WHERE product_slug = ?', MU_NEW, MU_OLD],
  [`UPDATE product_reviews SET category_slug = ? WHERE category_slug = ? AND product_slug LIKE '84040tj-w-%'`, NEW_CAT, OLD_CAT],
] : []
if (hasReviews) {
  const n1 = db.prepare('SELECT COUNT(*) c FROM product_reviews WHERE product_slug = ?').get(MU_OLD).c
  const n2 = db.prepare(`SELECT COUNT(*) c FROM product_reviews WHERE category_slug = ? AND product_slug LIKE '84040tj-w-%'`).get(OLD_CAT).c
  console.log(`\nвідгуки: на старому slug TJ-MU-40А — ${n1}, на колекторах TJ-W зі старою категорією — ${n2}`)
}

console.log(`\nперенесено колекторів: ${stats.moved} (очікується 14), нових slug: ${stats.slug} (очікується 1), товарів із виправленими посиланнями: ${stats.links}`)

if (!APPLY) {
  console.log('\nЦе лише показ. Щоб записати: додай --apply')
} else if (plan.length || revPlan.length) {
  db.transaction(() => {
    for (const p of plan) upd.run(p)
    for (const [sql, ...args] of revPlan) db.prepare(sql).run(...args)
  })()
  console.log(`\n✅ оновлено ${plan.length} товарів у ${DBP}`)
} else {
  console.log('\n✅ змінювати нічого')
}
