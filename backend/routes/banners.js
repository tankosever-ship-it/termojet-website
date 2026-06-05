const express = require('express')
const db = require('../db')
const { requireAdmin } = require('./auth')

const router = express.Router()

function parse(r) {
  return { ...r, active: r.active === 1 }
}

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM banners ORDER BY sort ASC, created_at ASC').all().map(parse))
})

router.post('/', requireAdmin, (req, res) => {
  const { title, subtitle, image, link, active, sort } = req.body
  const result = db.prepare(
    'INSERT INTO banners (title, subtitle, image, link, active, sort) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(title || '', subtitle || '', image || '', link || '', active ? 1 : 0, sort || 0)
  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/:id', requireAdmin, (req, res) => {
  const { title, subtitle, image, link, active, sort } = req.body
  db.prepare(
    'UPDATE banners SET title=?, subtitle=?, image=?, link=?, active=?, sort=? WHERE id=?'
  ).run(title || '', subtitle || '', image || '', link || '', active ? 1 : 0, sort || 0, req.params.id)
  res.json({ ok: true })
})

router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM banners WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
