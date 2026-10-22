import { useEffect } from 'react'

// Вікно згоди програми «Відгуки клієнтів Google» на сторінці підтвердження замовлення.
// Дані (merchant_id, номер замовлення, email, дата доставки) формує сервер — routes/orders.js;
// якщо програму вимкнено, сервер віддає gcr: null і компонент не рендериться.
// Google сам показує вікно поверх сторінки і після дати доставки надсилає клієнту опитування.
const SCRIPT_SRC = 'https://apis.google.com/js/platform.js?onload=renderOptIn'
// Мова вікна — як на сайті; коди мов Google збігаються з нашими
const GCR_LANGS = ['uk', 'en', 'pl', 'fr', 'de', 'ro']

export default function GoogleReviewsOptIn({ data, lang }) {
  useEffect(() => {
    if (!data) return
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
  }, [data, lang])

  return null
}
