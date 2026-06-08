const express = require('express')
const db = require('../db')
const { requireAdmin } = require('./auth')

const router = express.Router()

// Парсимо UTM-JSON безпечно
function parseUtm(raw) {
  try { return JSON.parse(raw || '{}') || {} } catch { return {} }
}

// Останні N днів у форматі YYYY-MM-DD (від найдавнішого до сьогодні)
function lastNDays(n) {
  const days = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

// Топ значень поля → [{ name, count }] відсортовано за спаданням
function topCounts(map, limit = 10) {
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

router.get('/', requireAdmin, (req, res) => {
  const orders        = db.prepare('SELECT created_at, total, status, utm FROM orders').all()
  const consultations = db.prepare('SELECT created_at, utm FROM consultations').all()
  const dealers       = db.prepare('SELECT created_at, utm FROM dealers').all()
  const subsRow       = db.prepare('SELECT COUNT(*) AS c FROM subscribers').get()

  // ── Підсумки ──
  const revenue = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0)
  const totals = {
    orders: orders.length,
    consultations: consultations.length,
    dealers: dealers.length,
    subscribers: subsRow ? subsRow.c : 0,
    leads: orders.length + consultations.length + dealers.length,
    revenue,
  }

  // ── Ліди по днях (останні 30 днів) ──
  const days = lastNDays(30)
  const dayIndex = {}
  days.forEach(d => { dayIndex[d] = { date: d, orders: 0, consultations: 0, dealers: 0, total: 0 } })
  const bump = (rows, key) => {
    for (const r of rows) {
      const d = (r.created_at || '').slice(0, 10)
      if (dayIndex[d]) { dayIndex[d][key]++; dayIndex[d].total++ }
    }
  }
  bump(orders, 'orders')
  bump(consultations, 'consultations')
  bump(dealers, 'dealers')
  const leadsByDay = days.map(d => dayIndex[d])

  // ── UTM-розбивка по всіх лідах ──
  const src = {}, med = {}, camp = {}
  const allUtm = [...orders, ...consultations, ...dealers].map(r => parseUtm(r.utm))
  for (const u of allUtm) {
    const s = (u.source || u.utm_source || '').trim() || '(прямий)'
    const m = (u.medium || u.utm_medium || '').trim() || '(немає)'
    const c = (u.campaign || u.utm_campaign || '').trim()
    src[s]  = (src[s]  || 0) + 1
    med[m]  = (med[m]  || 0) + 1
    if (c) camp[c] = (camp[c] || 0) + 1
  }

  // ── Замовлення за статусом ──
  const statusMap = {}
  for (const o of orders) {
    const st = o.status || 'new'
    statusMap[st] = (statusMap[st] || 0) + 1
  }
  const ordersByStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }))

  res.json({
    totals,
    leadsByDay,
    utm: {
      source: topCounts(src),
      medium: topCounts(med),
      campaign: topCounts(camp),
    },
    ordersByStatus,
  })
})

module.exports = router
