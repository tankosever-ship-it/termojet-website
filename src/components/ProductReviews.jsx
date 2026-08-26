import { useState, useEffect } from 'react'
import { Star, ImagePlus, Send, Check, MessageSquare } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import { imgUrl } from '../utils/imgUrl'
import { compressImage } from '../utils/compressImage'

// Локальні переклади 2 нових рядків (решта форми — наявні ключі home.review*)
const I18N = {
  title: { uk: 'Відгуки про товар', en: 'Product reviews', pl: 'Opinie o produkcie', fr: 'Avis sur le produit', de: 'Produktbewertungen', ro: 'Recenzii despre produs' },
  empty: { uk: 'Ще немає відгуків про цей товар. Будьте першим!', en: 'No reviews for this product yet. Be the first!', pl: 'Brak opinii o tym produkcie. Bądź pierwszy!', fr: 'Aucun avis sur ce produit. Soyez le premier !', de: 'Noch keine Bewertungen für dieses Produkt. Seien Sie der Erste!', ro: 'Încă nu există recenzii pentru acest produs. Fiți primul!' },
  count: { uk: 'відгуків', en: 'reviews', pl: 'opinii', fr: 'avis', de: 'Bewertungen', ro: 'recenzii' },
}
const DATE_LOCALE = { uk: 'uk-UA', en: 'en-US', pl: 'pl-PL', fr: 'fr-FR', de: 'de-DE', ro: 'ro-RO' }

function Stars({ value, size = 14, onPick }) {
  return (
    <div className="flex" style={{ gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        onPick ? (
          <button type="button" key={i} onClick={() => onPick(i)} className="p-0.5">
            <Star size={size} style={{ color: i <= value ? 'var(--accent)' : '#d8d8d8' }} fill={i <= value ? 'var(--accent)' : 'none'} />
          </button>
        ) : (
          <Star key={i} size={size} style={{ color: i <= value ? 'var(--accent)' : '#d8d8d8' }} fill={i <= value ? 'var(--accent)' : 'none'} />
        )
      ))}
    </div>
  )
}

