import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function AdminLoginPage() {
  const { adminLogin, isAdminAuth } = useApp()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  if (isAdminAuth) {
    navigate('/admin/dashboard', { replace: true })
    return null
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (adminLogin(password)) {
      navigate('/admin/dashboard')
    } else {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[var(--primary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-black font-['Archivo',sans-serif] text-[var(--primary)]">TERMOJET</h1>
          <p className="text-sm text-gray-500 mt-1">Адміністративна панель</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1.5">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false) }}
              placeholder="Введіть пароль"
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none text-sm ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[var(--primary)]'}`}
              autoFocus
            />
            {error && <p className="text-xs text-red-500 mt-1">Невірний пароль</p>}
          </div>
          <button type="submit" className="btn-primary w-full justify-center py-3">
            Увійти
          </button>
        </form>
      </div>
    </div>
  )
}
