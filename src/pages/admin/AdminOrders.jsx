import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { toUAH } from '../../utils/currency'

const STATUS_LABELS = { new: 'Новий', processing: 'В обробці', done: 'Виконано', cancelled: 'Скасовано' }
const STATUS_COLORS = { new: 'bg-blue-50 text-blue-600', processing: 'bg-yellow-50 text-yellow-600', done: 'bg-green-50 text-green-600', cancelled: 'bg-red-50 text-red-500' }

export default function AdminOrders() {
  const { orders, setOrders, isAdminAuth, API, authHeaders, eurRate } = useApp()
  const navigate = useNavigate()

  // Ціна позиції у гривнях (товари в EUR конвертуємо за курсом)
  const lineUAH = (item) => {
    const uah = toUAH(item.price, item.currency, eurRate)
    return Math.round((uah != null ? uah : (item.price || 0)) * item.quantity)
  }

  if (!isAdminAuth) { navigate('/admin'); return null }

  function setStatus(id, status) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    if (API) {
      fetch(`${API}/orders/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status }) }).catch(() => {})
    }
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
            {orders.map(order => {
              const d = order.created_at || order.createdAt
              const dateStr = d ? new Date(String(d).replace(' ', 'T')).toLocaleString('uk-UA') : ''
              const sum = order.total || (order.items || []).reduce((s, i) => s + lineUAH(i), 0)
              return (
                <div key={order.id} className="card p-4">
                  {/* Шапка: номер, контакт, сума, статус */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">#{String(order.id).slice(-6)} — {order.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {order.phone}{order.email ? ` • ${order.email}` : ''}{dateStr ? ` • ${dateStr}` : ''}
                      </div>
                    </div>
                    <span className="text-base font-bold text-gray-900">{Math.round(sum).toLocaleString('uk-UA')} грн</span>
                    <select
                      value={order.status || 'new'}
                      onChange={e => setStatus(order.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-lg font-medium border-0 outline-none cursor-pointer ${STATUS_COLORS[order.status || 'new']}`}
                    >
                      {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>

                  {/* Деталі — завжди видно */}
                  <div className="border-t border-gray-100 pt-3 space-y-3">
                    {/* Товари */}
                    {order.items?.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Товари</div>
                        <div className="space-y-1">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-sm gap-3">
                              <span className="text-gray-700 min-w-0 truncate">{item.name} × {item.quantity}</span>
                              <span className="font-medium flex-shrink-0">{lineUAH(item).toLocaleString('uk-UA')} грн</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Оплата · Адреса · Коментар */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                      <p><strong className="text-gray-500 font-medium">Оплата:</strong> {order.payment || '—'}</p>
                      <p><strong className="text-gray-500 font-medium">Адреса:</strong> {order.address || '—'}</p>
                      {order.comment && <p className="sm:col-span-2"><strong className="text-gray-500 font-medium">Коментар:</strong> {order.comment}</p>}
                    </div>

                    {/* UTM-джерело */}
                    {order.utm && Object.keys(order.utm).length > 0 && (
                      <p className="text-xs text-gray-400">
                        Джерело: {order.utm.utm_source || order.utm.referrer || '—'}{order.utm.utm_medium ? ' · ' + order.utm.utm_medium : ''}{order.utm.utm_campaign ? ' · ' + order.utm.utm_campaign : ''}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
