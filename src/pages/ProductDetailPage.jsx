import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ShoppingCart, Plus, Minus, ChevronRight, ChevronLeft, ChevronDown,
  Download, Phone, Package, Play, FileText, Wrench, X, ZoomIn,
  Truck, CreditCard, ShieldCheck, Factory, Headphones, MapPin, Banknote
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import { imgUrl } from '../utils/imgUrl'
import { CATEGORIES } from '../data/categories'
import SEO from '../components/SEO'
import { trackViewItem, trackAddToCart } from '../utils/analytics'
import { formatPrice, toUAH } from '../utils/currency'

// ── Accordion ──────────────────────────────────────────────────────────────────
function Accordion({ icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-[var(--primary)] flex-shrink-0">{icon}</span>
        <span className="font-semibold text-sm text-gray-800 flex-1">{title}</span>
        <ChevronDown
          size={15}
          className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 text-sm text-gray-600 border-t border-gray-100 space-y-2">
          {children}
        </div>
      )}
    </div>
  )
}

// ── ImageGallery ───────────────────────────────────────────────────────────────
function ImageGallery({ images, name }) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const touchStart = useRef(null)
  const thumbsRef = useRef(null)
  const vThumbsRef = useRef(null)

  const all = images?.length > 0 ? images : []
  const main = all[active] || null
  const total = all.length

  const prev = useCallback(() => setActive(i => (i - 1 + total) % total), [total])
  const next = useCallback(() => setActive(i => (i + 1) % total), [total])

  useEffect(() => {
    if (!lightbox) return
    const onKey = e => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') setLightbox(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, prev, next])

  // Scroll active thumb into view (both refs)
  useEffect(() => {
    ;[thumbsRef, vThumbsRef].forEach(ref => {
      if (!ref.current) return
      const btn = ref.current.children[active]
      btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    })
  }, [active])

  const onTouchStart = e => { touchStart.current = e.touches[0].clientX }
  const onTouchEnd = e => {
    if (touchStart.current === null) return
    const dx = e.changedTouches[0].clientX - touchStart.current
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev()
    touchStart.current = null
  }

  const ThumbButton = ({ img, i, size = 'md' }) => (
    <button
      onClick={() => setActive(i)}
      className={`flex-shrink-0 border-2 rounded overflow-hidden transition-all hover:opacity-90 bg-white
        ${size === 'sm' ? 'w-14 h-14' : 'w-[60px] h-[60px]'}`}
      style={{
        borderColor: active === i ? 'var(--accent)' : '#e5e7eb',
        boxShadow: active === i ? '0 0 0 1px var(--accent)' : 'none',
      }}
    >
      <img src={img} alt={`фото ${i + 1}`} className="w-full h-full object-contain p-1" />
    </button>
  )

  return (
    <div className="card overflow-hidden">
      {/* Desktop: thumbnails LEFT + main image RIGHT — fixed height */}
      <div className="flex" style={{ height: 420 }}>

        {/* Vertical thumbnails column */}
        {total > 1 && (
          <div
            ref={vThumbsRef}
            className="hidden md:flex flex-col gap-1.5 p-2 border-r border-gray-100 overflow-y-auto flex-shrink-0 scrollbar-thin"
            style={{ width: 76 }}
          >
            {all.map((img, i) => <ThumbButton key={i} img={img} i={i} />)}
          </div>
        )}

        {/* Main image — fills full height */}
        <div
          className="relative flex items-center justify-center bg-gray-50 flex-1 h-full select-none overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {main ? (
            <img
              src={main} alt={name}
              className="w-full h-full object-contain p-6 cursor-zoom-in"
              onClick={() => setLightbox(true)}
              draggable={false}
            />
          ) : (
            <div className="text-gray-200 text-8xl">⚙️</div>
          )}

          {main && (
            <button
              onClick={() => setLightbox(true)}
              className="absolute top-3 right-3 bg-black/20 hover:bg-black/40 text-white rounded-full p-1.5 transition-all"
              title="Збільшити"
            >
              <ZoomIn size={14} />
            </button>
          )}

          {total > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-2 transition-all hover:scale-110"
              >
                <ChevronLeft size={18} className="text-gray-700" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-2 transition-all hover:scale-110"
              >
                <ChevronRight size={18} className="text-gray-700" />
              </button>
            </>
          )}

          {total > 1 && (
            <span className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded font-mono">
              {active + 1}/{total}
            </span>
          )}
        </div>
      </div>

      {/* Mobile: thumbnails BELOW */}
      {total > 1 && (
        <div
          ref={thumbsRef}
          className="flex md:hidden gap-2 p-3 border-t border-gray-100 overflow-x-auto"
        >
          {all.map((img, i) => <ThumbButton key={i} img={img} i={i} size="sm" />)}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95"
          onClick={() => setLightbox(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all z-10"
            onClick={() => setLightbox(false)}
          >
            <X size={22} />
          </button>
          {total > 1 && (
            <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-mono">
              {active + 1} / {total}
            </span>
          )}
          {total > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all z-10"
              onClick={e => { e.stopPropagation(); prev() }}
            >
              <ChevronLeft size={26} />
            </button>
          )}
          <img
            src={main} alt={name}
            className="max-h-[82vh] max-w-[82vw] object-contain"
            onClick={e => e.stopPropagation()}
            draggable={false}
          />
          {total > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all z-10"
              onClick={e => { e.stopPropagation(); next() }}
            >
              <ChevronRight size={26} />
            </button>
          )}
          {total > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 overflow-x-auto max-w-[80vw] px-2">
              {all.map((img, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setActive(i) }}
                  className="flex-shrink-0 w-12 h-12 border-2 rounded overflow-hidden transition-all"
                  style={{ borderColor: active === i ? 'var(--accent)' : 'rgba(255,255,255,0.3)' }}
                >
                  <img src={img} alt="" className="w-full h-full object-contain bg-white/10" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { categorySlug, productSlug } = useParams()
  const { products, lang, addToCart, siteSettings, eurRate } = useApp()
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

  useEffect(() => {
    if (product) {
      trackViewItem({ sku: product.sku, id: product.id, name, price: product.price, categorySlug })
    }
  }, [product?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleAddToCart() {
    if (!product) return
    addToCart(product, qty)
    trackAddToCart({ sku: product.sku, id: product.id, name, price: product.price, categorySlug }, qty)
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

  const allImages = useMemo(() => {
    const seen = new Set()
    const result = []
    for (const img of [product.image, ...(product.images || [])]) {
      if (img && !seen.has(img)) { seen.add(img); result.push(imgUrl(img)) }
    }
    return result
  }, [product])

  const ytId = product.video ? (
    product.video.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/\s]{11})/)?.[1]
  ) : null

  const activeTab = tabs.find(t => t.key === tab) ? tab : tabs[0]?.key

  // Key specs for pills (skip Артикул, take up to 4)
  const specPills = useMemo(() => {
    if (!product.specs) return []
    return Object.entries(product.specs)
      .filter(([k]) => !['Артикул', 'Назва'].includes(k))
      .slice(0, 4)
  }, [product.specs])

  const priceUAH = product.price
    ? Math.round((toUAH(product.price, product.currency, eurRate) || 0) * qty)
    : null

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

          {/* Gallery — vertical thumbs on desktop */}
          <ImageGallery images={allImages} name={name} />

          {/* ── Right column ── */}
          <div>
            {/* Status badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {product.inStock ? (
                <span className="bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-100">
                  ✓ {pt.inStock || 'В наявності'}
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {cat.outOfStock || 'Під замовлення'}
                </span>
              )}
              <span className="bg-orange-50 text-[var(--accent)] text-xs font-semibold px-2.5 py-1 rounded-full border border-orange-100">
                🇺🇦 Виробник: Termojet
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2">{name}</h1>

            {product.sku && (
              <p className="text-sm text-gray-400 mb-4">
                {pt.sku || 'Артикул'}: <span className="font-mono text-gray-600">{product.sku}</span>
              </p>
            )}

            {/* Spec pills */}
            {specPills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {specPills.map(([k, v]) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full font-medium"
                  >
                    <span className="text-gray-400">{k}:</span> {v}
                  </span>
                ))}
                {Object.keys(product.specs || {}).length > 4 && (
                  <button
                    onClick={() => setTab('specs')}
                    className="text-xs text-[var(--primary)] hover:underline px-1 py-1.5"
                  >
                    всі характеристики →
                  </button>
                )}
              </div>
            )}

            {/* Short desc */}
            {desc && (
              <p className="text-sm text-gray-500 leading-relaxed mb-5 line-clamp-3">{desc}</p>
            )}

            {/* Price */}
            <div className="mb-4">
              {priceUAH ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900">
                    {priceUAH.toLocaleString('uk-UA')}
                  </span>
                  <span className="text-lg text-gray-500">{common.uah || 'грн'}</span>
                  {qty > 1 && (
                    <span className="text-sm text-gray-400 ml-1">
                      ({Math.round(priceUAH / qty).toLocaleString('uk-UA')} / шт.)
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-lg text-gray-500 font-medium">Ціна по запиту</div>
              )}
            </div>

            {/* Trust row */}
            <div className="grid grid-cols-2 gap-2 mb-5 p-3 bg-gray-50 rounded-xl">
              {[
                { icon: <Factory size={14} />, text: 'Власне виробництво' },
                { icon: <ShieldCheck size={14} />, text: 'Гарантія 2 роки' },
                { icon: <Truck size={14} />, text: 'Доставка по Україні' },
                { icon: <Headphones size={14} />, text: 'Технічна підтримка' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-[var(--primary)]">{icon}</span>
                  {text}
                </div>
              ))}
            </div>

            {/* Qty + Cart */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-semibold text-sm">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-10 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold rounded transition-all ${
                  added
                    ? 'bg-green-500 text-white'
                    : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-light)]'
                }`}
              >
                <ShoppingCart size={18} />
                {added ? '✓ Додано!' : pt.addToCart || 'Додати в кошик'}
              </button>
            </div>

            <a
              href={`tel:${siteSettings.phone}`}
              className="btn-secondary w-full justify-center py-3 mb-5 rounded"
            >
              <Phone size={16} />
              {pt.askConsult || 'Замовити консультацію'}
            </a>

            {/* ── Accordion sections ── */}
            <div className="space-y-2">
              <Accordion icon={<Truck size={16} />} title="Доставка">
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="text-base mt-0.5">📦</span>
                    <div>
                      <p className="font-medium text-gray-800">Нова Пошта</p>
                      <p className="text-gray-500 text-xs mt-0.5">По всій Україні — до відділення або кур'єром</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-base mt-0.5">🚚</span>
                    <div>
                      <p className="font-medium text-gray-800">Власна доставка</p>
                      <p className="text-gray-500 text-xs mt-0.5">Київ, Житомир та прилеглі регіони</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">Самовивіз</p>
                      <p className="text-gray-500 text-xs mt-0.5">Офіси в Києві та Житомирі</p>
                    </div>
                  </div>
                </div>
              </Accordion>

              <Accordion icon={<CreditCard size={16} />} title="Оплата">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Banknote size={15} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700">Готівка при отриманні</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CreditCard size={15} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700">Онлайн-оплата (Visa / Mastercard)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-gray-400 text-xs font-bold mt-0.5 flex-shrink-0">₴</span>
                    <div>
                      <p className="text-gray-700">Безготівковий розрахунок з ПДВ</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-gray-400 text-xs font-bold mt-0.5 flex-shrink-0">₴</span>
                    <div>
                      <p className="text-gray-700">Безготівковий розрахунок без ПДВ</p>
                    </div>
                  </div>
                </div>
              </Accordion>

              <Accordion icon={<ShieldCheck size={16} />} title="Гарантія та сервіс">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🛡️</span>
                    <span className="text-gray-700">Гарантія <strong>2 роки</strong> на все обладнання</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🔧</span>
                    <span className="text-gray-700">Гарантійний та постгарантійний сервіс</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">📞</span>
                    <span className="text-gray-700">Технічна підтримка та консультації</span>
                  </div>
                  <Link
                    to="/warranty"
                    className="inline-block text-xs text-[var(--primary)] hover:underline mt-1"
                  >
                    Детальні умови гарантії →
                  </Link>
                </div>
              </Accordion>
            </div>

            {/* Category meta */}
            {category && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                <span>Категорія:</span>
                <Link to={`/catalog/${categorySlug}`} className="font-medium text-[var(--primary)] hover:underline">
                  {category.name[lang] || category.name.uk}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="card overflow-hidden mb-10">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-5 py-4 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap flex-shrink-0 ${
                  activeTab === key
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
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

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <h2 className="font-bold text-xl mb-5">{pt.related || 'Схожі товари'}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => {
                const pName = (lang !== 'uk' && p[`name_${lang}`]) ? p[`name_${lang}`] : (p.name || '')
                return (
                  <Link
                    key={p.id}
                    to={`/catalog/${categorySlug}/${p.slug || p.id}`}
                    className="card card-hover p-4 flex flex-col group"
                  >
                    {p.image ? (
                      <img
                        src={imgUrl(p.image)} alt={pName}
                        className="h-32 object-contain mb-3 transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-32 flex items-center justify-center text-4xl text-gray-200 mb-3">⚙️</div>
                    )}
                    <h3 className="text-xs font-medium text-gray-900 line-clamp-2 flex-1">{pName}</h3>
                    {p.price && (
                      <span className="text-sm font-bold text-gray-900 mt-2">
                        {formatPrice(p.price, p.currency, eurRate)}
                      </span>
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
