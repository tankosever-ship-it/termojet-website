// Google Shopping / Merchant Center фіди (RSS 2.0 + g:). Динамічно з БД.
// UK:  /google-merchant.xml      EN: /google-merchant-en.xml
// PL:  /google-merchant-pl.xml   DE: /google-merchant-de.xml   FR: /google-merchant-fr.xml
// RO:  /google-merchant-ro.xml
//
// Ціни в UAH (EUR→UAH за курсом НБУ +2.2%, як у src/utils/currency.js).
// google_product_category — числові ID Google-таксономії (однакові для всіх мов).

const db = require('../db')
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

// Назви категорій 5 мовами (product_type)
const CAT = {
  'nasosni-hrupy': { uk: 'Насосні групи', en: 'Pump Groups', pl: 'Grupy pompowe', fr: 'Groupes de pompes', de: 'Pumpengruppen', ro: 'Grupuri de pompare' },
  'hidravlichni-rozdilnyky': { uk: 'Роздільники гідравлічні', en: 'Hydraulic Separators', pl: 'Rozdzielacze hydrauliczne', fr: 'Séparateurs hydrauliques', de: 'Hydraulische Weichen', ro: 'Separatoare hidraulice' },
  'rozpodilchi-kolektory': { uk: 'Розподільчі колектори', en: 'Distribution Manifolds', pl: 'Kolektory rozdzielcze', fr: 'Collecteurs de distribution', de: 'Verteiler', ro: 'Colectoare de distribuție' },
  'kolektory-z-hidrostrilkoyu': { uk: 'Розподільчі колектори з гідрострілкою', en: 'Manifolds with Hydraulic Separator', pl: 'Kolektory z rozdzielaczem hydraulicznym', fr: 'Collecteurs avec séparateur hydraulique', de: 'Verteiler mit hydraulischer Weiche', ro: 'Colectoare cu separator hidraulic' },
  'termojet-box': { uk: 'Модульні системи TERMOJET BOX', en: 'TERMOJET BOX Modular Systems', pl: 'Systemy modułowe TERMOJET BOX', fr: 'Systèmes modulaires TERMOJET BOX', de: 'Modulare Systeme TERMOJET BOX', ro: 'Sisteme modulare TERMOJET BOX' },
  'termojet-mega': { uk: 'Серія Termojet Mega', en: 'Termojet Mega Series', pl: 'Seria Termojet Mega', fr: 'Série Termojet Mega', de: 'Serie Termojet Mega', ro: 'Seria Termojet Mega' },
  'nasosy': { uk: 'Насоси', en: 'Pumps', pl: 'Pompy', fr: 'Pompes', de: 'Pumpen', ro: 'Pompe' },
  'klapany': { uk: '3-х/4-х ходові та термостатичні клапани', en: '3/4-Way & Thermostatic Valves', pl: 'Zawory 3/4-drożne i termostatyczne', fr: 'Vannes 3/4 voies et thermostatiques', de: '3/4-Wege- und Thermostatventile', ro: 'Vane cu 3/4 căi și termostatice' },
  'balansuval-klapany': { uk: 'Статичний балансувальний клапан', en: 'Static Balancing Valve', pl: 'Statyczny zawór równoważący', fr: "Vanne d'équilibrage statique", de: 'Statisches Regulierventil', ro: 'Vană statică de echilibrare' },
  'separatory': { uk: 'Сепаратори', en: 'Separators', pl: 'Separatory', fr: 'Séparateurs', de: 'Separatoren', ro: 'Separatoare' },
  'zonalne-keruvannya': { uk: 'Термостати та зональне керування', en: 'Thermostats & Zone Control', pl: 'Termostaty i sterowanie strefowe', fr: 'Thermostats et contrôle de zone', de: 'Thermostate und Zonenregelung', ro: 'Termostate și control zonal' },
  'kolektory-pidloha': { uk: 'Система підлогового опалення', en: 'Underfloor Heating System', pl: 'System ogrzewania podłogowego', fr: 'Système de chauffage par le sol', de: 'Fußbodenheizungssystem', ro: 'Sistem de încălzire prin pardoseală' },
  'avtomatyka': { uk: 'Автоматика котельного обладнання', en: 'Boiler Equipment Automation', pl: 'Automatyka urządzeń kotłowych', fr: 'Automatisation des équipements de chaudière', de: 'Kesselautomatik', ro: 'Automatizare echipamente centrală termică' },
  'dodatkove': { uk: 'Додаткове обладнання', en: 'Additional Equipment', pl: 'Wyposażenie dodatkowe', fr: 'Équipement supplémentaire', de: 'Zusatzausrüstung', ro: 'Echipamente suplimentare' },
  'rozprodazh': { uk: 'Акція', en: 'Sale', pl: 'Promocja', fr: 'Promotion', de: 'Aktion', ro: 'Promoție' },
}

