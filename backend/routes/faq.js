const express = require('express')
const db = require('../db')
const { requireAdmin } = require('./auth')
const { withI18n } = require('./_i18n')

const router = express.Router()

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM faqs ORDER BY sort ASC, created_at ASC').all().map(r => {
    const { i18n, ...rest } = r
    return withI18n({ ...rest }, i18n, { question: 'question', answer: 'answer' })
  })
  res.json(rows)
})

router.post('/', requireAdmin, (req, res) => {
  const { question, answer, sort, i18n } = req.body
  const result = db.prepare(
    'INSERT INTO faqs (question, answer, sort, i18n) VALUES (?, ?, ?, ?)'
  ).run(question || '', answer || '', sort || 0, i18n ? JSON.stringify(i18n) : '{}')
  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/:id', requireAdmin, (req, res) => {
  const { question, answer, sort, i18n } = req.body
  db.prepare(
    'UPDATE faqs SET question=?, answer=?, sort=?, i18n=COALESCE(?, i18n) WHERE id=?'
  ).run(question || '', answer || '', sort || 0, i18n !== undefined ? JSON.stringify(i18n) : null, req.params.id)
  res.json({ ok: true })
})

router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM faqs WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
