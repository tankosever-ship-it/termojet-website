import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { Target, Download, Search } from 'lucide-react'

// Парсимо utm (може бути об'єктом або JSON-рядком)
function getUtm(lead) {
  let u = lead.utm
  if (typeof u === 'string') { try { u = JSON.parse(u || '{}') } catch { u = {} } }
  return u && typeof u === 'object' ? u : {}
}

function fmtDate(s) {
  if (!s) return ''
  const d = new Date(s)
  return isNaN(d) ? String(s) : d.toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const TYPE_LABEL = { order: 'Замовлення', consultation: 'Консультація', dealer: 'Дилер' }
const COLS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']

export default function AdminUTM() {
  const { orders = [], consultations = [], dealers = [] } = useApp()
  const [q, setQ] = useState('')
  const [onlyUtm, setOnlyUtm] = useState(false)

  const rows = useMemo(() => {
    const norm = (list, type) => list.map(l => {
      const u = getUtm(l)
      return {
        type,
        date: l.created_at || l.createdAt || '',
        name: l.name || '',
        phone: l.phone || '',
        email: l.email || '',
        utm_source: u.utm_source || '',
        utm_medium: u.utm_medium || '',
        utm_campaign: u.utm_campaign || '',
        utm_term: u.utm_term || '',
        utm_content: u.utm_content || '',
        hasUtm: COLS.some(k => u[k]),
      }
    })
    let all = [
      ...norm(orders, 'order'),
      ...norm(consultations, 'consultation'),
      ...norm(dealers, 'dealer'),
    ].sort((a, b) => new Date(b.date) - new Date(a.date))
    if (onlyUtm) all = all.filter(r => r.hasUtm)
    if (q.trim()) {
      const s = q.trim().toLowerCase()
      all = all.filter(r => [r.name, r.phone, r.email, r.utm_source, r.utm_medium, r.utm_campaign, r.utm_term, r.utm_content]
        .some(v => (v || '').toLowerCase().includes(s)))
    }
    return all
  }, [orders, consultations, dealers, q, onlyUtm])

  const withUtm = rows.filter(r => r.hasUtm).length

  function exportCsv() {
    const head = ['Дата', 'Тип', "Ім'я", 'Телефон', 'Email', ...COLS]
    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`
    const lines = [head.map(esc).join(',')]
    rows.forEach(r => lines.push([fmtDate(r.date), TYPE_LABEL[r.type], r.name, r.phone, r.email,
      r.utm_source, r.utm_medium, r.utm_campaign, r.utm_term, r.utm_content].map(esc).join(',')))
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `utm-leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-3 mb-1">
        <Target size={22} className="text-[var(--accent)]" />
        <h1 className="text-xl font-bold">UTM — джерела лідів</h1>
      </div>
      <p className="text-sm text-gray-500 mb-5">Звідки прийшов клієнт: джерело, канал, кампанія — для аналітики та ремаркетингу.</p>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-white border border-gray-100 rounded-xl p-4"><div className="text-2xl font-bold">{rows.length}</div><div className="text-xs text-gray-500">Усього лідів</div></div>
        <div className="bg-white border border-gray-100 rounded-xl p-4"><div className="text-2xl font-bold">{withUtm}</div><div className="text-xs text-gray-500">З UTM-мітками</div></div>
        <div className="bg-white border border-gray-100 rounded-xl p-4"><div className="text-2xl font-bold">{rows.length ? Math.round(withUtm / rows.length * 100) : 0}%</div><div className="text-xs text-gray-500">Покриття UTM</div></div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Пошук: ім'я, телефон, кампанія…"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--accent)]" />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 select-none">
          <input type="checkbox" checked={onlyUtm} onChange={e => setOnlyUtm(e.target.checked)} /> Тільки з UTM
        </label>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 px-3 py-2 bg-[var(--accent)] text-white text-sm font-semibold rounded-lg hover:opacity-90">
          <Download size={15} /> CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-100 rounded-xl bg-white">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="text-left text-xs uppercase text-gray-400 border-b border-gray-100">
              <th className="px-3 py-2.5">Дата</th>
              <th className="px-3 py-2.5">Тип</th>
              <th className="px-3 py-2.5">Контакт</th>
              <th className="px-3 py-2.5">Source</th>
              <th className="px-3 py-2.5">Medium</th>
              <th className="px-3 py-2.5">Campaign</th>
              <th className="px-3 py-2.5">Term</th>
              <th className="px-3 py-2.5">Content</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={8} className="px-3 py-10 text-center text-gray-400">Лідів не знайдено</td></tr>
            ) : rows.map((r, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-3 py-2.5 text-gray-500">{fmtDate(r.date)}</td>
                <td className="px-3 py-2.5">{TYPE_LABEL[r.type]}</td>
                <td className="px-3 py-2.5">
                  <div className="font-medium text-gray-900">{r.name || '—'}</div>
                  <div className="text-xs text-gray-400">{[r.phone, r.email].filter(Boolean).join(' · ')}</div>
                </td>
                <td className="px-3 py-2.5">{r.utm_source || <span className="text-gray-300">—</span>}</td>
                <td className="px-3 py-2.5">{r.utm_medium || <span className="text-gray-300">—</span>}</td>
                <td className="px-3 py-2.5">{r.utm_campaign || <span className="text-gray-300">—</span>}</td>
                <td className="px-3 py-2.5">{r.utm_term || <span className="text-gray-300">—</span>}</td>
                <td className="px-3 py-2.5">{r.utm_content || <span className="text-gray-300">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
