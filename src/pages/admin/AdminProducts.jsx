import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search, X, ArrowLeft, Package, Eye, EyeOff } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { CATEGORIES } from '../../data/categories'
import { toSlug } from '../../utils/slug'
import ImageUpload from '../../components/admin/ImageUpload'

const EMPTY = { name: '', sku: '', price: '', salePrice: '', categorySlug: '', desc: '', inStock: true, isVisible: true, image: '', specs: {} }

function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, ...product })
  const [specKey, setSpecKey] = useState('')
  const [specVal, setSpecVal] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function addSpec() {
    if (!specKey.trim()) return
    setForm(f => ({ ...f, specs: { ...f.specs, [specKey]: specVal } }))
    setSpecKey(''); setSpecVal('')
  }

  function removeSpec(k) {
    setForm(f => { const s = { ...f.specs }; delete s[k]; return { ...f, specs: s } })
  }

  function handleSave() {
    const slug = form.slug || toSlug(form.name)
    onSave({ ...form, slug, price: form.price ? Number(form.price) : null, salePrice: form.salePrice ? Number(form.salePrice) : 0 })
  }

  return (
    <div className="card p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Назва *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Артикул (SKU)</label>
          <input value={form.sku} onChange={e => set('sku', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Ціна (грн)</label>
          <input value={form.price} onChange={e => set('price', e.target.value)} type="number" placeholder="0 = ціна по запиту"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Акційна ціна (грн)</label>
          <input value={form.salePrice} onChange={e => set('salePrice', e.target.value)} type="number" placeholder="порожньо = без акції"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--accent)] text-sm" />
          <p className="text-[11px] text-gray-400 mt-1">Якщо вказана й менша за ціну — товар потрапляє в категорію «Акція».</p>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Категорія *</label>
          <select value={form.categorySlug} onChange={e => set('categorySlug', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm bg-white">
            <option value="">— Виберіть категорію —</option>
            {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name.uk}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <ImageUpload value={form.image} onChange={v => set('image', v)} label="Фото товару" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-500 block mb-1">Опис</label>
          <textarea value={form.desc} onChange={e => set('desc', e.target.value)} rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm resize-none" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.inStock} onChange={e => set('inStock', e.target.checked)} className="accent-[var(--primary)]" />
          <span className="text-sm text-gray-700">В наявності</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isVisible !== false} onChange={e => set('isVisible', e.target.checked)} className="accent-[var(--primary)]" />
          <span className="text-sm text-gray-700">Показувати на сайті</span>
        </label>
      </div>

      {/* Specs */}
      <div>
        <div className="text-xs text-gray-500 mb-2">Характеристики</div>
        {Object.entries(form.specs || {}).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2 mb-1.5">
            <span className="text-sm text-gray-600 flex-1">{k}: <strong>{v}</strong></span>
            <button onClick={() => removeSpec(k)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <input value={specKey} onChange={e => setSpecKey(e.target.value)} placeholder="Параметр"
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-xs" />
          <input value={specVal} onChange={e => setSpecVal(e.target.value)} placeholder="Значення"
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-xs" />
          <button onClick={addSpec} className="px-3 py-2 bg-gray-100 rounded-xl text-xs hover:bg-gray-200 transition-colors">+ Додати</button>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} className="btn-primary text-sm py-2.5 px-5">Зберегти</button>
        <button onClick={onCancel} className="btn-secondary text-sm py-2.5 px-5">Скасувати</button>
      </div>
    </div>
  )
}

export default function AdminProducts() {
  const { products, saveProduct, removeProduct, isAdminAuth } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [catFilter, setCatFilter] = useState('')

  if (!isAdminAuth) { navigate('/admin'); return null }

  const filtered = products.filter(p => {
    const match = p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
    const catMatch = !catFilter || p.categorySlug === catFilter
    return match && catMatch
  })

  function handleSave(data) {
    const payload = editId === 'new' ? data : { ...data, id: editId }
    saveProduct(payload)
    setEditId(null)
    setShowForm(false)
  }

  function handleDelete(id) {
    if (!confirm('Видалити товар?')) return
    removeProduct(id)
  }

  // Швидке приховування/показ товару без відкриття форми
  function toggleVisible(p) {
    saveProduct({ ...p, isVisible: p.isVisible === false ? true : false })
  }

  const hiddenCount = products.filter(p => p.isVisible === false).length

  const _found = products.find(p => p.id === editId)
  const editingProduct = editId === 'new' ? EMPTY : (_found ? { ..._found, desc: _found.desc ?? _found.description ?? '', salePrice: _found.salePrice || '' } : undefined)

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="bg-[var(--primary)] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="text-white/60 hover:text-white transition-colors"><ArrowLeft size={18} /></Link>
          <div>
            <div className="font-bold">Товари</div>
            <div className="text-white/60 text-xs">
              {products.length} позицій{hiddenCount > 0 ? ` · ${hiddenCount} прихованих` : ''}
            </div>
          </div>
        </div>
        <button onClick={() => { setEditId('new'); setShowForm(true) }} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-xl text-sm font-medium">
          <Plus size={16} /> Додати товар
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Form */}
        {showForm && editingProduct !== undefined && (
          <div className="mb-6">
            <h2 className="font-bold mb-3">{editId === 'new' ? 'Новий товар' : 'Редагування товару'}</h2>
            <ProductForm product={editingProduct} onSave={handleSave} onCancel={() => { setEditId(null); setShowForm(false) }} />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-52">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Пошук за назвою або артикулом..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm bg-white" />
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none">
            <option value="">Всі категорії</option>
            {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name.uk}</option>)}
          </select>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p>{search || catFilter ? 'Нічого не знайдено' : 'Каталог порожній — додайте перший товар'}</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Фото</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Назва / Артикул</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium hidden md:table-cell">Категорія</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Ціна</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium hidden sm:table-cell">Наявність</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => {
                  const cat = CATEGORIES.find(c => c.slug === p.categorySlug)
                  return (
                    <tr key={p.id} className={`hover:bg-gray-50/50 transition-colors ${p.isVisible === false ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-12 h-12 object-contain bg-gray-50 rounded-lg" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">⚙️</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 line-clamp-1">{p.name}</div>
                        {p.sku && <div className="text-xs text-gray-400 mt-0.5">Арт. {p.sku}</div>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-gray-500">{cat ? cat.name.uk : p.categorySlug || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        {p.salePrice > 0 && (!p.price || p.salePrice < p.price) ? (
                          <span className="flex flex-col">
                            <span className="font-medium text-[var(--accent)]">{p.salePrice.toLocaleString()} грн</span>
                            <span className="text-[11px] text-gray-400 line-through">{p.price ? p.price.toLocaleString() : ''}</span>
                          </span>
                        ) : (
                          <span className="font-medium text-gray-900">
                            {p.price ? `${p.price.toLocaleString()} грн` : '—'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.inStock ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                          {p.inStock ? 'В наявності' : 'Під замовлення'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => toggleVisible(p)}
                            title={p.isVisible === false ? 'Показати на сайті' : 'Приховати з сайту'}
                            className={`p-1.5 transition-colors ${p.isVisible === false ? 'text-orange-400 hover:text-orange-600' : 'text-gray-400 hover:text-[var(--primary)]'}`}>
                            {p.isVisible === false ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                          <button onClick={() => { setEditId(p.id); setShowForm(true) }}
                            className="p-1.5 text-gray-400 hover:text-[var(--primary)] transition-colors">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDelete(p.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