export default function ProductReviews({ product }) {
  const t = useT()
  const { API, submitProductReview, lang } = useApp()
  const tr = (k) => I18N[k]?.[lang] || I18N[k]?.uk || k

  const [list, setList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', rating: 5, text: '' })
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState('')
  const [state, setState] = useState('idle') // idle | sending | done | error
  const [msg, setMsg] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (!API || !product?.id) return
    let alive = true
    fetch(`${API}/product-reviews?product=${encodeURIComponent(product.id)}`)
      .then(r => r.json())
      .then(data => { if (alive && Array.isArray(data)) setList(data) })
      .catch(() => {})
    return () => { alive = false }
  }, [API, product?.id])

  if (!product) return null

  const count = list.length
  const avg = count ? list.reduce((s, r) => s + (r.rating || 5), 0) / count : 0

  async function pickPhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 40 * 1024 * 1024) { setMsg(t('home.reviewPhotoTooBig')); setState('error'); return }
    const compressed = await compressImage(file)
    if (compressed.size > 8 * 1024 * 1024) { setMsg(t('home.reviewPhotoTooBig')); setState('error'); return }
    if (state === 'error') { setState('idle'); setMsg('') }
    setPhoto(compressed)
    setPreview(URL.createObjectURL(compressed))
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.name.trim() || form.text.trim().length < 10) {
      setState('error'); setMsg(t('home.reviewValidationError')); return
    }
    setState('sending'); setMsg('')
    const res = await submitProductReview({
      product_id: product.id,
      product_name: product.name || '',
      product_slug: product.slug || '',
      category_slug: product.categorySlug || '',
      name: form.name, rating: form.rating, text: form.text, photo,
    })
    if (res?.ok) { setState('done'); setMsg(res.message || t('home.reviewSuccessMsg')) }
    else { setState('error'); setMsg(res?.error || t('home.reviewSendError')) }
  }

  const fmtDate = (d) => {
    if (!d) return ''
    try { return new Date(d).toLocaleDateString(DATE_LOCALE[lang] || 'uk-UA', { month: 'long', year: 'numeric' }) } catch { return '' }
  }

  return (
    <section style={{ marginTop: 60 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', borderBottom: '2px solid var(--ink-100)', paddingBottom: 13, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <span className="section-num">05</span>
          <h2 style={{ fontFamily: "'Archivo', sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--ink-100)', margin: 0 }}>{tr('title')}</h2>
        </div>
        {count > 0 && (
          <div className="flex items-center gap-2">
            <Stars value={Math.round(avg)} size={16} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: 'var(--ink-100)' }}>
              {avg.toFixed(1)}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>· {count} {tr('count')}</span>
          </div>
        )}
      </div>

      {/* Список відгуків */}
      {count > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {list.map(r => (
            <div key={r.id} className="card p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {r.photo ? (
                  <a href={imgUrl(r.photo)} target="_blank" rel="noreferrer" className="flex-shrink-0">
                    <img src={imgUrl(r.photo)} alt="" className="w-11 h-11 object-cover rounded-lg border border-gray-200" />
                  </a>
                ) : (
                  <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white" style={{ background: 'var(--accent)' }}>
                    {r.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-bold text-[var(--ink-100)] leading-tight">{r.name}</div>
                  <div className="flex items-center gap-2">
                    <Stars value={r.rating || 5} size={12} />
                    {r.created_at && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtDate(r.created_at)}</span>}
                  </div>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed" style={{ whiteSpace: 'pre-line' }}>{r.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 mb-4">
          <MessageSquare size={38} className="mx-auto mb-3" style={{ color: 'var(--ink-200)' }} />
          <p className="text-[var(--text-muted)]">{tr('empty')}</p>
        </div>
      )}

      {/* Форма / кнопка */}
      {!showForm && state !== 'done' && (
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-bold" style={{ background: 'var(--accent)' }}>
          <Star size={15} fill="white" /> {t('home.leaveReview')}
        </button>
      )}

      {state === 'done' ? (
        <div className="card p-6 text-center max-w-lg">
          <Check size={42} className="mx-auto mb-3" style={{ color: '#22c55e' }} />
          <div className="font-bold text-lg text-[var(--ink-100)] mb-1">{t('home.reviewSentTitle')}</div>
          <p className="text-sm text-[var(--text-muted)]">{msg}</p>
        </div>
      ) : showForm && (
        <form onSubmit={submit} className="card p-6 space-y-4 max-w-lg">
          <div className="font-black text-lg text-[var(--ink-100)] font-['Archivo',sans-serif]">{t('home.leaveReview')}</div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{t('home.reviewFormRating')}</label>
            <Stars value={form.rating} size={28} onPick={(i) => set('rating', i)} />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">{t('home.reviewFormName')}</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder={t('home.reviewFormNamePlaceholder')} maxLength={80}
              className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:border-[var(--accent)] text-sm" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">{t('home.reviewFormText')}</label>
            <textarea value={form.text} onChange={e => set('text', e.target.value)} rows={4} maxLength={1500}
              placeholder={t('home.reviewFormTextPlaceholder')}
              className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:border-[var(--accent)] text-sm resize-none" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">{t('home.reviewFormPhoto')}</label>
            <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-gray-300 cursor-pointer hover:border-[var(--accent)] transition-colors">
              {preview ? <img src={preview} alt="" className="w-14 h-14 object-cover" /> : <ImagePlus size={22} className="text-gray-400" />}
              <span className="text-sm text-gray-500">{photo ? photo.name : t('home.reviewFormPhotoUpload')}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickPhoto} className="hidden" />
            </label>
          </div>

          {state === 'error' && <p className="text-sm text-red-500">{msg}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={state === 'sending'}
              className="flex items-center justify-center gap-2 py-3 px-6 text-white font-bold disabled:opacity-60" style={{ background: 'var(--accent)' }}>
              <Send size={16} />
              {state === 'sending' ? t('home.reviewFormSending') : t('home.reviewFormSubmit')}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="py-3 px-6 font-bold text-[var(--text-secondary)] border border-gray-200">
              {t('common.close')}
            </button>
          </div>
          <p className="text-[11px] text-gray-400">{t('home.reviewFormDisclaimer')}</p>
        </form>
      )}
    </section>
  )
}
