// Nova Poshta proxy (Stage 1): місто + відділення для оформлення замовлення.
//
// Ключ беремо ТІЛЬКИ з ENV — ніколи не світимо у фронт:
//   NOVA_POSHTA_API_KEY — ключ з кабінету НП (Налаштування → Безпека → Ключі API)
// Якщо ключа немає — ендпоінти віддають 503, кошик просто не показує підказки.
//
// Rate-limit (60/хв) навішено на /api/np у server.js.

const express = require('express')
const router = express.Router()

const NP_URL = 'https://api.novaposhta.ua/v2.0/json/'
const API_KEY = process.env.NOVA_POSHTA_API_KEY || ''

// Простий кеш відділень по місту (списки великі й майже не змінюються).
const whCache = new Map() // cityRef -> { at, list }
const WH_TTL = 6 * 60 * 60 * 1000 // 6 годин

async function npCall(modelName, calledMethod, methodProperties) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 8000)
  try {
    const res = await fetch(NP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: API_KEY, modelName, calledMethod, methodProperties }),
      signal: ctrl.signal,
    })
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

// GET /api/np/cities?q=київ  →  [{ ref, label }]
router.get('/cities', async (req, res) => {
  if (!API_KEY) return res.status(503).json({ error: 'np_not_configured' })
  const q = String(req.query.q || '').trim()
  if (q.length < 2) return res.json([])
  try {
    const data = await npCall('Address', 'searchSettlements', { CityName: q, Limit: '20' })
    const addresses = (data && data.data && data.data[0] && data.data[0].Addresses) || []
    const cities = addresses
      .filter(a => a.DeliveryCity) // лише ті, куди НП доставляє
      .map(a => ({ ref: a.DeliveryCity, label: a.Present }))
    res.json(cities)
  } catch (e) {
    res.status(502).json({ error: 'np_request_failed' })
  }
})

// GET /api/np/warehouses?cityRef=...&q=  →  [{ ref, label, number }]
router.get('/warehouses', async (req, res) => {
  if (!API_KEY) return res.status(503).json({ error: 'np_not_configured' })
  const cityRef = String(req.query.cityRef || '').trim()
  if (!cityRef) return res.json([])
  const q = String(req.query.q || '').trim().toLowerCase()

  // Кеш — лише для повного списку міста (без пошукового рядка)
  const cached = whCache.get(cityRef)
  let list
  if (cached && Date.now() - cached.at < WH_TTL) {
    list = cached.list
  } else {
    try {
      const data = await npCall('Address', 'getWarehouses', { CityRef: cityRef, Limit: '500' })
      list = (data && data.data || []).map(w => ({ ref: w.Ref, label: w.Description, number: w.Number }))
      whCache.set(cityRef, { at: Date.now(), list })
    } catch (e) {
      return res.status(502).json({ error: 'np_request_failed' })
    }
  }
  const filtered = q ? list.filter(w => w.label.toLowerCase().includes(q)) : list
  res.json(filtered)
})

module.exports = router
