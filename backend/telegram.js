// Telegram lead notifications for the termojet site.
//
// Uses the shared bot @termojet_ua_bot. Credentials come from ENV ONLY —
// never from the settings table, because GET /api/settings is public and
// would leak the token. Set on the server (docker-compose / .env):
//   TELEGRAM_BOT_TOKEN  — bot token from @BotFather
//   TELEGRAM_CHAT_ID    — target chat, e.g. Termojet Sales group (-100...)
//
// If either var is missing, notifications are silently disabled (no crash).

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID

// Escape user-supplied text for Telegram HTML parse_mode
function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

async function sendTelegram(text) {
  if (!TOKEN || !CHAT_ID) return
  try {
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })
  } catch (e) {
    console.error('Telegram notify failed:', e.message)
  }
}

// Fire-and-forget: must never block or break the HTTP request that triggered it
function notifyLead(text) {
  sendTelegram(text).catch(() => {})
}

module.exports = { notifyLead, esc }
