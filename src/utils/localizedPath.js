/**
 * Додає мовний префікс до публічного шляху.
 *
 * localizedPath('/catalog/nasosy', 'en')  → '/en/catalog/nasosy'
 * localizedPath('/catalog/nasosy', 'uk')  → '/catalog/nasosy'
 * localizedPath('/', 'en')                → '/en'
 */

const SUPPORTED_LANGS = ['en', 'pl', 'de', 'fr', 'ro']

export function localizedPath(path, lang) {
  // Зовнішні та спец-URL повертаємо без змін
  if (typeof path !== 'string') return path
  if (/^(https?:|mailto:|tel:|\/\/|#)/.test(path)) return path

  if (!lang || lang === 'uk') return path
  if (!SUPPORTED_LANGS.includes(lang)) return path

  // Прибираємо вже наявний мовний префікс (захист від подвоєння)
  const stripped = stripLangPrefix(path)
  const prefix = `/${lang}`
  if (stripped === '/') return prefix
  return prefix + stripped
}

/**
 * Видаляє мовний префікс з pathname.
 * stripLangPrefix('/en/catalog') → '/catalog'
 * stripLangPrefix('/catalog')    → '/catalog'
 */
export function stripLangPrefix(pathname) {
  for (const l of SUPPORTED_LANGS) {
    if (pathname === `/${l}`) return '/'
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1)
  }
  return pathname
}

/**
 * Повертає мову з URL-pathname або null якщо мова за замовчуванням (uk).
 */
export function langFromPathname(pathname) {
  for (const l of SUPPORTED_LANGS) {
    if (pathname === `/${l}` || pathname.startsWith(`/${l}/`)) return l
  }
  return null
}
