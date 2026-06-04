import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Star, Check, EyeOff } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { imgUrl } from '../../utils/imgUrl'

const EMPTY = { name: '', company: '', text: '', rating: 5, published: true }

export default function AdminReviews() {
  const { reviews, isAdminAuth, addReview, moderateReview, removeReview } = useApp()
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  if (!isAdminAuth) { navigate('/admin'); return null }

  const pending = reviews.filter(r => !(r.published === 1 || r.published === true)).length

  function save() {
    if (!form.name || !form.text) return
    addReview(form)
    setForm(EMPTY); setShowForm(false)
  }

  function isPub(r) { return r.published === 1 || r.published === true }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="bg-[var(--primary)] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="text-white/60 hover:text-white"><ArrowLeft size={18} /></Link>
          <div>
            <div className="font-bold">Відгуки</div>
            <div className="text-white/60 text-xs">{reviews.length} відгуків{pending > 0 ? ` · ${pending} на модерації` : ''}</div>
          </div>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> Додати відгук
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {showForm && (
          <div className="card p-5 mb-5 space-y-3">
            <h3 className="font-bold text-sm">Новий відгук</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ім'я клієнта *"
                className="px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
              <input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Компанія"
                className="px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
            </div>
            <textarea value={form.text} onChange={e => set('text', e.target.value)} placeholder="Текст відгуку *" rows={3}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm resize-none" />
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-500">Рейтинг:</label>
              {[1,2,3,4,5].map(r => (
                <button key={r} onClick={() => set('rating', r)}>
                  <Star size={18} className={r <= form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={save} className="btn-primary text-sm py-2 px-4">Зберегти</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm py-2 px-4">Скасувати</button>
            </div>
          </div>
        )}

        {reviews.length === 0 && !showForm ? (
          <div className="text-center py-20 text-gray-400">
            <Star size={40} className="mx-auto mb-3 opacity-30" />
            <p>Відгуків поки немає</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className={`card p-4 flex gap-4 ${isPub(r) ? '' : 'ring-1 ring-amber-300 bg-amber-50/40'}`}>
                {r.photo ? (
                  <a href={imgUrl(r.photo)} target="_blank" rel="noreferrer" className="flex-shrink-0">
                    <img src={imgUrl(r.photo)} alt="" className="w-14 h-14 object-cover rounded-lg border border-gray-200" />
                  </a>
                ) : (
                  <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[var(--primary)]">
                    {r.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-gray-900">{r.name}</span>
                    {r.company && <span className="text-xs text-gray-400">{r.company}</span>}
                    {!isPub(r) && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-800">на модерації</span>}
                    <div className="flex ml-auto">
                      {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= (r.rating||5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{r.text}</p>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  {isPub(r) ? (
                    <button onClick={() => moderateReview(r.id, { ...r, published: false })}
                      title="Сховати" className="p-1.5 text-gray-400 hover:text-amber-600">
                      <EyeOff size={15} />
                    </button>
                  ) : (
                    <button onClick={() => moderateReview(r.id, { ...r, published: true })}
                      title="Схвалити" className="p-1.5 text-green-600 hover:text-green-700">
                      <Check size={16} />
                    </button>
                  )}
                  <button onClick={() => { if (confirm('Видалити?')) removeReview(r.id) }}
                    className="p-1.5 text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
