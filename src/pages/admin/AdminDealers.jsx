import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Handshake, Phone, Mail, MapPin } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function AdminDealers() {
  const { dealers, markViewed, isAdminAuth } = useApp()
  const navigate = useNavigate()
  const markedRef = useRef(false)
  const [newIds, setNewIds] = useState([])

  // При відкритті розділу позначаємо нові заявки переглянутими (бейдж зникає)
  useEffect(() => {
    if (markedRef.current) return
    const ids = dealers.filter(d => (d.status || 'new') === 'new').map(d => d.id)
    if (ids.length) { markedRef.current = true; setNewIds(ids); markViewed('dealers', ids) }
  }, [dealers])

  if (!isAdminAuth) { navigate('/admin'); return null }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="bg-[var(--primary)] text-white px-6 py-4 flex items-center gap-3">
        <Link to="/admin/dashboard" className="text-white/60 hover:text-white"><ArrowLeft size={18} /></Link>
        <div>
          <div className="font-bold">Дилери та партнери</div>
          <div className="text-white/60 text-xs">{dealers.length} заявок</div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {dealers.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Handshake size={40} className="mx-auto mb-3 opacity-30" />
            <p>Заявок від дилерів поки немає</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dealers.map(d => (
              <div key={d.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      <span>{d.name}{d.company ? ` — ${d.company}` : ''}</span>
                      {newIds.includes(d.id) && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-600 text-white rounded-full">Новий</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-gray-500">
                      {d.phone && <a href={`tel:${d.phone}`} className="flex items-center gap-1 hover:text-[var(--primary)]"><Phone size={12} />{d.phone}</a>}
                      {d.email && <a href={`mailto:${d.email}`} className="flex items-center gap-1 hover:text-[var(--primary)]"><Mail size={12} />{d.email}</a>}
                      {d.city && <span className="flex items-center gap-1"><MapPin size={12} />{d.city}</span>}
                    </div>
                    {d.message && <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg p-3">{d.message}</p>}
                    {d.utm && Object.keys(d.utm).length > 0 && (
                      <p className="text-xs text-gray-400 mt-2">
                        Джерело: {d.utm.utm_source || d.utm.referrer || '—'}{d.utm.utm_medium ? ' · ' + d.utm.utm_medium : ''}{d.utm.utm_campaign ? ' · ' + d.utm.utm_campaign : ''}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {d.created_at ? new Date(d.created_at).toLocaleDateString('uk-UA') : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
