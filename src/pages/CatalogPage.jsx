import { useState, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ShoppingCart, ChevronRight, SlidersHorizontal, X } from 'lucide-react'
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
              <h1 className="text-3xl md:text-4xl font-black font-['Montserrat',sans-serif]">
                {currentCategory ? (currentCategory.name[lang] || currentCategory.name.uk) : cat.title}
              </h1>
              {currentCategory && (
                <p className="text-white/60 mt-1.5 text-sm">{currentCategory.desc[lang] || currentCategory.desc.uk}</p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-3xl font-black font-['Montserrat',sans-serif]">{filtered.length}</div>
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
              return (
                <motion.div key={product.id} variants={fadeUp} className="group">
                  <div className="card flex flex-col h-full relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_rgba(27,63,107,0.14)] hover:-translate-y-1 hover:border-[rgba(27,63,107,0.2)]">
                    {/* gradient border on hover */}
                    <div className="absolute inset-0 rounded-[1rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{ background: 'linear-gradient(135deg, rgba(27,63,107,0.06) 0%, rgba(232,93,4,0.04) 100%)' }} />

                    {/* Image */}
                    <Link to={`/catalog/${product.categorySlug || 'products'}/${product.slug || product.id}`} className="relative block">
                      {product.image ? (
                        <img src={product.image} alt={name}
                          className="w-full h-44 object-contain p-3 bg-gray-50/80 rounded-t-[1rem] group-hover:scale-[1.02] transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-44 bg-gray-50 rounded-t-[1rem] flex items-center justify-center text-gray-300 text-5xl">⚙️</div>
                      )}
                      {/* Stock badge */}
                      <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-semibold ${
                        product.inStock
                          ? 'bg-green-50 text-green-600 border border-green-100'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}>
                        {product.inStock ? '● В наявності' : '○ Під замовлення'}
                      </span>
                    </Link>

                    {/* Info */}
                    <div className="p-4 flex flex-col flex-1 relative">
                      {product.sku && (
                        <div className="text-xs text-gray-400 mb-1 font-mono">{product.sku}</div>
                      )}
                      <Link to={`/catalog/${product.categorySlug || 'products'}/${product.slug || product.id}`}>
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[var(--primary)] transition-colors line-clamp-2 mb-3 leading-snug">
                          {name}
                        </h3>
                      </Link>

                      <div className="mt-auto">
                        {price ? (
                          <div className="text-lg font-black text-gray-900 mb-2">
                            {price.toLocaleString('uk-UA')} <span className="text-sm font-medium text-gray-500">{t('common').uah}</span>
                          </div>
                        ) : (
                          <div className="text-sm font-medium text-gray-400 mb-2">Ціна по запиту</div>
                        )}

                        <button onClick={() => addToCart(product)}
                          className="w-full flex items-center justify-center gap-2 text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-200 hover:shadow-[0_4px_14px_rgba(232,93,4,0.35)] active:scale-[0.97]"
                          style={{ background: 'linear-gradient(135deg, var(--accent), #c94d00)' }}>
                          <ShoppingCart size={14} />
                          {cat.addToCart}
                        </button>
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
