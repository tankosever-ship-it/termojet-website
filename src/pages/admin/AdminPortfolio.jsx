import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import ImageUpload from '../../components/admin/ImageUpload'

const EMPTY = { title: '', location: '', year: '', power: '', desc: '', image: '' }

function Form({ item, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, ...item })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <div className="card p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-xs text-gray-500 block mb-1">Назва об'єкту *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Місцезнаходження</label>
          <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Київ, Україна"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Рік реалізації</label>
          <input value={form.year} onChange={e => set('year', e.target.value)} placeholder="2024"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Потужність</label>
          <input value={form.power} onChange={e => set('power', e.target.value)} placeholder="500 кВт"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
        </div>
        <div className="md:col-span-2">
          <ImageUpload value={form.image} onChange={v => set('image', v)} label="Фото проекту" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-500 block mb-1">Опис</label>
          <textarea value={form.desc} onChange={e => set('desc', e.target.value)} rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm resize-none" />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => onSave({ ...form, ...(item.id != null ? { id: item.id } : {}) })} className="btn-primary text-sm py-2.5 px-5">Зберегти</button>
        <button onClick={onCancel} className="btn-secondary text-sm py-2.5 px-5">Скасувати</button>
      </div>
    </div>
  )
}

export default function AdminPortfolio() {
  const { portfolio, savePortfolio, removePortfolio, isAdminAuth } = useApp()
  const navigate = useNavigate()
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  if (!isAdminAuth) { navigate('/admin'); return null }

  function save(data) {
    savePortfolio(data)
    setEditId(null); setShowForm(false)
  }

  const editing = editId === 'new' ? EMPTY : portfolio.find(p => p.id === editId)

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="bg-[var(--primary)] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="text-white/60 hover:text-white"><ArrowLeft size={18} /></Link>
          <div>
            <div className="font-bold">Портфоліо</div>
            <div className="text-white/60 text-xs">{portfolio.length} проектів</div>
          </div>
        </div>
        <button onClick={() => { setEditId('new'); setShowForm(true) }} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> Додати проект
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {showForm && editing !== undefined && (
          <div className="mb-6">
            <h2 className="font-bold mb-3">{editId === 'new' ? 'Новий проект' : 'Редагування'}</h2>
            <Form item={editing} onSave={save} onCancel={() => { setEditId(null); setShowForm(false) }} />
          </div>
        )}
        {portfolio.length === 0 && !showForm ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🏗️</p>
            <p>Проектів поки немає — додайте перший</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolio.map(item => (
              <div key={item.id} className="card overflow-hidden flex">
                {item.image && <img src={item.image} alt={item.title} className="w-28 h-28 object-cover flex-shrink-0" />}
                <div className="p-4 flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{item.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{item.location} {item.year && `• ${item.year}`} {item.power && `• ${item.power}`}</div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { setEditId(item.id); setShowForm(true) }} className="p-1.5 text-gray-400 hover:text-[var(--primary)]"><Pencil size={14} /></button>
                    <button onClick={() => { if (confirm('Видалити?')) removePortfolio(item.id) }} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
