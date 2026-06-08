const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const compression = require('compression')

const app = express()
const PORT = process.env.PORT || 3000

// gzip-стиснення всіх відповідей (−~75% ваги JS/HTML/JSON)
app.use(compression())

// легкі security-заголовки (без CSP, щоб нічого не зламати)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
})

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

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

// API routes
const { router: authRouter } = require('./routes/auth')
app.use('/api/auth', authRouter)
app.use('/api/products', require('./routes/products'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/consultations', require('./routes/consultations'))
app.use('/api/dealers', require('./routes/dealers'))
app.use('/api/blog', require('./routes/blog'))
app.use('/api/portfolio', require('./routes/portfolio'))
app.use('/api/reviews', require('./routes/reviews'))
app.use('/api/files', require('./routes/files'))
app.use('/api/settings', require('./routes/settings'))
app.use('/api/subscribers', require('./routes/subscribers'))
app.use('/api/faq', require('./routes/faq'))
app.use('/api/banners', require('./routes/banners'))
app.use('/api/promos', require('./routes/promos'))
app.use('/api/clients', require('./routes/clients'))
app.use('/api/analytics', require('./routes/analytics'))
app.use('/api/upload', require('./routes/upload'))

// serve React build
const DIST = path.join(__dirname, '..', 'dist')
app.use(express.static(DIST, {
  setHeaders: (res, filePath) => {
    // хешовані ассети (vite кладе контент-хеш у назву) — кеш на рік, immutable
    if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    } else {
      // index.html та інші кореневі файли — завжди свіжі
      res.setHeader('Cache-Control', 'no-cache')
    }
  },
}))
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache')
  res.sendFile(path.join(DIST, 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Termojet server running on port ${PORT}`)
})
