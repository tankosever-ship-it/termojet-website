const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const path = require('path')
const fs = require('fs')
const compression = require('compression')

const app = express()
const PORT = process.env.PORT || 3000

// За nginx reverse-proxy у Docker: nginx (127.0.0.1) → published-порт контейнера,
// тож усередині контейнера peer = docker-gateway (172.x.x.x), НЕ loopback. Тому
// довіряємо loopback + приватним діапазонам (unique-local) — Express пройде ланцюг
// довірених приватних проксі й візьме реальний клієнтський IP з X-Forwarded-For
// (nginx ставить XFF=$proxy_add_x_forwarded_for). Зовнішній клієнт (публічний peer)
// не довірений → його XFF ігнорується, req.ip = справжній IP. Потрібно для коректного
// rate-limiting і IP-allowlist вебхука Binotel.
app.set('trust proxy', ['loopback', 'uniquelocal'])

// gzip-стиснення всіх відповідей (−~75% ваги JS/HTML/JSON)
app.use(compression())

// security-заголовки. CSP навмисно поблажлива (allow https:) — блокує http/mixed-content,
// inline-object/embed та base-uri, але не ламає шрифти Google, GTM, мапи, курс НБУ й 3D-в'юер.
// FIX 6 — removed 'unsafe-eval' from script-src; added frame-ancestors 'self'
// 'wasm-unsafe-eval' — дозволяє WebAssembly для 3D-в'юера (model-viewer), але НЕ
// загальний eval (значно безпечніше за 'unsafe-eval').
const CSP = [
  "default-src 'self' https: data: blob:",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https:",
  "style-src 'self' 'unsafe-inline' https:",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https: data:",
  "connect-src 'self' https:",
  "frame-src 'self' https:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
].join('; ')
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Content-Security-Policy', CSP)
  next()
})

// FIX 5 — CORS allowlist from env CORS_ORIGINS (comma-separated) with sensible defaults
const corsAllowed = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
  : [
      'https://termojet.com.ua',
      'https://www.termojet.com.ua',
      'https://app.termojet.com.ua',
      'http://49.13.154.30:8080',
      'http://localhost:5173',
    ]
app.use(cors({
  origin: (o, cb) => cb(null, !o || corsAllowed.includes(o)),
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 301-редіректи зі старих WP-URL (termojet.com.ua) на нові React-маршрути — для збереження
// SEO-трафіку при переносі домену. Карта: backend/redirects.json (генерує scripts/gen-redirects.mjs).
// Мовні префікси /pl /en /de /fr стрипаємо й шукаємо UA-відповідник.
// ВАЖЛИВО: стрипуємо лише якщо стрипнутий шлях реально є в redirects.json, щоб не 301-ити
// чинні /en/catalog/... і /en/blog/... маршрути.
let REDIRECTS = {}
try { REDIRECTS = JSON.parse(fs.readFileSync(path.join(__dirname, 'redirects.json'), 'utf8')) } catch {}
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next()
  let p = req.path.replace(/\/+$/, '') || '/'
  // Шлях може приходити URL-закодованим (напр. кирилиця %D0%B0…) — розкодовуємо,
  // щоб збігалося з ключами карти редиректів.
  try { p = decodeURIComponent(p) } catch {}
  const lng = p.match(/^\/(pl|en|de|fr)(\/.*|)$/)
  if (lng) {
    const stripped = lng[2] || '/'
    // Редіректимо тільки якщо стрипнутий шлях є в redirects.json.
    // Якщо стрипнутого шляху нема — це чинний /en/... маршрут, пропускаємо далі.
    if (REDIRECTS[stripped] && REDIRECTS[stripped] !== req.path) {
      return res.redirect(301, REDIRECTS[stripped])
    }
    return next()
  }
  const to = REDIRECTS[p]
  if (to && to !== req.path) return res.redirect(301, to)
  next()
})

// Прекомпресовані 3D-моделі: якщо поряд лежить <file>.gz — віддаємо його з
// Content-Encoding: gzip (нуль CPU на запит, браузер розпакує прозоро в оригінал).
// Важкі STEP зберігаємо на сервері ЛИШЕ як .gz (економить диск і деплой ~4×).
const UPLOADS_DIR = path.join(__dirname, 'uploads')
app.get(/^\/uploads\/.+\.(glb|step)$/i, (req, res, next) => {
  if (!/\bgzip\b/.test(req.headers['accept-encoding'] || '')) return next()
  const rel = decodeURIComponent(req.path.replace(/^\/uploads\//, ''))
  const gzPath = path.join(UPLOADS_DIR, rel + '.gz')
  if (!gzPath.startsWith(UPLOADS_DIR + path.sep) || !fs.existsSync(gzPath)) return next()
  res.setHeader('Content-Type', req.path.toLowerCase().endsWith('.glb') ? 'model/gltf-binary' : 'application/step')
  res.setHeader('Content-Encoding', 'gzip')
  res.setHeader('Vary', 'Accept-Encoding')
  res.setHeader('Cache-Control', 'public, max-age=604800')
  res.sendFile(gzPath)
})

// static uploads (3D-моделі, документи) — кеш на 7 днів
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '7d' }))

// FIX 4 — rate limiters (req.ip = real client IP via trust proxy 'loopback' set above)

// Login: max 10 attempts per 15 min
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
})

// Public write endpoints: max 20 POSTs per minute
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method !== 'POST',
})

// Nova Poshta proxy: max 60 requests per minute
const npLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
})

// Binotel call webhook: до 120 запитів/хв (на дзвінок кілька подій + захист від флуду).
// НЕ через writeLimiter (20/хв) — сплеск дзвінків не має губити події.
const binotelLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
})

// API routes
const { router: authRouter } = require('./routes/auth')
app.post('/api/auth/login', loginLimiter)
app.use('/api/auth', authRouter)
app.use('/api/products', require('./routes/products'))
app.use('/api/orders', writeLimiter, require('./routes/orders'))
app.use('/api/consultations', writeLimiter, require('./routes/consultations'))
app.use('/api/dealers', writeLimiter, require('./routes/dealers'))
app.use('/api/blog', require('./routes/blog'))
app.use('/api/portfolio', require('./routes/portfolio'))
app.use('/api/reviews', writeLimiter, require('./routes/reviews'))
app.use('/api/product-reviews', writeLimiter, require('./routes/product-reviews'))
app.use('/api/files', require('./routes/files'))
app.use('/api/settings', require('./routes/settings'))
app.use('/api/subscribers', writeLimiter, require('./routes/subscribers'))
app.use('/api/faq', require('./routes/faq'))
app.use('/api/banners', require('./routes/banners'))
app.use('/api/promos', require('./routes/promos'))
app.use('/api/clients', require('./routes/clients'))
app.use('/api/analytics', require('./routes/analytics'))
app.use('/api/np', npLimiter, require('./routes/novaposhta'))
app.use('/api/upload', require('./routes/upload'))
// Binotel API PUSH: вхідний дзвінок → лід у CRM + Telegram (backend/routes/binotel.js)
app.use('/api/webhooks/binotel', binotelLimiter, require('./routes/binotel'))

// Google Shopping / Merchant Center фіди (динамічні, з БД) — ДО SPA-статики
const { feed: merchantFeed } = require('./routes/merchant')
app.get('/google-merchant.xml', merchantFeed('uk'))
app.get('/google-merchant-en.xml', merchantFeed('en'))
app.get('/google-merchant-pl.xml', merchantFeed('pl'))
app.get('/google-merchant-de.xml', merchantFeed('de'))
app.get('/google-merchant-fr.xml', merchantFeed('fr'))

