const express = require('express')
const cors = require('cors')
const path = require('path')
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
