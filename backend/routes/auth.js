const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const db = require('../db')

const router = express.Router()

// FIX 1 — fail fast if JWT_SECRET is missing or too short
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET not set or too short (must be ≥ 32 chars)')
}

router.post('/login', (req, res) => {
  const { password } = req.body
  const stored = db.prepare("SELECT value FROM settings WHERE key = 'adminPassword'").get()
  const storedValue = stored ? stored.value : 'termojet2024'

  // FIX 2 — bcrypt with one-time plaintext migration
  let valid = false
  if (storedValue.startsWith('$2')) {
    // already hashed
    valid = bcrypt.compareSync(password || '', storedValue)
  } else {
    // legacy plaintext — constant-time compare not critical here since we migrate immediately
    valid = password === storedValue
    if (valid) {
      // migrate to bcrypt on first successful plaintext login
      const hashed = bcrypt.hashSync(password, 12)
      db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('adminPassword', ?)").run(hashed)
    }
  }

  if (!valid) {
    return res.status(401).json({ error: 'Невірний пароль' })
  }

  // FIX 1 — shortened TTL from 7d to 24h
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' })
  res.json({ token })
})

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  try {
    jwt.verify(auth.slice(7), JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// М'яка перевірка адміна (не блокує запит) — для ендпоінтів, де адмін бачить більше
function checkAdmin(req) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return false
  try { jwt.verify(auth.slice(7), JWT_SECRET); return true } catch { return false }
}

module.exports = { router, requireAdmin, checkAdmin }
