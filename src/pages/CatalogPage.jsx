import { useState, useMemo } from 'react'
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ChevronRight, X, ArrowUpRight, Plus, SlidersHorizontal } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import { CATEGORIES } from '../data/categories'
import SEO from '../components/SEO'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}
const stagger = { show: { transition: { staggerChildren: 0.04 } } }

// ── Extract feature badges from product name / specs ──────────────────────────
function extractBadges(product) {
  const badges = []
  const name = product.name || ''
  const specs = product.specs || {}

  // From specs object
  const specKeys = Object.keys(specs)
  if (specKeys.length > 0) {
    specKeys.slice(0, 3).forEach(k => {
      const val = String(specs[k]).split(',')[0].trim()
      if (val && val.length < 30) badges.push({ label: val, type: 'blue' })
    })
    return badges
  }

  // Parse from product name: e.g. APM 25/8/180
  const pumpMatch = name.match(/APM\s*(\d+)\/(\d+)\/(\d+)/)
  if (pumpMatch) {
    badges.push({ label: `Dn${pumpMatch[1]}`, type: 'blue' })
    badges.push({ label: `H=${pumpMatch[2]}м`, type: 'orange' })
    badges.push({ label: `L=${pumpMatch[3]}мм`, type: 'gray' })
    return badges
  }

  // Collector pattern: e.g. 125(150) or 60кВт
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

// ── Static filter options (from catalog structure analysis) ──────────────────
const POWER_FILTERS = [
  { label: 'до 30 кВт',    test: (n) => { const m = n.match(/(\d+)\s*кВт/i); return m && parseInt(m[1]) <= 30 } },
  { label: '30–60 кВт',   test: (n) => { const m = n.match(/(\d+)\s*кВт/i); return m && parseInt(m[1]) > 30 && parseInt(m[1]) <= 60 } },
  { label: '60–105 кВт',  test: (n) => { const m = n.match(/(\d+)\s*кВт/i); return m && parseInt(m[1]) > 60 && parseInt(m[1]) <= 105 } },
  { label: '105–175 кВт', test: (n) => { const m = n.match(/(\d+)\s*кВт/i); return m && parseInt(m[1]) > 105 && parseInt(m[1]) <= 175 } },
  { label: 'понад 175 кВт',test: (n) => { const m = n.match(/(\d+)\s*кВт/i); return m && parseInt(m[1]) > 175 } },
]

const PURPOSE_FILTERS = [
  { label: 'Тепла підлога',  keywords: ['підлог', 'підлоги', 'floor', 'теплої підлоги', 'MU', 'байпас'] },
  { label: 'Радіаторне',     keywords: ['радіатор', 'radiator'] },
  { label: 'ГВС / бойлер',  keywords: ['бойлер', 'bojler', 'ГВС', 'гвс', 'НГ-67'] },
  { label: 'Промислові',     keywords: ['Mega', 'мегa', '2 МВт', 'фланц'] },
]

const INSULATION_FILTERS = [
  { label: 'Теплоізоляція', keywords: ['теплоізол', 'ізоляц', 'EPP', 'izolyac'] },
  { label: 'EPP BLACK',     keywords: ['EPP BLACK', 'epp black'] },
]

const SERIES_FILTERS = [
  { label: 'Mini (до 30 кВт)',  slugs: ['termojet-mini'] },
  { label: 'TERMOJET BOX',      slugs: ['termojet-box'] },
  { label: 'Mega (до 2 МВт)',   slugs: ['termojet-mega', 'mega'] },
  { label: 'Стандарт',          slugs: ['rozpodilchi-kolektory', 'nasosni-hrupy', 'hidravlichni-rozdilnyky'] },
]

function matchesKeywords(product, keywords) {
  const text = `${product.name || ''} ${product.description || ''}`.toLowerCase()
  return keywords.some(k => text.includes(k.toLowerCase()))
}

export default function CatalogPage() {
  const { categorySlug } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { products, lang, addToCart } = useApp()
  const t = useT()
  const cat = t('catalog')

  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sort, setSort] = useState('default')
  const [filterPower, setFilterPower] = useState('')
  const [filterPurpose, setFilterPurpose] = useState('')
  const [filterInsulation, setFilterInsulation] = useState('')
  const [filterSeries, setFilterSeries] = useState('')
  const [mobileFilters, setMobileFilters] = useState(false)

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

    if (filterPower) {
      const rule = POWER_FILTERS.find(f => f.label === filterPower)
      if (rule) list = list.filter(p => rule.test(p.name || ''))
    }
    if (filterPurpose) {
      const rule = PURPOSE_FILTERS.find(f => f.label === filterPurpose)
      if (rule) list = list.filter(p => matchesKeywords(p, rule.keywords))
    }
    if (filterInsulation) {
      const rule = INSULATION_FILTERS.find(f => f.label === filterInsulation)
      if (rule) list = list.filter(p => matchesKeywords(p, rule.keywords))
    }
    if (filterSeries) {
      const rule = SERIES_FILTERS.find(f => f.label === filterSeries)
      if (rule) list = list.filter(p => rule.slugs.some(s => (p.categorySlug || '').includes(s)))
    }

    if (sort === 'priceAsc')  list = [...list].sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0))
    if (sort === 'priceDesc') list = [...list].sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))
    if (sort === 'nameAsc')   list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    return list
  }, [catProducts, search, inStockOnly, sort, filterPower, filterPurpose, filterInsulation, filterSeries, lang])

  const hasFilters = search || inStockOnly || filterPower || filterPurpose || filterInsulation || filterSeries
  const resetFilters = () => {
    setSearch(''); setInStockOnly(false)
    setFilterPower(''); setFilterPurpose(''); setFilterInsulation(''); setFilterSeries('')
  }

  return (
    <>
      <SEO title={currentCategory ? (currentCategory.name[lang] || currentCategory.name.uk) : cat.title} />

      {/* ── Page header ── */}
      <div className="relative overflow-hidden text-white py-8"
        style={{
          background: `
            radial-gradient(ellipse 70% 100% at 100% 100%, rgba(232,93,4,0.15), transparent 55%),
            radial-gradient(ellipse 50% 80% at 0% 0%, rgba(36,87,160,0.2), transparent 50%),
            linear-gradient(160deg, #0a1628, #1B3F6B)
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
        <div className="flex gap-6">

          {/* ── Sidebar ── */}
          <aside className="hidden lg:flex flex-col gap-4 w-56 flex-shrink-0">

            {/* Categories */}
            <div className="bg-white rounded-2xl border border-[var(--ink-200)] overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--ink-200)] flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Категорії</span>
                {currentCategory && (
                  <Link to="/catalog" className="text-xs text-[var(--accent)] hover:underline">Всі</Link>
                )}
              </div>
              <nav className="py-1.5">
                {CATEGORIES.map(c => (
                  <Link
                    key={c.id}
                    to={`/catalog/${c.slug}`}
                    className={`flex items-center justify-between gap-2 px-4 py-2 text-sm transition-colors ${
                      currentCategory?.id === c.id
                        ? 'bg-[var(--primary)]/8 text-[var(--primary)] font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="flex-shrink-0">{c.icon}</span>
                      <span className="leading-snug">{c.name[lang] || c.name.uk}</span>
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{c.count}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-[var(--ink-200)] overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--ink-200)] flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Фільтри</span>
                {hasFilters && (
                  <button onClick={resetFilters} className="text-xs text-[var(--accent)] hover:underline">Скинути</button>
                )}
              </div>
              <div className="p-3 space-y-5">
                {/* Power */}
                <div>
                  <div className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Потужність</div>
                  {POWER_FILTERS.map(f => (
                    <label key={f.label} className="flex items-center gap-2 py-0.5 cursor-pointer group">
                      <input type="radio" name="power" checked={filterPower === f.label}
                        onChange={() => setFilterPower(filterPower === f.label ? '' : f.label)}
                        className="accent-[var(--accent)] w-3.5 h-3.5" />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900">{f.label}</span>
                    </label>
                  ))}
                </div>

                {/* Purpose */}
                <div>
                  <div className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Призначення</div>
                  {PURPOSE_FILTERS.map(f => (
                    <label key={f.label} className="flex items-center gap-2 py-0.5 cursor-pointer group">
                      <input type="radio" name="purpose" checked={filterPurpose === f.label}
                        onChange={() => setFilterPurpose(filterPurpose === f.label ? '' : f.label)}
                        className="accent-[var(--accent)] w-3.5 h-3.5" />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900">{f.label}</span>
                    </label>
                  ))}
                </div>

                {/* Insulation */}
                <div>
                  <div className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Теплоізоляція</div>
                  {INSULATION_FILTERS.map(f => (
                    <label key={f.label} className="flex items-center gap-2 py-0.5 cursor-pointer group">
                      <input type="radio" name="insulation" checked={filterInsulation === f.label}
                        onChange={() => setFilterInsulation(filterInsulation === f.label ? '' : f.label)}
                        className="accent-[var(--accent)] w-3.5 h-3.5" />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900">{f.label}</span>
                    </label>
                  ))}
                </div>

                {/* Series (only on /catalog root) */}
                {!categorySlug && (
                  <div>
                    <div className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Серія</div>
                    {SERIES_FILTERS.map(f => (
                      <label key={f.label} className="flex items-center gap-2 py-0.5 cursor-pointer group">
                        <input type="radio" name="series" checked={filterSeries === f.label}
                          onChange={() => setFilterSeries(filterSeries === f.label ? '' : f.label)}
                          className="accent-[var(--accent)] w-3.5 h-3.5" />
                        <span className="text-sm text-gray-600 group-hover:text-gray-900">{f.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">

            {/* Filters bar */}
            <div className="flex flex-wrap gap-2 mb-5 p-3 bg-white rounded-2xl border border-[var(--ink-200)] shadow-sm">
              <div className="relative flex-1 min-w-40">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={cat.search}
                  className="w-full pl-8 pr-8 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm bg-gray-50/70" />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={13} />
                  </button>
                )}
              </div>

              <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50/70 cursor-pointer text-sm text-gray-600 hover:border-[var(--primary)] transition-colors select-none">
                <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="accent-[var(--primary)] w-3.5 h-3.5" />
                {cat.filter.inStock}
              </label>

              <select value={sort} onChange={e => setSort(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50/70 text-sm focus:outline-none focus:border-[var(--primary)] text-gray-600">
                <option value="default">{cat.sort.default}</option>
                <option value="priceAsc">{cat.sort.priceAsc}</option>
                <option value="priceDesc">{cat.sort.priceDesc}</option>
                <option value="nameAsc">{cat.sort.nameAsc}</option>
              </select>

              {/* Mobile filters toggle */}
              <button onClick={() => setMobileFilters(v => !v)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600">
                <SlidersHorizontal size={14} /> Фільтри
              </button>

              {hasFilters && (
                <button onClick={resetFilters}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-400 transition-colors">
                  <X size={13} /> Скинути
                </button>
              )}
            </div>

            {/* Mobile filters panel */}
            {mobileFilters && (
              <div className="lg:hidden mb-5 p-4 bg-white rounded-2xl border border-[var(--ink-200)]">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <div className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Потужність</div>
                    {POWER_FILTERS.map(f => (
                      <label key={f.label} className="flex items-center gap-2 py-0.5 cursor-pointer">
                        <input type="radio" name="power-m" checked={filterPower === f.label}
                          onChange={() => setFilterPower(filterPower === f.label ? '' : f.label)}
                          className="accent-[var(--accent)] w-3.5 h-3.5" />
                        <span className="text-sm text-gray-600">{f.label}</span>
                      </label>
                    ))}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Призначення</div>
                    {PURPOSE_FILTERS.map(f => (
                      <label key={f.label} className="flex items-center gap-2 py-0.5 cursor-pointer">
                        <input type="radio" name="purpose-m" checked={filterPurpose === f.label}
                          onChange={() => setFilterPurpose(filterPurpose === f.label ? '' : f.label)}
                          className="accent-[var(--accent)] w-3.5 h-3.5" />
                        <span className="text-sm text-gray-600">{f.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Category pills — only on /catalog root */}
            {!categorySlug && (
              <div className="flex flex-wrap gap-2 mb-5">
                {CATEGORIES.map(c => (
                  <Link key={c.id} to={`/catalog/${c.slug}`}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[var(--border)] text-sm font-medium hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-sm transition-all">
                    {c.icon} {c.name[lang] || c.name.uk}
                    <span className="text-xs text-gray-400">({c.count})</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Products grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-24 text-gray-400">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-lg font-semibold mb-2 text-gray-600">{cat.noResults}</p>
                <p className="text-sm">Спробуйте змінити параметри пошуку або фільтри</p>
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

                        {/* Image area — taller */}
                        <div className="relative overflow-hidden bg-[var(--bg)]" style={{ height: '200px' }}>
                          <Link to={`/catalog/${product.categorySlug || 'products'}/${product.slug || product.id}`}>
                            {product.image ? (
                              <img src={product.image} alt={name}
                                className="w-full h-full object-contain p-4 group-hover:scale-[1.06] transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-200 text-6xl">⚙️</div>
                            )}
                          </Link>

                          {/* Status badge */}
                          {!product.inStock && (
                            <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 bg-gray-700 text-white rounded-full">
                              Під замовлення
                            </span>
                          )}

                          {/* Quick-action bar */}
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

                        {/* Info */}
                        <div className="p-4 flex flex-col flex-1">
                          {catObj && (
                            <div className="eyebrow mb-1.5 truncate">{catObj.name[lang] || catObj.name.uk}</div>
                          )}

                          <Link to={`/catalog/${product.categorySlug || 'products'}/${product.slug || product.id}`}>
                            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[var(--primary)] transition-colors line-clamp-2 mb-3 leading-snug">
                              {name}
                            </h3>
                          </Link>

                          {/* Spec badges */}
                          {badges.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {badges.map((b, i) => (
                                <span key={i} className={`spec-badge spec-badge-${b.type}`}>{b.label}</span>
                              ))}
                            </div>
                          )}

                          {/* Price */}
                          {price > 0 && (
                            <div className="text-sm font-bold text-[var(--primary)] mb-2">
                              {price.toLocaleString('uk-UA')} ₴
                            </div>
                          )}

                          {/* Footer */}
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
        </div>
      </div>
    </>
  )
}
