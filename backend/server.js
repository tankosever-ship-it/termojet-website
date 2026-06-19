const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const path = require('path')
const fs = require('fs')
const compression = require('compression')

const app = express()
const PORT = process.env.PORT || 3000

// За nginx reverse-proxy (127.0.0.1:8080). Довіряємо ЛИШЕ loopback-проксі —
// req.ip бере реальний клієнтський IP з X-Forwarded-For (потрібно для коректного
// rate-limiting), але зовнішні клієнти не можуть підробити XFF.
app.set('trust proxy', 'loopback')

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

app.get('/catalog/:cat/:slug', (req, res, next) => {
  try {
    const row = _db.prepare('SELECT name, image, short_desc, description FROM products WHERE slug = ? AND is_visible = 1').get(req.params.slug)
    if (!row) return next()
    let html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
    const title = `${row.name} — Termojet`
    const desc = (stripHtml(row.short_desc) || stripHtml(row.description) || DEFAULT_TITLE).slice(0, 200)
    const img = absImg(row.image)
    const url = `${SITE}/catalog/${encodeURIComponent(req.params.cat)}/${encodeURIComponent(req.params.slug)}`
    html = html
      .split(DEFAULT_OG_IMG).join(esc(img))
      .split(DEFAULT_TITLE).join(esc(title))
      .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${esc(url)}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
      .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    res.setHeader('Cache-Control', 'no-cache')
    return res.type('html').send(html)
  } catch (e) { return next() }
})

app.get('*', (req, res) => {
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
