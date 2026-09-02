// Спільний хелпер i18n: розкладає JSON-колонку i18n у пласкі поля `<base>_<lang>`,
// які очікує фронтенд (напр. p.name_en, p.desc_pl). UA лишається в базовому полі.
const LANGS = ['en', 'pl', 'fr', 'de', 'ro']

// obj      — вже розпарсений об'єкт для віддачі (parseProduct тощо)
// i18nRaw  — рядок JSON із колонки i18n: { en:{...}, pl:{...}, ... }
// fieldMap — { outputBase: i18nKey }, напр. { name:'name', desc:'description', specs:'specs' }
//            i18nKey — це ключ усередині i18n[lang] (зазвичай snake_case колонки БД)
// onlyLang — якщо задано, віддаємо пласкі поля ЛИШЕ цієї мови.
//            Навіщо: список товарів (/api/products?limit=500) віддавав переклади
//            ВСІМА 5 мовами — 10.5 МБ JSON на КОЖНЕ завантаження будь-якої сторінки,
//            з них 7.5 МБ — поля інших мов, які цьому відвідувачу не потрібні.
//            Це забивало канал і відсувало LCP на 17–21 с (пізні картинки) та давало
//            зсув футера 0.60 на 17.8 с. Форма відповіді не змінюється — просто немає
//            полів чужих мов, тож фронт (читає базове поле або `_<поточна мова>`)
//            працює як і раніше.
function withI18n(obj, i18nRaw, fieldMap, onlyLang) {
  let i18n = {}
  try { i18n = JSON.parse(i18nRaw || '{}') } catch { i18n = {} }
  const langs = onlyLang ? (LANGS.includes(onlyLang) ? [onlyLang] : []) : LANGS
  for (const lang of langs) {
    const tr = i18n[lang]
    if (!tr || typeof tr !== 'object') continue
    for (const [outBase, srcKey] of Object.entries(fieldMap)) {
      const v = tr[srcKey]
      if (v !== undefined && v !== null && v !== '') {
        obj[`${outBase}_${lang}`] = v
      }
    }
  }
  return obj
}

module.exports = { withI18n, LANGS }
