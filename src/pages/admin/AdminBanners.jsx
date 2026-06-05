import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const EMPTY_BANNER = { title: '', subtitle: '', image: '', link: '', active: true, sort: 0 }

function BannerForm({ item, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_BANNER, ...item })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="card p-6 space-y-4">
      <div>
        <label className="text-xs text-gray-500 block mb-1">Заголовок *</label>
        <input value={form.title} onChange={e => set('title', e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">Підзаголовок</label>
        <input value={form.subtitle} onChange={e => set('subtitle', e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">Зображення (URL)</label>
        <input value={form.image} onChange={e => set('image', e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">Посилання (URL)</label>
        <input value={form.link} onChange={e => set('link', e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-32">
          <label className="text-xs text-gray-500 block mb-1">Порядок</label>
          <input type="number" value={form.sort} onChange={e => set('sort', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
        </div>
        <div className="flex items-center gap-2 mt-4">
          <input type="checkbox" id="banner-active" checked={!!form.active} onChange={e => set('active', e.target.checked)}
            className="w-4 h-4 accent-[var(--primary)]" />
          <label htmlFor="banner-active" className="text-sm text-gray-700">Активний</label>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => onSave(form)} disabled={!form.title.trim()}
          className="btn-primary text-sm py-2.5 px-5 disabled:opacity-50">Зберегти</button>
        <button onClick={onCancel} className="btn-secondary text-sm py-2.5 px-5">Скасувати</button>
      </div>
    </div>
  )
}

export default function AdminBanners() {
  const { banners, saveBanner, removeBanner, isAdminAuth } = useApp()
  const navigate = useNavigate()
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  if (!isAdminAuth) { navigate('/admin'); return null }

  function save(data) {
    const payload = editId === 'new' ? data : { ...data, id: editId }
    saveBanner(payload)
    setEditId(null); setShowForm(false)
  }

  function remove(id) {
    if (!confirm('Видалити банер?')) return
    removeBanner(id)
  }

  const editing = editId === 'new' ? EMPTY_BANNER : banners.find(b => b.id === editId)

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="bg-[var(--primary)] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="text-white/60 hover:text-white"><ArrowLeft size={18} /></Link>
          <div>
            <div className="font-bold">Банери</div>
            <div className="text-white/60 text-xs">{banners.length} банерів</div>
          </div>
        </div>
        <button onClick={() => { setEditId('new'); setShowForm(true) }}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> Новий банер
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {showForm && editing !== undefined && (
          <div className="mb-6">
            <h2 className="font-bold mb-3">{editId === 'new' ? 'Новий банер' : 'Редагування'}</h2>
            <BannerForm item={editing} onSave={save} onCancel={() => { setEditId(null); setShowForm(false) }} />
          </div>
        )}

        {banners.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🖼️</p>
            <p>Банерів поки немає — додайте перший</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...banners].sort((a, b) => (a.sort || 0) - (b.sort || 0)).map(item => (
              <div key={item.id} className="card p-4 flex items-start gap-4">
                {item.image && (
                  <img src={item.image} alt={item.title}
                    className="w-16 h-12 object-cover rounded-lg flex-shrink-0 bg-gray-100" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    {item.title}
                    {!item.active && <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">неактивний</span>}
                  </div>
                  {item.subtitle && <div className="text-xs text-gray-400 mt-1 line-clamp-1">{item.subtitle}</div>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => { setEditId(item.id); setShowForm(true) }}
                    className="p-1.5 text-gray-400 hover:text-[var(--primary)] transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => remove(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
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
