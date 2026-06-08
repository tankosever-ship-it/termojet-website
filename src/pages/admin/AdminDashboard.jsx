import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { ADMIN_MENU } from '../../data/adminMenu'

export default function AdminDashboard() {
  const { products, orders, consultations, dealers, newCounts, isAdminAuth } = useApp()
  const navigate = useNavigate()

  if (!isAdminAuth) {
    navigate('/admin')
    return null
  }

  const stats = [
    { label: 'Товарів у каталозі', value: products.length, color: 'text-[var(--primary)]' },
    { label: 'Замовлень', value: orders.length, color: 'text-green-600' },
    { label: 'Консультацій', value: consultations.length, color: 'text-orange-600' },
    { label: 'Заявок дилерів', value: dealers.length, color: 'text-purple-600' },
  ]

  // У гриді — усі розділи, крім самого «Огляду»
  const sections = ADMIN_MENU.filter(m => m.to !== '/admin/dashboard')

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Page header */}
      <div className="bg-[var(--primary)] text-white px-6 py-4">
        <div className="font-bold">Огляд</div>
        <div className="text-white/60 text-xs">Адміністративна панель Termojet</div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="card p-5 text-center">
              <div className={`text-3xl font-black font-['Archivo',sans-serif] ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Menu */}
        <h2 className="font-bold text-lg mb-4">Розділи</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map(({ to, icon: Icon, label, desc }) => {
            const count = newCounts?.[to] || 0
            return (
              <Link key={to} to={to} className="card card-hover p-5 flex items-center gap-4">
                <div className="relative w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={22} className="text-[var(--primary)]" />
                  {count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-[11px] font-bold">
                      {count}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    {label}
                    {count > 0 && <span className="text-xs font-bold text-red-600">{count} нових</span>}
                  </div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
