// Вебхук Binotel (API PUSH) → лід у CRM + сповіщення в Telegram.
//
// Дзеркалить потік лідів із форм сайту (див. crm.js / telegram.js), але джерело —
// вхідний ДЗВІНОК на віртуальну АТС Binotel. Мета: команда реагує швидше —
// миттєвий пінг у Telegram на кожен вхідний + лід у CRM (пропущений окремо
// позначається й у CRM автоматично стає HIGH-задачею «Дзвінок клієнту»).
//
// Binotel шле POST на цей URL двома методами (увімкнено на боці Binotel):
//   receivedTheCall — пішов вхідний дзвінок (ще ніхто не підняв) → нема disposition/billsec
//   hangupTheCall   — дзвінок завершено → є disposition, billsec (тривалість розмови)
// Обидва методи йдуть на ОДИН URL; розрізняємо за наявністю disposition/billsec.
// Дублів на один дзвінок нема: пінг раз на received, лід раз на hangup.
//
// Безпека (Binotel API PUSH запити НЕ підписує):
//   1) IP-allowlist — приймаємо лише з серверів Binotel (req.ip коректний, бо trust proxy=loopback).
//   2) Звірка companyID — має збігатися з нашим акаунтом.
// ENV (сервер, .env поряд з docker-compose):
//   BINOTEL_COMPANY_ID   — ID компанії Binotel (порожньо → перевірку пропущено)
//   BINOTEL_ALLOWED_IPS  — CSV IP серверів Binotel (порожньо → IP-перевірку пропущено)
//   BINOTEL_API_KEY / BINOTEL_API_SECRET — на майбутнє (REST Binotel: запис розмови тощо)

const express = require('express')
const { notifyLead, esc } = require('../telegram')
const { notifyCRM } = require('../crm')

const router = express.Router()

const COMPANY_ID = String(process.env.BINOTEL_COMPANY_ID || '').trim()
const ALLOWED_IPS = (process.env.BINOTEL_ALLOWED_IPS || '')
  .split(',').map(s => s.trim()).filter(Boolean)

// req.ip може приходити як IPv6-mapped (::ffff:1.2.3.4) — нормалізуємо до IPv4
function clientIp(req) {
  return String(req.ip || '').replace(/^::ffff:/, '')
}

// 380671234567 → +380671234567 (читабельно + клікабельний tel-номер у Telegram/CRM)
function fmtPhone(raw) {
  const d = String(raw || '').replace(/[^\d]/g, '')
  return d ? '+' + d : String(raw || '')
}

router.post('/', (req, res) => {
  const ip = clientIp(req)

  // 1) IP-allowlist серверів Binotel
  if (ALLOWED_IPS.length && !ALLOWED_IPS.includes(ip)) {
    console.warn(`[binotel] відхилено: IP ${ip} не в allowlist`)
    return res.status(403).json({ status: 'error', message: 'forbidden' })
  }

  // Binotel може слати дані у callDetails-обгортці або пласко на корені
  const d = (req.body && req.body.callDetails) || req.body || {}
  const pick = (k) => d[k] ?? (req.body ? req.body[k] : undefined)

  // Сирий лог — щоб при налаштуванні звірити реальні назви полів (docker/pm2 logs)
  console.log('[binotel] push from', ip, JSON.stringify(req.body))

  // 2) Звірка компанії (відсікти чужі/тестові запити з дозволеного IP)
  if (COMPANY_ID && String(pick('companyID') ?? '') !== COMPANY_ID) {
    console.warn(`[binotel] відхилено: companyID ${pick('companyID')} ≠ ${COMPANY_ID}`)
    return res.status(403).json({ status: 'error', message: 'wrong company' })
  }

  // Binotel: callType 0 = вхідний, 1 = вихідний. Реагуємо лише на вхідні.
  if (String(pick('callType') ?? '0') === '1') return res.json({ status: 'success' })

  const external = pick('externalNumber') ?? ''
  const phone = fmtPhone(external)
  const generalCallID = pick('generalCallID') ?? ''

  const disposition = String(pick('disposition') ?? '').trim()
  const billsec = Number(pick('billsec') ?? 0) || 0
  // Завершений дзвінок має disposition або тривалість розмови; «дзвонить зараз» — ні.
  const isCompleted = disposition !== '' || billsec > 0

  if (!isCompleted) {
    // receivedTheCall — миттєвий пінг, щоб підняли слухавку
    notifyLead(
      `📞 <b>Termojet — вхідний дзвінок</b>\n` +
      `☎️ ${esc(phone)}\n` +
      `⏳ Дзвонить зараз — підніміть слухавку`
    )
    return res.json({ status: 'success' })
  }

  // hangupTheCall — розмова відбулась (billsec>0) чи пропущено (нема відповіді)
  const answered = billsec > 0

  // Гучний пінг лише на ПРОПУЩЕНІ (на прийняті вже пінгнули на receivedTheCall)
  if (!answered) {
    notifyLead(
      `🔴 <b>Termojet — ПРОПУЩЕНИЙ дзвінок</b>\n` +
      `☎️ ${esc(phone)}\n` +
      `⚠️ Ніхто не відповів — передзвоніть якнайшвидше`
    )
  }

  // Лід у CRM (пропущений → у CRM автоматично стає HIGH-задачею «Дзвінок клієнту»)
  notifyCRM({
    type: 'call',
    name: `Дзвінок ${phone}`,
    phone: external || phone,
    source: `Binotel · ${answered ? 'прийнятий' : 'ПРОПУЩЕНИЙ'} дзвінок`,
    message: answered
      ? `Вхідний дзвінок з Binotel — розмова ${billsec} с. ID: ${generalCallID}`
      : `ПРОПУЩЕНИЙ вхідний дзвінок з Binotel — передзвоніть. ID: ${generalCallID}`,
  })

  return res.json({ status: 'success' })
})

module.exports = router
