import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const STATUS_LABELS = { new: 'Новий', processing: 'В обробці', done: 'Виконано', cancelled: 'Скасовано' }
const STATUS_COLORS = { new: 'bg-blue-50 text-blue-600', processing: 'bg-yellow-50 text-yellow-600', done: 'bg-green-50 text-green-600', cancelled: 'bg-red-50 text-red-500' }

export default function AdminOrders() {
  const { orders, setOrders, isAdminAuth } = useApp()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(null)

  if (!isAdminAuth) { navigate('/admin'); return null }

  function setStatus(id, status) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="bg-[var(--primary)] text-white px-6 py-4 flex items-center gap-3">
        <Link to="/admin/dashboard" className="text-white/60 hover:text-white"><ArrowLeft size={18} /></Link>
        <div>
          <div className="font-bold">Замовлення</div>
          <div className="text-white/60 text-xs">{orders.length} всього</div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
            <p>Замовлень поки немає</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="card overflow-hidden">
                <div className="p-4 flex flex-wrap items-center gap-3 cursor-pointer" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">#{order.id?.slice(-6)} — {order.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {order.phone} • {order.createdAt ? new Date(order.createdAt).toLocaleString('uk-UA') : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {order.items && (
                      <span className="text-sm font-bold text-gray-900">
                        {order.items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0).toLocaleString()} грн
                      </span>
                    )}
                    <select
                      value={order.status || 'new'}
                      onChange={e => { e.stopPropagation(); setStatus(order.id, e.target.value) }}
                      onClick={e => e.stopPropagation()}
                      className={`text-xs px-2 py-1 rounded-lg font-medium border-0 outline-none cursor-pointer ${STATUS_COLORS[order.status || 'new']}`}
                    >
                      {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    {expanded === order.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>
                {expanded === order.id && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                    {order.utm && Object.keys(order.utm).length > 0 && (
                      <p className="text-xs text-gray-400 mb-2">
                        Джерело: {order.utm.utm_source || order.utm.referrer || '—'}{order.utm.utm_medium ? ' · ' + order.utm.utm_medium : ''}{order.utm.utm_campaign ? ' · ' + order.utm.utm_campaign : ''}
                      </p>
                    )}
                    {order.address && <p className="text-sm text-gray-600 mb-2"><strong>Адреса:</strong> {order.address}</p>}
                    {order.comment && <p className="text-sm text-gray-600 mb-3"><strong>Коментар:</strong> {order.comment}</p>}
                    {order.items?.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Товари</div>
                        <div className="space-y-2">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">{item.name} × {item.quantity}</span>
                              <span className="font-medium">{((item.price || 0) * item.quantity).toLocaleString()} грн</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