// Числові ID Google Product Taxonomy (taxonomy-with-ids.en-US.txt)
const GPC = {
  'nasosni-hrupy': 133,            // Hardware > Plumbing
  'hidravlichni-rozdilnyky': 133,
  'rozpodilchi-kolektory': 133,
  'kolektory-z-hidrostrilkoyu': 133,
  'termojet-box': 133,
  'termojet-mega': 133,
  'separatory': 133,
  'kolektory-pidloha': 133,
  'nasosy': 500096,                // Hardware > Hardware Pumps
  'klapany': 2466,                 // Hardware > Plumbing > ... > Plumbing Valves
  'balansuval-klapany': 2466,
  'zonalne-keruvannya': 1897,      // Hardware > HVAC > HVAC Controls > Thermostats
  'avtomatyka': 1519,              // Hardware > HVAC > HVAC Controls
  'dodatkove': 632,                // Hardware
  'rozprodazh': 632,
}
const GPC_DEFAULT = 133

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
  return img.startsWith('http') ? img : BASE + (img.startsWith('/') ? img : '/' + img)
}

// Фабрика обробника фіду для конкретної мови
function feed(lang) {
  return async (req, res) => {
    const rate = await eurRate()
    const rows = db.prepare('SELECT * FROM products WHERE is_visible = 1').all()
    const items = []

    for (const p of rows) {
      if (!p.slug || !p.category_slug) continue
      const img = absImg(p.image)
      if (!img) continue
      const amount = parseFloat(p.price)
      if (!amount || amount <= 0) continue
      let uah = null
      if ((p.currency || 'UAH') === 'UAH') uah = amount
      else if (p.currency === 'EUR' && rate) uah = Math.round(amount * rate)
      if (!uah || uah <= 0) continue

      // переклади з колонки i18n
      let tr = {}
      if (lang !== 'uk') { try { tr = (JSON.parse(p.i18n || '{}')[lang]) || {} } catch { tr = {} } }
      const name = (lang === 'uk' ? p.name : (tr.name || p.name)) || ''
      const descRaw = lang === 'uk'
        ? (p.short_desc || p.description)
        : (tr.short_desc || tr.description || p.short_desc || p.description)
      const desc = (plain(descRaw) || name).replace(/^(Опис|Description|Opis|Beschreibung)[\s:—-]+/i, '').slice(0, 4900)
      const ptype = (CAT[p.category_slug] && (CAT[p.category_slug][lang] || CAT[p.category_slug].uk)) || p.category_slug
      const gpc = GPC[p.category_slug] || GPC_DEFAULT

      items.push(
        '    <item>\n' +
        `      <g:id>${xmlEsc(p.sku || p.id)}</g:id>\n` +
        `      <g:title>${xmlEsc(name)}</g:title>\n` +
        `      <g:description>${xmlEsc(desc)}</g:description>\n` +
        `      <g:link>${xmlEsc(`${BASE}/catalog/${p.category_slug}/${p.slug}`)}</g:link>\n` +
        `      <g:image_link>${xmlEsc(img)}</g:image_link>\n` +
        `      <g:availability>${p.in_stock === 1 ? 'in_stock' : 'out_of_stock'}</g:availability>\n` +
        `      <g:price>${uah.toFixed(2)} UAH</g:price>\n` +
        '      <g:condition>new</g:condition>\n' +
        '      <g:brand>Termojet</g:brand>\n' +
        `      <g:mpn>${xmlEsc(p.sku || p.id)}</g:mpn>\n` +
        `      <g:google_product_category>${gpc}</g:google_product_category>\n` +
        `      <g:product_type>${xmlEsc(ptype)}</g:product_type>\n` +
        '    </item>'
      )
    }

    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n' +
      '  <channel>\n' +
      `    <title>Termojet — ${xmlEsc(lang.toUpperCase())}</title>\n` +
      `    <link>${BASE}</link>\n` +
      '    <description>Каталог обладнання Termojet для Google Shopping</description>\n' +
      items.join('\n') + '\n' +
      '  </channel>\n</rss>\n'

    res.set('Content-Type', 'application/xml; charset=utf-8')
    res.set('Cache-Control', 'public, max-age=3600')
    res.send(xml)
  }
}

module.exports = { feed }