// serve React build
const DIST = path.join(__dirname, '..', 'dist')
app.use(express.static(DIST, {
  // НЕ робити 301 на директорію (напр. /files → /files/) — такі шляхи мають віддаватись
  // SPA-маршрутом React (FilesPage), а не редиректом. Реальні файли віддаються як є.
  redirect: false,
  // index: false — не автосервити index.html для /, щоб catch-all міг вставити hreflang
  index: false,
  setHeaders: (res, filePath) => {
    // хешовані ассети (vite кладе контент-хеш у назву) — кеш на рік, immutable
    if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    } else if (/\.(png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf|eot|mp4|webm|glb|gltf)$/i.test(filePath)) {
      // Статичні медіа з public/ (фото товарів, шрифти, 3D-моделі) — кеш на 7 днів.
      // Раніше йшли з no-cache → браузер ревалідував КОЖНЕ фото при кожній навігації/
      // перемальовуванні (білий кадр → блимання, зайвий трафік на важких PNG).
      res.setHeader('Cache-Control', 'public, max-age=604800')
    } else {
      // index.html та інші кореневі файли — завжди свіжі
      res.setHeader('Cache-Control', 'no-cache')
    }
  },
}))

// ── Хелпери SEO-ін'єкту ──────────────────────────────────────────────────────
const _db = require('./db')
const SITE = 'https://termojet.com.ua'
const DEFAULT_OG_IMG = `${SITE}/images/portfolio/proj-1.jpg`
const DEFAULT_TITLE = 'Termojet — Виробник обладнання для котелень'
const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const absImg = u => {
  if (!u) return DEFAULT_OG_IMG
  if (/^https?:\/\//i.test(u)) return u
  return SITE + (u.startsWith('/') ? u : '/' + u)
}
const stripHtml = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

// Мультимовність: uk (без префікса) + en/pl/fr/de (з префіксом URL).
// LANG_PREFIX → префікс шляху; langBase → базовий URL для мови.
// Локалізований контент товарів живе в i18n (усі 331 товари мають en/pl/fr/de);
// категорії/статика/блог мають uk+en тексти, для pl/fr/de fallback на en-мітки.
const LANGS = ['uk', 'en', 'pl', 'fr', 'de', 'ro']
const LANG_PREFIX = { uk: '', en: '/en', pl: '/pl', fr: '/fr', de: '/de', ro: '/ro' }
const langBase = lang => SITE + (LANG_PREFIX[lang] || '')

// Хелпер локалізації: повертає локалізовані поля для lang з фолбеком на UA-колонки.
// Для товарів: {name, description, short_desc, seo_title, meta_description}.
// Для блогу: {title, excerpt, content}.
function pickLang(row, lang) {
  if (!lang || lang === 'uk') return row
  let i18n = null
  try { i18n = row.i18n ? JSON.parse(row.i18n) : null } catch {}
  if (!i18n || !i18n[lang]) return row
  const loc = i18n[lang]
  return Object.assign({}, row, {
    name: loc.name || row.name,
    title: loc.title || row.title,
    description: loc.description || row.description,
    short_desc: loc.short_desc || row.short_desc,
    // seo_title/meta_description БЕЗ укр-фолбеку: у i18n товарів їх немає, і фолбек
    // на row.* давав УКРАЇНСЬКИЙ <title> на pl/en/fr/de-сторінках. null → хендлер
    // падає на локалізований name/short_desc (title/desc тією ж мовою, що й контент).
    seo_title: loc.seo_title || null,
    meta_description: loc.meta_description || null,
    excerpt: loc.excerpt || row.excerpt,
    content: loc.content || row.content,
  })
}

// A+ per-товар і per-стаття: серверний ін'єкт у сирий HTML (для краулерів, у т.ч. LLM-ботів без JS).
// Метадані беремо з готових полів БД: seo_title (≤60, унікальні), meta_description.
// Head: title/canonical(self)/description/og. Body: у <noscript> ставимо сторінковий H1 +
// опис (React на клієнті рендерить своє в #root; <noscript> користувачам не видно → без флешу).

// Спільний хелпер ін'єкту метаданих у shell (для краулерів/LLM без JS).
// alternates: [{hreflang, href}] — список <link rel="alternate"> для hreflang.
// Вставляємо їх одразу після canonical-тега.
// Organization schema (дзеркало src/components/SEO.jsx ORGANIZATION_SCHEMA) — на всіх сторінках.
const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Termojet',
  url: SITE,
  logo: `${SITE}/wp-content/uploads/2023/08/logo.svg`,
  description: 'Виробник насосних груп, колекторів, клапанів та систем для котелень. Власне виробництво в Україні з 2002 року.',
  foundingDate: '2002',
  address: { '@type': 'PostalAddress', addressCountry: 'UA', addressLocality: 'Київ' },
  contactPoint: {
    '@type': 'ContactPoint', telephone: '+380-50-718-91-65',
    contactType: 'customer service', availableLanguage: ['Ukrainian', 'English', 'Polish'],
  },
}

// Будує BreadcrumbList із пар {name, url}.
function buildBreadcrumb(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem', position: i + 1, name: it.name, item: it.url,
    })),
  }
}

// Серіалізує масив JSON-LD у <script>-теги. Екрануємо '<' → '<' (щоб жодне поле
// не могло закрити <script> чи створити тег) — правильний escape для JSON усередині HTML.
function jsonLdScripts(schemas) {
  return (schemas || [])
    .filter(Boolean)
    .map(s => `<script type="application/ld+json">${JSON.stringify(s).replace(/</g, '\\u003c')}</script>`)
    .join('\n    ')
}

// Абсолютні URL зображень товару з JSON-поля images (з фолбеком на головне фото).
function productImages(imagesJson, fallback) {
  try {
    const arr = JSON.parse(imagesJson)
    if (Array.isArray(arr) && arr.length) return arr.map(u => absImg(u))
  } catch { /* нижче — фолбек */ }
  return fallback ? [fallback] : []
}

// Курс EUR→грн для серверної SEO-розмітки (НБУ × 1.022, кеш 1 год) — дзеркало
// src/utils/currency.js. Потрібен, щоб Product-схема EUR-товарів віддавала ціну в
// грн (як показує сайт), а не сире число EUR з підписом «грн» (Google бачив би
// ціну у ~52× нижчу за реальну).
const EUR_MARKUP = 1.022
let _eurCache = { rate: null, ts: 0 }
async function getEurRate() {
  const now = Date.now()
  if (_eurCache.rate && now - _eurCache.ts < 3600 * 1000) return _eurCache.rate
  try {
    const res = await fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=EUR&json')
    const data = await res.json()
    const rate = data[0]?.rate
    if (rate) { _eurCache = { rate: rate * EUR_MARKUP, ts: now }; return _eurCache.rate }
  } catch { /* нижче — фолбек */ }
  return _eurCache.rate || 51 * EUR_MARKUP
}

