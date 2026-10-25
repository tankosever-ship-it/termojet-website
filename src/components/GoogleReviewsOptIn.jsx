import { useEffect } from 'react'

// Вікно згоди програми «Відгуки клієнтів Google» на сторінці підтвердження замовлення.
// Дані (merchant_id, номер замовлення, email, дата доставки) формує сервер — routes/orders.js;
// якщо програму вимкнено, сервер віддає gcr: null і компонент не рендериться.
// Google сам показує вікно поверх сторінки і після дати доставки надсилає клієнту опитування.
const SCRIPT_SRC = 'https://apis.google.com/js/platform.js?onload=renderOptIn'
// Мова вікна — як на сайті; коди мов Google збігаються з нашими
const GCR_LANGS = ['uk', 'en', 'pl', 'fr', 'de', 'ro']

// Один показ на замовлення: номери вже показаних — у sessionStorage (перемикання мови на
// екрані подяки чи повторний рендер не викличуть вікно вдруге). Після оновлення сторінки
// екрана подяки вже немає (кошик порожній), тож і там повтору не буде.
const SHOWN_KEY = 'tj2_gcr_shown'
function alreadyShown(orderId) {
  try { return JSON.parse(sessionStorage.getItem(SHOWN_KEY) || '[]').includes(orderId) } catch { return false }
}
function markShown(orderId) {
  try {
    const ids = JSON.parse(sessionStorage.getItem(SHOWN_KEY) || '[]')
    sessionStorage.setItem(SHOWN_KEY, JSON.stringify([...ids, orderId].slice(-20)))
  } catch { /* приватний режим — не критично */ }
}

export default function GoogleReviewsOptIn({ data, lang }) {
  useEffect(() => {
    if (!data || alreadyShown(data.order_id)) return
    markShown(data.order_id)
    window.___gcfg = { lang: GCR_LANGS.includes(lang) ? lang : 'uk' }
    const render = () => {
      window.gapi.load('surveyoptin', () => {
        window.gapi.surveyoptin.render({ ...data, opt_in_style: 'CENTER_DIALOG' })
      })
    }
    // platform.js викликає window.renderOptIn після завантаження (параметр onload)
    window.renderOptIn = render
    if (window.gapi?.load) { render(); return }
    if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const s = document.createElement('script')
      s.src = SCRIPT_SRC
      s.async = true
      s.defer = true
      document.body.appendChild(s)
    }
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps -- мова береться на момент показу

  return null
}
