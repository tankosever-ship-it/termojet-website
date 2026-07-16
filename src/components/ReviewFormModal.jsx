import { useState } from 'react'
import { X, Check, Star, Send, ImagePlus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import { compressImage } from '../utils/compressImage'

export default function ReviewFormModal({ onClose }) {
  const t = useT()
  const { submitReview } = useApp()
  const [form, setForm] = useState({ name: '', company: '', rating: 5, text: '' })
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState('')
  const [state, setState] = useState('idle') // idle | sending | done | error
  const [msg, setMsg] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function pickPhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    // Запобіжник від абсурдно великих файлів (до стиснення)
    if (file.size > 40 * 1024 * 1024) { setMsg(t('home.reviewPhotoTooBig')); setState('error'); return }
    // Стискаємо прямо в браузері → надійний аплоад навіть на слабкій мережі
    const compressed = await compressImage(file)
    // Після стиснення фото майже завжди < 1 МБ; лишаємо запобіжник на 8 МБ
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
    const res = await submitReview({ ...form, photo })
    if (res?.ok) { setState('done'); setMsg(res.message || t('home.reviewSuccessMsg')) }
    else { setState('error'); setMsg(res?.error || t('home.reviewSendError')) }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="font-black text-lg text-[#1a1a1a] font-['Archivo',sans-serif]">{t('home.leaveReview')}</div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </div>

        {state === 'done' ? (
          <div className="text-center py-12 px-6">
            <Check size={46} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
            <div className="font-bold text-lg text-[#1a1a1a] mb-2">{t('home.reviewSentTitle')}</div>
            <p className="text-sm text-gray-500 mb-6">{msg}</p>
            <button onClick={onClose}
              className="px-6 py-2.5 text-white text-sm font-bold" style={{ background: 'var(--accent)' }}>
              {t('common.close')}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 space-y-4">
            {/* Зірки */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{t('home.reviewFormRating')}</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <button type="button" key={i} onClick={() => set('rating', i)} className="p-0.5">
                    <Star size={28} style={{ color: i <= form.rating ? 'var(--accent)' : '#d8d8d8' }}
                      fill={i <= form.rating ? 'var(--accent)' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">{t('home.reviewFormName')}</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder={t('home.reviewFormNamePlaceholder')} maxLength={80}
                className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:border-[var(--accent)] text-sm" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">{t('home.reviewFormCompany')}</label>
              <input value={form.company} onChange={e => set('company', e.target.value)} placeholder={t('home.reviewFormCompanyPlaceholder')} maxLength={120}
                className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:border-[var(--accent)] text-sm" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">{t('home.reviewFormText')}</label>
              <textarea value={form.text} onChange={e => set('text', e.target.value)} rows={4} maxLength={1500}
                placeholder={t('home.reviewFormTextPlaceholder')}
                className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:border-[var(--accent)] text-sm resize-none" />
            </div>

            {/* Фото */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">{t('home.reviewFormPhoto')}</label>
              <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-gray-300 cursor-pointer hover:border-[var(--accent)] transition-colors">
                {preview ? (
                  <img src={preview} alt="" className="w-14 h-14 object-cover" />
                ) : (
                  <ImagePlus size={22} className="text-gray-400" />
                )}
                <span className="text-sm text-gray-500">{photo ? photo.name : t('home.reviewFormPhotoUpload')}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickPhoto} className="hidden" />
              </label>
            </div>

            {state === 'error' && <p className="text-sm text-red-500">{msg}</p>}

            <button type="submit" disabled={state === 'sending'}
              className="w-full flex items-center justify-center gap-2 py-3 text-white font-bold disabled:opacity-60"
              style={{ background: 'var(--accent)' }}>
              <Send size={16} />
              {state === 'sending' ? t('home.reviewFormSending') : t('home.reviewFormSubmit')}
            </button>
            <p className="text-[11px] text-gray-400 text-center">{t('home.reviewFormDisclaimer')}</p>
          </form>
        )}
      </div>
    </div>
  )
}
