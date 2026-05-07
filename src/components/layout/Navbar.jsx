import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, Menu, X, ChevronDown, Phone } from 'lucide-react'
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

  useEffect(() => { setMenuOpen(false); setCatalogOpen(false) }, [location.pathname])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

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
      {/* Top bar */}
      <div className="hidden md:block bg-[var(--primary)] text-white/80 text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>Виробник обладнання для котелень з 2002 року • Київ, Україна</span>
          <div className="flex items-center gap-4">
            <a href={`tel:${siteSettings.phone}`} className="flex items-center gap-1 hover:text-white transition-colors">
              <Phone size={11} />
              {siteSettings.phone}
            </a>
            <a href={`mailto:${siteSettings.email}`} className="hover:text-white transition-colors">
              {siteSettings.email}
            </a>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-md' : 'bg-white border-b border-[var(--border)]'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 h-16">

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <img src={assetPath('/logo.png')} alt="Termojet" className="h-9 w-auto" onError={e => { e.target.style.display='none' }} />
              <span className="font-black text-xl tracking-tight text-[var(--primary)] font-['Montserrat',sans-serif] hidden sm:block">
                TERMOJET
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 ml-4">
              {/* Catalog with mega-menu */}
              <div className="relative" ref={catalogRef}>
                <button
                  onClick={() => setCatalogOpen(v => !v)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/catalog') ? 'text-[var(--primary)] bg-blue-50' : 'text-gray-700 hover:text-[var(--primary)] hover:bg-gray-50'}`}
                >
                  {nav.catalog}
                  <ChevronDown size={14} className={`transition-transform ${catalogOpen ? 'rotate-180' : ''}`} />
                </button>

                {catalogOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-2xl shadow-xl border border-[var(--border)] p-4 w-[720px] grid grid-cols-3 gap-2 z-50">
                    {CATEGORIES.map(cat => (
                      <Link
                        key={cat.id}
                        to={`/catalog/${cat.slug}`}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <span className="text-2xl mt-0.5">{cat.icon}</span>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-[var(--primary)] transition-colors leading-tight">
                            {cat.name[lang] || cat.name.uk}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{cat.count} товарів</div>
                        </div>
                      </Link>
                    ))}
                    <div className="col-span-3 pt-2 border-t border-gray-100 mt-1">
                      <Link to="/catalog" className="btn-primary text-sm py-2 px-4">
                        Переглянути весь каталог →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link to="/about" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/about') ? 'text-[var(--primary)] bg-blue-50' : 'text-gray-700 hover:text-[var(--primary)] hover:bg-gray-50'}`}>
                {nav.about}
              </Link>
              <Link to="/portfolio" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/portfolio') ? 'text-[var(--primary)] bg-blue-50' : 'text-gray-700 hover:text-[var(--primary)] hover:bg-gray-50'}`}>
                {nav.portfolio}
              </Link>
              <Link to="/blog" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/blog') ? 'text-[var(--primary)] bg-blue-50' : 'text-gray-700 hover:text-[var(--primary)] hover:bg-gray-50'}`}>
                {nav.blog}
              </Link>
              <Link to="/dealers" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/dealers') ? 'text-[var(--primary)] bg-blue-50' : 'text-gray-700 hover:text-[var(--primary)] hover:bg-gray-50'}`}>
                {nav.dealers}
              </Link>
              <Link to="/contacts" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/contacts') ? 'text-[var(--primary)] bg-blue-50' : 'text-gray-700 hover:text-[var(--primary)] hover:bg-gray-50'}`}>
                {nav.contacts}
              </Link>
            </nav>

            <div className="flex-1 lg:flex-none" />

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button onClick={() => setSearchOpen(v => !v)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-[var(--primary)]">
                <Search size={20} />
              </button>

              {/* Lang switcher */}
              <div className="hidden md:flex items-center border border-gray-200 rounded-lg overflow-hidden">
                {LANGS.map(l => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`px-2 py-1 text-xs font-bold transition-colors ${lang === l.code ? 'bg-[var(--primary)] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              {/* Cart */}
              <Link to="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-[var(--primary)]">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--accent)] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Burger */}
              <button onClick={() => setMenuOpen(v => !v)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <form onSubmit={handleSearch} className="pb-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={nav.search}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm bg-gray-50"
                />
              </div>
            </form>
          )}
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              <Link to="/catalog" className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{nav.catalog}</Link>
              <Link to="/about" className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{nav.about}</Link>
              <Link to="/portfolio" className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{nav.portfolio}</Link>
              <Link to="/blog" className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{nav.blog}</Link>
              <Link to="/dealers" className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{nav.dealers}</Link>
              <Link to="/contacts" className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{nav.contacts}</Link>
              <div className="flex gap-1 pt-2 border-t border-gray-100 mt-1">
                {LANGS.map(l => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${lang === l.code ? 'bg-[var(--primary)] text-white' : 'text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                  >
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
