const express = require('express')
const db = require('../db')
const { requireAdmin } = require('./auth')

const router = express.Router()

router.get('/', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all()
  res.json(rows.map(r => ({ ...r, items: JSON.parse(r.items), utm: JSON.parse(r.utm || '{}') })))
})

router.post('/', (req, res) => {
  const { items, total, name, phone, email, address, comment, utm } = req.body
  const result = db.prepare(`
    INSERT INTO orders (items, total, name, phone, email, address, comment, utm)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(JSON.stringify(items), total, name, phone, email, address, comment, JSON.stringify(utm || {}))
  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/:id', requireAdmin, (req, res) => {
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(req.body.status, req.params.id)
  res.json({ ok: true })
})

module.exports = router
