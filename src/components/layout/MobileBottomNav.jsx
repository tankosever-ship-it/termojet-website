import { useLocation } from 'react-router-dom'
import { Home, Grid, ShoppingCart, Blocks, Phone } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useT } from '../../i18n/useT'
import LLink from '../LLink'
import { stripLangPrefix } from '../../utils/localizedPath'

export default function MobileBottomNav() {
  const location = useLocation()
  const { cart } = useApp()
  const t = useT()

  const TABS = [
    { label: t('mobileNav.home'),        icon: Home,         path: '/' },
    { label: t('nav.catalog'),           icon: Grid,         path: '/catalog' },
    { label: t('nav.cart'),              icon: ShoppingCart, path: '/cart' },
    { label: t('mobileNav.constructor'), icon: Blocks,       href: 'https://app.termojet.com.ua/', external: true },
    { label: t('nav.contacts'),          icon: Phone,        path: '/contacts' },
  ]

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  // Знімаємо мовний префікс для визначення активної вкладки
  const strippedPathname = stripLangPrefix(location.pathname)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 md:hidden z-[100] flex items-center justify-around"
      style={{
        background: '#0C0B0A',
        height: 64,
        paddingBottom: 'env(safe-area-inset-bottom, 12px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {TABS.map(({ label, icon: Icon, path, href, external }) => {
        const isActive = !external && (path === '/'
          ? strippedPathname === '/'
          : strippedPathname.startsWith(path))

        const cls = 'flex flex-col items-center justify-center gap-1 flex-1 h-full relative'

        const inner = (
          <>
            {/* Cart badge */}
            {path === '/cart' && cartCount > 0 && (
              <span
                className="absolute top-2 right-1/2 translate-x-3 -translate-y-0.5 flex items-center justify-center rounded-full text-white font-bold"
                style={{
                  background: 'var(--accent)',
                  minWidth: 16,
                  height: 16,
                  fontSize: 10,
                  lineHeight: 1,
                  padding: '0 4px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}

            <Icon
              size={20}
              style={{ color: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.35)' }}
            />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.35)',
              }}
            >
              {label}
            </span>
          </>
        )

        return external ? (
          <a key={href} href={href} target="_blank" rel="noopener noreferrer" className={cls} style={{ textDecoration: 'none' }}>
            {inner}
          </a>
        ) : (
          <LLink key={path} to={path} className={cls} style={{ textDecoration: 'none' }}>
            {inner}
          </LLink>
        )
      })}
    </nav>
  )
}
