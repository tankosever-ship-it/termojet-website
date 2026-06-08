const express = require('express')
const jwt = require('jsonwebtoken')
const db = require('../db')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'termojet-secret-2024'

router.post('/login', (req, res) => {
  const { password } = req.body
  const stored = db.prepare("SELECT value FROM settings WHERE key = 'adminPassword'").get()
  const correct = stored ? stored.value : 'termojet2024'

  if (password !== correct) {
    return res.status(401).json({ error: 'Невірний пароль' })
  }

  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' })
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
