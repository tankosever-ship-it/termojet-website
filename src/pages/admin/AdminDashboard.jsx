import { Link, useNavigate } from 'react-router-dom'
import { Package, ShoppingCart, Users, MessageSquare, FileText, BarChart2, Settings, Image, BookOpen, Briefcase, LogOut, Star, HelpCircle, Tag } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const MENU = [
  { to: '/admin/products', icon: Package, label: 'Товари', desc: 'Каталог та CRUD' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Замовлення', desc: 'Всі замовлення' },
  { to: '/admin/consultations', icon: MessageSquare, label: 'Консультації', desc: 'Запити на консультацію' },
  { to: '/admin/dealers', icon: Briefcase, label: 'Дилери', desc: 'Заявки на партнерство' },
  { to: '/admin/blog', icon: BookOpen, label: 'Блог', desc: 'Статті та новини' },
  { to: '/admin/portfolio', icon: Image, label: 'Портфоліо', desc: 'Реалізовані проекти' },
  { to: '/admin/reviews', icon: Star, label: 'Відгуки', desc: 'Відгуки клієнтів' },
  { to: '/admin/faq', icon: HelpCircle, label: 'FAQ', desc: 'Питання та відповіді' },
  { to: '/admin/files', icon: FileText, label: 'Документи', desc: 'PDF файли та каталоги' },
  { to: '/admin/banners', icon: Image, label: 'Банери', desc: 'Банери головної' },
  { to: '/admin/promos', icon: Tag, label: 'Акції', desc: 'Промо-пропозиції' },
  { to: '/admin/clients', icon: Users, label: 'Клієнти', desc: 'Логотипи клієнтів' },
  { to: '/admin/settings', icon: Settings, label: 'Налаштування', desc: 'Контакти, пароль' },
]

export default function AdminDashboard() {
  const { products, orders, consultations, dealers, adminLogout, isAdminAuth } = useApp()
  const navigate = useNavigate()

  if (!isAdminAuth) {
    navigate('/admin')
    return null
  }

  function logout() {
    adminLogout()
    navigate('/admin')
  }

  const stats = [
    { label: 'Товарів у каталозі', value: products.length, color: 'text-[var(--primary)]' },
    { label: 'Замовлень', value: orders.length, color: 'text-green-600' },
    { label: 'Консультацій', value: consultations.length, color: 'text-orange-600' },
    { label: 'Заявок дилерів', value: dealers.length, color: 'text-purple-600' },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Admin header */}
      <div className="bg-[var(--primary)] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <div className="font-black text-lg font-['Archivo',sans-serif]">TERMOJET Admin</div>
          <div className="text-white/60 text-xs">Адміністративна панель</div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" target="_blank" className="text-xs text-white/60 hover:text-white transition-colors">
            Відкрити сайт →
          </Link>
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors">
            <LogOut size={14} />
            Вийти
          </button>
        </div>
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
          {MENU.map(({ to, icon: Icon, label, desc }) => (
            <Link key={to} to={to} className="card card-hover p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={22} className="text-[var(--primary)]" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{label}</div>
                <div className="text-xs text-gray-500">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
