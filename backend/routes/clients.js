const express = require('express')
const db = require('../db')
const { requireAdmin } = require('./auth')

const router = express.Router()

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM clients ORDER BY sort ASC, created_at ASC').all())
})

router.post('/', requireAdmin, (req, res) => {
  const { name, logo, url, sort } = req.body
  const result = db.prepare(
    'INSERT INTO clients (name, logo, url, sort) VALUES (?, ?, ?, ?)'
  ).run(name || '', logo || '', url || '', sort || 0)
  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/:id', requireAdmin, (req, res) => {
  const { name, logo, url, sort } = req.body
  db.prepare(
    'UPDATE clients SET name=?, logo=?, url=?, sort=? WHERE id=?'
  ).run(name || '', logo || '', url || '', sort || 0, req.params.id)
  res.json({ ok: true })
})

router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
