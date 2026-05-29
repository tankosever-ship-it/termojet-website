const express = require('express')
const db = require('../db')
const { requireAdmin } = require('./auth')

const router = express.Router()

router.get('/', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM dealers ORDER BY created_at DESC').all())
})

router.post('/', (req, res) => {
  const { company, name, phone, email, city, message } = req.body
  const result = db.prepare(
    'INSERT INTO dealers (company, name, phone, email, city, message) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(company, name, phone, email, city, message)
  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/:id', requireAdmin, (req, res) => {
  db.prepare('UPDATE dealers SET status = ? WHERE id = ?').run(req.body.status, req.params.id)
  res.json({ ok: true })
})

module.exports = router
