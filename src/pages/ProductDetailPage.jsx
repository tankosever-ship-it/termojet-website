import { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Plus, Minus, ChevronRight, Download, Phone, Package, Play, FileText, Wrench, Image } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import { imgUrl } from '../utils/imgUrl'
import { CATEGORIES } from '../data/categories'
import SEO from '../components/SEO'
import { trackViewItem, trackAddToCart } from '../utils/analytics'

function ImageGallery({ images, name }) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const all = images?.length > 0 ? images : []
  const main = all[active] || null

  return (
    <div className="card overflow-hidden">
      {/* Main image */}
      <div
        className="relative flex items-center justify-center bg-gray-50 cursor-zoom-in"
        style={{ minHeight: 340 }}
        onClick={() => main && setLightbox(true)}
      >
        {main ? (
          <img src={main} alt={name} className="max-h-80 max-w-full object-contain p-6" />
        ) : (
          <div className="text-gray-200 text-8xl">⚙️</div>
        )}
        {all.length > 1 && (
          <span className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded font-mono">
            {active + 1}/{all.length}
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {all.length > 1 && (
        <div className="flex gap-2 p-3 border-t border-gray-100 overflow-x-auto">
          {all.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="flex-shrink-0 w-16 h-16 border-2 transition-all overflow-hidden"
              style={{ borderColor: active === i ? 'var(--accent)' : 'transparent' }}
            >
              <img src={img} alt="" className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90"
          onClick={() => setLightbox(false)}
        >
          <img src={main} alt={name} className="max-h-[90vh] max-w-[90vw] object-contain" />
        </div>
      )}
    </div>
  )
}

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

  const tabs = useMemo(() => {
    if (!product) return []
    const list = [{ key: 'description', label: pt.description || 'Опис', icon: FileText }]
    if (product.specs && Object.keys(product.specs).length > 0)
      list.push({ key: 'specs', label: pt.specs || 'Характеристики', icon: Wrench })
    if (product.video)
      list.push({ key: 'video', label: 'Відео', icon: Play })
    if (product.docs?.length > 0)
      list.push({ key: 'docs', label: pt.docs || 'Документи', icon: Download })
    if (!list.find(t => t.key === 'specs'))
      list.push({ key: 'specs', label: pt.specs || 'Характеристики', icon: Wrench })
    return list
  }, [product, pt])

  // Track product view when product loads
  useEffect(() => {
    if (product) {
      trackViewItem({
        sku: product.sku,
        id: product.id,
        name,
        price: product.price,
        categorySlug,
      })
    }
  }, [product?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleAddToCart() {
    if (!product) return
    addToCart(product, qty)
    trackAddToCart({
      sku: product.sku,
      id: product.id,
      name,
      price: product.price,
      categorySlug,
    }, qty)
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

  // Build images list (deduplicated, with base path applied)
  const allImages = useMemo(() => {
    const seen = new Set()
    const result = []
    for (const img of [product.image, ...(product.images || [])]) {
      if (img && !seen.has(img)) { seen.add(img); result.push(imgUrl(img)) }
    }
    return result
  }, [product])

  // Extract YouTube ID from video URL
  const ytId = product.video ? (
    product.video.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/\s]{11})/)?.[1]
  ) : null

  const activeTab = tabs.find(t => t.key === tab) ? tab : tabs[0]?.key

  return (
    <>
      <SEO
        title={name}
        description={desc?.slice(0, 160)}
        type="product"
        product={{ name, description: desc, sku: product.sku, price: product.price, images: allImages }}
        breadcrumbs={[
          { name: 'Головна', url: 'https://termojet.com.ua/' },
          { name: 'Каталог', url: 'https://termojet.com.ua/catalog' },
          ...(category ? [{ name: category.name?.uk || category.name, url: `https://termojet.com.ua/catalog/${categorySlug}` }] : []),
          { name, url: `https://termojet.com.ua/catalog/${categorySlug}/${productSlug}` },
        ]}
      />

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
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

          {/* Gallery */}
          <ImageGallery images={allImages} name={name} />

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

            {/* Short desc preview */}
            {desc && (
              <p className="text-sm text-gray-500 leading-relaxed mb-5 line-clamp-3">{desc}</p>
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
              {allImages.length > 0 && (
                <div className="flex items-center justify-between text-gray-500">
                  <span className="flex items-center gap-1"><Image size={13} /> Фото:</span>
                  <span className="font-medium text-gray-900">{allImages.length} шт.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card overflow-hidden mb-10">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-5 py-4 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap flex-shrink-0 ${activeTab === key ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === 'description' && (
              <div className="text-gray-600 leading-relaxed text-sm max-w-3xl">
                {desc ? (
                  desc.split('\n\n').map((para, i) => (
                    <p key={i} className={i > 0 ? 'mt-4' : ''}>{para}</p>
                  ))
                ) : (
                  <p className="text-gray-400">Опис відсутній. Зверніться до менеджера для отримання детальної інформації.</p>
                )}
              </div>
            )}

            {activeTab === 'specs' && (
              <div>
                {product.specs && Object.keys(product.specs).length > 0 ? (
                  <table className="w-full text-sm max-w-2xl">
                    <tbody>
                      {Object.entries(product.specs).map(([k, v], i) => (
                        <tr key={k} className={`border-b border-gray-100 last:border-0 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                          <td className="py-3 pr-4 text-gray-500 pl-3 w-2/5 font-medium">{k}</td>
                          <td className="py-3 text-gray-900 pr-3">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-400 text-sm">Технічні характеристики відсутні</p>
                )}
              </div>
            )}

            {activeTab === 'video' && ytId && (
              <div className="aspect-video max-w-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}`}
                  title="Відео товару"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded"
                />
              </div>
            )}

            {activeTab === 'docs' && (
              <div>
                {product.docs?.length > 0 ? (
                  <ul className="space-y-2">
                    {product.docs.map((doc, i) => {
                      const icons = { pdf: '📄', dxf: '📐', dwg: '📐', '3d': '🧊', brochure: '📰' }
                      return (
                        <li key={i}>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 text-sm text-[var(--primary)] hover:underline p-3 rounded-lg hover:bg-orange-50 transition-colors">
                            <span className="text-lg">{icons[doc.type] || '📎'}</span>
                            <span>{doc.name || `Документ ${i + 1}`}</span>
                            <Download size={13} className="ml-auto opacity-50" />
                          </a>
                        </li>
                      )
                    })}
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
                      <img src={imgUrl(p.image)} alt={pName} className="h-32 object-contain mb-3" />
                    ) : (
                      <div className="h-32 flex items-center justify-center text-4xl text-gray-200 mb-3">⚙️</div>
                    )}
                    <h3 className="text-xs font-medium text-gray-900 line-clamp-2">{pName}</h3>
                    {p.price && (
                      <span className="text-sm font-bold text-gray-900 mt-1">{Number(p.price).toLocaleString()} {common.uah}</span>
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
