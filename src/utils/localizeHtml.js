/**
 * Додає мовний префікс до ВНУТРІШНІХ href у HTML-контенті (описи товарів, статті блогу),
 * який рендериться через dangerouslySetInnerHTML і містить сирі <a href="/catalog/...">.
 * НЕ чіпає: зовнішні (http/mailto/tel), якорі (#), протокол-відносні (//),
 * уже-префіксовані (/en/, /pl/, /de/, /fr/, /ro/). Для uk або невідомої мови повертає як є.
 *
 * localizeHtml('<a href="/catalog/x">…</a>', 'en') → '<a href="/en/catalog/x">…</a>'
 */
const SUPPORTED_LANGS = ['en', 'pl', 'de', 'fr', 'ro']

export function localizeHtml(html, lang) {
  if (!html || !lang || lang === 'uk' || !SUPPORTED_LANGS.includes(lang)) return html
  // href=" + / (але не //, і не /en//pl//de//fr//ro/) + решта шляху + "
  return String(html).replace(
    /href="(\/(?!\/|(?:en|pl|de|fr|ro)\/)[^"]*)"/g,
    (_, p) => `href="/${lang}${p}"`
  )
}
