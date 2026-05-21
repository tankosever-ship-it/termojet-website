import { useState, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ChevronRight, X, ArrowUpRight, Plus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import { CATEGORIES } from '../data/categories'
import SEO from '../components/SEO'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }
const stagger = { show: { transition: { staggerChildren: 0.04 } } }

function extractBadges(product) {
  const badges = []
  const name = product.name || ''
  const specs = product.specs || {}

  const specKeys = Object.keys(specs)
  if (specKeys.length > 0) {
    specKeys.slice(0, 3).forEach(k => {
      const val = String(specs[k]).split(',')[0].trim()
      if (val && val.length < 30) badges.push({ label: val, type: 'blue' })
    })
    return badges
  }

  const pumpMatch = name.match(/APM\s*(\d+)\/(\d+)\/(\d+)/)
  if (pumpMatch) {
    badges.push({ label: `Dn${pumpMatch[1]}`, type: 'blue' })
    badges.push({ label: `H=${pumpMatch[2]}м`, type: 'orange' })
    badges.push({ label: `L=${pumpMatch[3]}мм`, type: 'gray' })
    return badges
  }

  const kwMatch = name.match(/(\d+)\s*кВт/)
  if (kwMatch) badges.push({ label: `${kwMatch[1]} кВт`, type: 'orange' })

  const dnMatch = name.match(/DN\s*(\d+)|Dn\s*(\d+)|(\d+)\s*мм/)
  if (dnMatch) badges.push({ label: `DN${dnMatch[1] || dnMatch[2] || dnMatch[3]}`, type: 'blue' })

  const outMatch = name.match(/(\d+)\s*(вих|виход|контур)/)
  if (outMatch) badges.push({ label: `${outMatch[1]} вих`, type: 'gray' })

  const circMatch = name.match(/(\d+)\+(\d+)/)
  if (circMatch && !pumpMatch) badges.push({ label: `${circMatch[1]}+${circMatch[2]}`, type: 'blue' })

  return badges.slice(0, 3)
}

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

  const catProducts = useMemo(() => {
    if (!currentCategory) return products
    return products.filter(p => p.categorySlug === currentCategory.id || p.categorySlug === currentCategory.slug)
  }, [products, currentCategory])

  const filtered = useMemo(() => {
    let list = catProducts

    if (search) list = list.filter(p => {
      const name = (lang !== 'uk' && p[`name_${lang}`]) ? p[`name_${lang}`] : (p.name || '')
      return name.toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase())
    })
    if (inStockOnly) list = list.filter(p => p.inStock)
    if (sort === 'priceAsc')  list = [...list].sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0))
    if (sort === 'priceDesc') list = [...list].sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))
    if (sort === 'nameAsc')   list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    return list
  }, [catProducts, search, inStockOnly, sort, lang])

  return (
    <>
      <SEO title={currentCategory ? (currentCategory.name[lang] || currentCategory.name.uk) : cat.title} />

      {/* ── Page header ── */}
      <div className="relative overflow-hidden text-white py-8"
        style={{
          background: `
            radial-gradient(ellipse 70% 100% at 100% 100%, rgba(232,93,4,0.15), transparent 55%),
            radial-gradient(ellipse 50% 80% at 0% 0%, rgba(255,85,0,0.08), transparent 50%),
            linear-gradient(160deg, #080808, #111111)
          `
        }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(232,93,4,0.4)] to-transparent" />
        <div className="max-w-7xl mx-auto px-4">
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

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── Category pills — завжди зверху ── */}
        <div className="flex flex-wrap gap-2 mb-5">
          <Link to="/catalog"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium transition-all"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              background: !currentCategory ? 'var(--accent)' : 'transparent',
              color: !currentCategory ? 'white' : 'var(--text-secondary)',
              border: !currentCategory ? '1px solid var(--accent)' : '1px solid var(--border)',
            }}>
            Всі категорії
          </Link>
          {CATEGORIES.map(c => (
            <Link key={c.id} to={`/catalog/${c.slug}`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm transition-all"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                background: currentCategory?.id === c.id ? 'var(--accent)' : 'transparent',
                color: currentCategory?.id === c.id ? 'white' : 'var(--text-secondary)',
                border: currentCategory?.id === c.id ? '1px solid var(--accent)' : '1px solid var(--border)',
              }}>
              {c.icon} {c.name[lang] || c.name.uk}
              <span style={{ opacity: 0.6, fontSize: '10px' }}>({c.count})</span>
            </Link>
          ))}
        </div>

        {/* ── Toolbar: search + sort ── */}
        <div className="flex flex-wrap gap-2 mb-6 p-3 bg-white border border-[var(--ink-200)]">
          <div className="relative flex-1 min-w-40">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={cat.search}
              className="w-full pl-8 pr-8 py-2 border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm bg-gray-50/70" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 bg-gray-50/70 cursor-pointer text-sm text-gray-600 hover:border-[var(--primary)] transition-colors select-none">
            <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="accent-[var(--primary)] w-3.5 h-3.5" />
            {cat.filter.inStock}
          </label>

          <select value={sort} onChange={e => setSort(e.target.value)}
            className="px-3 py-2 border border-gray-200 bg-gray-50/70 text-sm focus:outline-none focus:border-[var(--primary)] text-gray-600">
            <option value="default">{cat.sort.default}</option>
            <option value="priceAsc">{cat.sort.priceAsc}</option>
            <option value="priceDesc">{cat.sort.priceDesc}</option>
            <option value="nameAsc">{cat.sort.nameAsc}</option>
          </select>
        </div>

        {/* ── Products grid ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-semibold mb-2 text-gray-600">{cat.noResults}</p>
            <p className="text-sm">Спробуйте змінити параметри пошуку</p>
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(product => {
              const name = (lang !== 'uk' && product[`name_${lang}`]) ? product[`name_${lang}`] : (product.name || '')
              const price = parseFloat(product.price)
              const catObj = CATEGORIES.find(c => c.slug === product.categorySlug || c.id === product.categorySlug)
              const badges = extractBadges(product)

              return (
                <motion.div key={product.id} variants={fadeUp}>
                  <div className="product-card-new group flex flex-col h-full">

                    <div className="relative overflow-hidden bg-[var(--bg)]" style={{ height: '200px' }}>
                      <Link to={`/catalog/${product.categorySlug || 'products'}/${product.slug || product.id}`}>
                        {product.image ? (
                          <img src={product.image} alt={name}
                            className="w-full h-full object-contain p-4 group-hover:scale-[1.06] transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200 text-6xl">⚙️</div>
                        )}
                      </Link>

                      {!product.inStock && (
                        <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 bg-gray-700 text-white rounded-full">
                          Під замовлення
                        </span>
                      )}

                      <div className="quick-bar">
                        <button onClick={() => addToCart(product)}
                          className="flex-1 flex items-center justify-center gap-1.5 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                          style={{ background: 'linear-gradient(135deg,var(--accent),#c94d00)' }}>
                          <Plus size={12} /> Швидка заявка
                        </button>
                        <Link to={`/catalog/${product.categorySlug || 'products'}/${product.slug || product.id}`}
                          className="w-9 h-9 flex items-center justify-center border border-[var(--ink-200)] rounded-lg hover:border-gray-400 transition-colors text-gray-500 hover:text-gray-800">
                          <ArrowUpRight size={14} />
                        </Link>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      {catObj && (
                        <div className="eyebrow mb-1.5 truncate">{catObj.name[lang] || catObj.name.uk}</div>
                      )}

                      <Link to={`/catalog/${product.categorySlug || 'products'}/${product.slug || product.id}`}>
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[var(--primary)] transition-colors line-clamp-2 mb-3 leading-snug">
                          {name}
                        </h3>
                      </Link>

                      {badges.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {badges.map((b, i) => (
                            <span key={i} className={`spec-badge spec-badge-${b.type}`}>{b.label}</span>
                          ))}
                        </div>
                      )}

                      {price > 0 && (
                        <div className="text-sm font-bold text-[var(--primary)] mb-2">
                          {price.toLocaleString('uk-UA')} ₴
                        </div>
                      )}

                      <div className="mt-auto flex items-center justify-between pt-2.5 border-t border-[var(--ink-200)]">
                        <div className="text-[10px] font-mono text-gray-400 truncate max-w-[60%]">{product.sku || '—'}</div>
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
