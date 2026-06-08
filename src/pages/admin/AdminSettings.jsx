import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, LogOut } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function AdminSettings() {
  const { siteSettings, saveSettings, isAdminAuth, adminLogout } = useApp()
  const navigate = useNavigate()
  // homeContent не редагуємо тут (є окрема сторінка) — виключаємо з форми
  const [form, setForm] = useState(() => { const { homeContent, ...rest } = siteSettings; return { ...rest } })
  const [saved, setSaved] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  if (!isAdminAuth) { navigate('/admin'); return null }

  async function handleSave() {
    // порожній пароль не відправляємо (щоб не перезаписати наявний)
    const patch = { ...form }
    if (!patch.adminPassword) delete patch.adminPassword
    await saveSettings(patch)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleLogout() {
    adminLogout()
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="bg-[var(--primary)] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="text-white/60 hover:text-white"><ArrowLeft size={18} /></Link>
          <div className="font-bold">Налаштування</div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
          <LogOut size={15} /> Вийти
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-5">

          {/* Contacts */}
          <div className="card p-6">
            <h3 className="font-bold mb-4">Контактна інформація</h3>
            <div className="space-y-4">
              {[
                ['phone', 'Телефон', 'tel'],
                ['email', 'Email', 'email'],
                ['address', 'Адреса', 'text'],
                ['workHours', 'Графік роботи', 'text'],
              ].map(([key, label, type]) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 block mb-1">{label}</label>
                  <input type={type} value={form[key] || ''} onChange={e => set(key, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="card p-6">
            <h3 className="font-bold mb-4">Безпека</h3>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Новий пароль адміна</label>
              <input type="password" value={form.adminPassword || ''} onChange={e => set('adminPassword', e.target.value)}
                placeholder="Залиште порожнім щоб не змінювати"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
              <p className="text-xs text-gray-400 mt-1">Після зміни потрібно знову увійти</p>
            </div>
          </div>

          <button onClick={handleSave} className={`btn-primary w-full justify-center py-3 ${saved ? 'bg-green-500' : ''}`}>
            <Save size={16} />
            {saved ? '✓ Збережено!' : 'Зберегти налаштування'}
          </button>
        </div>
      </div>
    </div>
  )
}
