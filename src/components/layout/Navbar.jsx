import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, Menu, X, ChevronDown, Phone, Mail, ArrowRight, ArrowUpRight, ExternalLink } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useT } from '../../i18n/useT'
import { LANGS } from '../../i18n/translations'
import { CATEGORIES } from '../../data/categories'
import { assetPath } from '../../utils/assetPath'

// ─── Mega-menu каталог (full-width) ───
function MegaMenu({ lang, products, onClose }) {
  const [activeCatIdx, setActiveCatIdx] = useState(0)
  const activeCat = CATEGORIES[activeCatIdx]
  const catProducts = products
    .filter(p => p.categorySlug === activeCat?.slug || p.categorySlug === activeCat?.id)
    .slice(0, 12)

  return (
    <>
      {/* Backdrop */}
      <div className="mega-backdrop" onClick={onClose} />

      {/* Panel */}
      <div className="mega-full" onMouseLeave={onClose}>
        <div className="mega-full-inner">

          {/* ── Left: category list ── */}
          <div className="border-r border-[var(--ink-200)] py-4 pr-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
            <div className="eyebrow px-3 mb-3">Категорії · {CATEGORIES.length}</div>
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.id}
                to={`/catalog/${cat.slug}`}
                onClick={onClose}
                onMouseEnter={() => setActiveCatIdx(i)}
                className={`mega-cat-item ${i === activeCatIdx ? 'active' : ''}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base flex-shrink-0">{cat.icon}</span>
                  <span className="text-sm font-medium text-gray-800 leading-snug">{cat.name[lang] || cat.name.uk}</span>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{cat.count}</span>
              </Link>
            ))}
          </div>

          {/* ── Center: products grid ── */}
          <div className="py-4 px-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="eyebrow">{activeCat?.name[lang] || activeCat?.name.uk}</div>
              <Link to={`/catalog/${activeCat?.slug}`} onClick={onClose}
                className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1">
                Всі товари <ArrowRight size={11} />
              </Link>
            </div>

            {catProducts.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {catProducts.map(p => {
                  const name = (lang !== 'uk' && p[`name_${lang}`]) ? p[`name_${lang}`] : (p.name || '')
                  return (
                    <Link key={p.id} to={`/catalog/${p.categorySlug}/${p.slug || p.id}`} onClick={onClose}
                      className="flex flex-col gap-2 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-[var(--ink-200)] transition-all group">
                      <div className="w-full aspect-square rounded-lg bg-[var(--bg)] border border-[var(--ink-200)] overflow-hidden group-hover:border-[var(--primary)]/30 transition-colors">
                        {p.image
                          ? <img src={p.image} alt={name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
                          : <span className="flex items-center justify-center w-full h-full text-3xl">{activeCat.icon}</span>}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug group-hover:text-[var(--primary)] transition-colors">{name}</div>
                        {p.sku && <div className="text-[10px] text-gray-400 font-mono mt-0.5">{p.sku}</div>}
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-300 text-sm">Оберіть категорію</div>
            )}
          </div>

          {/* ── Right: CTA ── */}
          <div className="section-dark p-6 flex flex-col gap-4" style={{ maxHeight: 'calc(100vh - 64px)' }}>
            <div className="eyebrow-white">Termojet App</div>
            <h4 className="text-white font-black text-xl leading-tight font-['Archivo',sans-serif]">
              Конфігуратор<br />котельної<br />системи
            </h4>
            <p className="text-white/55 text-xs leading-relaxed">
              Підберіть колектор та насосні групи без помилок. Експорт PDF.
            </p>
            <button className="mt-auto flex items-center gap-2 text-xs font-bold text-white bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 hover:bg-white/20 transition-colors self-start">
              Запустити <ArrowUpRight size={13} />
            </button>
            <div className="border-t border-white/10 pt-4">
              <Link to="/catalog" onClick={onClose}
                className="btn-primary text-xs py-2.5 px-4 w-full justify-center">
                Весь каталог →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

// ─── Простий дропдаун ───
function SimpleDropdown({ items, onClose }) {
  return (
    <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-[var(--ink-200)] rounded-2xl shadow-xl overflow-hidden z-50 py-1.5">
      {items.map(item => (
        item.external
          ? <a key={item.to} href={item.to} target="_blank" rel="noopener noreferrer" onClick={onClose}
              className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--primary)] transition-colors">
              {item.label} <ExternalLink size={12} className="text-gray-400" />
            </a>
          : <Link key={item.to} to={item.to} onClick={onClose}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--primary)] transition-colors">
              {item.label}
            </Link>
      ))}
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
  const [aboutOpen, setAboutOpen] = useState(false)
  const [clientOpen, setClientOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef(null)
  const catalogRef = useRef(null)
  const aboutRef = useRef(null)
  const clientRef = useRef(null)
  const langRef = useRef(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMenuOpen(false); setCatalogOpen(false); setAboutOpen(false); setClientOpen(false) }, [location.pathname])
  useEffect(() => { if (searchOpen) searchRef.current?.focus() }, [searchOpen])

  useEffect(() => {
    function handler(e) {
      if (catalogRef.current && !catalogRef.current.contains(e.target)) setCatalogOpen(false)
      if (aboutRef.current && !aboutRef.current.contains(e.target)) setAboutOpen(false)
      if (clientRef.current && !clientRef.current.contains(e.target)) setClientOpen(false)
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false); setSearchQuery('')
    }
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const aboutItems = [
    { to: '/about',     label: 'Про нас' },
    { to: '/portfolio', label: 'Реалізовані проекти' },
    { to: '/blog',      label: 'Блог' },
    { to: '/contacts',  label: 'Контакти' },
  ]

  const clientItems = [
    { to: '/service',  label: 'Сервіс' },
    { to: '/delivery', label: 'Доставка і оплата' },
    { to: '/returns',  label: 'Повернення та обмін' },
    { to: '/oem',      label: 'OEM виробництво' },
    { to: '/warranty', label: 'Гарантія' },
    { to: '/support',  label: 'Технічна підтримка' },
  ]

  return (
    <>
      {/* ─── Top bar ─── */}
      <div className="hidden md:block text-white/70 py-2"
        style={{ background: '#080f1c', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-5" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.04em' }}>
            <span className="flex items-center gap-1.5 text-white/80"><span className="text-[var(--accent)]">●</span> 20 років на ринку</span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1.5 text-white/80"><span className="text-[var(--accent)]">●</span> Експорт у 15 країн</span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1.5 text-white/80"><span className="text-[var(--accent)]">●</span> Власне виробництво в Києві і Житомирі</span>
          </div>
          <div className="flex items-center gap-4" style={{ fontSize: '11px' }}>
            <a href="tel:+380507189165" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={11} className="text-[var(--accent-light)]" /> +380 50 718 91 65
            </a>
            <a href={`mailto:${siteSettings.email}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail size={11} className="text-[var(--accent-light)]" /> {siteSettings.email}
            </a>
          </div>
        </div>
      </div>

      {/* ─── Main navbar ─── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-xl shadow-[0_2px_20px_rgba(27,63,107,0.10)] border-b border-[var(--ink-200)]' : 'bg-white border-b border-[var(--ink-200)]'
      }`}>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(27,63,107,0.15)] to-transparent" />
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 h-16">

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2.5 group">
              <img src={assetPath('/logo.png')} alt="Termojet" className="h-9 w-auto" onError={e => { e.target.style.display='none' }} />
              <span className="font-black text-xl tracking-tight font-['Archivo',sans-serif] hidden sm:block"
                style={{ background: 'linear-gradient(135deg, #FF5500 0%, #FF9500 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                TERMOJET
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0 ml-1 flex-shrink-0">

              {/* Каталог mega-menu */}
              <div className="relative" ref={catalogRef}>
                <button onMouseEnter={() => setCatalogOpen(true)} onClick={() => setCatalogOpen(v => !v)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap ${isActive('/catalog') ? 'text-[var(--primary)] bg-blue-50' : 'text-gray-700 hover:text-[var(--primary)] hover:bg-gray-50'}`}>
                  Каталог <ChevronDown size={13} className={`transition-transform duration-200 ${catalogOpen ? 'rotate-180 text-[var(--accent)]' : ''}`} />
                </button>
                {catalogOpen && <MegaMenu lang={lang} products={products} onClose={() => setCatalogOpen(false)} />}
              </div>

              {/* Про Termojet */}
              <div className="relative" ref={aboutRef}>
                <button onMouseEnter={() => setAboutOpen(true)} onClick={() => setAboutOpen(v => !v)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap ${['/about','/portfolio','/blog','/contacts'].some(p => isActive(p)) ? 'text-[var(--primary)] bg-blue-50' : 'text-gray-700 hover:text-[var(--primary)] hover:bg-gray-50'}`}>
                  Про Termojet <ChevronDown size={13} className={`transition-transform duration-200 ${aboutOpen ? 'rotate-180 text-[var(--accent)]' : ''}`} />
                </button>
                {aboutOpen && <SimpleDropdown items={aboutItems} onClose={() => setAboutOpen(false)} />}
              </div>

              {/* Для клієнта */}
              <div className="relative" ref={clientRef}>
                <button onMouseEnter={() => setClientOpen(true)} onClick={() => setClientOpen(v => !v)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap ${['/service','/delivery','/returns','/oem','/warranty','/support'].some(p => isActive(p)) ? 'text-[var(--primary)] bg-blue-50' : 'text-gray-700 hover:text-[var(--primary)] hover:bg-gray-50'}`}>
                  Для клієнта <ChevronDown size={13} className={`transition-transform duration-200 ${clientOpen ? 'rotate-180 text-[var(--accent)]' : ''}`} />
                </button>
                {clientOpen && <SimpleDropdown items={clientItems} onClose={() => setClientOpen(false)} />}
              </div>

              {/* Файли */}
              <Link to="/files"
                className={`px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap ${isActive('/files') ? 'text-[var(--primary)] bg-blue-50' : 'text-gray-700 hover:text-[var(--primary)] hover:bg-gray-50'}`}>
                Файли
              </Link>

              {/* Теплові насоси — external */}
              <a href="https://tjheatpump.com.ua/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[13px] font-medium text-gray-700 hover:text-[var(--primary)] hover:bg-gray-50 transition-all whitespace-nowrap">
                Теплові насоси <ExternalLink size={11} className="text-gray-400" />
              </a>

              {/* Phone */}
              <a href="tel:+380507189165"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold text-gray-700 hover:text-[var(--primary)] transition-all whitespace-nowrap"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>
                <Phone size={12} className="text-[var(--accent)]" /> +380 50 718 91 65
              </a>
            </nav>

            <div className="flex-1" />

            {/* Right actions */}
            <div className="flex items-center gap-1.5">
              {/* Search */}
              <button onClick={() => setSearchOpen(v => !v)}
                className={`p-2 rounded-lg transition-all hidden md:flex ${searchOpen ? 'bg-blue-50 text-[var(--primary)]' : 'text-gray-500 hover:bg-gray-100 hover:text-[var(--primary)]'}`}>
                <Search size={17} />
              </button>

              {/* Lang switcher dropdown */}
              <div className="relative hidden lg:block" ref={langRef}>
                <button onClick={() => setLangOpen(v => !v)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-[var(--ink-200)] text-gray-600 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all">
                  {LANGS.find(l => l.code === lang)?.label ?? 'UA'}
                  <ChevronDown size={11} className={`transition-transform duration-150 ${langOpen ? 'rotate-180' : ''}`} />
                </button>
                {langOpen && (
                  <div className="absolute top-full right-0 mt-1.5 w-24 bg-white border border-[var(--ink-200)] rounded-xl shadow-xl overflow-hidden z-50 py-1">
                    {LANGS.map(l => (
                      <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false) }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-bold transition-colors ${lang === l.code ? 'bg-[var(--primary)] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <span>{l.flag}</span> {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link to="/cart" className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[var(--primary)] transition-all">
                <ShoppingCart size={17} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                    style={{ background: 'var(--accent)' }}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* CTA buttons */}
              <Link to="/partners" className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg, #FF5500, #FF8800)' }}>
                Стати партнером
              </Link>
              <Link to="/contacts" className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-2 whitespace-nowrap"
                style={{ borderColor: '#FF5500', color: '#FF5500', background: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background='#FF5500'; e.currentTarget.style.color='white' }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#FF5500' }}>
                Консультація
              </Link>

              {/* Mobile burger */}
              <button onClick={() => setMenuOpen(v => !v)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
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
                  placeholder="Пошук товарів..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--ink-200)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(27,63,107,0.08)] text-sm bg-[var(--bg)]" />
              </div>
            </form>
          )}
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-[var(--ink-200)] bg-white/98 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-0.5">
              <Link to="/catalog"   className={`px-3 py-2.5 rounded-lg text-sm font-medium ${isActive('/catalog')   ? 'bg-blue-50 text-[var(--primary)]' : 'text-gray-700 hover:bg-gray-50'}`}>Каталог</Link>
              <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Про Termojet</div>
              {aboutItems.map(i => <Link key={i.to} to={i.to} className="px-5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">{i.label}</Link>)}
              <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Для клієнта</div>
              {clientItems.map(i => <Link key={i.to} to={i.to} className="px-5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">{i.label}</Link>)}
              <Link to="/files" className="px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 mt-1">Файли</Link>
              <a href="https://tjheatpump.com.ua/" target="_blank" rel="noopener noreferrer"
                className="px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                Теплові насоси <ExternalLink size={12} />
              </a>
              <div className="flex gap-2 pt-3 border-t border-[var(--ink-200)] mt-2">
                <Link to="/partners" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white text-center"
                  style={{ background: 'linear-gradient(135deg, #FF5500, #FF8800)' }}>Стати партнером</Link>
                <Link to="/contacts" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-center border-2"
                  style={{ borderColor: '#FF5500', color: '#FF5500' }}>Консультація</Link>
              </div>
              <div className="flex gap-1 pt-2 flex-wrap">
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
