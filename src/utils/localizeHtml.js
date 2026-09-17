/**
 * Додає мовний префікс до ВНУТРІШНІХ href у HTML-контенті (описи товарів, статті блогу),
 * який рендериться через dangerouslySetInnerHTML і містить сирі <a href="/catalog/...">.
 * НЕ чіпає: зовнішні (http/mailto/tel), якорі (#), протокол-відносні (//),
 * уже-префіксовані (/en/, /de/, /fr/, /ro/ — список публічних мов). Для uk або
 * невідомої/захованої мови повертає як є.
 *
 * localizeHtml('<a href="/catalog/x">…</a>', 'en') → '<a href="/en/catalog/x">…</a>'
 */
import { PUBLIC_LANG_CODES } from '../i18n/translations'

const SUPPORTED_LANGS = PUBLIC_LANG_CODES.filter(c => c !== 'uk')
// Готовий шматок регулярки, щоб список мов жив в одному місці (а не дублювався нижче).
const LANG_ALT = SUPPORTED_LANGS.join('|')

export function localizeHtml(html, lang) {
  if (!html || !lang || lang === 'uk' || !SUPPORTED_LANGS.includes(lang)) return html
  // href=" + / (але не //, і не вже-префіксований /en//de//fr//ro/) + решта шляху + "
  return String(html).replace(
    new RegExp(`href="(/(?!/|(?:${LANG_ALT})/)[^"]*)"`, 'g'),
    (_, p) => `href="/${lang}${p}"`
  )
}
