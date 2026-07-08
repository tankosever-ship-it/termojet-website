import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { langFromPathname } from '../utils/localizedPath'

/**
 * Синхронізує мову в AppContext з мовою в URL.
 * Якщо URL починається з /en → lang='en'.
 * Якщо URL без префікса → lang='uk' (або з localStorage, як зараз).
 *
 * Рендеримо цей хук один раз в корені публічного дерева.
 */
export function useLangFromUrl() {
  const { pathname } = useLocation()
  const { setLang, lang } = useApp()

  useEffect(() => {
    const urlLang = langFromPathname(pathname)
    const targetLang = urlLang ?? 'uk'
    if (lang !== targetLang) {
      setLang(targetLang)
    }
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps
}
