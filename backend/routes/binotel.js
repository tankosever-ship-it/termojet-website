// Вебхук Binotel (API PUSH) → лід у CRM + сповіщення в Telegram.
//
// Джерело — вхідний ДЗВІНОК на віртуальну АТС Binotel зі сквозною аналітикою
// (CallTracking). Дзеркалить потік лідів із форм сайту (crm.js / telegram.js).
//
// Binotel шле НА ОДИН URL кілька подій одного дзвінка (поле requestType/method):
//   receivedTheCall   — пішов вхідний (ще не підняли) → ІГНОРУЄМО (немає callTrackingData,
//                       не можна визначити сайт → раніше пінг ішов у чужий топік)
//   answeredTheCall   — слухавку підняли (ігноруємо)
//   hangupTheCall     — мінімальний leg-hangup без companyID/даних (ігноруємо)
//   apiCallCompleted  — ФІНАЛ з callDetails + callTrackingData (UTM/GA/гео/час на сайті/
//                       запис/клієнт) → ТУТ створюємо лід + багату картку в Telegram
// Лід генеруємо ЛИШЕ на apiCallCompleted → один лід і один річ-меседж на дзвінок.
//
// Безпека (Binotel запити НЕ підписує):
//   1) IP-allowlist серверів Binotel (req.ip коректний завдяки trust proxy у server.js).
//   2) Звірка companyID (де він є в payload).
// ENV (сервер, .env поряд з docker-compose): BINOTEL_COMPANY_ID, BINOTEL_ALLOWED_IPS,
//   BINOTEL_API_KEY, BINOTEL_API_SECRET (останні два — на майбутнє: REST Binotel).
//   Колтрекінг стоїть на termojet.com.ua → дзвінок = лід termojet, тож картка йде
//   в той самий топік 🔵 Termojet, що й форми (TELEGRAM_THREAD_ID у telegram.js).

const express = require('express')
const { notifyLead, esc } = require('../telegram')
const { notifyCRM } = require('../crm')

const router = express.Router()

const COMPANY_ID = String(process.env.BINOTEL_COMPANY_ID || '').trim()
const ALLOWED_IPS = (process.env.BINOTEL_ALLOWED_IPS || '')
  .split(',').map(s => s.trim()).filter(Boolean)

// ОДИН Binotel-вебхук обслуговує ОБИДВА сайти (termojet + tjheatpump) — джерело
// дзвінка визначаємо з callTrackingData.fullUrl. Кожен сайт → свій forum-топік і
// свій підпис у заголовку, щоб одразу було видно, звідки дзвінок:
//   • tjheatpump.com.ua → 🟠 TJ Heat Pumps (TELEGRAM_TJ_THREAD_ID, дефолт 168)
//   • termojet.com.ua   → 🔵 Termojet (дефолтний notifyLead / TELEGRAM_THREAD_ID)
// (Раніше все слалось із захардкодженим «Termojet» через TELEGRAM_CALLS_THREAD_ID —
//  tjheatpump-дзвінки мали чужий підпис, а хибна env кидала картки в General.)
const TJ_THREAD_ID = process.env.TELEGRAM_TJ_THREAD_ID || '168'

// fullUrl → { label для заголовка, threadId для топіка }. Невідомий домен → termojet
// (дефолтний топік). Ping-подія може не містити fullUrl → тоді теж дефолт termojet.
function siteFrom(url) {
  const u = String(url || '').toLowerCase()
  if (u.includes('tjheatpump')) return { label: 'Tjheatpump', threadId: TJ_THREAD_ID }
  return { label: 'Termojet', threadId: undefined }
}

function clientIp(req) {
  return String(req.ip || '').replace(/^::ffff:/, '')
}

