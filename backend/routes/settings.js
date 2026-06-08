const express = require('express')
const db = require('../db')
const { requireAdmin } = require('./auth')

const router = express.Router()

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all()
  const settings = {}
  rows.forEach(r => { settings[r.key] = r.value })
  // never expose adminPassword to public
  delete settings.adminPassword
  res.json(settings)
})

router.put('/', requireAdmin, (req, res) => {
  const allowed = ['phone', 'email', 'address', 'workHours', 'telegram', 'adminPassword', 'homeContent']
  const update = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
  const tx = db.transaction(() => {
    for (const key of allowed) {
      if (req.body[key] !== undefined) update.run(key, req.body[key])
    }
  })
  tx()
  res.json({ ok: true })
})

module.exports = router
