const express = require('express')
const db = require('../db')
const { requireAdmin } = require('./auth')

const router = express.Router()

function parse(r) {
  return { ...r, active: r.active === 1 }
}

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM promos ORDER BY sort ASC, created_at ASC').all().map(parse))
})

router.post('/', requireAdmin, (req, res) => {
  const { title, description, discount, image, active, sort } = req.body
  const result = db.prepare(
    'INSERT INTO promos (title, description, discount, image, active, sort) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(title || '', description || '', discount || '', image || '', active ? 1 : 0, sort || 0)
  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/:id', requireAdmin, (req, res) => {
  const { title, description, discount, image, active, sort } = req.body
  db.prepare(
    'UPDATE promos SET title=?, description=?, discount=?, image=?, active=?, sort=? WHERE id=?'
  ).run(title || '', description || '', discount || '', image || '', active ? 1 : 0, sort || 0, req.params.id)
  res.json({ ok: true })
})

router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM promos WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
