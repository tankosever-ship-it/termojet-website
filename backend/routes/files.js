const express = require('express')
const db = require('../db')
const { requireAdmin } = require('./auth')

const router = express.Router()

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM files ORDER BY created_at DESC').all())
})

router.post('/', requireAdmin, (req, res) => {
  const { name, filename, category, size } = req.body
  const result = db.prepare(
    'INSERT INTO files (name, filename, category, size) VALUES (?, ?, ?, ?)'
  ).run(name, filename, category||'', size||'')
  res.status(201).json({ id: result.lastInsertRowid })
})

router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM files WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
