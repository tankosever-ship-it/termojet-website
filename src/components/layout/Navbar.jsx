import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, Menu, X, ChevronDown, Phone, Mail, ArrowRight, ArrowUpRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useT } from '../../i18n/useT'
import { LANGS } from '../../i18n/translations'
import { CATEGORIES } from '../../data/categories'
import { assetPath } from '../../utils/assetPath'

// ─── Mega-menu (3 columns: categories | product previews | promo) ───
function MegaMenu({ lang, products, onClose }) {
  const [activeCatIdx, setActiveCatIdx] = useState(4) // насоси by default

  const activeCat = CATEGORIES[activeCatIdx]
  const catProducts = products
    .filter(p => p.categorySlug === activeCat?.slug || p.categorySlug === activeCat?.id)
    .slice(0, 9)

  return (
    <div className="mega-new" onMouseLeave={onClose}>
      {/* Column 1 — categories */}
      <div className="border-r border-[var(--ink-200)] py-3 px-3 overflow-y-auto max-h-[480px]">
        <div className="eyebrow px-2 mb-3">Категорії · {CATEGORIES.length}</div>
        {CATEGORIES.map((cat, i) => (
          <div
            key={cat.id}
            className={`mega-cat-item ${i === activeCatIdx ? 'active' : ''}`}
            onMouseEnter={() => setActiveCatIdx(i)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-lg flex-shrink-0">{cat.icon}</span>
              <span className="text-sm font-medium text-gray-800 leading-tight">
                {cat.name[lang] || cat.name.uk}
              </span>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">{cat.count}</span>
          </div>
        ))}
      </div>

      {/* Column 2 — product previews */}
      <div className="py-3 px-3 border-r border-[var(--ink-200)]">
        <div className="eyebrow px-2 mb-3">
          {activeCat?.name[lang] || activeCat?.name.uk}
        </div>
        {catProducts.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {catProducts.map(p => {
              const name = (lang !== 'uk' && p[`name_${lang}`]) ? p[`name_${lang}`] : (p.name || '')
              return (
                <Link
                  key={p.id}
                  to={`/catalog/${p.categorySlug}/${p.slug || p.id}`}
                  onClick={onClose}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-[var(--ink-200)] transition-all group text-center"
                >
                  <div className="w-20 h-20 rounded-xl bg-[var(--bg)] border border-[var(--ink-200)] flex-shrink-0 overflow-hidden group-hover:border-[var(--primary)]/30 transition-colors">
                    {p.image
                      ? <img src={p.image} alt={name} className="w-full h-full object-contain p-2" />
                      : <span className="flex items-center justify-center w-full h-full text-2xl">{activeCat.icon}</span>
                    }
                  </div>
                  <div className="min-w-0 w-full">
                    <div className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug group-hover:text-[var(--primary)] transition-colors">
                      {name}
                    </div>
                    {p.sku && <div className="text-[10px] text-gray-400 font-mono mt-0.5">{p.sku}</div>}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-gray-300 text-sm">
            Оберіть категорію
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-[var(--ink-200)]">
          <Link
            to={`/catalog/${activeCat?.slug}`}
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:gap-2.5 transition-all"
          >
            Всі товари категорії <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Column 3 — promo panel */}
      <div className="section-navy p-5 flex flex-col gap-4">
        <div className="eyebrow-white">Termojet App</div>
        <h4 className="text-white font-black text-lg leading-tight font-['Archivo',sans-serif]">
          Конфігуратор<br />котельної<br />системи
        </h4>
        <p className="text-white/55 text-xs leading-relaxed">
          Підберіть колектор та насосні групи без помилок. Експорт PDF.
        </p>
        <button className="mt-auto flex items-center gap-2 text-xs font-bold text-white bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 hover:bg-white/20 transition-colors self-start">
          Запустити <ArrowUpRight size={13} />
        </button>
        <div className="border-t border-white/10 pt-3">
          <Link to="/catalog" onClick={onClose} className="btn-primary text-xs py-2 px-4 w-full justify-center">
            Весь каталог →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Navbar() {
  const { lang, setLang, cartCount, siteSettings, products } = useApp()
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
      <div className="hidden md:block text-white/70 py-2"
        style={{ background: '#080f1c', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-5" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.04em' }}>
            <span className="flex items-center gap-1.5 text-white/80">
              <span className="text-[var(--accent)]">●</span> 20 років на ринку
            </span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1.5 text-white/80">
              <span className="text-[var(--accent)]">●</span> Експорт у 15 країн
            </span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1.5 text-white/80">
              <span className="text-[var(--accent)]">●</span> Власне виробництво в Києві і Житомирі
            </span>
          </div>
          <div className="flex items-center gap-4" style={{ fontSize: '11px' }}>
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
          ? 'bg-white/95 backdrop-blur-xl shadow-[0_2px_20px_rgba(27,63,107,0.10)] border-b border-[var(--ink-200)]'
          : 'bg-white border-b border-[var(--ink-200)]'
      }`}>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(27,63,107,0.15)] to-transparent" />

        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 h-16">

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2.5 group">
              <img src={assetPath('/logo.png')} alt="Termojet" className="h-9 w-auto"
                onError={e => { e.target.style.display='none' }} />
              <span className="font-black text-xl tracking-tight font-['Archivo',sans-serif] hidden sm:block"
                style={{ background: 'linear-gradient(135deg, #FF5500 0%, #FF9500 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                TERMOJET
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1 ml-4">

              {/* Catalog — mega-menu trigger */}
              <div className="relative" ref={catalogRef}>
                <button
                  onMouseEnter={() => setCatalogOpen(true)}
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
                  <MegaMenu
                    lang={lang}
                    products={products}
                    onClose={() => setCatalogOpen(false)}
                  />
                )}
              </div>

              {[
                { to: '/about',     label: nav.about },
                { to: '/portfolio', label: nav.portfolio },
                { to: '/blog',      label: nav.blog },
                { to: '/dealers',   label: nav.dealers },
                { to: '/contacts',  label: nav.contacts },
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
              <button onClick={() => setSearchOpen(v => !v)}
                className={`p-2 rounded-lg transition-all ${searchOpen ? 'bg-blue-50 text-[var(--primary)]' : 'text-gray-500 hover:bg-gray-100 hover:text-[var(--primary)]'}`}>
                <Search size={18} />
              </button>

              <div className="hidden md:flex items-center border border-[var(--ink-200)] rounded-lg overflow-hidden ml-1">
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => setLang(l.code)}
                    className={`px-2 py-1.5 text-xs font-bold transition-colors ${
                      lang === l.code ? 'bg-[var(--primary)] text-white' : 'text-gray-500 hover:bg-gray-50'
                    }`}>
                    {l.label}
                  </button>
                ))}
              </div>

              <Link to="/cart" className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[var(--primary)] transition-all ml-1">
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                    style={{ background: 'var(--accent)' }}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

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
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--ink-200)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(27,63,107,0.08)] text-sm bg-[var(--bg)]" />
              </div>
            </form>
          )}
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-[var(--ink-200)] bg-white/98 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-0.5">
              {[
                { to: '/catalog',   label: nav.catalog },
                { to: '/about',     label: nav.about },
                { to: '/portfolio', label: nav.portfolio },
                { to: '/blog',      label: nav.blog },
                { to: '/dealers',   label: nav.dealers },
                { to: '/contacts',  label: nav.contacts },
              ].map(({ to, label }) => (
                <Link key={to} to={to}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(to) ? 'bg-blue-50 text-[var(--primary)]' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {label}
                </Link>
              ))}
              <div className="flex gap-1 pt-2 border-t border-[var(--ink-200)] mt-1 flex-wrap">
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => setLang(l.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${lang === l.code ? 'bg-[var(--primary)] text-white' : 'text-gray-600 border border-[var(--ink-200)]'}`}>
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
