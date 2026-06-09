const express = require('express')
const db = require('../db')
const { requireAdmin } = require('./auth')
const { notifyLead, esc } = require('../telegram')

const router = express.Router()

router.get('/', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM consultations ORDER BY created_at DESC').all()
  res.json(rows.map(r => ({ ...r, utm: JSON.parse(r.utm || '{}') })))
})

router.post('/', (req, res) => {
  const { name, phone, email, message, utm } = req.body
  const result = db.prepare(
    'INSERT INTO consultations (name, phone, email, message, utm) VALUES (?, ?, ?, ?, ?)'
  ).run(name, phone, email, message, JSON.stringify(utm || {}))

  notifyLead(
    `🔵 <b>Termojet — заявка на консультацію</b>\n` +
    `👤 ${esc(name)}\n` +
    `📞 ${esc(phone)}` +
    (email ? `\n✉️ ${esc(email)}` : '') +
    (message ? `\n💬 ${esc(message)}` : '')
  )

  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/:id', requireAdmin, (req, res) => {
  db.prepare('UPDATE consultations SET status = ? WHERE id = ?').run(req.body.status, req.params.id)
  res.json({ ok: true })
})

module.exports = router
