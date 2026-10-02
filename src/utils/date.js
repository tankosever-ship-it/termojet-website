// Форматування дат без toLocaleDateString.
// Сторінки рендерить і сервер (Node, таймзона UTC), і браузер (у відвідувача —
// Київ), а ICU в них різні. toLocaleDateString давав би різний текст, тобто
// розбіжність гідрації. Тому:
//   • календарну дату беремо в київському часі (числові частини Intl з timeZone
//     однакові в усіх рушіях, на відміну від текстових назв місяців);
//   • назви місяців — власні таблиці, рівно такі, як досі показував Chrome.

const MONTHS = {
  // «вересень 2026 р.» — називний відмінок (місяць+рік)
  ukNom: ['січень', 'лютий', 'березень', 'квітень', 'травень', 'червень', 'липень', 'серпень', 'вересень', 'жовтень', 'листопад', 'грудень'],
  // «1 вересня 2026 р.» — родовий (повна дата)
  ukGen: ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  pl: ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'],
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  ro: ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'],
}

let _kyiv = null
function kyivParts(input) {
  // SQLite CURRENT_TIMESTAMP («2026-09-01 18:30:00») — це UTC без позначки зони;
  // new Date() прочитав би його як МІСЦЕВИЙ час, тобто по-різному на сервері й у браузері.
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(input)) {
    input = input.replace(' ', 'T') + 'Z'
  }
  const d = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(d.getTime())) return null
  try {
    // 'Europe/Kiev' — аліас, який знають і старі ICU (Europe/Kyiv з'явився пізніше)
    if (!_kyiv) _kyiv = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Kiev', year: 'numeric', month: 'numeric', day: 'numeric' })
    const p = Object.fromEntries(_kyiv.formatToParts(d).map(x => [x.type, x.value]))
    return { y: +p.year, m: +p.month - 1, d: +p.day }
  } catch {
    return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate() }
  }
}

const pad = n => String(n).padStart(2, '0')

// «01.09.2026»
export function formatDateShort(input) {
  const p = kyivParts(input)
  return p ? `${pad(p.d)}.${pad(p.m + 1)}.${p.y}` : ''
}

// «1 вересня 2026 р.»
export function formatDateLongUk(input) {
  const p = kyivParts(input)
  return p ? `${p.d} ${MONTHS.ukGen[p.m]} ${p.y} р.` : ''
}

// «вересень 2026 р.» / «September 2026» / …
export function formatMonthYear(input, lang = 'uk') {
  const p = kyivParts(input)
  if (!p) return ''
  if (lang === 'uk' || !MONTHS[lang]) return `${MONTHS.ukNom[p.m]} ${p.y} р.`
  return `${MONTHS[lang][p.m]} ${p.y}`
}

// Поточний рік за Києвом — однаковий на сервері (UTC) і в браузері в ніч на 1 січня
export function currentYearKyiv() {
  return kyivParts(new Date())?.y || new Date().getFullYear()
}
