const express = require('express')
const db = require('../db')
const { requireAdmin } = require('./auth')

const router = express.Router()

router.get('/', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM subscribers ORDER BY created_at DESC').all())
})

router.post('/', (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Невірний email' })
  }
  try {
    const result = db.prepare('INSERT INTO subscribers (email) VALUES (?)').run(email)
    res.status(201).json({ id: result.lastInsertRowid })
  } catch (e) {
    // UNIQUE constraint → вже підписаний, вважаємо успіхом
    if (String(e.message).includes('UNIQUE')) return res.status(200).json({ ok: true, already: true })
    res.status(500).json({ error: 'Помилка сервера' })
  }
})

router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM subscribers WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
