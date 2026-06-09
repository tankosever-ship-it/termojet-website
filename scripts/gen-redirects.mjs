/*
 * gen-redirects.mjs — карта 301-редіректів зі старих WP-URL (termojet.com.ua) на нові React-маршрути.
 * Джерело старих URL: backend/scripts/wp-urls.txt (витягнуто з wp-sitemap.xml).
 * Результат: backend/redirects.json  { "<old-path>": "<new-path>", ... }  (без домену, без / в кінці).
 * Мовні версії (/pl /en /de /fr) обробляє middleware у server.js (стрипає префікс і шукає знову).
 *   node scripts/gen-redirects.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { PRODUCTS } from '../src/data/products.js'
import { CATEGORIES } from '../src/data/categories.js'
import { BLOG_POSTS } from '../src/data/blog.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WP = fs.readFileSync(path.join(__dirname, '..', 'backend', 'scripts', 'wp-urls.txt'), 'utf8')

// React-довідники
const bySlug = new Map()
for (const p of PRODUCTS) if (p.slug && p.categorySlug) bySlug.set(p.slug, p.categorySlug)
const catSet = new Set(CATEGORIES.map(c => c.slug))
const blogSet = new Set(BLOG_POSTS.map(b => b.slug))

// Категорія за ключем у слагу (для зняття з продажу товарів і WP-категорій)
function catByKeyword(s) {
  s = s.toLowerCase()
  if (/(kolektory-z-gidrostril|ze-strzalka|z-gidrostrilkoyu)/.test(s)) return 'kolektory-z-hidrostrilkoyu'
  if (/(kolektor|kollektor|dystrybucyjne|odnobalochnyj|vyhodamy)/.test(s)) return 'rozpodilchi-kolektory'
  if (/(ze-stali-nierdzewnej|pidlog|tepl)/.test(s)) return 'kolektory-pidloha'
  if (/(strzaly-hydrauliczne|gidrostril|rozdilyuvach|\bgs-)/.test(s)) return 'hidravlichni-rozdilnyky'
  if (/(separator|separatory|tjdn|tjv|tjt|povitr)/.test(s)) return 'separatory'
  if (/(termojet-box|^box|seria-termojet-mini)/.test(s)) return 'termojet-box'
  if (/(seria-termojet-mega|mega)/.test(s)) return 'termojet-mega'
  if (/(balansuval|sbv)/.test(s)) return 'balansuval-klapany'
  if (/(zonal)/.test(s)) return 'klapany'
  if (/(automatyka-sterowania|avtomatyk|kontroler|termostat|wt-?1|ht-?1|tj03)/.test(s)) return 'avtomatyka'
  if (/(servopryvod|servonaped|kran|zurawi|klapan|chotyryhodovi|hodovi)/.test(s)) return 'klapany'
  if (/(nasosni-grup|grupy-pomp|nasosna-grup|\bng-|\bnh-|grupa-pompowa)/.test(s)) return 'nasosni-hrupy'
  if (/(nasos|pompy|pump|apm|ape|xps|wilo|grundfos|\bspe|\bhbs|\btbe|grandlift|silencer|lakierki|reczyrkul)/.test(s)) return 'nasosy'
  if (/(pozostaly|dodatkov)/.test(s)) return 'dodatkove'
  return null
}

// Кореневі сторінки WP → React-маршрут
const PAGES = {
  '': '/', 'home': '/', 'glowna': '/',
  'about': '/about', 'o-nas': '/about', 'pro-nas': '/about', 'o-kompanii': '/about',
  'contacts': '/contacts', 'kontakty': '/contacts', 'kontakt': '/contacts', 'rekvizyty': '/contacts',
  'service': '/service', 'servis': '/service', 'support': '/service', 'garantiya': '/service', 'gwarancja': '/service', 'warranty': '/service',
  'payment': '/delivery', 'oplata': '/delivery', 'delivery': '/delivery', 'dostavka': '/delivery', 'dostawa': '/delivery',
  'partners': '/partners', 'partnery': '/partners', 'partnerzy': '/partners', 'dealers': '/partners',
  'galeria': '/portfolio', 'gallery': '/portfolio', 'portfolio': '/portfolio', 'realizacje': '/portfolio',
  'blog': '/blog', 'news': '/blog', 'aktualnosci': '/blog',
  'faq': '/faq', 'files': '/files', 'dokumenty': '/files', 'oem': '/oem',
  'catalog': '/catalog', 'katalog': '/catalog', 'shop': '/catalog', 'sklep': '/catalog', 'product': '/catalog',
  'privacy': '/privacy', 'polityka-prywatnosci': '/privacy', 'terms': '/terms', 'umowa': '/terms',
  'my-account': '/', 'koszyk': '/cart', 'cart': '/cart', 'checkout': '/cart', 'returns': '/returns',
  'contact-us': '/contacts', 'kontaktyi': '/contacts',
}

const map = {}
const stats = { product_exact: 0, product_cat: 0, prod_cat: 0, page: 0, blog: 0, fallback: 0 }

const lines = WP.split('\n').map(l => l.trim()).filter(Boolean)
for (const url of lines) {
  let p
  try { p = new URL(url).pathname } catch { continue }
  p = p.replace(/\/+$/, '') // прибрати кінцевий /
  // лише україномовні; мовні версії обробляє middleware
  if (/^\/(pl|en|de|fr)(\/|$)/.test(p)) continue
  if (!p) { continue } // корінь — не редіректимо
  if (p.startsWith('/author') || p.includes('wp-sitemap')) continue
  if (map[p]) continue

  // 1) товар: /product/{slug}
  let m = p.match(/^\/product\/([^/]+)$/)
  if (m) {
    const slug = m[1]
    if (bySlug.has(slug)) { map[p] = `/catalog/${bySlug.get(slug)}/${slug}`; stats.product_exact++ }
    else { const c = catByKeyword(slug); map[p] = c ? `/catalog/${c}` : '/catalog'; stats[c ? 'product_cat' : 'fallback']++ }
    continue
  }
  // 2) категорія товарів: /product-category/{...nested}
  m = p.match(/^\/product-category\/(.+)$/)
  if (m) {
    const leaf = m[1].split('/').pop()
    const c = catByKeyword(m[1]) || catByKeyword(leaf)
    map[p] = c ? `/catalog/${c}` : '/catalog'; stats.prod_cat++
    continue
  }
  // 3) блог-категорія /category/{x} → /blog
  if (/^\/category\//.test(p)) { map[p] = '/blog'; stats.blog++; continue }
  // 4) кореневі сторінки / блог-пости
  const seg = p.replace(/^\//, '')
  if (PAGES[seg] !== undefined) { map[p] = PAGES[seg]; stats.page++; continue }
  if (blogSet.has(seg)) { map[p] = `/blog/${seg}`; stats.blog++; continue }
  // 5) інше — на каталог або блог за натяком
  if (/nasos|kolektor|klapan|grupa|separator|gidro|box|mega/.test(seg)) {
    const c = catByKeyword(seg); map[p] = c ? `/catalog/${c}` : '/catalog'
  } else {
    map[p] = '/blog' // ймовірно стара стаття/новина
  }
  stats.fallback++
}

// прибрати no-op редіректи (старий шлях === новий)
for (const k of Object.keys(map)) if (map[k] === k) delete map[k]

fs.writeFileSync(path.join(__dirname, '..', 'backend', 'redirects.json'), JSON.stringify(map, null, 2) + '\n')
console.log(`redirects.json: ${Object.keys(map).length} правил`)
console.log(stats)
