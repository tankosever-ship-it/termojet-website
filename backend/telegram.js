// Telegram lead notifications for the termojet site.
//
// Uses the shared bot @termojet_ua_bot. Credentials come from ENV ONLY —
// never from the settings table, because GET /api/settings is public and
// would leak the token. Set on the server (docker-compose / .env):
//   TELEGRAM_BOT_TOKEN  — bot token from @BotFather
//   TELEGRAM_CHAT_ID    — target chat, e.g. Termojet Sales group (-100...)
//   TELEGRAM_THREAD_ID  — (optional) forum-topic id inside that group.
//                         The shared "Termojet Sales" group serves BOTH sites,
//                         so every termojet lead is routed into the dedicated
//                         "🔵 Termojet — заявки/дзвінки" topic to keep it apart
//                         from TJ Heat Pumps leads. Defaults to 169 (the live
//                         Termojet topic) so routing survives even if the env
//                         var is dropped — mirrors TJ's hardcoded 168 fallback
//                         in routes/binotel.js. Set the env var to override.
//
// If token or chat id is missing, notifications are silently disabled (no crash).

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID
// Default to the live "🔵 Termojet — заявки/дзвінки" topic (169) so leads never
// silently fall back to General when TELEGRAM_THREAD_ID is missing from the env.
const THREAD_ID = process.env.TELEGRAM_THREAD_ID || '169'

// Escape user-supplied text for Telegram HTML parse_mode
function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

async function sendTelegram(text, threadId) {
  if (!TOKEN || !CHAT_ID) return
  try {
    const body = {
      chat_id: CHAT_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }
    // Route into a forum topic when a thread id is configured. Telegram wants
    // an integer; ignore an empty/invalid value so we fall back to General.
    const tid = parseInt(threadId, 10)
    if (Number.isInteger(tid)) body.message_thread_id = tid
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (e) {
    console.error('Telegram notify failed:', e.message)
  }
}

// Fire-and-forget: must never block or break the HTTP request that triggered it.
// Defaults to the Termojet leads topic (TELEGRAM_THREAD_ID); pass an explicit
// threadId to override per-call.
function notifyLead(text, threadId = THREAD_ID) {
  sendTelegram(text, threadId).catch(() => {})
}

// UTM-рядок для картки в Telegram: "\n📊 source=fb · medium=cpc · campaign=…".
// Порожній рядок, якщо міток немає або всі «сміттєві» (direct/none/not set) —
// тоді до повідомлення нічого не додається. Дзеркалить формат дзвінків (binotel.js)
// і CRM (crm.js · utmString), щоб UTM з форм було видно менеджерам у чаті так само,
// як у дзвінках. Значення екрануємо для parse_mode=HTML.
function utmLine(utm) {
  if (!utm || typeof utm !== 'object') return ''
  const junk = ['(direct)', '(none)', '(not set)', '']
  const parts = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
    .filter(k => utm[k] && !junk.includes(String(utm[k]).trim()))
    .map(k => `${k.replace('utm_', '')}=${esc(utm[k])}`)
  return parts.length ? `\n📊 ${parts.join(' · ')}` : ''
}

module.exports = { notifyLead, esc, utmLine }
