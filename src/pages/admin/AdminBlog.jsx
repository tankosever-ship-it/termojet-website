import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { toSlug } from '../../utils/slug'

const EMPTY_POST = { title: '', slug: '', excerpt: '', content: '', image: '', category: '', publishedAt: new Date().toISOString().slice(0,10), published: false }

function PostForm({ post, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_POST, ...post })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleSave() {
    onSave({ ...form, slug: form.slug || toSlug(form.title) })
  }

  return (
    <div className="card p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-xs text-gray-500 block mb-1">Заголовок *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Категорія</label>
          <input value={form.category} onChange={e => set('category', e.target.value)} placeholder="Новини, Технології..."
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Дата публікації</label>
          <input type="date" value={form.publishedAt} onChange={e => set('publishedAt', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-500 block mb-1">URL зображення</label>
          <input value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://..."
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-500 block mb-1">Короткий опис</label>
          <textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm resize-none" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-500 block mb-1">Текст статті</label>
          <textarea value={form.content} onChange={e => set('content', e.target.value)} rows={8}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm resize-none font-mono" />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)} className="accent-[var(--primary)]" />
        <span className="text-sm text-gray-700">Опублікована</span>
      </label>
      <div className="flex gap-3">
        <button onClick={handleSave} className="btn-primary text-sm py-2.5 px-5">Зберегти</button>
        <button onClick={onCancel} className="btn-secondary text-sm py-2.5 px-5">Скасувати</button>
      </div>
    </div>
  )
}

export default function AdminBlog() {
  const { blog, saveBlog, removeBlog, isAdminAuth } = useApp()
  const navigate = useNavigate()
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  if (!isAdminAuth) { navigate('/admin'); return null }

  function save(data) {
    saveBlog(editId === 'new' ? data : { ...data, id: editId })
    setEditId(null); setShowForm(false)
  }

  function remove(id) {
    if (!confirm('Видалити статтю?')) return
    removeBlog(id)
  }

  function togglePublished(id) {
    const post = blog.find(p => p.id === id)
    if (post) saveBlog({ ...post, published: !post.published })
  }

  const editing = editId === 'new' ? EMPTY_POST : blog.find(p => p.id === editId)

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="bg-[var(--primary)] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="text-white/60 hover:text-white"><ArrowLeft size={18} /></Link>
          <div>
            <div className="font-bold">Блог</div>
            <div className="text-white/60 text-xs">{blog.length} статей</div>
          </div>
        </div>
        <button onClick={() => { setEditId('new'); setShowForm(true) }} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> Нова стаття
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {showForm && editing !== undefined && (
          <div className="mb-6">
            <h2 className="font-bold mb-3">{editId === 'new' ? 'Нова стаття' : 'Редагування'}</h2>
            <PostForm post={editing} onSave={save} onCancel={() => { setEditId(null); setShowForm(false) }} />
          </div>
        )}

        {blog.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📝</p>
            <p>Статей поки немає — додайте першу</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blog.map(post => (
              <div key={post.id} className="card p-4 flex items-center gap-4">
                {post.image && <img src={post.image} alt={post.title} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{post.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                    {post.category && <span>{post.category}</span>}
                    {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString('uk-UA')}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => togglePublished(post.id)}
                    className={`p-1.5 rounded-lg transition-colors ${post.published ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                    {post.published ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button onClick={() => { setEditId(post.id); setShowForm(true) }} className="p-1.5 text-gray-400 hover:text-[var(--primary)] transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => remove(post.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
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
