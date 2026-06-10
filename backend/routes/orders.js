const express = require('express')
const db = require('../db')
const { requireAdmin } = require('./auth')
const { notifyLead, esc } = require('../telegram')
const { notifyCRM, utmString } = require('../crm')

const router = express.Router()

router.get('/', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all()
  res.json(rows.map(r => ({ ...r, items: JSON.parse(r.items), utm: JSON.parse(r.utm || '{}') })))
})

router.post('/', (req, res) => {
  const { items, name, phone, email, address, comment, payment, utm } = req.body

  // FIX 3 — recompute total server-side; never trust client-supplied price/total
  const getProduct = db.prepare('SELECT price FROM products WHERE id = ?')
  let serverTotal = 0
  if (Array.isArray(items)) {
    for (const item of items) {
      if (!item || !item.id) continue
      const row = getProduct.get(item.id)
      if (!row) continue
      const qty = Number(item.qty) || 1
      serverTotal += (Number(row.price) || 0) * qty
    }
  }

  const result = db.prepare(`
    INSERT INTO orders (items, total, name, phone, email, address, comment, payment, utm)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(JSON.stringify(items), serverTotal, name, phone, email, address, comment, payment || '', JSON.stringify(utm || {}))

  // Email із замовлення зберігаємо також у підписників (дедуп за UNIQUE)
  const mail = (email || '').trim().toLowerCase()
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
    try { db.prepare('INSERT OR IGNORE INTO subscribers (email) VALUES (?)').run(mail) } catch {}
  }

  const itemLines = Array.isArray(items)
    ? items.map(i => `• ${esc(i.name || i.title || 'товар')}${i.qty ? ` × ${i.qty}` : ''}`).join('\n')
    : ''
  notifyLead(
    `🔵 <b>Termojet — нове замовлення</b>\n` +
    `👤 ${esc(name)}\n` +
    `📞 ${esc(phone)}` +
    (email ? `\n✉️ ${esc(email)}` : '') +
    (address ? `\n🏠 ${esc(address)}` : '') +
    (payment ? `\n💳 ${esc(payment)}` : '') +
    (comment ? `\n💬 ${esc(comment)}` : '') +
    (itemLines ? `\n\n${itemLines}` : '') +
    `\n\n💰 Сума: <b>${esc(String(serverTotal))}</b> грн`
  )

  // Пересилаємо лід у CRM (звідки прийшов: сайт · форма · UTM-канал)
  const utmStr = utmString(utm)
  const plainItems = Array.isArray(items)
    ? items.map(i => `• ${i.name || i.title || 'товар'}${i.qty ? ` × ${i.qty}` : ''}`).join('\n')
    : ''
  notifyCRM({
    type: 'order',
    name,
    phone,
    email,
    source: `termojet.com.ua · Магазин${utm && utm.utm_source ? ` · ${utm.utm_source}` : ''}`,
    message: [
      plainItems,
      address ? `Адреса: ${address}` : '',
      payment ? `Оплата: ${payment}` : '',
      comment ? `Коментар: ${comment}` : '',
      `Сума: ${serverTotal} грн`,
      utmStr ? `UTM: ${utmStr}` : '',
    ].filter(Boolean).join('\n'),
  })

  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/:id', requireAdmin, (req, res) => {
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(req.body.status, req.params.id)
  res.json({ ok: true })
})

module.exports = router
