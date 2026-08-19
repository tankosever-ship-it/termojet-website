const express = require('express')
const db = require('../db')
const { requireAdmin } = require('./auth')
const { notifyLead, esc, utmLine } = require('../telegram')
const { notifyCRM, utmString } = require('../crm')
const { notifyCustomerOrder } = require('../email')
const { getEurRate, toUAH } = require('../currency')

const router = express.Router()

router.get('/', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all()
  res.json(rows.map(r => ({ ...r, items: JSON.parse(r.items), utm: JSON.parse(r.utm || '{}') })))
})

router.post('/', async (req, res) => {
  const { items, name, phone, email, address, comment, payment, utm,
    np_city, np_city_ref, np_warehouse, np_warehouse_ref } = req.body
  const npLine = [np_city, np_warehouse].filter(Boolean).join(', ')

  // Кошик фронта кладе кількість у поле `quantity`; підтримуємо й `qty` про запас
  const itemQty = (i) => Number(i && (i.qty ?? i.quantity)) || 1

  // FIX 3 — recompute total server-side; never trust client-supplied price/total.
  // Ціни EUR-товарів конвертуємо в гривню за курсом НБУ (як на фронті), інакше
  // сума в «грн» була б числом у євро.
  const eurRate = await getEurRate()
  const getProduct = db.prepare('SELECT name, price, currency FROM products WHERE id = ?')
  let serverTotal = 0
  const orderLines = [] // {name, qty, lineTotal} для листа/сповіщень
  if (Array.isArray(items)) {
    for (const item of items) {
      if (!item || !item.id) continue
      const row = getProduct.get(item.id)
      if (!row) continue
      const qty = itemQty(item)
      const priceUah = toUAH(row.price, row.currency, eurRate)
      const lineTotal = priceUah * qty
      serverTotal += lineTotal
      orderLines.push({ name: item.name || item.title || row.name || 'товар', qty, lineTotal })
    }
  }

  const result = db.prepare(`
    INSERT INTO orders (items, total, name, phone, email, address, comment, payment, utm, np_city, np_city_ref, np_warehouse, np_warehouse_ref)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(JSON.stringify(items), serverTotal, name, phone, email, address, comment, payment || '', JSON.stringify(utm || {}),
    np_city || '', np_city_ref || '', np_warehouse || '', np_warehouse_ref || '')

  // Email із замовлення зберігаємо також у підписників (дедуп за UNIQUE)
  const mail = (email || '').trim().toLowerCase()
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
    try { db.prepare('INSERT OR IGNORE INTO subscribers (email) VALUES (?)').run(mail) } catch {}
  }

  const itemLines = Array.isArray(items)
    ? items.map(i => `• ${esc(i.name || i.title || 'товар')} × ${itemQty(i)}`).join('\n')
    : ''
  notifyLead(
    `🔵 <b>Termojet — нове замовлення</b>\n` +
    `👤 ${esc(name)}\n` +
    `📞 ${esc(phone)}` +
    (email ? `\n✉️ ${esc(email)}` : '') +
    (npLine ? `\n🏤 Нова Пошта: ${esc(npLine)}` : '') +
    (address ? `\n🏠 ${esc(address)}` : '') +
    (payment ? `\n💳 ${esc(payment)}` : '') +
    (comment ? `\n💬 ${esc(comment)}` : '') +
    (itemLines ? `\n\n${itemLines}` : '') +
    `\n\n💰 Сума: <b>${esc(String(serverTotal))}</b> грн` +
    utmLine(utm)
  )

  // Пересилаємо лід у CRM (звідки прийшов: сайт · форма · UTM-канал)
  const utmStr = utmString(utm)
  const plainItems = Array.isArray(items)
    ? items.map(i => `• ${i.name || i.title || 'товар'} × ${itemQty(i)}`).join('\n')
    : ''
  notifyCRM({
    type: 'order',
    name,
    phone,
    email,
    source: `termojet.com.ua · Магазин${utm && utm.utm_source ? ` · ${utm.utm_source}` : ''}`,
    message: [
      plainItems,
      npLine ? `Нова Пошта: ${npLine}` : '',
      address ? `Адреса: ${address}` : '',
      payment ? `Оплата: ${payment}` : '',
      comment ? `Коментар: ${comment}` : '',
      `Сума: ${serverTotal} грн`,
      utmStr ? `UTM: ${utmStr}` : '',
    ].filter(Boolean).join('\n'),
  })

  // Лист-підтвердження клієнту (Resend). Fire-and-forget: якщо email не вказано
  // або ключ не налаштований — просто не відправиться, замовлення це не блокує.
  notifyCustomerOrder({
    id: result.lastInsertRowid,
    name,
    email,
    lines: orderLines,
    total: serverTotal,
    delivery: npLine || address || '',
    payment: payment || '',
  })

  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/:id', requireAdmin, (req, res) => {
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(req.body.status, req.params.id)
  res.json({ ok: true })
})

module.exports = router