// Product + BreadcrumbList + Organization для сторінки товару (дзеркало SEO.jsx, серверно з БД).
function buildProductJsonLd(row, loc, { url, img, desc, cat, lang, eurRate }) {
  const en = lang !== 'uk' // мітки/назви категорій: uk або міжнародні (en як fallback для pl/fr/de)
  const base = langBase(lang)
  const cm = CATEGORY_META[cat]
  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: loc.name,
    description: desc,
    sku: row.sku || undefined,
    mpn: row.sku || undefined,
    image: productImages(row.images, img),
    brand: { '@type': 'Brand', name: 'Termojet' },
    category: cm ? (en ? cm.nameEn : cm.name) : undefined,
  }
  const hasPrice = row.price && Number(row.price) > 0
  if (hasPrice) {
    // Ціна завжди в грн: UAH-товари як є; EUR-товари конвертуємо (НБУ×1.022),
    // так само як показує сайт (src/utils/currency.js toUAH) — інакше схема
    // віддавала б сире число EUR із підписом «грн».
    const priceUah = row.currency === 'EUR' && eurRate
      ? String(Math.round(Number(row.price) * eurRate))
      : String(row.price)
    product.offers = {
      '@type': 'Offer',
      price: priceUah,
      priceCurrency: 'UAH',
      availability: row.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url,
      seller: { '@type': 'Organization', name: 'Termojet' },
    }
  }
  const crumbs = [
    { name: en ? 'Home' : 'Головна', url: base },
    { name: en ? 'Catalog' : 'Каталог', url: `${base}/catalog` },
  ]
  if (cm) crumbs.push({ name: en ? cm.nameEn : cm.name, url: `${base}/catalog/${encodeURIComponent(cat)}` })
  crumbs.push({ name: loc.name, url })
  // Product без offers невалідний (schema-валідатори вимагають offers/review/aggregateRating
  // і без них rich-result неможливий) → для товарів без ціни віддаємо лише Breadcrumb+Organization.
  return hasPrice ? [product, buildBreadcrumb(crumbs), ORG_SCHEMA] : [buildBreadcrumb(crumbs), ORG_SCHEMA]
}

// FAQPage schema з таблиці faqs (локалізовано). Порожня таблиця → null (нема schema).
function buildFaqSchema(lang) {
  try {
    const rows = _db.prepare('SELECT question, answer, i18n FROM faqs ORDER BY sort ASC, created_at ASC').all()
    if (!rows.length) return null
    const mainEntity = rows.map(r => {
      let q = r.question, a = r.answer
      if (lang !== 'uk') {
        try { const t = JSON.parse(r.i18n || '{}').en; if (t) { q = t.question || q; a = t.answer || a } } catch { /* UA-фолбек */ }
      }
      return { '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }
    })
    return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity }
  } catch { return null }
}

function injectMeta(html, { title, desc, url, img, ogType = 'website', h1, bodyText, alternates, jsonLd }) {
  let out = img ? html.split(DEFAULT_OG_IMG).join(esc(img)) : html
  out = out
    .split(DEFAULT_TITLE).join(esc(title))
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, () => {
      // Повністю замінюємо тег canonical (включно з " />"), інакше лишається стрей-текст
      // "/>" і перший hreflang «проковтується» в незакритий canonical.
      let canon = `<link rel="canonical" href="${esc(url)}" />`
      if (alternates && alternates.length) {
        canon += alternates.map(alt =>
          `\n    <link rel="alternate" hreflang="${esc(alt.hreflang)}" href="${esc(alt.href)}" />`
        ).join('')
      }
      return canon
    })
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${esc(url)}$2`)
    .replace(/(<meta property="og:type" content=")[^"]*(")/, `$1${esc(ogType)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
  if (h1) out = out.replace(/<h1>Termojet[^<]*<\/h1>/, `<h1>${esc(h1)}</h1>${bodyText ? `\n        <p>${esc(bodyText)}</p>` : ''}`)
  const scripts = jsonLdScripts(jsonLd)
  if (scripts) out = out.replace('</head>', `    ${scripts}\n  </head>`)
  return out
}

// Будує hreflang-альтернативи для ВСІХ мов (uk/en/pl/fr/de) + x-default.
// logicalPath — шлях БЕЗ мовного префікса (напр. '/catalog/termojet-box/...' або '/').
// x-default → українська (основний ринок).
function buildAlternates(logicalPath) {
  const p = (!logicalPath || logicalPath === '/') ? '' : logicalPath
  const alts = LANGS.map(lg => ({ hreflang: lg, href: langBase(lg) + p }))
  alts.push({ hreflang: 'x-default', href: SITE + p })
  return alts
}

// Назви+описи 15 категорій (uk + en; джерело — src/data/categories.js; бекенд CJS не імпортує ESM-фронт).
const CATEGORY_META = {
  'nasosni-hrupy': {
    name: 'Насосні групи', desc: 'Готові насосні вузли зі змішувачем і термостатикою для котелень та теплих підлог',
    nameEn: 'Pump Groups', descEn: 'Ready-made pump units with mixing and thermostatic control for boiler rooms',
  },
  'hidravlichni-rozdilnyky': {
    name: 'Роздільники гідравлічні', desc: 'Гідравлічні стрілки для балансування потоків у котельних системах опалення',
    nameEn: 'Hydraulic Separators', descEn: 'Hydraulic separators for balancing flows in boiler heating systems',
  },
  'rozpodilchi-kolektory': {
    name: 'Розподільчі колектори', desc: 'Розподільчі колектори в теплоізоляції по потужності 60, 105 та 175 кВт для котелень',
    nameEn: 'Distribution Manifolds', descEn: 'Distribution manifolds in insulation by capacity 60, 105 and 175 kW for boiler rooms',
  },
  'kolektory-z-hidrostrilkoyu': {
    name: 'Розподільчі колектори з гідрострілкою', desc: 'Колектори з вбудованою гідрострілкою — компактний вузол розподілу для котельні',
    nameEn: 'Manifolds with Hydraulic Separator', descEn: 'Manifolds with an integrated hydraulic separator — a compact distribution unit',
  },
  'termojet-box': {
    name: 'Модульні системи TERMOJET BOX', desc: 'Модульні системи TERMOJET BOX — компактні готові вузли обвʼязки котла для монтажу',
    nameEn: 'TERMOJET BOX Modular Systems', descEn: 'TERMOJET BOX modular systems — compact ready-made boiler connection units',
  },
  'termojet-mega': {
    name: 'Серія Termojet Mega (до 2200 кВт)', desc: 'Промислові системи опалення Termojet Mega потужністю до 2200 кВт для великих котелень',
    nameEn: 'Termojet Mega Series (up to 2200 kW)', descEn: 'Termojet Mega industrial heating systems up to 2200 kW for large boiler rooms',
  },
  'nasosy': {
    name: 'Насоси', desc: 'Циркуляційні насоси для систем опалення, теплої підлоги та котельних вузлів',
    nameEn: 'Pumps', descEn: 'Circulation pumps for heating systems, underfloor heating and boiler units',
  },
  'klapany': {
    name: '3-х/4-х ходові та термостатичні клапани', desc: '3- і 4-ходові поворотні та термостатичні клапани з електроприводами для опалення',
    nameEn: '3/4-Way & Thermostatic Valves', descEn: '3- and 4-way rotary and thermostatic valves with electric actuators for heating',
  },
  'balansuval-klapany': {
    name: 'Статичний балансувальний клапан', desc: 'Статичні балансувальні клапани для рівномірного розподілу теплоносія в системі',
    nameEn: 'Static Balancing Valve', descEn: 'Static balancing valves for even heat carrier distribution across the system',
  },
  'separatory': {
    name: 'Сепаратори', desc: 'Шламові та повітряні сепаратори для очищення теплоносія й захисту обладнання',
    nameEn: 'Separators', descEn: 'Sludge and air separators for coolant cleaning and equipment protection',
  },
  'zonalne-keruvannya': {
    name: 'Термостати та зональне керування', desc: 'Термостати, програматори та центри комутації для зонального керування опаленням',
    nameEn: 'Thermostats & Zone Control', descEn: 'Thermostats, programmers and switching centers for zone heating control',
  },
  'kolektory-pidloha': {
    name: 'Система підлогового опалення', desc: 'Колектори, змішувальні вузли та монтажні шафи для систем теплої підлоги',
    nameEn: 'Underfloor Heating System', descEn: 'Manifolds, mixing units and cabinets for underfloor heating systems',
  },
  'avtomatyka': {
    name: 'Автоматика котельного обладнання', desc: 'Контролери, датчики та системи управління котлами й котельним обладнанням',
    nameEn: 'Boiler Equipment Automation', descEn: 'Controllers, sensors and management systems for boilers and boiler equipment',
  },
  'dodatkove': {
    name: 'Додаткове обладнання', desc: 'Аксесуари, кріплення та супутні товари для монтажу котельного обладнання',
    nameEn: 'Additional Equipment', descEn: 'Accessories, fittings and related products for boiler equipment installation',
  },
  'rozprodazh': {
    name: 'Акція', desc: 'Обладнання Termojet за акційними цінами — колектори, насосні групи та клапани',
    nameEn: 'Sale', descEn: 'Termojet equipment at special prices — manifolds, pump groups and valves',
  },
}

