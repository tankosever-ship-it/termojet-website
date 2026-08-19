// Спільний хелпер i18n: розкладає JSON-колонку i18n у пласкі поля `<base>_<lang>`,
// які очікує фронтенд (напр. p.name_en, p.desc_pl). UA лишається в базовому полі.
const LANGS = ['en', 'pl', 'fr', 'de', 'ro']

// obj      — вже розпарсений об'єкт для віддачі (parseProduct тощо)
// i18nRaw  — рядок JSON із колонки i18n: { en:{...}, pl:{...}, ... }
// fieldMap — { outputBase: i18nKey }, напр. { name:'name', desc:'description', specs:'specs' }
//            i18nKey — це ключ усередині i18n[lang] (зазвичай snake_case колонки БД)
function withI18n(obj, i18nRaw, fieldMap) {
  let i18n = {}
  try { i18n = JSON.parse(i18nRaw || '{}') } catch { i18n = {} }
  for (const lang of LANGS) {
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
