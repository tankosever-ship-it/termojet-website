/*
 * gen-sitemap.mjs — генерує public/sitemap.xml із реальних маршрутів React-сайту.
 * Запуск: node scripts/gen-sitemap.mjs   (також можна додати в build).
 * Базовий домен — termojet.com.ua (фінальний публічний домен).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { CATEGORIES } from '../src/data/categories.js'
import { PRODUCTS } from '../src/data/products.js'
import { BLOG_POSTS } from '../src/data/blog.js'
import { PORTFOLIO } from '../src/data/portfolio.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE = 'https://termojet.com.ua'

const STATIC = [
  ['/', '1.0', 'daily'],
  ['/catalog', '0.9', 'daily'],
  ['/blog', '0.8', 'weekly'],
  ['/portfolio', '0.7', 'weekly'],
  ['/about', '0.6', 'monthly'],
  ['/contacts', '0.6', 'monthly'],
  ['/service', '0.5', 'monthly'],
  ['/files', '0.5', 'monthly'],
  ['/faq', '0.5', 'monthly'],
  ['/delivery', '0.4', 'monthly'],
  ['/partners', '0.4', 'monthly'],
  ['/oem', '0.4', 'monthly'],
  ['/returns', '0.3', 'yearly'],
  ['/privacy', '0.2', 'yearly'],
  ['/terms', '0.2', 'yearly'],
]

const urls = []
const push = (loc, priority = '0.6', changefreq = 'weekly', lastmod) =>
  urls.push({ loc: BASE + loc, priority, changefreq, lastmod })

for (const [loc, p, cf] of STATIC) push(loc, p, cf)
for (const c of CATEGORIES) if (c.slug) push(`/catalog/${c.slug}`, '0.8', 'weekly')
for (const p of PRODUCTS) {
  if (p.isVisible === false) continue
  if (p.categorySlug && p.slug) push(`/catalog/${p.categorySlug}/${p.slug}`, '0.7', 'weekly')
}
for (const b of BLOG_POSTS) {
  if (b.published === false || !b.slug) continue
  push(`/blog/${b.slug}`, '0.6', 'monthly', (b.publishedAt || b.date || '').slice(0, 10) || undefined)
}

// дедуп за loc
const seen = new Set()
const uniq = urls.filter(u => !seen.has(u.loc) && seen.add(u.loc))

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  uniq.map(u =>
    `  <url>\n    <loc>${u.loc}</loc>\n` +
    (u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : '') +
    `    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
  ).join('\n') +
  `\n</urlset>\n`

fs.writeFileSync(path.join(__dirname, '..', 'public', 'sitemap.xml'), xml)
console.log(`sitemap.xml: ${uniq.length} URL (static ${STATIC.length}, cat ${CATEGORIES.length})`)
