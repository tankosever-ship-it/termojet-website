import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, FileText } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const EMPTY = { name: '', url: '', category: '', size: '' }

export default function AdminFiles() {
  const { files, setFiles, isAdminAuth } = useApp()
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  if (!isAdminAuth) { navigate('/admin'); return null }

  function save() {
    if (!form.name || !form.url) return
    setFiles(prev => [{ ...form, id: Date.now().toString() }, ...prev])
    setForm(EMPTY); setShowForm(false)
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="bg-[var(--primary)] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="text-white/60 hover:text-white"><ArrowLeft size={18} /></Link>
          <div>
            <div className="font-bold">Документи</div>
            <div className="text-white/60 text-xs">{files.length} файлів</div>
          </div>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> Додати файл
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {showForm && (
          <div className="card p-5 mb-5 space-y-3">
            <h3 className="font-bold text-sm">Новий документ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Назва *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Категорія</label>
                <input value={form.category} onChange={e => set('category', e.target.value)} placeholder="Каталоги, Прайси..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">URL файлу *</label>
                <input value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Розмір</label>
                <input value={form.size} onChange={e => set('size', e.target.value)} placeholder="2.4 MB"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={save} className="btn-primary text-sm py-2 px-4">Зберегти</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm py-2 px-4">Скасувати</button>
            </div>
          </div>
        )}

        {files.length === 0 && !showForm ? (
          <div className="text-center py-20 text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p>Файлів поки немає</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map(file => (
              <div key={file.id} className="card p-4 flex items-center gap-3">
                <FileText size={20} className="text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{file.name}</div>
                  <div className="text-xs text-gray-400">{file.category} {file.size && `• ${file.size}`}</div>
                </div>
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--primary)] hover:underline flex-shrink-0">
                  Відкрити
                </a>
                <button onClick={() => { if (confirm('Видалити?')) setFiles(prev => prev.filter(f => f.id !== file.id)) }}
                  className="p-1.5 text-gray-400 hover:text-red-500 flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
