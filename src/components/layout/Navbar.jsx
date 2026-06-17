import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, Menu, X, ChevronDown, Phone, Mail, ArrowRight, ArrowUpRight, ExternalLink } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useT } from '../../i18n/useT'
import { imgUrl } from '../../utils/imgUrl'
import { LANGS } from '../../i18n/translations'
import { CATEGORIES } from '../../data/categories'
import { assetPath } from '../../utils/assetPath'
import CategoryIcon from '../CategoryIcon'

// ─── Mega-menu каталог (full-width) ───
function MegaMenu({ lang, products, onClose }) {
  const t = useT()
  const [activeCatIdx, setActiveCatIdx] = useState(0)
  const activeCat = CATEGORIES[activeCatIdx]
  const catProducts = products
    .filter(p => p.categorySlug === activeCat?.slug || p.categorySlug === activeCat?.id)
    .slice(0, 12)

  return (
    <>
      <div className="mega-backdrop" onClick={onClose} />
      <div className="mega-full">
        <div className="mega-full-inner">

          {/* ── Left: category list ── */}
          <div className="border-r border-[var(--border)] py-4 pr-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)', background: '#0D0D0D' }}>
            <div className="px-3 mb-4 flex items-center justify-between gap-2">
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--accent)' }}>
                {t('navbar.categories')} · {CATEGORIES.length}
              </span>
              <Link to="/catalog" onClick={onClose}
                style={{ background: '#FF6B00', color: '#fff', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '3px 10px', borderRadius: '0.4rem', whiteSpace: 'nowrap' }}>
                {t('navbar.goTo')}
              </Link>
            </div>
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.id}
                to={`/catalog/${cat.slug}`}
                onClick={onClose}
                onMouseEnter={() => setActiveCatIdx(i)}
                className={`mega-cat-item ${i === activeCatIdx ? 'active' : ''}`}
                style={{ color: i === activeCatIdx ? 'white' : 'rgba(255,255,255,0.55)', background: i === activeCatIdx ? 'rgba(255,85,0,0.12)' : 'transparent', borderLeftColor: i === activeCatIdx ? 'var(--accent)' : 'transparent' }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-6 h-6 flex-shrink-0"
                    style={{ background: i === activeCatIdx ? 'rgba(255,107,0,0.25)' : 'rgba(255,107,0,0.08)' }}>
                    <CategoryIcon name={cat.icon} size={13}
                      style={{ color: '#FF6B00' }} />
                  </span>
                  <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '13px', fontWeight: 500, lineHeight: 1.3 }}>
                    {cat.name[lang] || cat.name.uk}
                  </span>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>
                  {cat.count}
                </span>
              </Link>
            ))}
          </div>

          {/* ── Center: products grid ── */}
          <div className="py-4 px-4 overflow-y-auto bg-white" style={{ maxHeight: 'calc(100vh - 64px)' }}>
            <div className="flex items-center justify-between mb-4">
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--accent)' }}>
                {activeCat?.name[lang] || activeCat?.name.uk}
              </div>
              <Link to={`/catalog/${activeCat?.slug}`} onClick={onClose}
                className="flex items-center gap-1 hover:gap-2 transition-all"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)' }}>
                {t('navbar.allProducts')} <ArrowRight size={11} />
              </Link>
            </div>

            {catProducts.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {catProducts.map(p => {
                  const name = (lang !== 'uk' && p[`name_${lang}`]) ? p[`name_${lang}`] : (p.name || '')
                  return (
                    <Link key={p.id} to={`/catalog/${p.categorySlug}/${p.slug || p.id}`} onClick={onClose}
                      className="flex flex-col gap-2 p-2.5 border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-warm)] transition-all group"
                      style={{ borderRadius: '0.5rem' }}>
                      <div className="w-full aspect-square bg-[var(--bg-warm)] border border-[var(--border)] overflow-hidden group-hover:border-[var(--accent)] transition-colors"
                        style={{ borderRadius: '0.5rem' }}>
                        {p.image
                          ? <img src={imgUrl(p.image)} alt={name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
                          : <span className="flex items-center justify-center w-full h-full text-gray-200"><CategoryIcon name={activeCat.icon} size={40} /></span>}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug group-hover:text-[var(--accent)] transition-colors"
                          style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                          {name}
                        </div>
                        {p.sku && (
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#999', marginTop: 2 }}>
                            {p.sku}
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-300 text-sm">{t('navbar.selectCategory')}</div>
            )}
          </div>

          {/* ── Right: CTA ── */}
          <div className="flex flex-col border-l border-white/5 overflow-hidden" style={{ maxHeight: 'calc(100vh - 64px)', background: '#0a0a0a' }}>
            {/* Phones image on dark bg */}
            <div className="flex-shrink-0 flex items-center justify-center px-4 pt-5 pb-2 relative"
              style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 100%, rgba(255,85,0,0.18), transparent 70%)' }}>
              <img src={assetPath('/app-promo-nobg.png')} alt={t('navbar.appPromoAlt')}
                className="w-full block" style={{ maxHeight: 180, objectFit: 'contain' }} />
            </div>
            <div className="p-5 flex flex-col gap-3 flex-1">
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--accent)' }}>
                Termojet App
              </div>
              <h4 className="text-white font-black text-lg leading-tight font-['Archivo',sans-serif]">
                {t('navbar.appHeading')}
              </h4>
              <p className="text-white/50 text-xs leading-relaxed" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                {t('navbar.appDesc')}
              </p>
              <div className="h-px bg-white/8 my-1" />
              <a href="https://app.termojet.com.ua/" target="_blank" rel="noopener noreferrer"
                className="mt-auto flex items-center gap-2 text-white border border-white/20 px-4 py-2.5 hover:bg-white/10 transition-colors self-start"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', borderRadius: '0.5rem' }}>
                {t('navbar.launch')} <ArrowUpRight size={13} />
              </a>
              <Link to="/catalog" onClick={onClose} className="btn-primary text-center justify-center" style={{ fontSize: '11px', padding: '10px 16px' }}>
                {t('navbar.allCatalog')}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

// ─── Темний дропдаун у дизайн системі ───
function DarkDropdown({ items, onClose }) {
  return (
    <div className="absolute top-full left-0 mt-0 w-60 overflow-hidden"
      style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.08)', borderTop: '2px solid var(--accent)', borderRadius: '0.5rem', boxShadow: '0 16px 48px rgba(0,0,0,0.4)', zIndex: 200 }}>
      {items.map((item, i) => (
        item.external
          ? <a key={item.to} href={item.to} target="_blank" rel="noopener noreferrer" onClick={onClose}
              className="flex items-center justify-between gap-2 px-4 py-3 transition-all group"
              style={{ borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,85,0,0.10)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.8)' }}>
                {item.label}
              </span>
              <ExternalLink size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />
            </a>
          : <Link key={item.to} to={item.to} onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 transition-all group"
              style={{ borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', borderLeft: '2px solid transparent' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,85,0,0.10)'; e.currentTarget.style.borderLeftColor = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent' }}>
              <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.8)' }}>
                {item.label}
              </span>
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

  const navLinkStyle = { fontFamily: "'Rubik', sans-serif", fontSize: '15px', fontWeight: 500, letterSpacing: '0.01em', transition: 'color 0.3s' }

  const aboutItems = [
    { to: '/about',     label: t('navbar.aboutUs') },
    { to: '/portfolio', label: t('navbar.projects') },
    { to: '/blog',      label: t('navbar.blog') },
    { to: '/contacts',  label: t('navbar.contacts') },
  ]
  const clientItems = [
    { to: '/service',    label: t('navbar.service') },
    { to: '/navchannya', label: t('navbar.training') },
    { to: '/delivery',   label: t('navbar.delivery') },
    { to: '/returns',    label: t('navbar.returns') },
    { to: '/oem',        label: t('navbar.oem') },
    { to: '/files',      label: t('navbar.files') },
  ]

  // Сторінки зі світлим верхом (без темного героя) — навбар завжди світлий
  const seg = location.pathname.split('/').filter(Boolean)
  const lightTop =
    ['/cart', '/privacy', '/terms'].includes(location.pathname) ||
    (seg[0] === 'catalog' && seg.length === 3) // картка товару
  // прозорий над темним героєм → світлий «glassmorphism» при скролі або на світлих сторінках
  const solid = scrolled || lightTop

  const navBg = solid
    ? 'rgba(255,255,255,0.88)'
    : 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)'
  const navBackdrop = solid ? 'blur(20px)' : 'none'
  const navShadow = solid ? '0 2px 32px rgba(0,0,0,0.12)' : 'none'
  const navBorderB = solid ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent'
  // text: white on dark hero, dark on white glassmorphism
  const linkCol = solid ? '#1a1a1a' : 'rgba(255,255,255,0.95)'
  const linkColMuted = solid ? '#555' : 'rgba(255,255,255,0.75)'

  return (
    <>
      {/* ─── Main navbar ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{ background: navBg, backdropFilter: navBackdrop, WebkitBackdropFilter: navBackdrop, boxShadow: navShadow, borderBottom: navBorderB }}>

        {/* orange accent line bottom — only when solid */}
        {solid && <div className="absolute bottom-0 left-0 right-0 h-[1.5px]"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,85,0,0.4) 30%, rgba(255,85,0,0.4) 70%, transparent)' }} />}

        <div className="px-5 lg:px-6">
          <div className="flex items-center gap-2 h-[60px]">

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img src={assetPath('/logo-orange.png')} alt="Termojet" className="h-10 w-auto" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center ml-1 flex-shrink-0">

              {/* Каталог */}
              <div className="relative" ref={catalogRef}>
                <button onClick={() => { setCatalogOpen(v => !v); setAboutOpen(false); setClientOpen(false) }}
                  className="flex items-center gap-1.5 px-3 py-2 transition-all whitespace-nowrap group"
                  style={{ ...navLinkStyle, color: isActive('/catalog') ? 'var(--accent)' : linkCol, borderBottom: isActive('/catalog') ? '2px solid var(--accent)' : '2px solid transparent' }}>
                  {t('nav.catalog')}
                  <ChevronDown size={11} className="transition-transform duration-200" style={{ transform: catalogOpen ? 'rotate(180deg)' : 'none', color: catalogOpen ? 'var(--accent)' : 'currentColor' }} />
                </button>
                {catalogOpen && <MegaMenu lang={lang} products={products} onClose={() => setCatalogOpen(false)} />}
              </div>

              {/* Про Termojet */}
              <div className="relative" ref={aboutRef}>
                <button onClick={() => { setAboutOpen(v => !v); setCatalogOpen(false); setClientOpen(false) }}
                  className="flex items-center gap-1.5 px-3 py-2 transition-all whitespace-nowrap"
                  style={{ ...navLinkStyle, color: ['/about','/portfolio','/blog','/contacts'].some(p => isActive(p)) ? 'var(--accent)' : linkCol, borderBottom: ['/about','/portfolio','/blog','/contacts'].some(p => isActive(p)) ? '2px solid var(--accent)' : '2px solid transparent' }}>
                  {t('navbar.aboutTermojet')}
                  <ChevronDown size={11} className="transition-transform duration-200" style={{ transform: aboutOpen ? 'rotate(180deg)' : 'none' }} />
                </button>
                {aboutOpen && <DarkDropdown items={aboutItems} onClose={() => setAboutOpen(false)} />}
              </div>

              {/* Для клієнта */}
              <div className="relative" ref={clientRef}>
                <button onClick={() => { setClientOpen(v => !v); setCatalogOpen(false); setAboutOpen(false) }}
                  className="flex items-center gap-1.5 px-3 py-2 transition-all whitespace-nowrap"
                  style={{ ...navLinkStyle, color: ['/service','/navchannya','/delivery','/returns','/oem','/warranty','/support'].some(p => isActive(p)) ? 'var(--accent)' : linkCol, borderBottom: ['/service','/navchannya','/delivery','/returns','/oem','/warranty','/support'].some(p => isActive(p)) ? '2px solid var(--accent)' : '2px solid transparent' }}>
                  {t('navbar.forClient')}
                  <ChevronDown size={11} className="transition-transform duration-200" style={{ transform: clientOpen ? 'rotate(180deg)' : 'none' }} />
                </button>
                {clientOpen && <DarkDropdown items={clientItems} onClose={() => setClientOpen(false)} />}
              </div>

              {/* Теплові насоси */}
              <a href="https://tjheatpump.com.ua/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 transition-all whitespace-nowrap"
                style={{ ...navLinkStyle, color: linkColMuted, borderBottom: '2px solid transparent' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = linkColMuted}>
                {t('navbar.heatPumps')} <ExternalLink size={10} />
              </a>

              {/* Конструктор */}
              <a href="https://app.termojet.com.ua/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 transition-all whitespace-nowrap"
                style={{ ...navLinkStyle, color: 'var(--accent)', borderBottom: '2px solid transparent', fontWeight: 600 }}
                onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'transparent' }}>
                {t('navbar.constructor')} <ExternalLink size={10} />
              </a>
            </nav>

            <div className="flex-1" />

            {/* Right actions */}
            <div className="flex items-center gap-1">

              {/* Phone */}
              <a href={`tel:${siteSettings.phone.replace(/[^\d+]/g, '')}`}
                className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 transition-all whitespace-nowrap"
                style={{ color: linkCol }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = linkCol}>
                <Phone size={15} className="text-[var(--accent)]" />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 600, letterSpacing: '0.01em' }}>
                  {siteSettings.phone}
                </span>
              </a>

              {/* Search */}
              <button onClick={() => setSearchOpen(v => !v)}
                className="p-2 hidden md:flex transition-all"
                style={{ color: searchOpen ? 'var(--accent)' : linkColMuted }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => { if (!searchOpen) e.currentTarget.style.color = linkColMuted }}>
                <Search size={17} />
              </button>

              {/* Lang switcher */}
              <div className="relative hidden lg:block" ref={langRef}>
                <button onClick={() => setLangOpen(v => !v)}
                  className="flex items-center gap-1 px-2.5 py-1.5 transition-all"
                  style={{ fontFamily: "'Rubik', sans-serif", fontSize: '13px', fontWeight: 500, letterSpacing: '0.01em', color: linkCol, border: solid ? '1px solid rgba(0,0,0,0.12)' : '1px solid rgba(255,255,255,0.3)', borderRadius: '0.5rem', transition: 'all 0.3s' }}>
                  {LANGS.find(l => l.code === lang)?.label ?? 'UA'}
                  <ChevronDown size={10} style={{ transition: 'transform 0.15s', transform: langOpen ? 'rotate(180deg)' : 'none' }} />
                </button>
                {langOpen && (
                  <div className="absolute top-full right-0 mt-0 w-16 z-50 overflow-hidden"
                    style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.08)', borderTop: '2px solid var(--accent)', borderRadius: '0.5rem', boxShadow: '0 16px 32px rgba(0,0,0,0.4)' }}>
                    {LANGS.map(l => (
                      <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false) }}
                        className="w-full flex items-center gap-1.5 px-2.5 py-2 transition-colors"
                        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: lang === l.code ? 'var(--accent)' : 'rgba(255,255,255,0.6)', background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,85,0,0.10)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <span>{l.flag}</span> {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link to="/cart" className="relative p-2 transition-all"
                style={{ color: linkColMuted }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = linkColMuted}>
                <ShoppingCart size={17} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-white text-xs w-5 h-5 flex items-center justify-center font-bold"
                    style={{ background: 'var(--accent)', borderRadius: '0.5rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px' }}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* CTA — Консультація (головна, оранжева заливка) + Стати партнером (оранжева рамка) */}
              <Link to="/partners"
                className="hidden xl:flex items-center gap-1.5 px-3 py-2 transition-all whitespace-nowrap"
                style={{ border: '2px solid var(--accent)', color: 'var(--accent)', fontFamily: "'Rubik', sans-serif", fontSize: '13px', fontWeight: 500, borderRadius: '0.5rem' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'white' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent)' }}>
                {t('navbar.becomePartner')}
              </Link>
              <Link to="/contacts"
                className="hidden xl:flex items-center gap-1.5 px-3 py-2 text-white transition-all whitespace-nowrap hover:opacity-85"
                style={{ background: 'var(--accent)', fontFamily: "'Rubik', sans-serif", fontSize: '13px', fontWeight: 500, borderRadius: '0.5rem' }}>
                {t('navbar.consultation')}
              </Link>

              {/* Mobile burger */}
              <button onClick={() => setMenuOpen(v => !v)} className="lg:hidden p-2 transition-colors" style={{ color: linkCol }}>
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <form onSubmit={handleSearch} className="pb-3 pt-1">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input ref={searchRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('navbar.searchPlaceholder')}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-[var(--bg-warm)]"
                  style={{ border: '1px solid var(--border)', borderBottom: '2px solid var(--accent)', borderRadius: '0.5rem', outline: 'none', fontFamily: "'IBM Plex Sans', sans-serif" }} />
              </div>
            </form>
          )}
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-[var(--border)]"
            style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)' }}>
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-0.5">

              <Link to="/catalog"
                className="px-3 py-2.5 transition-colors"
                style={{ ...navLinkStyle, color: isActive('/catalog') ? 'var(--accent)' : '#333', borderLeft: isActive('/catalog') ? '2px solid var(--accent)' : '2px solid transparent' }}>
                {t('nav.catalog')}
              </Link>

              <div className="px-3 py-1.5 mt-2" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-muted)' }}>
                {t('navbar.aboutTermojet')}
              </div>
              {aboutItems.map(i => (
                <Link key={i.to} to={i.to}
                  className="px-5 py-2 transition-colors"
                  style={{ ...navLinkStyle, color: '#555', fontSize: '10px' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = '#555'}>
                  {i.label}
                </Link>
              ))}

              <div className="px-3 py-1.5 mt-2" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-muted)' }}>
                {t('navbar.forClient')}
              </div>
              {clientItems.map(i => (
                <Link key={i.to} to={i.to}
                  className="px-5 py-2 transition-colors"
                  style={{ ...navLinkStyle, color: '#555', fontSize: '10px' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = '#555'}>
                  {i.label}
                </Link>
              ))}

              <a href="https://tjheatpump.com.ua/" target="_blank" rel="noopener noreferrer"
                className="px-3 py-2.5 flex items-center gap-2 transition-colors"
                style={{ ...navLinkStyle, color: '#444' }}>
                {t('navbar.heatPumps')} <ExternalLink size={11} />
              </a>

              <a href={`tel:${siteSettings.phone.replace(/[^\d+]/g, '')}`}
                className="px-3 py-2.5 mt-2 flex items-center gap-2 transition-colors"
                style={{ ...navLinkStyle, color: '#1a1a1a', fontWeight: 600 }}>
                <Phone size={15} className="text-[var(--accent)]" /> {siteSettings.phone}
              </a>

              <div className="flex gap-2 pt-3 border-t border-[var(--border)] mt-1">
                <Link to="/partners"
                  className="flex-1 py-2.5 text-center"
                  style={{ border: '2px solid var(--accent)', color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '0.5rem' }}>
                  {t('navbar.becomePartner')}
                </Link>
                <Link to="/contacts"
                  className="flex-1 py-2.5 text-white text-center"
                  style={{ background: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '0.5rem' }}>
                  {t('navbar.consultation')}
                </Link>
              </div>

              <div className="flex gap-1 pt-2 flex-wrap">
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => setLang(l.code)}
                    className="px-3 py-1.5 transition-colors"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', borderRadius: '0.5rem', background: lang === l.code ? 'var(--accent)' : 'transparent', color: lang === l.code ? 'white' : '#555', border: lang === l.code ? 'none' : '1px solid var(--border)' }}>
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
