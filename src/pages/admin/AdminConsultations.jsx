import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageSquare, Phone, Mail } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function AdminConsultations() {
  const { consultations, isAdminAuth } = useApp()
  const navigate = useNavigate()
  if (!isAdminAuth) { navigate('/admin'); return null }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="bg-[var(--primary)] text-white px-6 py-4 flex items-center gap-3">
        <Link to="/admin/dashboard" className="text-white/60 hover:text-white"><ArrowLeft size={18} /></Link>
        <div>
          <div className="font-bold">Консультації</div>
          <div className="text-white/60 text-xs">{consultations.length} запитів</div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {consultations.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
            <p>Запитів на консультацію поки немає</p>
          </div>
        ) : (
          <div className="space-y-3">
            {consultations.map(c => (
              <div key={c.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-gray-900">{c.name}</div>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-gray-500">
                      {c.phone && <a href={`tel:${c.phone}`} className="flex items-center gap-1 hover:text-[var(--primary)]"><Phone size={12} />{c.phone}</a>}
                      {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:text-[var(--primary)]"><Mail size={12} />{c.email}</a>}
                    </div>
                    {c.message && <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg p-3">{c.message}</p>}
                    {c.utm && Object.keys(c.utm).length > 0 && (
                      <p className="text-xs text-gray-400 mt-2">
                        Джерело: {c.utm.utm_source || c.utm.referrer || '—'}{c.utm.utm_medium ? ' · ' + c.utm.utm_medium : ''}{c.utm.utm_campaign ? ' · ' + c.utm.utm_campaign : ''}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('uk-UA') : ''}
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
