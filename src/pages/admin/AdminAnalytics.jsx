import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, MessageSquare, Briefcase, Mail, TrendingUp, Banknote } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const fmtNum = (n) => (n || 0).toLocaleString('uk-UA')
const fmtMoney = (n) => (n || 0).toLocaleString('uk-UA', { maximumFractionDigits: 0 }) + ' ₴'
const shortDate = (d) => {
  const [, m, day] = (d || '').split('-')
  return day && m ? `${day}.${m}` : d
}

// Горизонтальний bar-список (UTM-розбивки)
function BarList({ title, items, empty }) {
  const max = Math.max(1, ...items.map(i => i.count))
  return (
    <div className="card p-5">
      <h3 className="font-bold text-sm mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 py-4 text-center">{empty || 'Немає даних'}</p>
      ) : (
        <div className="space-y-2.5">
          {items.map((it, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-700 truncate pr-2">{it.name}</span>
                <span className="text-gray-400 font-mono flex-shrink-0">{it.count}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-[var(--primary)]"
                  style={{ width: `${(it.count / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Вертикальний bar-графік лідів по днях
function LeadsTrend({ data }) {
  const max = Math.max(1, ...data.map(d => d.total))
  const totalSum = data.reduce((s, d) => s + d.total, 0)
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm">Ліди за 30 днів</h3>
        <span className="text-xs text-gray-400">всього {totalSum}</span>
      </div>
      <div className="flex items-end gap-[3px] h-40">
        {data.map((d, i) => (
          <div key={i} className="flex-1 h-full flex flex-col justify-end group relative">
            <div className="w-full rounded-t bg-[var(--primary)]/80 hover:bg-[var(--primary)] transition-colors min-h-[2px]"
              style={{ height: `${(d.total / max) * 100}%` }} />
            {/* tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 whitespace-nowrap
              bg-gray-900 text-white text-[10px] rounded px-2 py-1">
              {shortDate(d.date)} · {d.total} ({d.orders}з / {d.consultations}к / {d.dealers}д)
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-mono">
        <span>{shortDate(data[0]?.date)}</span>
        <span>{shortDate(data[data.length - 1]?.date)}</span>
      </div>
      <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[var(--primary)]" /> Замовлення / Консультації / Дилери</span>
      </div>
    </div>
  )
}

const STATUS_LABELS = { new: 'Нові', processing: 'В обробці', done: 'Виконані', completed: 'Виконані', cancelled: 'Скасовані', canceled: 'Скасовані' }

export default function AdminAnalytics() {
  const { isAdminAuth, API, authHeaders } = useApp()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [state, setState] = useState('loading') // loading | ready | error

  if (!isAdminAuth) { navigate('/admin'); return null }

  useEffect(() => {
    if (!API) { setState('error'); return }
    fetch(`${API}/analytics`, { headers: authHeaders() })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => { setData(d); setState('ready') })
      .catch(() => setState('error'))
  }, [])

  const totals = data?.totals || {}
  const cards = [
    { label: 'Усього лідів',  value: fmtNum(totals.leads),         icon: TrendingUp,    color: 'text-[var(--primary)]' },
    { label: 'Замовлення',    value: fmtNum(totals.orders),        icon: ShoppingCart,  color: 'text-green-600' },
    { label: 'Консультації',  value: fmtNum(totals.consultations), icon: MessageSquare, color: 'text-orange-600' },
    { label: 'Заявки дилерів',value: fmtNum(totals.dealers),       icon: Briefcase,     color: 'text-purple-600' },
    { label: 'Підписники',    value: fmtNum(totals.subscribers),   icon: Mail,          color: 'text-blue-600' },
    { label: 'Сума замовлень',value: fmtMoney(totals.revenue),     icon: Banknote,      color: 'text-emerald-600' },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="bg-[var(--primary)] text-white px-6 py-4 flex items-center gap-3">
        <Link to="/admin/dashboard" className="text-white/60 hover:text-white"><ArrowLeft size={18} /></Link>
        <div>
          <div className="font-bold">Аналітика</div>
          <div className="text-white/60 text-xs">Ліди, UTM-джерела, замовлення</div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {state === 'loading' && <div className="text-center py-20 text-gray-400">Завантаження…</div>}
        {state === 'error' && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📊</p>
            <p>Аналітика доступна лише на сервері з бекендом.</p>
          </div>
        )}

        {state === 'ready' && data && (
          <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {cards.map(c => (
                <div key={c.label} className="card p-4">
                  <c.icon size={18} className={`${c.color} mb-2`} />
                  <div className={`text-xl font-black font-['Archivo',sans-serif] ${c.color}`}>{c.value}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5 leading-tight">{c.label}</div>
                </div>
              ))}
            </div>

            {/* Trend */}
            <LeadsTrend data={data.leadsByDay || []} />

            {/* UTM breakdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BarList title="Джерела (utm_source)"  items={data.utm?.source   || []} empty="Лідів з UTM ще немає" />
              <BarList title="Канали (utm_medium)"   items={data.utm?.medium   || []} empty="Лідів з UTM ще немає" />
              <BarList title="Кампанії (utm_campaign)" items={data.utm?.campaign || []} empty="Кампаній ще немає" />
            </div>

            {/* Orders by status */}
            <div className="card p-5">
              <h3 className="font-bold text-sm mb-4">Замовлення за статусом</h3>
              {(data.ordersByStatus || []).length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">Замовлень ще немає</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {data.ordersByStatus.map(s => (
                    <div key={s.status} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-2xl font-black font-['Archivo',sans-serif] text-[var(--primary)]">{s.count}</span>
                      <span className="text-xs text-gray-500">{STATUS_LABELS[s.status] || s.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
