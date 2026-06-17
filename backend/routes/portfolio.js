const express = require('express')
const db = require('../db')
const { requireAdmin } = require('./auth')
const { withI18n } = require('./_i18n')

const router = express.Router()

function parse(r) {
  const obj = { ...r, images: JSON.parse(r.images || '[]') }
  return withI18n(obj, r.i18n, { title: 'title', description: 'description', location: 'location', power: 'power' })
}

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM portfolio ORDER BY year DESC, id DESC').all().map(parse))
})

router.post('/', requireAdmin, (req, res) => {
  const { title, location, year, power, description, images, i18n } = req.body
  const result = db.prepare(
    'INSERT INTO portfolio (title, location, year, power, description, images, i18n) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(title, location||'', year||null, power||'', description||'', JSON.stringify(images||[]), i18n ? JSON.stringify(i18n) : '{}')
  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/:id', requireAdmin, (req, res) => {
  const { title, location, year, power, description, images, i18n } = req.body
  db.prepare(`
    UPDATE portfolio SET title=?, location=?, year=?, power=?, description=?, images=?, i18n=COALESCE(?, i18n) WHERE id=?
  `).run(title, location||'', year||null, power||'', description||'', JSON.stringify(images||[]), i18n !== undefined ? JSON.stringify(i18n) : null, req.params.id)
  res.json({ ok: true })
})

router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM portfolio WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
