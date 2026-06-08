const express = require('express')
const db = require('../db')
const { requireAdmin } = require('./auth')

const router = express.Router()

router.get('/', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all()
  res.json(rows.map(r => ({ ...r, items: JSON.parse(r.items), utm: JSON.parse(r.utm || '{}') })))
})

router.post('/', (req, res) => {
  const { items, total, name, phone, email, address, comment, payment, utm } = req.body
  const result = db.prepare(`
    INSERT INTO orders (items, total, name, phone, email, address, comment, payment, utm)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(JSON.stringify(items), total, name, phone, email, address, comment, payment || '', JSON.stringify(utm || {}))

  // Email із замовлення зберігаємо також у підписників (дедуп за UNIQUE)
  const mail = (email || '').trim().toLowerCase()
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
    try { db.prepare('INSERT OR IGNORE INTO subscribers (email) VALUES (?)').run(mail) } catch {}
  }

  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/:id', requireAdmin, (req, res) => {
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(req.body.status, req.params.id)
  res.json({ ok: true })
})

module.exports = router
