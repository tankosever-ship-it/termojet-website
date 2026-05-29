const express = require('express')
const db = require('../db')
const { requireAdmin } = require('./auth')

const router = express.Router()

router.get('/', (req, res) => {
  const admin = req.query.admin === '1'
  const q = admin
    ? 'SELECT * FROM reviews ORDER BY created_at DESC'
    : 'SELECT * FROM reviews WHERE published = 1 ORDER BY created_at DESC'
  res.json(db.prepare(q).all())
})

router.post('/', requireAdmin, (req, res) => {
  const { name, company, rating, text, published } = req.body
  const result = db.prepare(
    'INSERT INTO reviews (name, company, rating, text, published) VALUES (?, ?, ?, ?, ?)'
  ).run(name, company||'', rating||5, text, published !== false ? 1 : 0)
  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/:id', requireAdmin, (req, res) => {
  const { name, company, rating, text, published } = req.body
  db.prepare('UPDATE reviews SET name=?, company=?, rating=?, text=?, published=? WHERE id=?')
    .run(name, company||'', rating||5, text, published ? 1 : 0, req.params.id)
  res.json({ ok: true })
})

router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
