/*
 * gen-sitemap.cjs — генерує public/sitemap.xml з товарів + категорій + статичних сторінок.
 * Включає EN-URL (/en/...) з hreflang-анотаціями і <lastmod> з дат товарів/постів.
 * Запуск: node scripts/gen-sitemap.cjs  (також виконується автоматично перед build:prod)
 */
const fs = require('fs')
const path = require('path')

const BASE = 'https://termojet.com.ua'
const dbPath = path.join(__dirname, '..', 'backend', 'data', 'termojet.db')
const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml')

// ⚠️ У Docker-builder немає ні backend/node_modules, ні data/termojet.db (обидва в .dockerignore).
// Тому якщо БД/модуль недоступні — НЕ чіпаємо наявний public/sitemap.xml (закомічений, актуальний)
// і виходимо без помилки, щоб build:prod не крашнув. Оновлення sitemap: локальний запуск + коміт.
let Database
try {
  Database = require('../backend/node_modules/better-sqlite3')
} catch {
  console.warn('gen-sitemap: better-sqlite3 недоступний (build-контекст) — лишаю наявний public/sitemap.xml')
  process.exit(0)
}
let db
try {
  db = new Database(dbPath, { readonly: true })
} catch {
  console.warn('gen-sitemap: БД недоступна — лишаю наявний public/sitemap.xml')
  process.exit(0)
}

// статичні сторінки (реальні роути) з пріоритетами/частотою
const STATIC = [
  ['/', 'daily', '1.0'],
  ['/catalog', 'daily', '0.9'],
  ['/about', 'monthly', '0.6'],
  ['/contacts', 'monthly', '0.6'],
  ['/service', 'monthly', '0.6'],
  ['/delivery', 'monthly', '0.5'],
  ['/files', 'weekly', '0.5'],
  ['/faq', 'monthly', '0.5'],
  ['/partners', 'monthly', '0.5'],
  ['/oem', 'monthly', '0.5'],
  ['/blog', 'weekly', '0.5'],
  ['/portfolio', 'monthly', '0.5'],
  ['/reviews', 'weekly', '0.5'],
  ['/returns', 'yearly', '0.3'],
  ['/privacy', 'yearly', '0.3'],
  ['/terms', 'yearly', '0.3'],
]

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function toDate(val) {
  if (!val) return null
  const d = new Date(val)
  if (isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

const today = new Date().toISOString().slice(0, 10)

// Рендеримо hreflang-блок для URL-пари UA↔EN
function hreflangBlock(uaLoc, enLoc) {
  return (
    `    <xhtml:link rel="alternate" hreflang="uk" href="${esc(uaLoc)}" />\n` +
    `    <xhtml:link rel="alternate" hreflang="en" href="${esc(enLoc)}" />\n` +
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(uaLoc)}" />`
  )
}

// Рендеримо один <url> запис (з опційними hreflang)
function urlEntry(loc, { freq, pri, lastmod, uaLoc, enLoc } = {}) {
  let s = `  <url>\n    <loc>${esc(loc)}</loc>\n`
  if (lastmod) s += `    <lastmod>${lastmod}</lastmod>\n`
  if (freq) s += `    <changefreq>${freq}</changefreq>\n`
  if (pri) s += `    <priority>${pri}</priority>\n`
  if (uaLoc && enLoc) s += `${hreflangBlock(uaLoc, enLoc)}\n`
  s += `  </url>`
  return s
}

const entries = []

// Статичні сторінки: UA + EN обидві з hreflang
for (const [loc, freq, pri] of STATIC) {
  const uaLoc = BASE + loc
  const enLoc = BASE + '/en' + (loc === '/' ? '' : loc)
  entries.push(urlEntry(uaLoc, { freq, pri, uaLoc, enLoc }))
  entries.push(urlEntry(enLoc, { freq, pri, uaLoc, enLoc }))
}

// Категорії з БД (унікальні categorySlug видимих товарів)
const cats = db.prepare(
  'SELECT DISTINCT category_slug FROM products WHERE is_visible = 1 AND category_slug IS NOT NULL ORDER BY category_slug'
).all().map(r => r.category_slug)

for (const c of cats) {
  const uaLoc = `${BASE}/catalog/${c}`
  const enLoc = `${BASE}/en/catalog/${c}`
  entries.push(urlEntry(uaLoc, { freq: 'weekly', pri: '0.8', uaLoc, enLoc }))
  entries.push(urlEntry(enLoc, { freq: 'weekly', pri: '0.8', uaLoc, enLoc }))
}

// Товари з БД (видимі, зі slug і категорією) — з реальним created_at
const products = db.prepare(
  'SELECT category_slug, slug, created_at FROM products WHERE is_visible = 1 AND slug IS NOT NULL AND category_slug IS NOT NULL ORDER BY category_slug, slug'
).all()

for (const p of products) {
  const lastmod = toDate(p.created_at) || today
  const uaLoc = `${BASE}/catalog/${esc(p.category_slug)}/${esc(p.slug)}`
  const enLoc = `${BASE}/en/catalog/${esc(p.category_slug)}/${esc(p.slug)}`
  entries.push(urlEntry(uaLoc, { freq: 'weekly', pri: '0.7', lastmod, uaLoc, enLoc }))
  entries.push(urlEntry(enLoc, { freq: 'weekly', pri: '0.7', lastmod, uaLoc, enLoc }))
}

// Блог-пости з БД (опубліковані) — UA + EN де є i18n.en
const posts = db.prepare(
  'SELECT slug, i18n, published_at, created_at FROM blog_posts WHERE published = 1 AND slug IS NOT NULL ORDER BY slug'
).all()

for (const p of posts) {
  let hasEn = false
  try {
    const i18n = p.i18n ? JSON.parse(p.i18n) : null
    hasEn = !!(i18n && i18n.en && i18n.en.title)
  } catch {}
  const lastmod = toDate(p.published_at) || toDate(p.created_at) || today
  const uaLoc = `${BASE}/blog/${esc(p.slug)}`
  const enLoc = `${BASE}/en/blog/${esc(p.slug)}`
  if (hasEn) {
    entries.push(urlEntry(uaLoc, { freq: 'monthly', pri: '0.6', lastmod, uaLoc, enLoc }))
    entries.push(urlEntry(enLoc, { freq: 'monthly', pri: '0.6', lastmod, uaLoc, enLoc }))
  } else {
    entries.push(urlEntry(uaLoc, { freq: 'monthly', pri: '0.6', lastmod }))
  }
}

db.close()

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
  `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
  entries.join('\n') + '\n' +
  `</urlset>\n`

fs.writeFileSync(outPath, xml)

const staticCount = STATIC.length * 2
const catCount = cats.length * 2
const productCount = products.length * 2
const postEntries = entries.length - staticCount - catCount - productCount
console.log(
  `sitemap.xml: ${entries.length} URL` +
  ` (${staticCount} статичних, ${catCount} категорій, ${productCount} товарів, ${postEntries} блог)`
)
