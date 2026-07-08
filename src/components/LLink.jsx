import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { localizedPath } from '../utils/localizedPath'

/**
 * Локалізований <Link> — автоматично додає /en (або інший lang) до внутрішніх шляхів.
 *
 * Використання: замість <Link to="/catalog"> пишемо <LLink to="/catalog">
 * Якщо lang='en' → рендерить <Link to="/en/catalog">
 * Якщо lang='uk' → рендерить <Link to="/catalog"> (без змін)
 *
 * Всі інші props передаються безпосередньо до Link.
 */
const LLink = forwardRef(function LLink({ to, ...props }, ref) {
  const { lang } = useApp()
  const resolvedTo = typeof to === 'string'
    ? localizedPath(to, lang)
    : to
  return <Link ref={ref} to={resolvedTo} {...props} />
})

export default LLink