// Binotel шле номери в локальному форматі: 0504428335 → +380504428335
function fmtPhone(raw) {
  const d = String(raw || '').replace(/\D/g, '')
  if (!d) return String(raw || '')
  if (d.length === 10 && d[0] === '0') return '+38' + d
  if (d.startsWith('380')) return '+' + d
  return '+' + d
}

// unix-секунди → «02.06.2026 17:10» за київським часом
function fmtTs(unix) {
  const n = Number(unix)
  if (!n) return ''
  try {
    return new Date(n * 1000).toLocaleString('uk-UA', {
      timeZone: 'Europe/Kyiv',
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch { return '' }
}

// секунди → «1 хв 17 с» / «5 с»
function fmtDur(sec) {
  const s = Number(sec) || 0
  const m = Math.floor(s / 60), r = s % 60
  return m ? `${m} хв ${r} с` : `${r} с`
}

// UTM-мітки, що мають сенс (не «(direct)/(none)/(not set)»)
function meaningfulUtm(ct) {
  return ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
    .filter(k => ct[k] && !['(direct)', '(none)', '(not set)', ''].includes(ct[k]))
    .map(k => [k.replace('utm_', ''), ct[k]])
}

router.post('/', (req, res) => {
  const ip = clientIp(req)

  // 1) IP-allowlist серверів Binotel
  if (ALLOWED_IPS.length && !ALLOWED_IPS.includes(ip)) {
    console.warn(`[binotel] відхилено: IP ${ip} не в allowlist`)
    return res.status(403).json({ status: 'error', message: 'forbidden' })
  }

  const body = req.body || {}
  const requestType = String(body.requestType || body.method || '')
  const d = body.callDetails || body // apiCallCompleted обгортає у callDetails; інші події пласкі

  console.log(`[binotel] ${requestType || '?'} from ${ip} ext=${d.externalNumber ?? ''} disp=${d.disposition ?? ''} bill=${d.billsec ?? ''}`)

  // 2) Звірка компанії — лише коли companyID присутній (flat hangupTheCall його не має)
  const cid = d.companyID ?? body.companyID
  if (COMPANY_ID && cid != null && String(cid) !== COMPANY_ID) {
    console.warn(`[binotel] відхилено: companyID ${cid} ≠ ${COMPANY_ID}`)
    return res.status(403).json({ status: 'error', message: 'wrong company' })
  }

  // Реагуємо лише на вхідні (callType 0). callType 1 = вихідний.
  const callType = String(d.callType ?? body.callType ?? '0')

  // Миттєвий пінг «дзвонить зараз» ВИМКНЕНО: подія receivedTheCall не містить
  // callTrackingData (fullUrl) → неможливо визначити сайт-джерело, тож пінг ішов
  // у чужий топік із хибним підписом «Termojet». Лишаємо лише фінальну картку
  // apiCallCompleted — там є fullUrl → правильний топік + підпис. Просто ACK події.
  if (requestType === 'receivedTheCall') {
    return res.json({ status: 'success' })
  }

  // Лід + багата картка — лише на фінальному apiCallCompleted (там є callTrackingData)
  if (requestType === 'apiCallCompleted' && callType !== '1') {
    return handleCompleted(d, res)
  }

  // answeredTheCall / hangupTheCall(flat) / вихідні / apiCallSettings — ігноруємо
  return res.json({ status: 'success' })
})

function handleCompleted(d, res) {
  const answered = (Number(d.billsec) || 0) > 0
  const phone = fmtPhone(d.externalNumber)
  const ct = d.callTrackingData || {}
  const cust = d.customerData || {}
  const emp = d.employeeData || {}
  const utm = meaningfulUtm(ct)
  const geo = [ct.geoipCity, ct.geoipRegion, ct.geoipCountry].filter(Boolean).join(', ')
  const rec = d.linkToCallRecordInMyBusiness || ''
  const btId = ct.id || d.generalCallID || ''
  const site = siteFrom(ct.fullUrl)

  // ── Багата картка в Telegram ──
  const L = []
  L.push(answered
    ? `🟢 <b>${site.label} — вхідний дзвінок (прийнятий)</b>`
    : `🔴 <b>${site.label} — ПРОПУЩЕНИЙ дзвінок</b>`)
  L.push(`☎️ ${esc(phone)}`)
  if (cust.name) L.push(`👤 ${esc(cust.name)}${cust.id ? ` (#${esc(cust.id)})` : ''}`)
  L.push(answered
    ? `⏱ Розмова: ${fmtDur(d.billsec)}${emp.name ? ` · відповів ${esc(emp.name)}` : ''}`
    : `⚠️ Ніхто не відповів — передзвоніть якнайшвидше`)
  if (ct.fullUrl) L.push(`🌐 Сторінка: ${esc(ct.fullUrl)}`)
  if (ct.timeSpentOnSiteBeforeMakeCall) L.push(`🕒 На сайті до дзвінка: ${fmtDur(ct.timeSpentOnSiteBeforeMakeCall)}`)
  if (ct.firstVisitAt) L.push(`🆕 Перший візит: ${esc(fmtTs(ct.firstVisitAt))}`)
  if (utm.length) L.push(`📊 ${utm.map(([k, v]) => `${k}=${esc(v)}`).join(' · ')}`)
  else if (ct.utm_source) L.push(`📊 Джерело: прямий перехід`)
  if (geo) L.push(`📍 ${esc(geo)}`)
  if (ct.ipAddress) L.push(`🌍 IP: ${esc(ct.ipAddress)}`)
  if (ct.gaClientId || ct.gaTrackingId) L.push(`📈 GA: ${esc(ct.gaClientId || '')}${ct.gaTrackingId ? ` · ${esc(ct.gaTrackingId)}` : ''}`)
  if (rec) L.push(`🎧 <a href="${esc(rec)}">Запис розмови</a>`)
  if (btId) L.push(`🆔 binotel_id: ${esc(btId)}`)
  notifyLead(L.join('\n'), site.threadId)

  // ── Лід у CRM (деталі в message; пропущений → у CRM стає HIGH-задачею) ──
  const M = [
    answered
      ? `Прийнятий вхідний дзвінок Binotel — розмова ${fmtDur(d.billsec)}`
      : 'ПРОПУЩЕНИЙ вхідний дзвінок Binotel — передзвоніть',
    answered && emp.name ? `Відповів: ${emp.name}` : '',
    ct.fullUrl ? `Сторінка дзвінка: ${ct.fullUrl}` : '',
    ct.timeSpentOnSiteBeforeMakeCall ? `На сайті до дзвінка: ${fmtDur(ct.timeSpentOnSiteBeforeMakeCall)}` : '',
    ct.firstVisitAt ? `Перший візит: ${fmtTs(ct.firstVisitAt)}` : '',
    utm.length ? `UTM: ${utm.map(([k, v]) => `${k}=${v}`).join(', ')}` : '',
    geo ? `Місцезнаходження: ${geo}` : '',
    ct.ipAddress ? `IP: ${ct.ipAddress}` : '',
    ct.gaClientId ? `GA Client ID: ${ct.gaClientId}` : '',
    ct.gaTrackingId ? `GA Tracking ID: ${ct.gaTrackingId}` : '',
    rec ? `Запис розмови: ${rec}` : '',
    btId ? `binotel_id: ${btId}` : '',
  ].filter(Boolean).join('\n')

  notifyCRM({
    type: 'call',
    name: cust.name ? `${cust.name} (дзвінок)` : `Дзвінок ${phone}`,
    phone: d.externalNumber || phone,
    source: `Binotel ${site.label} · ${answered ? 'прийнятий' : 'ПРОПУЩЕНИЙ'} дзвінок${utm.length ? ` · ${utm[0][1]}` : ''}`,
    message: M,
  })

  return res.json({ status: 'success' })
}

module.exports = router
