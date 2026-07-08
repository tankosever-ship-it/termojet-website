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
let REDIRECTS = {}
try { REDIRECTS = JSON.parse(fs.readFileSync(path.join(__dirname, 'redirects.json'), 'utf8')) } catch {}
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next()
  let p = req.path.replace(/\/+$/, '') || '/'
  // Шлях може приходити URL-закодованим (напр. кирилиця %D0%B0…) — розкодовуємо,
  // щоб збігалося з ключами карти редиректів.
  try { p = decodeURIComponent(p) } catch {}
  const lng = p.match(/^\/(pl|en|de|fr)(\/.*|)$/)
  if (lng) p = lng[2] || '/'
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
// ── Per-product OG-теги для прев'ю посилань (Telegram/Viber/FB не виконують JS) ──
// Сторінка товару = /catalog/<cat>/<slug>. Підставляємо фото/назву/опис у мета-теги
// index.html, щоб кожне посилання мало СВОЮ мініатюру, а не одну спільну.
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

// A+ per-товар: серверний ін'єкт у сирий HTML (для краулерів, у т.ч. LLM-ботів без JS).
// Метадані беремо з готових полів БД: seo_title (≤60, унікальні), meta_description.
// Head: title/canonical(self)/description/og. Body: у <noscript> ставимо сторінковий H1 +
// опис (React на клієнті рендерить своє в #root; <noscript> користувачам не видно → без флешу).
app.get('/catalog/:cat/:slug', (req, res, next) => {
  try {
    const row = _db.prepare('SELECT name, image, short_desc, description, seo_title, meta_description FROM products WHERE slug = ? AND is_visible = 1').get(req.params.slug)
    if (!row) return next()
    let html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
    const title = row.seo_title || `${row.name} — Termojet`
    const desc = (row.meta_description || stripHtml(row.short_desc) || stripHtml(row.description) || DEFAULT_TITLE).slice(0, 200)
    const img = absImg(row.image)
    const url = `${SITE}/catalog/${encodeURIComponent(req.params.cat)}/${encodeURIComponent(req.params.slug)}`
    const bodyText = (stripHtml(row.description) || stripHtml(row.short_desc) || desc).slice(0, 600)
    const noscriptH1 = `<h1>${esc(row.name)}</h1>${bodyText ? `\n        <p>${esc(bodyText)}</p>` : ''}`
    html = html
      .split(DEFAULT_OG_IMG).join(esc(img))
      .split(DEFAULT_TITLE).join(esc(title))
      .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${esc(url)}$2`)
      .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${esc(url)}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
      .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
      .replace(/<h1>Termojet[^<]*<\/h1>/, noscriptH1)
    res.setHeader('Cache-Control', 'no-cache')
    return res.type('html').send(html)
  } catch (e) { return next() }
})

// A+ per-стаття блогу: той самий ін'єкт із blog_posts (title/excerpt).
app.get('/blog/:slug', (req, res, next) => {
  try {
    const row = _db.prepare('SELECT title, excerpt, content, image FROM blog_posts WHERE slug = ? AND published = 1').get(req.params.slug)
    if (!row) return next()
    let html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
    const title = `${row.title} | Termojet`
    const desc = (stripHtml(row.excerpt) || stripHtml(row.content) || DEFAULT_TITLE).slice(0, 200)
    const img = absImg(row.image)
    const url = `${SITE}/blog/${encodeURIComponent(req.params.slug)}`
    const bodyText = (stripHtml(row.excerpt) || stripHtml(row.content) || desc).slice(0, 600)
    const noscriptH1 = `<h1>${esc(row.title)}</h1>${bodyText ? `\n        <p>${esc(bodyText)}</p>` : ''}`
    html = html
      .split(DEFAULT_OG_IMG).join(esc(img))
      .split(DEFAULT_TITLE).join(esc(title))
      .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${esc(url)}$2`)
      .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${esc(url)}$2`)
      .replace(/(<meta property="og:type" content=")[^"]*(")/, `$1article$2`)
      .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
      .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
      .replace(/<h1>Termojet[^<]*<\/h1>/, noscriptH1)
    res.setHeader('Cache-Control', 'no-cache')
    return res.type('html').send(html)
  } catch (e) { return next() }
})

// Спільний хелпер ін'єкту метаданих у shell (для краулерів/LLM без JS).
function injectMeta(html, { title, desc, url, img, ogType = 'website', h1, bodyText }) {
  let out = img ? html.split(DEFAULT_OG_IMG).join(esc(img)) : html
  out = out
    .split(DEFAULT_TITLE).join(esc(title))
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${esc(url)}$2`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${esc(url)}$2`)
    .replace(/(<meta property="og:type" content=")[^"]*(")/, `$1${esc(ogType)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
  if (h1) out = out.replace(/<h1>Termojet[^<]*<\/h1>/, `<h1>${esc(h1)}</h1>${bodyText ? `\n        <p>${esc(bodyText)}</p>` : ''}`)
  return out
}

// Назви+описи 15 категорій (джерело — src/data/categories.js; бекенд CJS не імпортує ESM-фронт).
const CATEGORY_META = {
  'nasosni-hrupy': { name: 'Насосні групи', desc: 'Готові насосні вузли з обв’язкою для котелень' },
  'hidravlichni-rozdilnyky': { name: 'Роздільники гідравлічні', desc: 'Гідрострілки для котельних систем' },
  'rozpodilchi-kolektory': { name: 'Розподільчі колектори', desc: 'Колектори по потужності 60/105/175 кВт' },
  'kolektory-z-hidrostrilkoyu': { name: 'Розподільчі колектори з гідрострілкою', desc: 'Колектори з вбудованою гідрострілкою' },
  'termojet-box': { name: 'Модульні системи TERMOJET BOX', desc: 'Компактні вузли обв’язки котла' },
  'termojet-mega': { name: 'Серія Termojet Mega (до 2200 кВт)', desc: 'Промислові системи опалення до 2.2 МВт' },
  'nasosy': { name: 'Насоси', desc: 'Циркуляційні насоси для систем опалення' },
  'klapany': { name: '3-х/4-х ходові та термостатичні клапани', desc: '3- і 4-ходові клапани та електричні сервоприводи' },
  'balansuval-klapany': { name: 'Статичний балансувальний клапан', desc: 'Статичне балансування систем опалення' },
  'separatory': { name: 'Сепаратори', desc: 'Шламові та повітряні сепаратори' },
  'zonalne-keruvannya': { name: 'Термостати та зональне керування', desc: 'Термостати, програматори, центри комутації та аксесуари' },
  'kolektory-pidloha': { name: 'Система підлогового опалення', desc: 'Колектори, змішувальні вузли та шафи для теплої підлоги' },
  'avtomatyka': { name: 'Автоматика котельного обладнання', desc: 'Контролери та системи управління котлами' },
  'dodatkove': { name: 'Додаткове обладнання', desc: 'Аксесуари і супутні товари для монтажу' },
  'rozprodazh': { name: 'Акція', desc: 'Обладнання Termojet за акційними цінами' },
}

// Статичні сторінки — унікальні title/description (усувають дубль generic на не-товарних).
const STATIC_META = {
  '/catalog': { title: 'Каталог обладнання для котелень | Termojet', desc: 'Каталог Termojet: насосні групи, колектори, гідрострілки, клапани, сепаратори, автоматика. Власне виробництво з 2002 року.' },
  '/about': { title: 'Про компанію Termojet — виробник з 2002 року', desc: 'Termojet — український виробник обладнання для котелень з 2002 року: власне виробництво, інженерна підтримка, гарантія.' },
  '/contacts': { title: 'Контакти Termojet — звʼязатися з виробником', desc: 'Контакти Termojet: телефони, адреса, форма звʼязку. Консультація з підбору обладнання для котелень.' },
  '/blog': { title: 'Блог Termojet — опалення, котельні, монтаж', desc: 'Статті Termojet про опалення, котельні, монтаж систем, новини компанії та галузеві виставки.' },
  '/service': { title: 'Сервіс і гарантія | Termojet', desc: 'Сервісне обслуговування та гарантія на обладнання Termojet для котелень.' },
  '/faq': { title: 'Часті питання (FAQ) | Termojet', desc: 'Відповіді на часті питання про обладнання Termojet: підбір, монтаж, доставка, гарантія.' },
  '/delivery': { title: 'Доставка й оплата | Termojet', desc: 'Умови доставки й оплати обладнання Termojet по Україні.' },
  '/files': { title: 'Документація й каталоги | Termojet', desc: 'Технічна документація, каталоги та інструкції на обладнання Termojet.' },
  '/oem': { title: 'OEM та приватна марка | Termojet', desc: 'OEM-виробництво обладнання для котелень під приватною маркою від Termojet.' },
  '/partners': { title: 'Дилерам і партнерам | Termojet', desc: 'Співпраця з Termojet: умови для дилерів, інсталяторів і партнерів.' },
  '/portfolio': { title: 'Наші проекти | Termojet', desc: 'Реалізовані проекти котелень і систем опалення з обладнанням Termojet.' },
  '/returns': { title: 'Повернення й обмін | Termojet', desc: 'Умови повернення й обміну обладнання Termojet.' },
  '/terms': { title: 'Умови використання | Termojet', desc: 'Умови використання сайту та придбання обладнання Termojet.' },
  '/privacy': { title: 'Політика конфіденційності | Termojet', desc: 'Політика конфіденційності та обробки персональних даних Termojet.' },
  '/navchannya': { title: 'Навчання та тренінги | Termojet', desc: 'Навчальні матеріали й тренінги Termojet з монтажу та підбору обладнання для котелень.' },
}

// A+ per-категорія (/catalog/:cat) — title/description/H1 з CATEGORY_META.
app.get('/catalog/:cat', (req, res, next) => {
  const cm = CATEGORY_META[req.params.cat]
  if (!cm) return next()
  try {
    let html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
    const title = `${cm.name} | Termojet`
    const desc = `${cm.desc}. Termojet — власне виробництво з 2002 року, доставка по Україні.`.slice(0, 200)
    const url = `${SITE}/catalog/${encodeURIComponent(req.params.cat)}`
    html = injectMeta(html, { title, desc, url, h1: cm.name, bodyText: cm.desc })
    res.setHeader('Cache-Control', 'no-cache')
    return res.type('html').send(html)
  } catch (e) { return next() }
})

app.get('*', (req, res) => {
  // A+ статичні сторінки — унікальні метадані з STATIC_META.
  const sm = STATIC_META[(req.path.replace(/\/+$/, '') || '/')]
  if (sm) {
    try {
      let html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
      const url = SITE + (req.path === '/' ? '/' : req.path.replace(/\/+$/, ''))
      html = injectMeta(html, { title: sm.title, desc: sm.desc, url })
      res.setHeader('Cache-Control', 'no-cache')
      return res.type('html').send(html)
    } catch (e) { /* fall through */ }
  }
  // Неіснуючі службові файли не маскуємо SPA-заглушкою (інакше /sitemap_index.xml,
  // robots тощо віддавали б HTML і ламали валідацію). Реальні файли вже віддав express.static.
  if (/\.(xml|txt|json|map|ico)$/i.test(req.path)) {
    return res.status(404).type('text/plain').send('Not found')
  }
  res.setHeader('Cache-Control', 'no-cache')
  res.sendFile(path.join(DIST, 'index.html'))
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
