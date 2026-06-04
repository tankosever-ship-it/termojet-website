const express = require('express')
const db = require('../db')
const { requireAdmin } = require('./auth')

const router = express.Router()

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM faqs ORDER BY sort ASC, created_at ASC').all())
})

router.post('/', requireAdmin, (req, res) => {
  const { question, answer, sort } = req.body
  const result = db.prepare(
    'INSERT INTO faqs (question, answer, sort) VALUES (?, ?, ?)'
  ).run(question || '', answer || '', sort || 0)
  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/:id', requireAdmin, (req, res) => {
  const { question, answer, sort } = req.body
  db.prepare(
    'UPDATE faqs SET question=?, answer=?, sort=? WHERE id=?'
  ).run(question || '', answer || '', sort || 0, req.params.id)
  res.json({ ok: true })
})

router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM faqs WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
