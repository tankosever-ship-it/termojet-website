import { Link, useLocation } from 'react-router-dom'
import { Home, Grid, ShoppingCart, Wrench, Phone } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const TABS = [
  { label: 'Головна',  icon: Home,         path: '/' },
  { label: 'Каталог',  icon: Grid,         path: '/catalog' },
  { label: 'Кошик',    icon: ShoppingCart, path: '/cart' },
  { label: 'Сервіс',   icon: Wrench,       path: '/service' },
  { label: 'Контакти', icon: Phone,        path: '/contacts' },
]

export default function MobileBottomNav() {
  const location = useLocation()
  const { cart } = useApp()

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

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
      {TABS.map(({ label, icon: Icon, path }) => {
        const isActive = path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(path)

        return (
          <Link
            key={path}
            to={path}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative"
            style={{ textDecoration: 'none' }}
          >
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
          </Link>
        )
      })}
    </nav>
  )
}
