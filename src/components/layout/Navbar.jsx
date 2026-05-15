import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, Menu, X, ChevronDown, Phone, Mail } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useT } from '../../i18n/useT'
import { LANGS } from '../../i18n/translations'
import { CATEGORIES } from '../../data/categories'
import { assetPath } from '../../utils/assetPath'

export default function Navbar() {
  const { lang, setLang, cartCount, siteSettings } = useApp()
  const t = useT()
  const nav = t('nav')
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef(null)
  const catalogRef = useRef(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMenuOpen(false); setCatalogOpen(false) }, [location.pathname])
  useEffect(() => { if (searchOpen) searchRef.current?.focus() }, [searchOpen])

  useEffect(() => {
    function handler(e) {
      if (catalogRef.current && !catalogRef.current.contains(e.target)) setCatalogOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <>
      {/* ─── Top bar ─── */}
      <div className="hidden md:block text-white/80 text-xs py-1.5"
        style={{ background: 'linear-gradient(90deg, #0a1628 0%, #1B3F6B 60%, #0a1628 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              🇺🇦 <span className="font-semibold text-white/90">Виробник обладнання для котелень з 2002 року</span>
            </span>
            <span className="text-white/30">•</span>
            <span>Київ, Україна</span>
          </span>
          <div className="flex items-center gap-4">
            <a href={`tel:${siteSettings.phone}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={11} className="text-[var(--accent-light)]" />
              {siteSettings.phone}
            </a>
            <a href={`mailto:${siteSettings.email}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail size={11} className="text-[var(--accent-light)]" />
              {siteSettings.email}
            </a>
          </div>
        </div>
      </div>

      {/* ─── Main navbar ─── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-[0_2px_20px_rgba(27,63,107,0.12)] border-b border-[var(--border)]'
          : 'bg-white border-b border-[var(--border)]'
      }`}>
        {/* gradient accent line at bottom of header */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(27,63,107,0.2)] to-transparent" />

        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 h-16">

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2.5 group">
              <img src={assetPath('/logo.png')} alt="Termojet" className="h-9 w-auto" onError={e => { e.target.style.display='none' }} />
              <span className="font-black text-xl tracking-tight font-['Montserrat',sans-serif] hidden sm:block"
                style={{ background: 'linear-gradient(135deg, #FF5500 0%, #FF9500 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                TERMOJET
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1 ml-4">
              {/* Catalog mega-menu */}
              <div className="relative" ref={catalogRef}>
                <button
                  onClick={() => setCatalogOpen(v => !v)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/catalog')
                      ? 'text-[var(--primary)] bg-blue-50'
                      : 'text-gray-700 hover:text-[var(--primary)] hover:bg-gray-50'
                  }`}
                >
                  {nav.catalog}
                  <ChevronDown size={14} className={`transition-transform duration-200 ${catalogOpen ? 'rotate-180 text-[var(--accent)]' : ''}`} />
                </button>

                {catalogOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-[var(--border)] overflow-hidden z-50 w-[760px]"
                    style={{ boxShadow: '0 20px 60px rgba(27,63,107,0.15), 0 4px 16px rgba(0,0,0,0.08)' }}>
                    {/* Mega-menu header */}
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between"
                      style={{ background: 'linear-gradient(90deg, rgba(27,63,107,0.04), rgba(232,93,4,0.03))' }}>
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Каталог обладнання</span>
                      <span className="text-xs text-gray-400">13 категорій • 242 товари</span>
                    </div>
                    {/* Categories grid */}
                    <div className="p-4 grid grid-cols-3 gap-1">
                      {CATEGORIES.map(cat => (
                        <Link
                          key={cat.id}
                          to={`/catalog/${cat.slug}`}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50/60 transition-all group"
                        >
                          <span className="text-2xl mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform">{cat.icon}</span>
                          <div>
                            <div className="text-sm font-semibold text-gray-800 group-hover:text-[var(--primary)] transition-colors leading-tight">
                              {cat.name[lang] || cat.name.uk}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">{cat.count} товарів</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <span className="text-xs text-gray-400">Власне виробництво • MADE IN UKRAINE 🇺🇦</span>
                      <Link to="/catalog" className="btn-primary text-xs py-1.5 px-4">
                        Весь каталог →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {[
                { to: '/about', label: nav.about },
                { to: '/portfolio', label: nav.portfolio },
                { to: '/blog', label: nav.blog },
                { to: '/dealers', label: nav.dealers },
                { to: '/contacts', label: nav.contacts },
              ].map(({ to, label }) => (
                <Link key={to} to={to}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(to) ? 'text-[var(--primary)] bg-blue-50' : 'text-gray-700 hover:text-[var(--primary)] hover:bg-gray-50'
                  }`}>
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex-1 lg:flex-none" />

            {/* Right actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button onClick={() => setSearchOpen(v => !v)}
                className={`p-2 rounded-lg transition-all ${searchOpen ? 'bg-blue-50 text-[var(--primary)]' : 'text-gray-500 hover:bg-gray-100 hover:text-[var(--primary)]'}`}>
                <Search size={18} />
              </button>

              {/* Lang switcher */}
              <div className="hidden md:flex items-center border border-gray-200 rounded-lg overflow-hidden ml-1">
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => setLang(l.code)}
                    className={`px-2 py-1.5 text-xs font-bold transition-colors ${
                      lang === l.code ? 'bg-[var(--primary)] text-white' : 'text-gray-500 hover:bg-gray-50'
                    }`}>
                    {l.label}
                  </button>
                ))}
              </div>

              {/* Cart */}
              <Link to="/cart" className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[var(--primary)] transition-all ml-1">
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                    style={{ background: 'var(--accent)' }}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Burger */}
              <button onClick={() => setMenuOpen(v => !v)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors ml-1">
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <form onSubmit={handleSearch} className="pb-3 pt-1">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input ref={searchRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder={nav.search}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(27,63,107,0.08)] text-sm bg-gray-50/80" />
              </div>
            </form>
          )}
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-0.5">
              {[
                { to: '/catalog', label: nav.catalog },
                { to: '/about', label: nav.about },
                { to: '/portfolio', label: nav.portfolio },
                { to: '/blog', label: nav.blog },
                { to: '/dealers', label: nav.dealers },
                { to: '/contacts', label: nav.contacts },
              ].map(({ to, label }) => (
                <Link key={to} to={to}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(to) ? 'bg-blue-50 text-[var(--primary)]' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {label}
                </Link>
              ))}
              <div className="flex gap-1 pt-2 border-t border-gray-100 mt-1 flex-wrap">
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => setLang(l.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${lang === l.code ? 'bg-[var(--primary)] text-white' : 'text-gray-600 border border-gray-200'}`}>
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
