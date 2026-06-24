// Google Shopping / Merchant Center фід (RSS 2.0 + g:). Динамічно з БД — завжди
// актуальні ціни/наявність. URL: https://termojet.com.ua/google-merchant.xml
//
// Ціни в UAH (вимога Merchant для України): EUR-товари конвертуються за курсом НБУ
// (+2.2% маркап, як у фронтенді src/utils/currency.js), UAH — як є.

const express = require('express')
const db = require('../db')

const router = express.Router()
const BASE = 'https://termojet.com.ua'

// ── EUR→UAH курс (НБУ), кеш 1 год ────────────────────────────────────────────
const NBU_API = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=EUR&json'
const MARKUP = 1.022
let _rate = { val: null, ts: 0 }
async function eurRate() {
  const now = Date.now()
  if (_rate.val && now - _rate.ts < 3600 * 1000) return _rate.val
  try {
    const res = await fetch(NBU_API)
    const data = await res.json()
    const r = data[0] && data[0].rate
    if (r) { _rate = { val: r * MARKUP, ts: now }; return _rate.val }
  } catch { /* fallback нижче */ }
  return _rate.val || 51 * MARKUP
}

const CAT_NAME = {
  'nasosni-hrupy': 'Насосні групи',
  'hidravlichni-rozdilnyky': 'Роздільники гідравлічні',
  'rozpodilchi-kolektory': 'Розподільчі колектори',
  'kolektory-z-hidrostrilkoyu': 'Розподільчі колектори з гідрострілкою',
  'termojet-box': 'Модульні системи TERMOJET BOX',
  'termojet-mega': 'Серія Termojet Mega',
  'nasosy': 'Насоси',
  'klapany': 'Клапани',
  'balansuval-klapany': 'Балансувальні клапани',
  'separatory': 'Сепаратори',
  'zonalne-keruvannya': 'Термостати та зональне керування',
  'kolektory-pidloha': 'Система підлогового опалення',
  'avtomatyka': 'Автоматика котельного обладнання',
  'dodatkove': 'Додаткове обладнання',
  'rozprodazh': 'Акція',
}

function xmlEsc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}
function plain(s) {
  return String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
function absImg(img) {
  if (!img) return ''
  if (img.startsWith('http')) return img
  return BASE + (img.startsWith('/') ? img : '/' + img)
}

router.get('/', async (req, res) => {
  const rate = await eurRate()
  const rows = db.prepare('SELECT * FROM products WHERE is_visible = 1').all()
  const items = []

  for (const p of rows) {
    if (!p.slug || !p.category_slug) continue
    const img = absImg(p.image)
    if (!img) continue
    // ціна в UAH
    const amount = parseFloat(p.price)
    if (!amount || amount <= 0) continue
    let uah = null
    if ((p.currency || 'UAH') === 'UAH') uah = amount
    else if (p.currency === 'EUR' && rate) uah = Math.round(amount * rate)
    if (!uah || uah <= 0) continue

    const link = `${BASE}/catalog/${p.category_slug}/${p.slug}`
    const desc = (plain(p.short_desc) || plain(p.description) || p.name || '').slice(0, 4900)
    const avail = p.in_stock === 1 ? 'in_stock' : 'out_of_stock'
    const ptype = CAT_NAME[p.category_slug] || p.category_slug

    items.push(
      '    <item>\n' +
      `      <g:id>${xmlEsc(p.sku || p.id)}</g:id>\n` +
      `      <g:title>${xmlEsc(p.name)}</g:title>\n` +
      `      <g:description>${xmlEsc(desc)}</g:description>\n` +
      `      <g:link>${xmlEsc(link)}</g:link>\n` +
      `      <g:image_link>${xmlEsc(img)}</g:image_link>\n` +
      `      <g:availability>${avail}</g:availability>\n` +
      `      <g:price>${uah.toFixed(2)} UAH</g:price>\n` +
      '      <g:condition>new</g:condition>\n' +
      '      <g:brand>Termojet</g:brand>\n' +
      `      <g:mpn>${xmlEsc(p.sku || p.id)}</g:mpn>\n` +
      `      <g:product_type>${xmlEsc(ptype)}</g:product_type>\n` +
      '    </item>'
    )
  }

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n' +
    '  <channel>\n' +
    '    <title>Termojet — обладнання для котелень</title>\n' +
    `    <link>${BASE}</link>\n` +
    '    <description>Каталог обладнання Termojet для Google Shopping</description>\n' +
    items.join('\n') + '\n' +
    '  </channel>\n</rss>\n'

  res.set('Content-Type', 'application/xml; charset=utf-8')
  res.set('Cache-Control', 'public, max-age=3600')
  res.send(xml)
})

module.exports = router