// Статичні сторінки — унікальні title/description (усувають дубль generic на не-товарних).
const STATIC_META = {
  '/': { title: 'Termojet — Виробник обладнання для котелень', desc: 'Termojet — український виробник обладнання для котелень: насосні групи, колектори, гідрострілки, сепаратори, клапани, автоматика. Виробництво з 2002 року.' },
  '/catalog': { title: 'Каталог обладнання для котелень | Termojet', desc: 'Каталог Termojet: насосні групи, колектори, гідрострілки, клапани, сепаратори, автоматика. Власне виробництво з 2002 року.' },
  '/about': { title: 'Про компанію Termojet — виробник з 2002 року', desc: 'Termojet — український виробник обладнання для котелень з 2002 року: власне виробництво, інженерна підтримка, гарантія.' },
  '/contacts': { title: 'Контакти Termojet — звʼязатися з виробником', desc: 'Контакти Termojet: телефони, адреса, форма звʼязку. Консультація з підбору обладнання для котелень.' },
  '/blog': { title: 'Блог Termojet — опалення, котельні, монтаж', desc: 'Статті Termojet про опалення, котельні, монтаж систем, новини компанії та галузеві виставки.' },
  '/service': { title: 'Сервіс і гарантія на обладнання Termojet для котелень', desc: 'Сервісне обслуговування та гарантія на обладнання Termojet для котелень.' },
  '/faq': { title: 'Часті питання про обладнання Termojet (FAQ)', desc: 'Відповіді на часті питання про обладнання Termojet: підбір, монтаж, доставка, гарантія.' },
  '/delivery': { title: 'Доставка й оплата обладнання Termojet по Україні', desc: 'Умови доставки й оплати обладнання Termojet по Україні.' },
  '/files': { title: 'Документація та каталоги обладнання Termojet', desc: 'Технічна документація, каталоги та інструкції на обладнання Termojet.' },
  '/oem': { title: 'OEM-виробництво під приватною маркою | Termojet', desc: 'OEM-виробництво обладнання для котелень під приватною маркою від Termojet.' },
  '/partners': { title: 'Дилерам і партнерам Termojet — умови співпраці', desc: 'Співпраця з Termojet: умови для дилерів, інсталяторів і партнерів.' },
  '/portfolio': { title: 'Наші проекти — котельні та системи опалення Termojet', desc: 'Реалізовані проекти котелень і систем опалення з обладнанням Termojet.' },
  '/returns': { title: 'Повернення й обмін обладнання Termojet — умови', desc: 'Умови повернення й обміну обладнання Termojet.' },
  '/terms': { title: 'Умови використання сайту та придбання Termojet', desc: 'Умови використання сайту та придбання обладнання Termojet.' },
  '/privacy': { title: 'Політика конфіденційності та обробка даних | Termojet', desc: 'Політика конфіденційності та обробки персональних даних Termojet.' },
  '/navchannya': { title: 'Навчання та тренінги Termojet для монтажників', desc: 'Навчальні матеріали й тренінги Termojet з монтажу та підбору обладнання для котелень.' },
  '/reviews': { title: 'Відгуки клієнтів про обладнання Termojet', desc: 'Реальні відгуки клієнтів про обладнання Termojet для котелень: якість, монтаж, сервіс, співпраця.' },
}

// EN-версії статичних сторінок (для /en/...). Немає запису → фолбек на UA STATIC_META.
const STATIC_META_EN = {
  '/': { title: 'Termojet — Boiler Room Equipment Manufacturer', desc: 'Termojet — Ukrainian manufacturer of boiler room equipment: pump groups, manifolds, hydraulic separators, valves, automation. In production since 2002.' },
  '/catalog': { title: 'Boiler Room Equipment Catalog | Termojet', desc: 'Termojet catalog: pump groups, manifolds, hydraulic separators, valves, separators, automation. Own production since 2002.' },
  '/about': { title: 'About Termojet — Manufacturer Since 2002', desc: 'Termojet — Ukrainian boiler room equipment manufacturer since 2002: own production, engineering support, warranty.' },
  '/contacts': { title: 'Contact Termojet — Reach the Manufacturer', desc: 'Termojet contacts: phone, address, contact form. Consultation on selecting boiler room equipment.' },
  '/blog': { title: 'Termojet Blog — Heating, Boiler Rooms, Installation', desc: 'Termojet articles on heating, boiler rooms, system installation, company news and industry exhibitions.' },
  '/service': { title: 'Service and Warranty on Termojet Equipment', desc: 'Service and warranty for Termojet boiler room equipment.' },
  '/faq': { title: 'Frequently Asked Questions about Termojet (FAQ)', desc: 'Answers to common questions about Termojet equipment: selection, installation, delivery, warranty.' },
  '/delivery': { title: 'Delivery and Payment for Termojet Equipment', desc: 'Delivery and payment terms for Termojet equipment across Ukraine.' },
  '/files': { title: 'Documentation and Catalogs of Termojet Equipment', desc: 'Technical documentation, catalogs and manuals for Termojet equipment.' },
  '/oem': { title: 'OEM Manufacturing under Private Label | Termojet', desc: 'OEM manufacturing of boiler room equipment under private label by Termojet.' },
  '/partners': { title: 'For Dealers and Partners — Termojet Cooperation', desc: 'Cooperation with Termojet: terms for dealers, installers and partners.' },
  '/portfolio': { title: 'Our Projects — Boiler Rooms & Heating by Termojet', desc: 'Completed boiler room and heating system projects with Termojet equipment.' },
  '/returns': { title: 'Returns and Exchange of Termojet Equipment', desc: 'Return and exchange terms for Termojet equipment.' },
  '/terms': { title: 'Terms of Use of the Site and Purchase | Termojet', desc: 'Terms of use of the website and purchase of Termojet equipment.' },
  '/privacy': { title: 'Privacy Policy and Data Processing | Termojet', desc: 'Privacy policy and personal data processing at Termojet.' },
  '/navchannya': { title: 'Training and Workshops by Termojet for Installers', desc: 'Training materials and workshops by Termojet on installation and selection of boiler room equipment.' },
  '/reviews': { title: 'Customer Reviews of Termojet Equipment', desc: 'Real customer reviews of Termojet boiler room equipment: quality, installation, service, cooperation.' },
}

// ── SSR-lite: серверний семантичний HTML сторінки у #seo-content ────────────────
// Ціна в грн: UAH як є, EUR конвертуємо (як SEO-схема/сайт).
function priceToUah(price, currency, eurRate) {
  if (!(price && Number(price) > 0)) return null
  return currency === 'EUR' && eurRate ? Math.round(Number(price) * eurRate) : Math.round(Number(price))
}

