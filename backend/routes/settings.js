const express = require('express')
const bcrypt = require('bcryptjs')
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
  // FIX 2 — adminPassword is handled separately: hash it, and only if non-empty
  const allowed = ['phone', 'email', 'address', 'workHours', 'telegram', 'homeContent', 'aboutContent']
  const update = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
  const tx = db.transaction(() => {
    for (const key of allowed) {
      if (req.body[key] !== undefined) update.run(key, req.body[key])
    }
    // hash new password only when explicitly provided and non-empty
    if (req.body.adminPassword && typeof req.body.adminPassword === 'string' && req.body.adminPassword.length > 0) {
      update.run('adminPassword', bcrypt.hashSync(req.body.adminPassword, 12))
    }
  })
  tx()
  res.json({ ok: true })
})

module.exports = router
