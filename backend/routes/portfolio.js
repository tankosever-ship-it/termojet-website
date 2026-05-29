const express = require('express')
const db = require('../db')
const { requireAdmin } = require('./auth')

const router = express.Router()

function parse(r) {
  return { ...r, images: JSON.parse(r.images || '[]') }
}

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM portfolio ORDER BY year DESC, id DESC').all().map(parse))
})

router.post('/', requireAdmin, (req, res) => {
  const { title, location, year, power, description, images } = req.body
  const result = db.prepare(
    'INSERT INTO portfolio (title, location, year, power, description, images) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(title, location||'', year||null, power||'', description||'', JSON.stringify(images||[]))
  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/:id', requireAdmin, (req, res) => {
  const { title, location, year, power, description, images } = req.body
  db.prepare(`
    UPDATE portfolio SET title=?, location=?, year=?, power=?, description=?, images=? WHERE id=?
  `).run(title, location||'', year||null, power||'', description||'', JSON.stringify(images||[]), req.params.id)
  res.json({ ok: true })
})

router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM portfolio WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
