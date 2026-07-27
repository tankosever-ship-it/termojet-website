const express = require('express')
const multer = require('multer')
const path = require('path')
const db = require('../db')
const { requireAdmin, checkAdmin } = require('./auth')

const router = express.Router()

// ── Сховище фото відгуків (ті самі uploads, що й решта файлів) ──
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `preview-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /\.(jpg|jpeg|png|webp)$/i.test(file.originalname)),
})

// GET — відгуки на товар.
//   ?product=<id>  → лише опубліковані для конкретного товару (публічно)
//   ?admin=1       → всі (для модерації); можна теж звузити ?product=
router.get('/', (req, res) => {
  // Немодеровані (published=0) видно ЛИШЕ адміну з валідним токеном.
  const admin = req.query.admin === '1' && checkAdmin(req)
  const productId = req.query.product
  const where = []
  const params = []
  if (!admin) { where.push('published = 1') }
  if (productId) { where.push('product_id = ?'); params.push(productId) }
  const sql = 'SELECT * FROM product_reviews'
    + (where.length ? ' WHERE ' + where.join(' AND ') : '')
    + ' ORDER BY created_at DESC'
  res.json(db.prepare(sql).all(...params))
})

// POST /submit — ПУБЛІЧНИЙ: клієнт лишає відгук на товар, іде на модерацію (published=0)
router.post('/submit', upload.single('photo'), (req, res) => {
  const b = req.body || {}
  const productId = (b.product_id || '').trim()
  const name = (b.name || '').trim()
  const text = (b.text || '').trim()
  let rating = parseInt(b.rating, 10)
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) rating = 5
  if (!productId) return res.status(400).json({ error: 'Товар не вказано' })
  if (!name || name.length > 80) return res.status(400).json({ error: 'Вкажіть імʼя' })
  if (!text || text.length < 10 || text.length > 1500)
    return res.status(400).json({ error: 'Текст відгуку має бути від 10 до 1500 символів' })

  const photo = req.file ? `/uploads/${req.file.filename}` : ''
  db.prepare(
    `INSERT INTO product_reviews
       (product_id, product_name, product_slug, category_slug, name, rating, text, photo, published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`
  ).run(
    productId,
    (b.product_name || '').slice(0, 300),
    (b.product_slug || '').slice(0, 300),
    (b.category_slug || '').slice(0, 120),
    name, rating, text, photo,
  )
  res.status(201).json({ ok: true, message: 'Дякуємо! Відгук зʼявиться після перевірки модератором.' })
})

// PUT /:id — адмін: модерація (публікація/приховання/редагування)
router.put('/:id', requireAdmin, (req, res) => {
  const b = req.body || {}
  db.prepare(
    `UPDATE product_reviews
       SET name=?, rating=?, text=?, photo=?, published=?
     WHERE id=?`
  ).run(
    b.name || '', b.rating || 5, b.text || '', b.photo || '',
    b.published ? 1 : 0, req.params.id,
  )
  res.json({ ok: true })
})

// DELETE /:id — адмін
router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM product_reviews WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
