import { useState } from 'react'
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Menu, X, ExternalLink } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ADMIN_MENU } from '../../data/adminMenu'

function SidebarContent({ onNavigate }) {
  const { adminLogout } = useApp()
  const navigate = useNavigate()

  function logout() {
    adminLogout()
    navigate('/admin')
  }

  return (
    <div className="flex flex-col h-full bg-[#1d1d1f] text-white">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="font-black text-base font-['Archivo',sans-serif] leading-none">TERMOJET</div>
        <div className="text-white/40 text-[11px] mt-1">Адмінпанель</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {ADMIN_MENU.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={onNavigate} end
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors border-l-2 ${
                isActive
                  ? 'bg-[var(--primary)]/15 text-white border-[var(--primary)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
              }`
            }>
            <Icon size={17} className="flex-shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer actions */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <Link to="/" target="_blank"
          className="flex items-center gap-2.5 px-2 py-2 text-xs text-white/50 hover:text-white transition-colors">
          <ExternalLink size={15} /> Відкрити сайт
        </Link>
        <button onClick={logout}
          className="w-full flex items-center gap-2.5 px-2 py-2 text-xs text-white/50 hover:text-white transition-colors">
          <LogOut size={15} /> Вийти
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const { isAdminAuth } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  if (!isAdminAuth) { navigate('/admin'); return null }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Desktop sidebar (fixed) */}
      <aside className="hidden md:block fixed inset-y-0 left-0 w-60 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-[#1d1d1f] text-white px-4 py-3">
        <div className="font-black text-sm font-['Archivo',sans-serif]">TERMOJET Admin</div>
        <button onClick={() => setOpen(true)} className="p-1.5"><Menu size={20} /></button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative w-64 max-w-[80%] h-full shadow-xl">
            <button onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 text-white/60 hover:text-white"><X size={20} /></button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Content */}
      <main className="md:ml-60 min-h-screen">
        <Outlet key={location.pathname} />
      </main>
    </div>
  )
}
