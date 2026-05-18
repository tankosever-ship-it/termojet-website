import { useState, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ShoppingCart, ChevronRight, X, Bookmark, ArrowUpRight, Plus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import { CATEGORIES } from '../data/categories'
import SEO from '../components/SEO'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}
const stagger = { show: { transition: { staggerChildren: 0.04 } } }

export default function CatalogPage() {
  const { categorySlug } = useParams()
  const [searchParams] = useSearchParams()
  const { products, lang, addToCart } = useApp()
  const t = useT()
  const cat = t('catalog')

  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sort, setSort] = useState('default')

  const currentCategory = categorySlug ? CATEGORIES.find(c => c.slug === categorySlug) : null

  const filtered = useMemo(() => {
    let list = products
    if (currentCategory) list = list.filter(p => p.categorySlug === currentCategory.id || p.categorySlug === currentCategory.slug)
    if (search) list = list.filter(p => {
      const name = (lang !== 'uk' && p[`name_${lang}`]) ? p[`name_${lang}`] : (p.name || '')
      return name.toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase())
    })
    if (inStockOnly) list = list.filter(p => p.inStock)
    if (sort === 'priceAsc') list = [...list].sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0))
    if (sort === 'priceDesc') list = [...list].sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))
    if (sort === 'nameAsc') list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    return list
  }, [products, currentCategory, search, inStockOnly, sort, lang])

  return (
    <>
      <SEO title={currentCategory ? (currentCategory.name[lang] || currentCategory.name.uk) : cat.title} />

      {/* ─── Page header with gradient ─── */}
      <div className="relative overflow-hidden text-white py-10"
        style={{
          background: `
            radial-gradient(ellipse 70% 100% at 100% 100%, rgba(232,93,4,0.15), transparent 55%),
            radial-gradient(ellipse 50% 80% at 0% 0%, rgba(36,87,160,0.2), transparent 50%),
            linear-gradient(160deg, #0a1628, #1B3F6B)
          `
        }}>
        <div className="absolute inset-0 bg-dots pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(232,93,4,0.4)] to-transparent" />
        <div className="max-w-7xl mx-auto px-4">
          {/* breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
            <Link to="/" className="hover:text-white/70 transition-colors">Головна</Link>
            <ChevronRight size={12} />
            {currentCategory ? (
              <>
                <Link to="/catalog" className="hover:text-white/70 transition-colors">Каталог</Link>
                <ChevronRight size={12} />
                <span className="text-white/70">{currentCategory.name[lang] || currentCategory.name.uk}</span>
              </>
            ) : (
              <span className="text-white/70">Каталог</span>
            )}
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              {currentCategory && (
                <span className="text-3xl block mb-2">{currentCategory.icon}</span>
              )}
              <h1 className="text-3xl md:text-4xl font-black font-['Archivo',sans-serif]">
                {currentCategory ? (currentCategory.name[lang] || currentCategory.name.uk) : cat.title}
              </h1>
              {currentCategory && (
                <p className="text-white/60 mt-1.5 text-sm">{currentCategory.desc[lang] || currentCategory.desc.uk}</p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-3xl font-black font-['Archivo',sans-serif]">{filtered.length}</div>
              <div className="text-white/50 text-xs">товарів</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ─── Category pills (only on /catalog) ─── */}
        {!categorySlug && (
          <div className="flex flex-wrap gap-2 mb-7">
            {CATEGORIES.map(c => (
              <Link key={c.id} to={`/catalog/${c.slug}`}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[var(--border)] text-sm font-medium hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-sm transition-all">
                {c.icon} {c.name[lang] || c.name.uk}
                <span className="text-xs text-gray-400 font-normal">({c.count})</span>
              </Link>
            ))}
          </div>
        )}

        {/* ─── Filters bar ─── */}
        <div className="flex flex-wrap gap-3 mb-7 p-3 bg-white rounded-2xl border border-[var(--border)] shadow-sm">
          <div className="relative flex-1 min-w-52">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={cat.search}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(27,63,107,0.07)] text-sm bg-gray-50/70" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50/70 cursor-pointer text-sm font-medium text-gray-600 hover:border-[var(--primary)] transition-colors select-none">
            <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="accent-[var(--primary)] w-4 h-4" />
            {cat.filter.inStock}
          </label>

          <select value={sort} onChange={e => setSort(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50/70 text-sm focus:outline-none focus:border-[var(--primary)] font-medium text-gray-600">
            <option value="default">{cat.sort.default}</option>
            <option value="priceAsc">{cat.sort.priceAsc}</option>
            <option value="priceDesc">{cat.sort.priceDesc}</option>
            <option value="nameAsc">{cat.sort.nameAsc}</option>
          </select>

          {(search || inStockOnly) && (
            <button onClick={() => { setSearch(''); setInStockOnly(false) }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-400 transition-colors">
              <X size={14} /> Скинути
            </button>
          )}
        </div>

        {/* ─── Products grid ─── */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-semibold mb-2 text-gray-600">{cat.noResults}</p>
            <p className="text-sm">Спробуйте змінити параметри пошуку</p>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {filtered.map(product => {
              const name = (lang !== 'uk' && product[`name_${lang}`]) ? product[`name_${lang}`] : (product.name || '')
              const price = parseFloat(product.price)
              const catObj = CATEGORIES.find(c => c.slug === product.categorySlug || c.id === product.categorySlug)
              const specEntries = product.specs ? Object.entries(product.specs).slice(0, 3) : []

              return (
                <motion.div key={product.id} variants={fadeUp}>
                  <div className="product-card-new group flex flex-col h-full">

                    {/* Image area */}
                    <div className="relative overflow-hidden h-44 bg-[var(--bg)]">
                      <Link to={`/catalog/${product.categorySlug || 'products'}/${product.slug || product.id}`}>
                        {product.image ? (
                          <img src={product.image} alt={name}
                            className="w-full h-full object-contain p-3 group-hover:scale-[1.04] transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">⚙️</div>
                        )}
                      </Link>

                      {/* NEW/HIT badge */}
                      <div className="absolute top-2 left-2 flex gap-1">
                        {!product.inStock && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-800 text-white rounded-full">Під замовлення</span>
                        )}
                      </div>

                      {/* Quick-action bar */}
                      <div className="quick-bar">
                        <button
                          onClick={() => addToCart(product)}
                          className="flex-1 flex items-center justify-center gap-1.5 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                          style={{ background: 'linear-gradient(135deg,var(--accent),#c94d00)' }}
                        >
                          <Plus size={12} /> Швидка заявка
                        </button>
                        <Link
                          to={`/catalog/${product.categorySlug || 'products'}/${product.slug || product.id}`}
                          className="w-9 h-9 flex items-center justify-center border border-[var(--ink-200)] rounded-lg hover:border-gray-400 transition-colors text-gray-500 hover:text-gray-800"
                        >
                          <ArrowUpRight size={14} />
                        </Link>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col flex-1">
                      {/* Category label */}
                      {catObj && (
                        <div className="eyebrow mb-1.5 truncate">
                          {catObj.name[lang] || catObj.name.uk}
                        </div>
                      )}

                      <Link to={`/catalog/${product.categorySlug || 'products'}/${product.slug || product.id}`}>
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[var(--primary)] transition-colors line-clamp-2 mb-2.5 leading-snug">
                          {name}
                        </h3>
                      </Link>

                      {/* Spec pills */}
                      {specEntries.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {specEntries.map(([, v]) => (
                            <span key={v} className="spec-pill">{String(v).split(',')[0].trim()}</span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="mt-auto flex items-center justify-between pt-2 border-t border-[var(--ink-200)]">
                        <div className="text-[10px] font-mono text-gray-400 truncate">{product.sku || '—'}</div>
                        <div className={`text-[10px] font-semibold flex items-center gap-1 ${product.inStock ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: product.inStock ? '#22c55e' : '#9ca3af' }} />
                          {product.inStock ? 'В наявності' : 'Замовлення'}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </>
  )
}
