// Пересилання лідів у Termojet CRM (проєкт heat-pump-registration).
//
// Fire-and-forget POST на публічний lead-intake CRM. Дзеркало telegram.js —
// НІКОЛИ не блокує і не ламає HTTP-запит, який його викликав: якщо CRM
// недоступна, заявка все одно вже збережена в БД сайту й пішла в Telegram.
//
// ENV (необов'язкові — є робочі дефолти):
//   CRM_LEADS_URL    — ендпоінт прийому лідів (дефолт: прод CRM)
//   CRM_LEAD_SECRET  — спільний секрет, шлеться заголовком X-Lead-Secret (якщо заданий)
//
// CRM-ендпоінт публічний (без авторизації) і приймає:
//   { type, name, phone, email, message, source }
//   type ∈ consultation | partnership | order | other
//   source — вільний рядок, у CRM видно у списку лідів і в нотатці задачі.

const CRM_URL = process.env.CRM_LEADS_URL || 'https://crm.tjheatpump.com.ua/api/leads'
const CRM_SECRET = process.env.CRM_LEAD_SECRET || ''

// Компактний рядок "source=fb · medium=cpc · campaign=..." з об'єкта utm (або '')
function utmString(utm) {
  if (!utm || typeof utm !== 'object') return ''
  const parts = []
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    if (utm[k]) parts.push(`${k.replace('utm_', '')}=${utm[k]}`)
  }
  return parts.join(' · ')
}

async function postLead(payload) {
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 8000)
    const headers = { 'Content-Type': 'application/json' }
    if (CRM_SECRET) headers['X-Lead-Secret'] = CRM_SECRET
    await fetch(CRM_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    }).finally(() => clearTimeout(t))
  } catch (e) {
    console.error('CRM lead forward failed:', e.message)
  }
}

// Fire-and-forget: ніколи не блокує/не валить запит. name обов'язковий для CRM.
function notifyCRM(payload) {
  if (!payload || !payload.name) return
  postLead(payload).catch(() => {})
}

module.exports = { notifyCRM, utmString }
