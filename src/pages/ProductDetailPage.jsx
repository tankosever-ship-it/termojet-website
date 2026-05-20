import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Plus, Minus, ChevronRight, Download, Phone, Package } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import { CATEGORIES } from '../data/categories'
import SEO from '../components/SEO'

const TABS = ['description', 'specs', 'docs']

export default function ProductDetailPage() {
  const { categorySlug, productSlug } = useParams()
  const { products, lang, addToCart, siteSettings } = useApp()
  const t = useT()
  const pt = t('product')
  const cat = t('catalog')
  const common = t('common')

  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('description')
  const [added, setAdded] = useState(false)

  const product = products.find(p =>
    (p.slug === productSlug || p.id === productSlug) &&
    (p.categorySlug === categorySlug || !categorySlug)
  )

  const category = CATEGORIES.find(c => c.slug === categorySlug)
  const related = products.filter(p => p.categorySlug === categorySlug && p.id !== product?.id).slice(0, 4)

  function handleAddToCart() {
    if (!product) return
    addToCart(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Package size={56} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Товар не знайдено</h2>
        <p className="text-gray-400 mb-6">Можливо, він був переміщений або видалений</p>
        <Link to="/catalog" className="btn-primary">{cat.title}</Link>
      </div>
    )
  }

  const name = (lang !== 'uk' && product[`name_${lang}`]) ? product[`name_${lang}`] : (product.name || '')
  const desc = (lang !== 'uk' && product[`desc_${lang}`]) ? product[`desc_${lang}`] : (product.desc || product.description || '')

  return (
    <>
      <SEO title={name} description={desc?.slice(0, 160)} />

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-1.5 text-sm text-gray-500">
          <Link to="/" className="hover:text-[var(--primary)] transition-colors">Головна</Link>
          <ChevronRight size={13} />
          <Link to="/catalog" className="hover:text-[var(--primary)] transition-colors">{t('nav').catalog}</Link>
          {category && (
            <>
              <ChevronRight size={13} />
              <Link to={`/catalog/${categorySlug}`} className="hover:text-[var(--primary)] transition-colors">
                {category.name[lang] || category.name.uk}
              </Link>
            </>
          )}
          <ChevronRight size={13} />
          <span className="text-gray-900 font-medium truncate max-w-48">{name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">

          {/* Image */}
          <div className="card p-6 flex items-center justify-center min-h-80">
            {product.image ? (
              <img src={product.image} alt={name} className="max-h-80 object-contain" />
            ) : (
              <div className="text-gray-200 text-8xl">⚙️</div>
            )}
          </div>

          {/* Info */}
          <div>
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {product.inStock ? (
                <span className="bg-green-50 text-green-600 text-xs font-medium px-2.5 py-1 rounded-full">{pt.inStock}</span>
              ) : (
                <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full">{cat.outOfStock}</span>
              )}
              <span className="bg-orange-50 text-[var(--accent)] text-xs font-medium px-2.5 py-1 rounded-full">🇺🇦 Виробник: Termojet</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-3">{name}</h1>

            {product.sku && (
              <p className="text-sm text-gray-400 mb-4">{pt.sku}: <span className="font-mono text-gray-600">{product.sku}</span></p>
            )}

            {/* Price */}
            <div className="mb-6">
              {product.price ? (
                <div className="text-3xl font-black text-gray-900">
                  {(product.price * qty).toLocaleString()} <span className="text-lg text-gray-500">{common.uah}</span>
                </div>
              ) : (
                <div className="text-lg text-gray-500">Ціна по запиту</div>
              )}
            </div>

            {/* Quantity + Cart */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600">
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-10 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600">
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${added ? 'bg-green-500 text-white' : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-light)]'}`}
              >
                <ShoppingCart size={18} />
                {added ? '✓ Додано!' : pt.addToCart}
              </button>
            </div>

            <a
              href={`tel:${siteSettings.phone}`}
              className="btn-secondary w-full justify-center py-3 mb-5"
            >
              <Phone size={16} />
              {pt.askConsult}
            </a>

            {/* Meta */}
            <div className="border-t border-gray-100 pt-5 space-y-2 text-sm">
              {category && (
                <div className="flex items-center justify-between text-gray-500">
                  <span>{pt.category}:</span>
                  <Link to={`/catalog/${categorySlug}`} className="font-medium text-[var(--primary)] hover:underline">
                    {category.name[lang] || category.name.uk}
                  </Link>
                </div>
              )}
              <div className="flex items-center justify-between text-gray-500">
                <span>Виробник:</span>
                <span className="font-medium text-gray-900">Termojet (Україна) 🇺🇦</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card overflow-hidden mb-10">
          <div className="flex border-b border-gray-100">
            {TABS.map(tabKey => (
              <button
                key={tabKey}
                onClick={() => setTab(tabKey)}
                className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === tabKey ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
              >
                {pt[tabKey]}
              </button>
            ))}
          </div>
          <div className="p-6">
            {tab === 'description' && (
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                {desc ? (
                  <p>{desc}</p>
                ) : (
                  <p className="text-gray-400">Опис відсутній. Зверніться до менеджера для отримання детальної інформації.</p>
                )}
              </div>
            )}
            {tab === 'specs' && (
              <div>
                {product.specs && Object.keys(product.specs).length > 0 ? (
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(product.specs).map(([k, v]) => (
                        <tr key={k} className="border-b border-gray-50 last:border-0">
                          <td className="py-2.5 pr-4 text-gray-500 w-1/2">{k}</td>
                          <td className="py-2.5 font-medium text-gray-900">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-400 text-sm">Технічні характеристики відсутні</p>
                )}
              </div>
            )}
            {tab === 'docs' && (
              <div>
                {product.docs?.length > 0 ? (
                  <ul className="space-y-2">
                    {product.docs.map((doc, i) => (
                      <li key={i}>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[var(--primary)] hover:underline">
                          <Download size={14} />
                          {doc.name || `Документ ${i + 1}`}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-sm">Документи відсутні</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 className="font-bold text-xl mb-5">{pt.related}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => {
                const pName = (lang !== 'uk' && p[`name_${lang}`]) ? p[`name_${lang}`] : (p.name || '')
                return (
                  <Link
                    key={p.id}
                    to={`/catalog/${categorySlug}/${p.slug || p.id}`}
                    className="card card-hover p-4 flex flex-col"
                  >
                    {p.image ? (
                      <img src={p.image} alt={pName} className="h-32 object-contain mb-3" />
                    ) : (
                      <div className="h-32 flex items-center justify-center text-4xl text-gray-200 mb-3">⚙️</div>
                    )}
                    <h3 className="text-xs font-medium text-gray-900 line-clamp-2">{pName}</h3>
                    {p.price && (
                      <span className="text-sm font-bold text-gray-900 mt-1">{p.price.toLocaleString()} {common.uah}</span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