// Навігація на основні розділи (внутрішні лінки для краулерів; локалізована).
function seoNav(lang) {
  const en = lang !== 'uk'
  const b = langBase(lang)
  const links = [
    ['/catalog', en ? 'Catalog' : 'Каталог'],
    ['/catalog/nasosni-hrupy', en ? 'Pump groups' : 'Насосні групи'],
    ['/catalog/rozpodilchi-kolektory', en ? 'Manifolds' : 'Розподільчі колектори'],
    ['/catalog/hidravlichni-rozdilnyky', en ? 'Hydraulic separators' : 'Гідравлічні розділювачі'],
    ['/catalog/separatory', en ? 'Separators' : 'Сепаратори'],
    ['/catalog/nasosy', en ? 'Pumps' : 'Насоси'],
    ['/blog', en ? 'Blog' : 'Блог'],
    ['/about', en ? 'About' : 'Про компанію'],
    ['/contacts', en ? 'Contacts' : 'Контакти'],
  ]
  return `<nav aria-label="${en ? 'Main sections' : 'Основні розділи'}">${links.map(([h, t]) => `<a href="${b}${h}">${esc(t)}</a>`).join('')}</nav>`
}

// Повний семантичний HTML товару → в #seo-content. Дані ті самі, що на сторінці/у JSON-LD.
function buildProductSeoContent(row, loc, { cat, lang, eurRate, related }) {
  const en = lang !== 'uk'
  const base = langBase(lang)
  const cm = CATEGORY_META[cat]
  const catName = cm ? (en ? cm.nameEn : cm.name) : cat
  const catUrl = `${base}/catalog/${encodeURIComponent(cat)}`
  const img = absImg(row.image)
  const priceUah = priceToUah(row.price, row.currency, eurRate)

  let specsHtml = ''
  try {
    const specs = JSON.parse(row.specs || '{}')
    const rows = Object.entries(specs).filter(([k, v]) => k && v != null && String(v) !== '' && !/^артикул|^назва|^article|^name/i.test(k))
    if (rows.length) {
      specsHtml = `<h2>${en ? 'Specifications' : 'Технічні характеристики'}</h2><table><tbody>${
        rows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(String(v))}</td></tr>`).join('')
      }</tbody></table>`
    }
  } catch { /* без таблиці */ }

  let relHtml = ''
  if (related && related.length) {
    relHtml = `<h2>${en ? 'Related products' : 'Схожі товари'}</h2><ul>${
      related.map(r => {
        const rp = priceToUah(r.price, r.currency, eurRate)
        return `<li><a href="${base}/catalog/${encodeURIComponent(cat)}/${encodeURIComponent(r.slug)}">${esc(r.name)}</a>${rp ? ` — ${rp} ${en ? 'UAH' : 'грн'}` : ''}</li>`
      }).join('')
    }</ul>`
  }

  const breadcrumb = `<nav aria-label="${en ? 'Breadcrumb' : 'Хлібні крихти'}"><a href="${base}/">${en ? 'Home' : 'Головна'}</a> / <a href="${base}/catalog">${en ? 'Catalog' : 'Каталог'}</a> / <a href="${catUrl}">${esc(catName)}</a></nav>`

  return `<div id="seo-content">
    ${breadcrumb}
    <h1>${esc(loc.name)}</h1>
    ${img ? `<img src="${esc(img)}" alt="${esc(loc.name)}" width="360" height="360" loading="lazy" />` : ''}
    ${row.sku ? `<p>${en ? 'SKU' : 'Артикул'}: ${esc(row.sku)}</p>` : ''}
    ${priceUah ? `<p><strong>${en ? 'Price' : 'Ціна'}: ${priceUah} ${en ? 'UAH' : 'грн'}</strong></p>` : ''}
    <p>${en ? 'Availability' : 'Наявність'}: ${row.in_stock ? (en ? 'In stock' : 'В наявності') : (en ? 'On order' : 'Під замовлення')}</p>
    ${loc.description || loc.short_desc ? `<div>${loc.description || loc.short_desc}</div>` : ''}
    ${specsHtml}
    ${relHtml}
    ${seoNav(lang)}
  </div>`
}

// Сітка товарів категорії → #seo-content (усі внутрішні лінки + ціни для краулерів).
function buildCategorySeoContent(cm, { cat, lang, products, eurRate }) {
  const en = lang !== 'uk'
  const base = langBase(lang)
  const catName = en ? cm.nameEn : cm.name
  const catDesc = en ? cm.descEn : cm.desc
  const breadcrumb = `<nav aria-label="${en ? 'Breadcrumb' : 'Хлібні крихти'}"><a href="${base}/">${en ? 'Home' : 'Головна'}</a> / <a href="${base}/catalog">${en ? 'Catalog' : 'Каталог'}</a></nav>`
  const grid = products && products.length
    ? `<ul>${products.map(p => {
        const pu = priceToUah(p.price, p.currency, eurRate)
        return `<li><a href="${base}/catalog/${encodeURIComponent(cat)}/${encodeURIComponent(p.slug)}">${esc(p.name)}</a>${pu ? ` — ${pu} ${en ? 'UAH' : 'грн'}` : ''}</li>`
      }).join('')}</ul>`
    : ''
  return `<div id="seo-content">
    ${breadcrumb}
    <h1>${esc(catName)}</h1>
    <p>${esc(catDesc)}</p>
    ${products && products.length ? `<h2>${en ? 'Products in this category' : 'Товари категорії'} (${products.length})</h2>${grid}` : ''}
    ${seoNav(lang)}
  </div>`
}

// Універсальний #seo-content для сторінки (стаття блогу / статична): H1 + контент + nav.
function buildPageSeoContent({ lang, h1, bodyHtml }) {
  return `<div id="seo-content">
    <h1>${esc(h1)}</h1>
    ${bodyHtml || ''}
    ${seoNav(lang)}
  </div>`
}

// ── Дані блоків головної/про-нас (дзеркало src/data/homeContent.js + about.js;
// бекенд CJS не імпортує ESM-фронт). uk + en; pl/fr/de → en (fallback). ────────
const HOME_STATS = {
  uk: [['23 роки', 'На ринку котельного обладнання'], ['16 країн', 'Експорт у Європу — філія в Польщі'], ['50+', 'Проєктів укомплектовано'], ['70 000+', 'Виробів на рік на заводі']],
  en: [['23 years', 'In the boiler equipment market'], ['16 countries', 'Export to Europe — branch in Poland'], ['50+', 'Projects fully equipped'], ['70,000+', 'Units produced per year']],
}
const HOME_ADVANTAGES = {
  uk: [
    ['Власне виробництво', 'Завод 3 000 м² у Києві та Житомирі. Повний цикл від металу до готового вузла.'],
    ['Гарантія якості', 'Кожна одиниця проходить вихідний контроль. ISO 9001:2015, CE.'],
    ['Наявність на складі', 'Склад 2 500 м². Більшість позицій відвантажуємо наступного дня.'],
    ['Міжнародний досвід', 'Поставки в 15 країн ЄС. Офіс у Польщі з 2018 року.'],
    ['Технічна підтримка', 'Інженерна підтримка на всіх етапах. Підбір під ваш проєкт.'],
    ['Комплексні рішення', 'TERMOJET BOX, Mini, Mega — від 30 кВт до 2 МВт.'],
  ],
  en: [
    ['In-house manufacturing', 'Factory of 3,000 m² in Kyiv and Zhytomyr. Full cycle from raw metal to finished unit.'],
    ['Quality assurance', 'Every unit passes final inspection. ISO 9001:2015, CE.'],
    ['In-stock availability', 'Warehouse of 2,500 m². Most items ship next day.'],
    ['International experience', 'Deliveries to 15 EU countries. Office in Poland since 2018.'],
    ['Technical support', 'Engineering support at every stage. Selection for your project.'],
    ['Complete solutions', 'TERMOJET BOX, Mini, Mega — from 30 kW to 2 MW.'],
  ],
}
const ABOUT_TIMELINE = [
  [2002, 'Заснування компанії Termojet у Києві. Перша продукція — насосні групи та гідравлічні роздільники.', 'Termojet founded in Kyiv. First products — pump groups and hydraulic separators.'],
  [2005, 'Відкрито власний виробничий цех площею 1 000 м². Початок серійного виробництва розподільчих колекторів.', 'Opened own 1,000 m² workshop. Start of serial production of distribution manifolds.'],
  [2008, 'Перші поставки в країни Євросоюзу. Сертифікація продукції за стандартами ЄС.', 'First deliveries to EU countries. Product certification to EU standards.'],
  [2012, 'Розширення виробництва до 3 000 м². Запуск автоматизованих ліній. Потужність — 70 000+ одиниць на рік.', 'Production expanded to 3,000 m². Automated lines launched. Capacity — 70,000+ units per year.'],
  [2015, 'Оснащено 10 000-у котельню обладнанням Termojet. Запуск серії TERMOJET Mega для промислових об\'єктів.', '10,000th boiler room equipped by Termojet. Launch of the TERMOJET Mega series for industrial facilities.'],
  [2018, 'Відкрито офіс у Забже (Польща) для обслуговування ринків Центральної та Східної Європи.', 'Office opened in Zabrze (Poland) to serve Central and Eastern European markets.'],
  [2022, 'Попри повномасштабне вторгнення виробництво не зупинялось. Termojet забезпечує критичну інфраструктуру України.', 'Despite the full-scale invasion, production never stopped. Termojet supplies Ukraine\'s critical infrastructure.'],
  [2024, '50 000+ оснащених об\'єктів. Експорт у 15 країн ЄС. ~100 працівників. Флагман українського виробництва.', '50,000+ equipped facilities. Export to 15 EU countries. ~100 employees. A flagship of Ukrainian manufacturing.'],
]
const ABOUT_LEGAL = {
  uk: [['Повна назва', 'Товариство з обмеженою відповідальністю «Софіївка Монтаж»'], ['Скорочена назва', 'ТОВ «Софіївка Монтаж»'], ['Юридична адреса', '08131, Київська обл., Бучанський р-н, с. Софіївська Борщагівка, вул. Київська, буд. 3'], ['Email', 'termojet@sofievka.kiev.ua']],
  en: [['Full name', 'Sofiivka Montazh LLC'], ['Short name', 'Sofiivka Montazh LLC'], ['Registered address', '08131, Kyiv Oblast, Bucha District, Sofiivska Borshchahivka, Kyivska St., 3'], ['Email', 'termojet@sofievka.kiev.ua']],
}

// Головна: інтро + сітка категорій + переваги (Чому обирають Termojet) + показники.
function buildHomeContent(lang) {
  const en = lang !== 'uk'
  const base = langBase(lang)
  const intro = en
    ? 'Termojet — Ukrainian manufacturer of quick-assembly systems for boiler rooms since 2002: pump groups, distribution manifolds, hydraulic separators, sludge and air separators, 3- and 4-way valves, circulation pumps, BOX modules, the Mega system and control automation.'
    : 'Termojet — український виробник систем швидкого монтажу для котелень з 2002 року: насосні групи, розподільчі колектори, гідравлічні розділювачі (гідрострілки), сепаратори шламу та повітря, 3- і 4-ходові клапани, циркуляційні насоси, модулі BOX, система Mega та автоматика керування.'
  const cats = Object.entries(CATEGORY_META).map(([slug, cm]) => {
    const name = en ? cm.nameEn : cm.name
    const d = en ? cm.descEn : cm.desc
    return `<li><a href="${base}/catalog/${encodeURIComponent(slug)}">${esc(name)}</a>${d ? ` — ${esc(d)}` : ''}</li>`
  }).join('')
  const stats = (en ? HOME_STATS.en : HOME_STATS.uk).map(([v, l]) => `<li><strong>${esc(v)}</strong> — ${esc(l)}</li>`).join('')
  const advs = (en ? HOME_ADVANTAGES.en : HOME_ADVANTAGES.uk).map(([t, d]) => `<li><strong>${esc(t)}</strong> — ${esc(d)}</li>`).join('')
  return `<p>${esc(intro)}</p>`
    + `<h2>${en ? 'Equipment catalog' : 'Каталог обладнання'}</h2><ul>${cats}</ul>`
    + `<h2>${en ? 'Termojet in numbers' : 'Termojet у цифрах'}</h2><ul>${stats}</ul>`
    + `<h2>${en ? 'Why choose Termojet' : 'Чому обирають Termojet'}</h2><ul>${advs}</ul>`
}

// Про нас: опис + юридичні реквізити + таймлайн «22 роки розвитку».
function buildAboutContent(lang) {
  const en = lang !== 'uk'
  const intro = en
    ? '<p>Termojet — Ukrainian manufacturer of boiler room equipment with its own production in Kyiv and a full cycle under one roof: laser cutting, bending, welding, powder coating, thermal insulation and quality control. The company has operated since 2002.</p><p>Termojet products — pump groups, distribution manifolds, hydraulic separators, separators, valves and automation — comply with European standards, are presented at industry exhibitions (including ISH in Frankfurt) and come with an official manufacturer warranty.</p>'
    : PAGE_CONTENT['/about']
  const legal = (en ? ABOUT_LEGAL.en : ABOUT_LEGAL.uk).map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')
  const timeline = ABOUT_TIMELINE.map(([y, uk, e]) => `<li><strong>${y}</strong> — ${esc(en ? e : uk)}</li>`).join('')
  return intro
    + `<h2>${en ? 'Legal details' : 'Юридичні реквізити'}</h2><table><tbody>${legal}</tbody></table>`
    + `<h2>${en ? '22 years of growth' : '22 роки розвитку та зростання'}</h2><ul>${timeline}</ul>`
}

// Список статей блогу (заголовок + анонс + лінк).
function buildBlogListContent(lang) {
  const en = lang !== 'uk'
  const base = langBase(lang)
  const rows = _db.prepare('SELECT slug, title, excerpt, i18n FROM blog_posts WHERE published = 1 ORDER BY created_at DESC').all()
  if (!rows.length) return ''
  const items = rows.map(r => {
    const loc = pickLang(r, lang)
    const ex = stripHtml(loc.excerpt)
    return `<li><a href="${base}/blog/${encodeURIComponent(r.slug)}">${esc(loc.title)}</a>${ex ? ` — ${esc(ex.slice(0, 180))}` : ''}</li>`
  }).join('')
  return `<h2>${en ? 'Articles' : 'Статті'} (${rows.length})</h2><ul>${items}</ul>`
}

// Стислий контент для контентних статичних сторінок (про нас / сервіс / доставка тощо).
// Текст самих сторінок живе в i18n (React); тут — коротка точна SEO-версія для raw HTML.
const PAGE_CONTENT = {
  '/about': '<p>Termojet — український виробник обладнання для котелень із власним виробництвом у Києві та повним циклом під одним дахом: лазерне різання, гнуття, зварювання, порошкове фарбування, теплоізоляція та контроль якості. Компанія працює з 2002 року.</p><p>Продукція Termojet — насосні групи, розподільчі колектори, гідравлічні розділювачі, сепаратори, клапани та автоматика — відповідає європейським стандартам, представлена на галузевих виставках (зокрема ISH у Франкфурті) і постачається з офіційною гарантією виробника.</p>',
  '/service': '<p>Termojet забезпечує сервісне обслуговування, інженерну підтримку та офіційну гарантію на все обладнання для котелень. Наші фахівці допомагають із підбором, монтажем і налаштуванням систем опалення.</p><p>Ми надаємо консультації щодо обв’язки котельні, гідравлічних схем та підбору обладнання під конкретний об’єкт — від приватного будинку до промислового об’єкта.</p>',
  '/delivery': '<p>Доставка обладнання Termojet здійснюється по всій Україні — «Новою Поштою» та іншими перевізниками. Доступні оплата при отриманні та оплата за рахунком для юридичних осіб.</p>',
  '/oem': '<p>Termojet пропонує OEM-виробництво обладнання для котелень під приватною торговою маркою: насосні групи, колектори, гідрострілки та інші вузли за вашими вимогами та брендуванням.</p>',
  '/partners': '<p>Termojet запрошує до співпраці дилерів, інсталяторів та проєктні організації. Партнерам — вигідні умови, технічна підтримка та навчання.</p>',
  '/returns': '<p>Умови повернення та обміну обладнання Termojet відповідають законодавству України. Товар можна повернути або обміняти згідно з установленими правилами.</p>',
  '/navchannya': '<p>Termojet проводить навчання та тренінги для монтажників і партнерів: підбір і монтаж насосних груп, колекторів, гідравлічних розділювачів та інших вузлів обв’язки котелень.</p>',
  '/portfolio': '<p>Реалізовані проєкти котелень і систем опалення з обладнанням Termojet: приватні будинки, комерційні та промислові об’єкти по всій Україні.</p>',
}

// FAQ: питання + відповіді (текстом).
function buildFaqContent(lang) {
  const en = lang !== 'uk' // pl/fr/de → en-переклад FAQ (i18n.en) як fallback
  const rows = _db.prepare('SELECT question, answer, i18n FROM faqs ORDER BY sort ASC, created_at ASC').all()
  if (!rows.length) return ''
  return rows.map(r => {
    let q = r.question, a = r.answer
    if (en) { try { const t = JSON.parse(r.i18n || '{}').en; if (t) { q = t.question || q; a = t.answer || a } } catch { /* UA */ } }
    return `<h3>${esc(q)}</h3><p>${esc(stripHtml(a))}</p>`
  }).join('')
}

// ── Товари: UA + EN ───────────────────────────────────────────────────────────
// Спільний хендлер для /catalog/:cat/:slug і /en/catalog/:cat/:slug.
function handleProduct(lang) {
  return async (req, res, next) => {
    try {
      const row = _db.prepare(
        'SELECT name, image, images, sku, price, currency, in_stock, category_slug, specs, short_desc, description, seo_title, meta_description, i18n FROM products WHERE slug = ? AND is_visible = 1'
      ).get(req.params.slug)
      if (!row) return next()
      const loc = pickLang(row, lang)
      let html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
      const title = loc.seo_title || `${loc.name} | Termojet`
      const desc = (loc.meta_description || stripHtml(loc.short_desc) || stripHtml(loc.description) || DEFAULT_TITLE).slice(0, 200)
      const img = absImg(row.image)
      const catEnc = encodeURIComponent(req.params.cat)
      const slugEnc = encodeURIComponent(req.params.slug)
      const logicalPath = `/catalog/${catEnc}/${slugEnc}`
      const url = langBase(lang) + logicalPath
      const bodyText = (stripHtml(loc.description) || stripHtml(loc.short_desc) || desc).slice(0, 600)
      const h1 = loc.name
      const alternates = buildAlternates(logicalPath)
      const eurRate = await getEurRate()
      const jsonLd = buildProductJsonLd(row, loc, { url, img, desc, cat: req.params.cat, lang, eurRate })
      html = injectMeta(html, { title, desc, url, img, h1, bodyText, alternates, jsonLd })
      // SSR-lite: повний семантичний HTML товару в #seo-content (бачать краулери)
      const related = _db.prepare(
        'SELECT name, slug, price, currency FROM products WHERE category_slug = ? AND slug != ? AND is_visible = 1 ORDER BY name LIMIT 4'
      ).all(row.category_slug, req.params.slug)
      const seoBlock = buildProductSeoContent(row, loc, { cat: req.params.cat, lang, eurRate, related })
      html = html.replace('<div id="seo-content"></div>', seoBlock)
      res.setHeader('Cache-Control', 'no-cache')
      return res.type('html').send(html)
    } catch (e) { return next() }
  }
}

app.get('/catalog/:cat/:slug', handleProduct('uk'))
for (const lg of ['en', 'pl', 'fr', 'de', 'ro']) app.get(`/${lg}/catalog/:cat/:slug`, handleProduct(lg))

// ── Блог: UA + EN ─────────────────────────────────────────────────────────────
function handleBlog(lang) {
  return (req, res, next) => {
    try {
      const row = _db.prepare(
        'SELECT title, excerpt, content, image, published_at, created_at, i18n FROM blog_posts WHERE slug = ? AND published = 1'
      ).get(req.params.slug)
      if (!row) return next()
      const loc = pickLang(row, lang)
      let html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
      const title = `${loc.title || row.title} | Termojet`
      const desc = (stripHtml(loc.excerpt) || stripHtml(loc.content) || DEFAULT_TITLE).slice(0, 200)
      const img = absImg(row.image)
      const slugEnc = encodeURIComponent(req.params.slug)
      const logicalPath = `/blog/${slugEnc}`
      const url = langBase(lang) + logicalPath
      const bodyText = (stripHtml(loc.excerpt) || stripHtml(loc.content) || desc).slice(0, 600)
      const h1 = loc.title || row.title
      const alternates = buildAlternates(logicalPath)
      const published = row.published_at || row.created_at || undefined
      const article = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: (loc.title || row.title || '').slice(0, 110),
        description: desc,
        image: [img],
        author: { '@type': 'Organization', name: 'Termojet' },
        publisher: { '@type': 'Organization', name: 'Termojet', logo: { '@type': 'ImageObject', url: `${SITE}/logo-white.png` } },
        datePublished: published,
        dateModified: published,
        mainEntityOfPage: url,
      }
      html = injectMeta(html, { title, desc, url, img, ogType: 'article', h1, bodyText, alternates, jsonLd: [article, ORG_SCHEMA] })
      // SSR-lite: заголовок + текст статті в #seo-content
      html = html.replace('<div id="seo-content"></div>', buildPageSeoContent({ lang, h1, bodyHtml: loc.content || `<p>${esc(desc)}</p>` }))
      res.setHeader('Cache-Control', 'no-cache')
      return res.type('html').send(html)
    } catch (e) { return next() }
  }
}

app.get('/blog/:slug', handleBlog('uk'))
for (const lg of ['en', 'pl', 'fr', 'de', 'ro']) app.get(`/${lg}/blog/:slug`, handleBlog(lg))

// ── Категорії: UA + EN/PL/FR/DE ───────────────────────────────────────────────
// Назви категорій мають uk+en; для pl/fr/de — англійський fallback (en-мітки).
function handleCategory(lang) {
  return async (req, res, next) => {
    const cm = CATEGORY_META[req.params.cat]
    if (!cm) return next()
    try {
      let html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
      const intl = lang !== 'uk'
      const base = langBase(lang)
      const catEnc = encodeURIComponent(req.params.cat)
      const logicalPath = `/catalog/${catEnc}`
      const url = base + logicalPath
      const alternates = buildAlternates(logicalPath)
      const cName = intl ? cm.nameEn : cm.name
      const cDesc = intl ? cm.descEn : cm.desc
      if (intl) {
        let title = `${cName} | Termojet`
        if (title.length < 35) title = `${cName} — boiler room equipment | Termojet`.slice(0, 60)
        const desc = `${cDesc}. Termojet — manufacturer since 2002, delivery across Ukraine.`.slice(0, 200)
        const jsonLd = [buildBreadcrumb([
          { name: 'Home', url: base },
          { name: 'Catalog', url: `${base}/catalog` },
          { name: cName, url },
        ]), ORG_SCHEMA]
        html = injectMeta(html, { title, desc, url, h1: cName, bodyText: cDesc, alternates, jsonLd })
      } else {
        let title = `${cName} | Termojet`
        if (title.length < 35) title = `${cName} — обладнання для котелень | Termojet`.slice(0, 60)
        const desc = `${cDesc}. Termojet — власне виробництво з 2002 року, доставка по Україні.`.slice(0, 200)
        const jsonLd = [buildBreadcrumb([
          { name: 'Головна', url: base },
          { name: 'Каталог', url: `${base}/catalog` },
          { name: cName, url },
        ]), ORG_SCHEMA]
        html = injectMeta(html, { title, desc, url, h1: cName, bodyText: cDesc, alternates, jsonLd })
      }
      // SSR-lite: сітка товарів категорії в #seo-content
      const products = _db.prepare(
        'SELECT name, slug, price, currency FROM products WHERE category_slug = ? AND is_visible = 1 ORDER BY name'
      ).all(req.params.cat)
      const eurRate = await getEurRate()
      html = html.replace('<div id="seo-content"></div>', buildCategorySeoContent(cm, { cat: req.params.cat, lang, products, eurRate }))
      res.setHeader('Cache-Control', 'no-cache')
      return res.type('html').send(html)
    } catch (e) { return next() }
  }
}

app.get('/catalog/:cat', handleCategory('uk'))
for (const lg of ['en', 'pl', 'fr', 'de', 'ro']) app.get(`/${lg}/catalog/:cat`, handleCategory(lg))

// Білий список реальних SPA-роутів (мовний префікс /en /pl /fr /de вже стрипнуто).
// Усе, що НЕ тут і не валідний товар/категорія/стаття — віддаємо HTTP 404, щоб
// прибрати «soft 404»: раніше catch-all був чорним списком (лише WP-патерни → 404),
// тому будь-який неіснуючий URL (/catalog/фейк, /catalog/mega/фейк, /випадкове)
// віддавав 200 + SPA-заглушку, і Google індексував порожні сторінки.
const KNOWN_ROUTES = new Set([
  '/', '/catalog', '/blog', '/faq', '/about', '/service', '/delivery',
  '/oem', '/partners', '/returns', '/navchannya', '/portfolio', '/contacts',
  '/files', '/reviews', '/privacy', '/terms', '/cart', '/dealers', '/support',
  '/training', '/warranty',
])
function isKnownRoute(p) {
  if (KNOWN_ROUTES.has(p)) return true
  if (p === '/admin' || p.startsWith('/admin/')) return true
  let m = p.match(/^\/catalog\/([^/]+)$/)
  if (m) return !!CATEGORY_META[decodeURIComponent(m[1])]
  m = p.match(/^\/catalog\/[^/]+\/([^/]+)$/)
  // fail-open (return true) на помилці БД — краще показати сторінку, ніж хибно 404-ити реальний товар
  if (m) { try { return !!_db.prepare('SELECT 1 FROM products WHERE slug = ? AND is_visible = 1').get(decodeURIComponent(m[1])) } catch { return true } }
  m = p.match(/^\/blog\/([^/]+)$/)
  if (m) { try { return !!_db.prepare('SELECT 1 FROM blog_posts WHERE slug = ? AND published = 1').get(decodeURIComponent(m[1])) } catch { return true } }
  return false
}

// ── Catch-all: статичні сторінки + SPA fallback ───────────────────────────────
app.get('*', (req, res) => {
  // Нормалізуємо шлях + визначаємо мову: /en|pl|fr|de|ro/about → /about + lang.
  const rawPath = req.path.replace(/\/+$/, '') || '/'
  let lookupPath = rawPath, lang = 'uk'
  const langMatch = rawPath.match(/^\/(en|pl|fr|de|ro)(\/.*|)$/)
  if (langMatch) { lang = langMatch[1]; lookupPath = langMatch[2] || '/' }
  const intl = lang !== 'uk'

  // Статичні сторінки з унікальними метаданими + self-canonical + hreflang (5 мов).
  // pl/fr/de беруть англійські title/desc як fallback (STATIC_META_EN).
  const sm = STATIC_META[lookupPath]
  const meta = intl ? (STATIC_META_EN[lookupPath] || sm) : sm
  if (sm) {
    try {
      let html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
      const url = langBase(lang) + (lookupPath === '/' ? '' : lookupPath)
      const alternates = buildAlternates(lookupPath)
      const jsonLd = [ORG_SCHEMA]
      if (lookupPath === '/faq') { const faq = buildFaqSchema(lang); if (faq) jsonLd.unshift(faq) }
      html = injectMeta(html, { title: meta.title, desc: meta.desc, url, alternates, jsonLd })
      // SSR-lite: H1 + контент сторінки + nav у #seo-content.
      // Дата-керовані сторінки (головна/блог/FAQ) наповнюємо реальним контентом.
      const lg = lang
      const h1 = (meta.title || '').replace(/\s*[|–—-]\s*Termojet\s*$/i, '').trim() || 'Termojet'
      let bodyHtml = `<p>${esc(meta.desc)}</p>`
      if (lookupPath === '/') bodyHtml += buildHomeContent(lg)
      else if (lookupPath === '/about') bodyHtml += buildAboutContent(lg)
      else if (lookupPath === '/blog') bodyHtml += buildBlogListContent(lg)
      else if (lookupPath === '/faq') bodyHtml += buildFaqContent(lg)
      else if (PAGE_CONTENT[lookupPath]) bodyHtml += PAGE_CONTENT[lookupPath]
      html = html.replace('<div id="seo-content"></div>', buildPageSeoContent({ lang: lg, h1, bodyHtml }))
      res.setHeader('Cache-Control', 'no-cache')
      return res.type('html').send(html)
    } catch (e) { /* fall through */ }
  }


  // Неіснуючі службові файли не маскуємо SPA-заглушкою (інакше /sitemap_index.xml,
  // robots тощо віддавали б HTML і ламали валідацію). Реальні файли вже віддав express.static.
  if (/\.(xml|txt|json|map|ico)$/i.test(req.path)) {
    return res.status(404).type('text/plain').send('Not found')
  }
  // Старі WordPress-URL (лишились в індексі Google) → SPA-шелл, але з HTTP 404:
  // користувач бачить клієнтську сторінку 404, а Google коректно деіндексує (не
  // «soft 404»). Патерни однозначні й НЕ перетинаються з реальними роутами
  // (реальні товари — /catalog/:cat/:slug, а не /product/…).
  const DEAD_WP = /(^|\/)(product|product-category|author|feed|sample-page|comments|wp-json|xmlrpc\.php)(\/|$)|^\/ru(\/|$)/i
  // Білий список: lookupPath (уже без мовного префікса) перевіряємо на реальний роут.
  // 404 якщо: старий WP-URL АБО шлях не відповідає жодному валідному роуту/товару.
  const statusCode = (DEAD_WP.test(req.path) || !isKnownRoute(lookupPath)) ? 404 : 200

  // SPA fallback для роутів поза STATIC_META (/cart, /pl, /fr, /de, глибокі шляхи…).
  // Інжектимо принаймні Organization, щоб мікророзмітка Organization була на КОЖНІЙ
  // сторінці (унікальні індексовані сторінки мають власний запис у STATIC_META вище
  // з title/desc/canonical). canonical/title лишаємо дефолтними з index.html.
  res.setHeader('Cache-Control', 'no-cache')
  res.status(statusCode)
  try {
    const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
      .replace('</head>', `    ${jsonLdScripts([ORG_SCHEMA])}\n  </head>`)
    return res.type('html').send(html)
  } catch (e) {
    return res.sendFile(path.join(DIST, 'index.html'))
  }
})

// FIX 7 — global error handler: log server-side, never leak stack traces to client
// Must be defined after all routes and before app.listen
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: 'Internal error' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Termojet server running on port ${PORT}`)
})
