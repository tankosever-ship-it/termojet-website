import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { imgUrl } from '../utils/imgUrl'
import { useT } from '../i18n/useT'
import ConsentCheckbox from '../components/ConsentCheckbox'
import SEO from '../components/SEO'
import { toUAH } from '../utils/currency'
import { trackBeginCheckout, trackPurchase } from '../utils/analytics'

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity, cartTotal, placeOrder, eurRate } = useApp()
  const t = useT()
  const cartT = t('cart')
  const common = t('common')
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  // ── Нова Пошта (Етап 1): місто + відділення ───────────────────────────
  const NP_API = '/api/np'
  const [cityQuery, setCityQuery] = useState('')
  const [citySug, setCitySug] = useState([])
  const [cityOpen, setCityOpen] = useState(false)
  const [npCity, setNpCity] = useState(null)            // { ref, label }
  const [warehouses, setWarehouses] = useState([])
  const [npWarehouse, setNpWarehouse] = useState(null)  // { ref, label }
  const [npError, setNpError] = useState('')
  const [npAvailable, setNpAvailable] = useState(true)  // якщо ключ НП не заданий — фолбек на поле адреси

  // Одноразова перевірка, чи НП налаштована на бекенді (503 = ключа немає)
  useEffect(() => {
    fetch(`${NP_API}/cities?q=ки`)
      .then(r => { if (r.status === 503) setNpAvailable(false) })
      .catch(() => setNpAvailable(false))
  }, [])

  // begin_checkout — при відкритті сторінки кошика/оформлення (якщо є товари)
  useEffect(() => {
    if (cart.length) trackBeginCheckout(cart)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Дебаунс-пошук міста
  useEffect(() => {
    if (npCity && cityQuery === npCity.label) return
    const q = cityQuery.trim()
    const id = setTimeout(async () => {
      if (q.length < 2) { setCitySug([]); return }
      try {
        const r = await fetch(`${NP_API}/cities?q=${encodeURIComponent(q)}`)
        setCitySug(r.ok ? await r.json() : [])
      } catch { setCitySug([]) }
    }, 300)
    return () => clearTimeout(id)
  }, [cityQuery, npCity])

  async function pickCity(c) {
    setNpCity(c); setCityQuery(c.label); setCityOpen(false); setCitySug([])
    setNpWarehouse(null); setWarehouses([])
    try {
      const r = await fetch(`${NP_API}/warehouses?cityRef=${encodeURIComponent(c.ref)}`)
      if (r.ok) setWarehouses(await r.json())
    } catch { /* ignore */ }
  }

  async function onSubmit(data) {
    if (npAvailable && (!npCity || !npWarehouse)) {
      setNpError(t('cartPage.np.selectCityAndBranch'))
      return
    }
    setNpError('')
    const npFields = (npAvailable && npCity && npWarehouse)
      ? {
          np_city: npCity.label,
          np_city_ref: npCity.ref,
          np_warehouse: npWarehouse.label,
          np_warehouse_ref: npWarehouse.ref,
          address: `${npCity.label}, ${npWarehouse.label}`,
        }
      : {}
    const order = await placeOrder({ ...data, ...npFields })
    if (order) trackPurchase({ id: order.id, items: order.items, total: order.total, affiliation: 'cart' })
    setSuccess(true)
    reset()
    setNpCity(null); setNpWarehouse(null); setCityQuery(''); setWarehouses([])
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-2">{cartT.form.success}</h2>
        <Link to="/catalog" className="btn-primary mt-6">{cartT.toCatalog}</Link>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={56} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-1">{cartT.empty}</h2>
        <p className="text-gray-400 mb-6">{cartT.emptySub}</p>
        <Link to="/catalog" className="btn-primary">{cartT.toCatalog} <ArrowRight size={16} /></Link>
      </div>
    )
  }

  return (
    <>
      <SEO title={cartT.title} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="section-title mb-8">{cartT.title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.map(item => (
              <div key={item.id} className="card p-4 flex gap-4 items-center">
                {item.image ? (
                  <img src={imgUrl(item.image)} alt={item.name} className="w-20 h-20 object-contain bg-gray-50 rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">⚙️</div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 line-clamp-2 text-sm">{item.name}</h3>
                  {item.sku && <p className="text-xs text-gray-400 mt-0.5">{t('catalog.article')} {item.sku}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="flex items-baseline gap-2">
                      {item.onSale && item.originalPrice > 0 && (
                        <span className="text-xs text-gray-400 line-through">
                          {Math.round((toUAH(item.originalPrice, item.currency, eurRate) || 0) * item.quantity).toLocaleString('uk-UA')}
                        </span>
                      )}
                      <span className={`font-bold ${item.onSale ? 'text-[var(--accent)]' : 'text-gray-900'}`}>
                        {Math.round((toUAH(item.price, item.currency, eurRate) || 0) * item.quantity).toLocaleString('uk-UA')} {common.uah}
                      </span>
                    </span>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Order form */}
          <div className="card p-6 h-fit">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
              <span className="font-semibold">{cartT.total}</span>
              <span className="text-xl font-black">{cartTotal.toLocaleString()} {common.uah}</span>
            </div>

            <h3 className="font-semibold mb-4">{cartT.form.title}</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <input
                  {...register('name', { required: true })}
                  placeholder={cartT.form.name}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{t('cartPage.error.name')}</p>}
              </div>
              <div>
                <input
                  {...register('phone', { required: true })}
                  placeholder={cartT.form.phone}
                  type="tel"
                  inputMode="numeric"
                  maxLength={12}
                  onInput={e => { e.target.value = e.target.value.replace(/\D/g, '') }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm"
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{t('cartPage.error.phone')}</p>}
              </div>
              <input
                {...register('email')}
                placeholder={cartT.form.email}
                type="email"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm"
              />
              {/* Доставка — Нова Пошта (фолбек на поле адреси, якщо НП не налаштована) */}
              {npAvailable ? (
              <div className="space-y-2">
                <label className="text-xs text-gray-500 block">{t('cartPage.np.label')}</label>
                <div className="relative">
                  <input
                    value={cityQuery}
                    onChange={e => { setCityQuery(e.target.value); setNpCity(null); setCityOpen(true) }}
                    onFocus={() => setCityOpen(true)}
                    onBlur={() => setTimeout(() => setCityOpen(false), 150)}
                    placeholder={t('cartPage.np.cityPlaceholder')}
                    autoComplete="off"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm"
                  />
                  {cityOpen && citySug.length > 0 && (
                    <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-auto">
                      {citySug.map(c => (
                        <li key={c.ref}>
                          <button type="button" onClick={() => pickCity(c)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
                            {c.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <select
                  value={npWarehouse?.ref || ''}
                  onChange={e => setNpWarehouse(warehouses.find(x => x.ref === e.target.value) || null)}
                  disabled={!npCity || warehouses.length === 0}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm bg-white disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">{npCity ? t('cartPage.np.selectBranch') : t('cartPage.np.selectCityFirst')}</option>
                  {warehouses.map(w => <option key={w.ref} value={w.ref}>{w.label}</option>)}
                </select>
                {npError && <p className="text-xs text-red-500">{npError}</p>}
              </div>
              ) : (
                <input
                  {...register('address')}
                  placeholder={cartT.form.address}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm"
                />
              )}
              <textarea
                {...register('comment')}
                placeholder={cartT.form.comment}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm resize-none"
              />
              <div>
                <label className="text-xs text-gray-500 block mb-1">{t('cartPage.payment.label')}</label>
                <select
                  {...register('payment')}
                  defaultValue={t('cartPage.payment.bankTransfer')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm bg-white"
                >
                  <option>{t('cartPage.payment.bankTransfer')}</option>
                  <option>{t('cartPage.payment.card')}</option>
                </select>
              </div>
              <ConsentCheckbox buttonLabel={t('cartPage.payment.placeOrder')} />
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3">
                {cartT.form.submit}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
