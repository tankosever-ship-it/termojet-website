/*
 * gen-sitemap.cjs — генерує public/sitemap.xml з товарів + категорій + статичних сторінок.
 * Включає ВСІ 6 мовних версій (uk/en/pl/fr/de/ro) з hreflang-анотаціями
 * і <lastmod> з дат товарів/постів.
 * Запуск: node scripts/gen-sitemap.cjs  (також виконується автоматично перед build:prod)
 *
 * ⚠️ Ганяти ТІЛЬКИ на актуальній (прод) БД. На застарілій локальній копії генератор
 * тихо викине URL, яких у ній нема (так з файлу вже зникали всі EN-статті блогу).
 */
const fs = require('fs')
const path = require('path')

const BASE = 'https://termojet.com.ua'
const dbPath = path.join(__dirname, '..', 'backend', 'data', 'termojet.db')
const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml')

// Мови сайту. Префікси — ті самі, що в backend/server.js (LANG_PREFIX).
const LANGS = ['uk', 'en', 'pl', 'fr', 'de', 'ro']
const PREFIX = { uk: '', en: '/en', pl: '/pl', fr: '/fr', de: '/de', ro: '/ro' }
// x-default → українська (основний ринок), як у server.js → buildAlternates().
const XDEFAULT = 'uk'

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

// URL мовної версії логічного шляху. Головна = BASE без слеша — рівно так, як
// сервер віддає canonical (server.js → buildAlternates: p='' для '/'), щоб URL
// у sitemap збігався з canonical сторінки символ-у-символ.
function locFor(lang, logicalPath) {
  const p = (!logicalPath || logicalPath === '/') ? '' : logicalPath
  return BASE + PREFIX[lang] + p
}

// hreflang-блок: усі мови, для яких сторінка існує, + x-default.
// langs — підмножина LANGS (для блогу беремо лише мови з наявним перекладом).
function hreflangBlock(logicalPath, langs) {
  const lines = langs.map(lg =>
    `    <xhtml:link rel="alternate" hreflang="${lg}" href="${esc(locFor(lg, logicalPath))}" />`
  )
  const xd = langs.includes(XDEFAULT) ? XDEFAULT : langs[0]
  lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(locFor(xd, logicalPath))}" />`)
  return lines.join('\n')
}

// Один <url> запис
function urlEntry(loc, { freq, pri, lastmod, alternates } = {}) {
  let s = `  <url>\n    <loc>${esc(loc)}</loc>\n`
  if (lastmod) s += `    <lastmod>${lastmod}</lastmod>\n`
  if (freq) s += `    <changefreq>${freq}</changefreq>\n`
  if (pri) s += `    <priority>${pri}</priority>\n`
  if (alternates) s += `${alternates}\n`
  s += `  </url>`
  return s
}

// Додає по одному <url> на кожну мову зі спільним hreflang-блоком.
function pushAllLangs(entries, logicalPath, opts, langs = LANGS) {
  const alternates = hreflangBlock(logicalPath, langs)
  for (const lg of langs) {
    entries.push(urlEntry(locFor(lg, logicalPath), { ...opts, alternates }))
  }
}

const entries = []

// Статичні сторінки — усі 6 мов
for (const [loc, freq, pri] of STATIC) {
  pushAllLangs(entries, loc, { freq, pri })
}

// Категорії з БД (унікальні categorySlug видимих товарів) — усі 6 мов
const cats = db.prepare(
  'SELECT DISTINCT category_slug FROM products WHERE is_visible = 1 AND category_slug IS NOT NULL ORDER BY category_slug'
).all().map(r => r.category_slug)

for (const c of cats) {
  pushAllLangs(entries, `/catalog/${c}`, { freq: 'weekly', pri: '0.8' })
}

// Товари з БД (видимі, зі slug і категорією) — усі 6 мов, з реальним created_at.
// Товари локалізовані всіма 6 мовами (i18n у БД), тому мовну наявність не звіряємо.
const products = db.prepare(
  'SELECT category_slug, slug, created_at FROM products WHERE is_visible = 1 AND slug IS NOT NULL AND category_slug IS NOT NULL ORDER BY category_slug, slug'
).all()

for (const p of products) {
  const lastmod = toDate(p.created_at) || today
  pushAllLangs(entries, `/catalog/${p.category_slug}/${p.slug}`, { freq: 'weekly', pri: '0.7', lastmod })
}

// Блог-пости з БД (опубліковані). Мовну версію додаємо ЛИШЕ якщо є переклад
// (i18n.<lang>.title) — інакше б у sitemap потрапляв укр. текст під /de/ тощо.
const posts = db.prepare(
  'SELECT slug, i18n, published_at, created_at FROM blog_posts WHERE published = 1 AND slug IS NOT NULL ORDER BY slug'
).all()

const blogLangStats = Object.fromEntries(LANGS.map(l => [l, 0]))
for (const p of posts) {
  let i18n = null
  try { i18n = p.i18n ? JSON.parse(p.i18n) : null } catch {}
  const langs = LANGS.filter(lg => lg === 'uk' || !!(i18n && i18n[lg] && i18n[lg].title))
  langs.forEach(lg => blogLangStats[lg]++)
  const lastmod = toDate(p.published_at) || toDate(p.created_at) || today
  pushAllLangs(entries, `/blog/${p.slug}`, { freq: 'monthly', pri: '0.6', lastmod }, langs)
}

db.close()

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
  `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
  entries.join('\n') + '\n' +
  `</urlset>\n`

fs.writeFileSync(outPath, xml)

const staticCount = STATIC.length * LANGS.length
const catCount = cats.length * LANGS.length
const productCount = products.length * LANGS.length
const postEntries = entries.length - staticCount - catCount - productCount
console.log(
  `sitemap.xml: ${entries.length} URL, ${LANGS.length} мов` +
  ` (${staticCount} статичних, ${catCount} категорій, ${productCount} товарів, ${postEntries} блог)`
)
console.log(`  блог по мовах: ${LANGS.map(l => `${l}=${blogLangStats[l]}`).join(' ')} (усього постів: ${posts.length})`)
