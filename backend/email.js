// Транзакційна пошта клієнту через Resend (https://resend.com).
//
// Стиль дзеркалить telegram.js/crm.js: чистий fetch, fire-and-forget, ніколи
// не блокує й не валить HTTP-запит, який його викликав. Якщо ключа немає або
// email клієнта відсутній/невалідний — тихо пропускаємо (лист просто не йде).
//
// ENV (усі на сервері, у .env поряд з docker-compose; gitignored):
//   RESEND_API_KEY   — ключ з resend.com → API Keys (обов'язковий, інакше вимкнено)
//   RESEND_FROM      — адреса відправника на верифікованому домені
//                      (дефолт: "Termojet <zamovlennya@termojet.com.ua>")
//   ORDER_EMAIL_BCC  — (необов'язково) прихована копія замовлень менеджеру
//
// Домен termojet.com.ua має бути верифікований у Resend (SPF/DKIM DNS-записи),
// інакше листи летітимуть у спам або відхиляться.

const db = require('./db')

const API_KEY = process.env.RESEND_API_KEY
const FROM = process.env.RESEND_FROM || 'Termojet <zamovlennya@termojet.com.ua>'
const BCC = process.env.ORDER_EMAIL_BCC || ''

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Екранування для HTML-тіла листа
function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// "8 200" — гривні з розділювачем тисяч
function uah(n) {
  return `${Math.round(Number(n) || 0).toLocaleString('uk-UA')} грн`
}

// Контакти магазину з таблиці settings (для футера); тихий фолбек
function storeContacts() {
  try {
    const rows = db.prepare("SELECT key, value FROM settings WHERE key IN ('phone','email','address')").all()
    const s = {}
    rows.forEach(r => { s[r.key] = r.value })
    return s
  } catch {
    return {}
  }
}

function buildHtml(order) {
  const { id, name, lines = [], total, delivery, payment } = order
  const c = storeContacts()

  const rows = lines.map(l => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eef1f5;color:#1f2937;font-size:15px;">
        ${esc(l.name)} <span style="color:#6b7280;">× ${esc(l.qty)}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #eef1f5;color:#1f2937;font-size:15px;text-align:right;white-space:nowrap;">
        ${uah(l.lineTotal)}
      </td>
    </tr>`).join('')

  const info = [
    delivery ? ['Доставка', delivery] : null,
    payment ? ['Оплата', payment] : null,
  ].filter(Boolean).map(([k, v]) => `
    <tr>
      <td style="padding:4px 0;color:#6b7280;font-size:14px;vertical-align:top;white-space:nowrap;padding-right:16px;">${esc(k)}:</td>
      <td style="padding:4px 0;color:#1f2937;font-size:14px;">${esc(v)}</td>
    </tr>`).join('')

  const footerBits = [
    c.phone ? `тел. ${esc(c.phone)}` : '',
    c.email ? `<a href="mailto:${esc(c.email)}" style="color:#cc4400;text-decoration:none;">${esc(c.email)}</a>` : '',
  ].filter(Boolean).join(' · ')

  return `<!doctype html>
<html lang="uk">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
        <!-- header -->
        <tr><td style="background:#FF5500;padding:26px 32px;">
          <div style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.3px;">Termojet</div>
          <div style="color:#ffe0cc;font-size:14px;margin-top:2px;">Теплові насоси та обладнання</div>
        </td></tr>
        <!-- body -->
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 6px;font-size:20px;color:#0f172a;">Дякуємо за замовлення${name ? `, ${esc(name)}` : ''}!</h1>
          <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.5;">
            Ваше замовлення <b>№${esc(id)}</b> прийнято. Наш менеджер зв'яжеться з вами найближчим часом для підтвердження деталей.
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
            ${rows}
            <tr>
              <td style="padding:14px 0 0;color:#0f172a;font-size:17px;font-weight:700;">Разом</td>
              <td style="padding:14px 0 0;color:#FF5500;font-size:17px;font-weight:700;text-align:right;white-space:nowrap;">${uah(total)}</td>
            </tr>
          </table>

          ${info ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0;border-top:1px solid #eef1f5;padding-top:16px;">${info}</table>` : ''}
        </td></tr>
        <!-- footer -->
        <tr><td style="padding:20px 32px 28px;border-top:1px solid #eef1f5;">
          <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;">
            Питання по замовленню? ${footerBits ? footerBits + '<br>' : ''}
            <a href="https://termojet.com.ua" style="color:#cc4400;text-decoration:none;">termojet.com.ua</a>
          </p>
        </td></tr>
      </table>
      <div style="color:#b0bac6;font-size:12px;margin-top:14px;">© Termojet — власне виробництво в Україні</div>
    </td></tr>
  </table>
</body>
</html>`
}

async function sendEmail(order) {
  if (!API_KEY) return
  const to = (order.email || '').trim()
  if (!EMAIL_RE.test(to)) return
  try {
    const body = {
      from: FROM,
      to: [to],
      subject: `Termojet — замовлення №${order.id} прийнято`,
      html: buildHtml(order),
    }
    // Відповіді клієнта → у робочу скриньку магазину (from лишається на верифікованому домені)
    const storeEmail = (storeContacts().email || '').trim()
    if (EMAIL_RE.test(storeEmail)) body.reply_to = storeEmail
    if (BCC) body.bcc = [BCC]
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      console.error('Resend send failed:', res.status, await res.text().catch(() => ''))
    }
  } catch (e) {
    console.error('Resend send error:', e.message)
  }
}

// Fire-and-forget: ніколи не блокує/не валить запит замовлення.
function notifyCustomerOrder(order) {
  sendEmail(order).catch(() => {})
}

module.exports = { notifyCustomerOrder, buildHtml }
