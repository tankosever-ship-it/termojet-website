const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

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
app.use('/api/upload', require('./routes/upload'))

// serve React build
const DIST = path.join(__dirname, '..', 'dist')
app.use(express.static(DIST))
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST, 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Termojet server running on port ${PORT}`)
})
