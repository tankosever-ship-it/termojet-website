// HIDDEN_LANGS — мови, ЗАХОВАНІ з сайту (рішення власниці 17.09.2026: польська).
// Переклади T.pl нижче НЕ чіпаємо — вони чекають на повернення мови.
// ПОВЕРНУТИ МОВУ: прибрати код звідси і з HIDDEN_LANGS у backend/server.js,
// тоді перегенерувати sitemap (node scripts/gen-sitemap.cjs на прод-БД).
export const HIDDEN_LANGS = ['pl']

// LANGS — усі мови, для яких є переклади; PUBLIC_LANGS — ті, що показуємо людям.
// UI (перемикач, маршрути) бере саме PUBLIC_LANGS.
export const ALL_LANGS = [
  {
    "code": "uk",
    "label": "UA",
    "flag": "🇺🇦"
  },
  {
    "code": "en",
    "label": "EN",
    "flag": "🇬🇧"
  },
  {
    "code": "pl",
    "label": "PL",
    "flag": "🇵🇱"
  },
  {
    "code": "fr",
    "label": "FR",
    "flag": "🇫🇷"
  },
  {
    "code": "de",
    "label": "DE",
    "flag": "🇩🇪"
  },
  {
    "code": "ro",
    "label": "RO",
    "flag": "🇷🇴"
  }
]

export const LANGS = ALL_LANGS
export const PUBLIC_LANGS = ALL_LANGS.filter(l => !HIDDEN_LANGS.includes(l.code))
export const PUBLIC_LANG_CODES = PUBLIC_LANGS.map(l => l.code)

// ── Словники інтерфейсу ────────────────────────────────────────────────────────
// Кожна мова — окремий файл у ./lang. Раніше всі шість мов лежали тут одним об'єктом
// (530 кБ, ~143 кБ gzip) і їхали в основному JS-бандлі кожному відвідувачу, хоча
// потрібна йому одна. Тепер у бандлі лише uk (мова за замовчуванням і запасна),
// решта вантажиться окремим чанком, коли знадобиться:
//   • перед першим рендером/гідрацією — src/main.jsx (мова сторінки відома з URL);
//   • при перемиканні мови — AppContext.setLang.
// SSR-бандл (src/entry-server.jsx) реєструє всі мови одразу — сервер має їх усі.
import uk from './lang/uk'

// T — словники, які вже завантажені (useT читає саме його).
export const T = { uk }

const LOADERS = {
  en: () => import('./lang/en'),
  pl: () => import('./lang/pl'),
  fr: () => import('./lang/fr'),
  de: () => import('./lang/de'),
  ro: () => import('./lang/ro'),
}

export const isLangLoaded = code => !!T[code] || !LOADERS[code]

export async function loadLang(code) {
  if (isLangLoaded(code)) return
  const mod = await LOADERS[code]()
  T[code] = mod.default
}

// Для SSR: усі мови синхронно (див. entry-server.jsx)
export function registerLang(code, dict) {
  T[code] = dict
}
