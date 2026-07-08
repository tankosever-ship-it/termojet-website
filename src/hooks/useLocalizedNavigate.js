import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { localizedPath, langFromPathname } from '../utils/localizedPath'

/**
 * Повертає функцію navigate, що автоматично додає мовний префікс.
 *
 * const navigate = useLocalizedNavigate()
 * navigate('/catalog')  // → /en/catalog якщо поточна мова en
 */
export function useLocalizedNavigate() {
  const navigate = useNavigate()
  const { lang } = useApp()

  return function localizedNavigate(to, options) {
    if (typeof to === 'string' && to.startsWith('/')) {
      return navigate(localizedPath(to, lang), options)
    }
    return navigate(to, options)
  }
}
