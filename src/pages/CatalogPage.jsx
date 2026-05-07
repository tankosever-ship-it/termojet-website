import { useState, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Search, Filter, ShoppingCart, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import { CATEGORIES } from '../data/categories'
import SEO from '../components/SEO'

export default function CatalogPage() {
  const { categorySlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
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
    if (sort === 'priceAsc') list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0))
    if (sort === 'priceDesc') list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0))
    if (sort === 'nameAsc') list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    return list
  }, [products, currentCategory, search, inStockOnly, sort, lang])

  return (
    <>
      <SEO title={currentCategory ? (currentCategory.name[lang] || currentCategory.name.uk) : cat.title} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="label-accent mb-2">Обладнання Termojet</div>
          <h1 className="section-title">
            {currentCategory ? (currentCategory.name[lang] || currentCategory.name.uk) : cat.title}
          </h1>
          {currentCategory && (
            <p className="text-gray-500 mt-2">{currentCategory.desc[lang] || currentCategory.desc.uk}</p>
          )}
        </div>

        {/* Category pills */}
        {!categorySlug && (
          <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map(c => (
              <Link
                key={c.id}
                to={`/catalog/${c.slug}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
              >
                {c.icon} {c.name[lang] || c.name.uk}
                <span className="text-xs text-gray-400">({c.count})</span>
              </Link>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-60">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={cat.search}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm bg-white"
            />
          </div>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white cursor-pointer text-sm">
            <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="accent-[var(--primary)]" />
            {cat.filter.inStock}
          </label>

          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="default">{cat.sort.default}</option>
            <option value="priceAsc">{cat.sort.priceAsc}</option>
            <option value="priceDesc">{cat.sort.priceDesc}</option>
            <option value="nameAsc">{cat.sort.nameAsc}</option>
          </select>
        </div>

        {/* Products grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium mb-2">{cat.noResults}</p>
            <p className="text-sm">Спробуйте змінити параметри пошуку</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(product => {
              const name = (lang !== 'uk' && product[`name_${lang}`]) ? product[`name_${lang}`] : (product.name || '')
              return (
                <div key={product.id} className="card card-hover flex flex-col">
                  <Link to={`/catalog/${product.categorySlug || 'products'}/${product.slug || product.id}`}>
                    {product.image ? (
                      <img src={product.image} alt={name} className="w-full h-44 object-contain p-3 bg-gray-50 rounded-t-xl" />
                    ) : (
                      <div className="w-full h-44 bg-gray-50 rounded-t-xl flex items-center justify-center text-gray-300 text-5xl">⚙️</div>
                    )}
                  </Link>
                  <div className="p-4 flex flex-col flex-1">
                    {product.sku && (
                      <div className="text-xs text-gray-400 mb-1">{cat.article} {product.sku}</div>
                    )}
                    <Link to={`/catalog/${product.categorySlug || 'products'}/${product.slug || product.id}`}>
                      <h3 className="text-sm font-semibold text-gray-900 hover:text-[var(--primary)] transition-colors line-clamp-2 mb-2 flex-1">
                        {name}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between mt-auto pt-2">
                      {product.price ? (
                        <span className="font-bold text-gray-900">
                          {product.price.toLocaleString()} {t('common').uah}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Ціна по запиту</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${product.inStock ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        {product.inStock ? cat.inStock : cat.outOfStock}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className="mt-3 w-full flex items-center justify-center gap-2 bg-[var(--primary)] text-white text-sm font-medium py-2.5 rounded-xl hover:bg-[var(--primary-light)] transition-colors"
                    >
                      <ShoppingCart size={14} />
                      {cat.addToCart}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
