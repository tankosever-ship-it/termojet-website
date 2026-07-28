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
    seo_title: loc.seo_title || row.seo_title,
    meta_description: loc.meta_description || row.meta_description,
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

// Product + BreadcrumbList + Organization для сторінки товару (дзеркало SEO.jsx, серверно з БД).
function buildProductJsonLd(row, loc, { url, img, desc, cat, lang }) {
  const en = lang === 'en'
  const base = en ? `${SITE}/en` : SITE
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
    product.offers = {
      '@type': 'Offer',
      price: String(row.price),
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
      if (lang === 'en') {
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

// Будує пару hreflang-альтернатив uk↔en+x-default для товару/категорії/блогу.
function buildAlternates(uaUrl, enUrl) {
  return [
    { hreflang: 'uk', href: uaUrl },
    { hreflang: 'en', href: enUrl },
    { hreflang: 'x-default', href: uaUrl },
  ]
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

// ── Товари: UA + EN ───────────────────────────────────────────────────────────
// Спільний хендлер для /catalog/:cat/:slug і /en/catalog/:cat/:slug.
function handleProduct(lang) {
  return (req, res, next) => {
    try {
      const row = _db.prepare(
        'SELECT name, image, images, sku, price, in_stock, category_slug, short_desc, description, seo_title, meta_description, i18n FROM products WHERE slug = ? AND is_visible = 1'
      ).get(req.params.slug)
      if (!row) return next()
      const loc = pickLang(row, lang)
      let html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
      const title = loc.seo_title || `${loc.name} | Termojet`
      const desc = (loc.meta_description || stripHtml(loc.short_desc) || stripHtml(loc.description) || DEFAULT_TITLE).slice(0, 200)
      const img = absImg(row.image)
      const catEnc = encodeURIComponent(req.params.cat)
      const slugEnc = encodeURIComponent(req.params.slug)
      const uaUrl = `${SITE}/catalog/${catEnc}/${slugEnc}`
      const enUrl = `${SITE}/en/catalog/${catEnc}/${slugEnc}`
      const url = lang === 'en' ? enUrl : uaUrl
      const bodyText = (stripHtml(loc.description) || stripHtml(loc.short_desc) || desc).slice(0, 600)
      const h1 = loc.name
      const alternates = buildAlternates(uaUrl, enUrl)
      const jsonLd = buildProductJsonLd(row, loc, { url, img, desc, cat: req.params.cat, lang })
      html = injectMeta(html, { title, desc, url, img, h1, bodyText, alternates, jsonLd })
      res.setHeader('Cache-Control', 'no-cache')
      return res.type('html').send(html)
    } catch (e) { return next() }
  }
}

app.get('/catalog/:cat/:slug', handleProduct('uk'))
app.get('/en/catalog/:cat/:slug', handleProduct('en'))

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
      const uaUrl = `${SITE}/blog/${slugEnc}`
      const enUrl = `${SITE}/en/blog/${slugEnc}`
      const url = lang === 'en' ? enUrl : uaUrl
      const bodyText = (stripHtml(loc.excerpt) || stripHtml(loc.content) || desc).slice(0, 600)
      const h1 = loc.title || row.title
      const alternates = buildAlternates(uaUrl, enUrl)
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
      res.setHeader('Cache-Control', 'no-cache')
      return res.type('html').send(html)
    } catch (e) { return next() }
  }
}

app.get('/blog/:slug', handleBlog('uk'))
app.get('/en/blog/:slug', handleBlog('en'))

// ── Категорії: UA + EN ────────────────────────────────────────────────────────
function handleCategory(lang) {
  return (req, res, next) => {
    const cm = CATEGORY_META[req.params.cat]
    if (!cm) return next()
    try {
      let html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
      const catEnc = encodeURIComponent(req.params.cat)
      const uaUrl = `${SITE}/catalog/${catEnc}`
      const enUrl = `${SITE}/en/catalog/${catEnc}`
      if (lang === 'en') {
        // Короткі назви категорій дають задовгий/закороткий title — падимо до ≥30 симв.
        let title = `${cm.nameEn} | Termojet`
        if (title.length < 35) title = `${cm.nameEn} — boiler room equipment | Termojet`.slice(0, 60)
        const desc = `${cm.descEn}. Termojet — manufacturer since 2002, delivery across Ukraine.`.slice(0, 200)
        const alternates = buildAlternates(uaUrl, enUrl)
        const jsonLd = [buildBreadcrumb([
          { name: 'Home', url: `${SITE}/en` },
          { name: 'Catalog', url: `${SITE}/en/catalog` },
          { name: cm.nameEn, url: enUrl },
        ]), ORG_SCHEMA]
        html = injectMeta(html, { title, desc, url: enUrl, h1: cm.nameEn, bodyText: cm.descEn, alternates, jsonLd })
      } else {
        let title = `${cm.name} | Termojet`
        if (title.length < 35) title = `${cm.name} — обладнання для котелень | Termojet`.slice(0, 60)
        const desc = `${cm.desc}. Termojet — власне виробництво з 2002 року, доставка по Україні.`.slice(0, 200)
        const alternates = buildAlternates(uaUrl, enUrl)
        const jsonLd = [buildBreadcrumb([
          { name: 'Головна', url: SITE },
          { name: 'Каталог', url: `${SITE}/catalog` },
          { name: cm.name, url: uaUrl },
        ]), ORG_SCHEMA]
        html = injectMeta(html, { title, desc, url: uaUrl, h1: cm.name, bodyText: cm.desc, alternates, jsonLd })
      }
      res.setHeader('Cache-Control', 'no-cache')
      return res.type('html').send(html)
    } catch (e) { return next() }
  }
}

app.get('/catalog/:cat', handleCategory('uk'))
app.get('/en/catalog/:cat', handleCategory('en'))

// ── Catch-all: статичні сторінки + SPA fallback ───────────────────────────────
app.get('*', (req, res) => {
  // Нормалізуємо шлях: /en/about → /about для пошуку в STATIC_META
  const rawPath = req.path.replace(/\/+$/, '') || '/'
  let lookupPath = rawPath
  const isEn = rawPath.startsWith('/en/') || rawPath === '/en'
  if (rawPath.startsWith('/en/')) lookupPath = rawPath.slice(3) || '/'
  else if (rawPath === '/en') lookupPath = '/'

  // UA/EN статичні сторінки з унікальними метаданими + hreflang.
  const sm = STATIC_META[lookupPath]
  const meta = isEn ? (STATIC_META_EN[lookupPath] || sm) : sm
  if (sm) {
    try {
      let html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
      const uaUrl = SITE + lookupPath
      const enUrl = SITE + '/en' + (lookupPath === '/' ? '' : lookupPath)
      const url = isEn ? enUrl : uaUrl
      const alternates = buildAlternates(uaUrl, enUrl)
      const jsonLd = [ORG_SCHEMA]
      if (lookupPath === '/faq') { const faq = buildFaqSchema(isEn ? 'en' : 'uk'); if (faq) jsonLd.unshift(faq) }
      html = injectMeta(html, { title: meta.title, desc: meta.desc, url, alternates, jsonLd })
      res.setHeader('Cache-Control', 'no-cache')
      return res.type('html').send(html)
    } catch (e) { /* fall through */ }
  }


  // Неіснуючі службові файли не маскуємо SPA-заглушкою (інакше /sitemap_index.xml,
  // robots тощо віддавали б HTML і ламали валідацію). Реальні файли вже віддав express.static.
  if (/\.(xml|txt|json|map|ico)$/i.test(req.path)) {
    return res.status(404).type('text/plain').send('Not found')
  }
  // SPA fallback для роутів поза STATIC_META (/cart, /pl, /fr, /de, глибокі шляхи…).
  // Інжектимо принаймні Organization, щоб мікророзмітка Organization була на КОЖНІЙ
  // сторінці (унікальні індексовані сторінки мають власний запис у STATIC_META вище
  // з title/desc/canonical). canonical/title лишаємо дефолтними з index.html.
  res.setHeader('Cache-Control', 'no-cache')
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
