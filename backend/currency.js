// Серверна конвертація EUR→UAH — дзеркало src/utils/currency.js.
//
// Частина товарів у каталозі має ціну в EUR (products.currency = 'EUR').
// Фронт показує ціну в гривні за курсом НБУ +2.2%, але суму замовлення
// перераховує сервер (orders.js, щоб не довіряти клієнтській сумі) — тож
// сервер теж мусить конвертувати EUR, інакше total рахується «як є» і для
// EUR-товарів у гривні виходить число в євро.
//
// Курс кешується на 1 год; при недоступності НБУ — останній відомий або фолбек.

const NBU_API = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=EUR&json'
const MARKUP = 1.022 // курс НБУ + 2.2% (як на фронті)
const CACHE_TTL = 3600 * 1000 // 1 год
const FALLBACK_RATE = 51 * MARKUP // якщо НБУ недоступний і кешу ще нема

let _cached = { rate: null, ts: 0 }

// Повертає «валовий» курс UAH за 1 EUR (уже з націнкою). Ніколи не кидає.
async function getEurRate() {
  const now = Date.now()
  if (_cached.rate && now - _cached.ts < CACHE_TTL) return _cached.rate
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 4000)
    const res = await fetch(NBU_API, { signal: ctrl.signal }).finally(() => clearTimeout(t))
    const data = await res.json()
    const rate = data && data[0] && data[0].rate
    if (rate) {
      _cached = { rate: rate * MARKUP, ts: now }
      return _cached.rate
    }
  } catch (e) {
    console.error('NBU rate fetch failed:', e.message)
  }
  return _cached.rate || FALLBACK_RATE
}

// Ціна в гривні: EUR → конверсія за курсом, UAH → як є. Повертає ціле число.
function toUAH(price, currency, eurRate) {
  const amount = Number(price) || 0
  if (currency === 'EUR' && eurRate) return Math.round(amount * eurRate)
  return Math.round(amount)
}

module.exports = { getEurRate, toUAH }
