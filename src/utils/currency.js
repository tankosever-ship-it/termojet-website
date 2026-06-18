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

// Локаль форматування ціни за мовою UI (uk→"7 945 грн", en→"UAH 7,945", pl/fr/de→локальний UAH)
const PRICE_LOCALE = { uk: 'uk-UA', en: 'en-US', pl: 'pl-PL', fr: 'fr-FR', de: 'de-DE' }

// Format price for display: locale-aware UAH (e.g. "7 945 грн" / "UAH 7,945")
export function formatPrice(price, currency, eurRate, lang = 'uk') {
  const amount = parseFloat(price)
  if (!amount) return ''
  const locale = PRICE_LOCALE[lang] || 'uk-UA'
  const uah = currency === 'UAH' ? amount : (currency === 'EUR' && eurRate ? Math.round(amount * eurRate) : null)
  if (uah !== null) {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'UAH', maximumFractionDigits: 0 }).format(uah)
  }
  // fallback — показуємо EUR якщо курс ще не завантажений
  return `${amount} €`
}
