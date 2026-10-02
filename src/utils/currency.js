// EUR→UAH conversion via NBU rate + 2.2% markup
// UAH prices are used as-is (no conversion)

const NBU_API = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=EUR&json'
const MARKUP = 1.022 // NBU rate + 2.2%
const CACHE_TTL = 3600 * 1000 // 1 hour in ms

let _cached = { rate: null, ts: 0 }

export async function fetchEurRate() {
  const now = Date.now()
  if (_cached.rate && now - _cached.ts < CACHE_TTL) {
    return _cached.rate
  }
  try {
    const res = await fetch(NBU_API)
    const data = await res.json()
    const rate = data[0]?.rate
    if (rate) {
      _cached = { rate: rate * MARKUP, ts: now }
      return _cached.rate
    }
  } catch {
    // fallback if NBU unreachable
  }
  return _cached.rate || 51 * MARKUP // fallback if NBU unreachable
}

// Convert price to UAH. Returns number.
// product.currency === 'EUR' → convert, 'UAH' → return as-is
export function toUAH(price, currency, eurRate) {
  const amount = parseFloat(price)
  if (!amount || !currency) return null
  if (currency === 'UAH') return amount
  if (currency === 'EUR' && eurRate) return Math.round(amount * eurRate)
  return null
}

// Групування розрядів БЕЗ Intl. Чому не toLocaleString/Intl.NumberFormat:
// сторінки рендерить і сервер (Node), і браузер, а ICU в них різні — Node 24
// форматує uk-UA як «7 945 ₴», Chrome як «7 945 грн», Safari/Firefox можуть
// по-своєму. Будь-яка різниця в тексті = розбіжність гідрації (React перемальовує
// блок). Тому формат задаємо самі — рівно такий, який досі показував Chrome.
export function groupDigits(n, sep = '\u00a0') {
  const v = Math.round(Number(n) || 0)
  return (v < 0 ? '-' : '') + String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, sep)
}

// Формат ціни в ₴ за мовою UI (дзеркало колишнього Intl-виводу Chrome):
// uk «7 945 грн», en «UAH 7,945», pl «7945 UAH» (групує лише від 10 000),
// fr «7 945 UAH» (вузький пробіл), de «7.945 UAH». ro — як uk.
const NB = '\u00a0'
const PRICE_FMT = {
  uk: n => `${groupDigits(n)}${NB}грн`,
  en: n => `UAH${NB}${groupDigits(n, ',')}`,
  pl: n => `${Math.abs(n) >= 10000 ? groupDigits(n) : groupDigits(n, '')}${NB}UAH`,
  fr: n => `${groupDigits(n, '\u202f')}${NB}UAH`,
  de: n => `${groupDigits(n, '.')}${NB}UAH`,
}

// Format price for display: locale-aware UAH (e.g. "7 945 грн" / "UAH 7,945")
export function formatPrice(price, currency, eurRate, lang = 'uk') {
  const amount = parseFloat(price)
  if (!amount) return ''
  const uah = currency === 'UAH' ? Math.round(amount) : (currency === 'EUR' && eurRate ? Math.round(amount * eurRate) : null)
  if (uah !== null) return (PRICE_FMT[lang] || PRICE_FMT.uk)(uah)
  // fallback — показуємо EUR якщо курс ще не завантажений
  return `${amount} €`
}
