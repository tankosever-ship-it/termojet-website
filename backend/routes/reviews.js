const express = require('express')
const multer = require('multer')
const path = require('path')
const db = require('../db')
const { requireAdmin } = require('./auth')

const router = express.Router()

// ── Сховище фото відгуків (ті самі uploads, що й решта файлів) ──
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `review-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /\.(jpg|jpeg|png|webp)$/i.test(file.originalname)),
})

// GET — опубліковані (або всі для адміна)
router.get('/', (req, res) => {
  const admin = req.query.admin === '1'
  const q = admin
    ? 'SELECT * FROM reviews ORDER BY created_at DESC'
    : 'SELECT * FROM reviews WHERE published = 1 ORDER BY created_at DESC'
  res.json(db.prepare(q).all())
})

// POST /submit — ПУБЛІЧНИЙ: клієнт залишає відгук з фото, йде на модерацію (published=0)
router.post('/submit', upload.single('photo'), (req, res) => {
  const name = (req.body.name || '').trim()
  const company = (req.body.company || '').trim()
  const text = (req.body.text || '').trim()
  let rating = parseInt(req.body.rating, 10)
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) rating = 5
  if (!name || name.length > 80) return res.status(400).json({ error: 'Вкажіть імʼя' })
  if (!text || text.length < 10 || text.length > 1500)
    return res.status(400).json({ error: 'Текст відгуку має бути від 10 до 1500 символів' })

  const photo = req.file ? `/uploads/${req.file.filename}` : ''
  db.prepare(
    'INSERT INTO reviews (name, company, rating, text, photo, published) VALUES (?, ?, ?, ?, ?, 0)'
  ).run(name, company.slice(0, 120), rating, text, photo)
  res.status(201).json({ ok: true, message: 'Дякуємо! Відгук зʼявиться після перевірки модератором.' })
})

// POST — адмін додає одразу опублікований
router.post('/', requireAdmin, (req, res) => {
  const { name, company, rating, text, photo, published } = req.body
  const result = db.prepare(
    'INSERT INTO reviews (name, company, rating, text, photo, published) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, company || '', rating || 5, text, photo || '', published !== false ? 1 : 0)
  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/:id', requireAdmin, (req, res) => {
  const { name, company, rating, text, photo, published } = req.body
  db.prepare('UPDATE reviews SET name=?, company=?, rating=?, text=?, photo=?, published=? WHERE id=?')
    .run(name, company || '', rating || 5, text, photo || '', published ? 1 : 0, req.params.id)
  res.json({ ok: true })
})

router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
