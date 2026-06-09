const express = require('express')
const db = require('../db')
const { requireAdmin } = require('./auth')
const { notifyLead, esc } = require('../telegram')

const router = express.Router()

router.get('/', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM dealers ORDER BY created_at DESC').all()
  res.json(rows.map(r => ({ ...r, utm: JSON.parse(r.utm || '{}') })))
})

router.post('/', (req, res) => {
  const { company, name, phone, email, city, message, utm } = req.body
  const result = db.prepare(
    'INSERT INTO dealers (company, name, phone, email, city, message, utm) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(company, name, phone, email, city, message, JSON.stringify(utm || {}))

  notifyLead(
    `🔵 <b>Termojet — заявка дилера/партнера</b>\n` +
    (company ? `🏢 ${esc(company)}\n` : '') +
    `👤 ${esc(name)}\n` +
    `📞 ${esc(phone)}` +
    (email ? `\n✉️ ${esc(email)}` : '') +
    (city ? `\n🏙 ${esc(city)}` : '') +
    (message ? `\n💬 ${esc(message)}` : '')
  )

  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/:id', requireAdmin, (req, res) => {
  db.prepare('UPDATE dealers SET status = ? WHERE id = ?').run(req.body.status, req.params.id)
  res.json({ ok: true })
})

module.exports = router
