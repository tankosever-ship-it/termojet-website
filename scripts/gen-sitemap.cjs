/*
 * gen-sitemap.cjs — генерує public/sitemap.xml з товарів + категорій + статичних сторінок.
 * Запуск: node scripts/gen-sitemap.cjs  (також виконується автоматично перед build:prod)
 */
const fs = require('fs')
const path = require('path')

const BASE = 'https://termojet.com.ua'
const seedPath = path.join(__dirname, '..', 'backend', 'seed-products.json')
const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml')

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
  ['/returns', 'yearly', '0.3'],
  ['/privacy', 'yearly', '0.3'],
  ['/terms', 'yearly', '0.3'],
]

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const products = JSON.parse(fs.readFileSync(seedPath, 'utf8'))
const today = new Date().toISOString().slice(0, 10)

const urls = []
for (const [loc, freq, pri] of STATIC) urls.push({ loc: BASE + loc, freq, pri })

// категорії (унікальні categorySlug)
const cats = [...new Set(products.map(p => p.categorySlug).filter(Boolean))]
for (const c of cats) urls.push({ loc: `${BASE}/catalog/${c}`, freq: 'weekly', pri: '0.8' })

// товари (видимі, зі slug і категорією)
for (const p of products) {
  if (!p.slug || !p.categorySlug) continue
  if (p.isVisible === false) continue
  urls.push({ loc: `${BASE}/catalog/${esc(p.categorySlug)}/${esc(p.slug)}`, freq: 'weekly', pri: '0.7', lastmod: today })
}

const body = urls.map(u =>
  `  <url>\n    <loc>${u.loc}</loc>\n` +
  (u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : '') +
  `    <changefreq>${u.freq}</changefreq>\n    <priority>${u.pri}</priority>\n  </url>`
).join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
fs.writeFileSync(outPath, xml)
console.log(`sitemap.xml: ${urls.length} URL (${STATIC.length} статичних, ${cats.length} категорій, ${urls.length - STATIC.length - cats.length} товарів)`)
