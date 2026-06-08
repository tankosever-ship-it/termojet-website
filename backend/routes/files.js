const express = require('express')
const db = require('../db')
const { requireAdmin } = require('./auth')

const router = express.Router()

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM files ORDER BY created_at DESC').all()
  // У БД шлях зберігається в колонці filename; публічна сторінка очікує поле url
  res.json(rows.map(r => ({
    id: `f${r.id}`,
    name: r.name,
    url: r.filename,
    category: r.category,
    size: r.size,
  })))
})

router.post('/', requireAdmin, (req, res) => {
  // приймаємо url (шлях до завантаженого файлу) або filename
  const { name, url, filename, category, size } = req.body
  const path = url || filename || ''
  const result = db.prepare(
    'INSERT INTO files (name, filename, category, size) VALUES (?, ?, ?, ?)'
  ).run(name, path, category||'', size||'')
  res.status(201).json({ id: result.lastInsertRowid })
})

router.delete('/:id', requireAdmin, (req, res) => {
  // приймаємо як числовий id, так і префіксований ("f12")
  const id = String(req.params.id).replace(/^f/, '')
  db.prepare('DELETE FROM files WHERE id = ?').run(id)
  res.json({ ok: true })
})

module.exports = router
