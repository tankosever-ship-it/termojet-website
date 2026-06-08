import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Mail, Download, Copy, Check, Search } from 'lucide-react'
import { useApp } from '../../context/AppContext'

function fmtDate(d) {
  if (!d) return ''
  try { return new Date(d.replace(' ', 'T')).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
  catch { return d }
}

export default function AdminSubscribers() {
  const { subscribers, removeSubscriber, isAdminAuth } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(false)

  if (!isAdminAuth) { navigate('/admin'); return null }

  const filtered = subscribers.filter(s => s.email?.toLowerCase().includes(search.toLowerCase()))
  const emails = filtered.map(s => s.email)

  function copyAll() {
    navigator.clipboard?.writeText(emails.join(', ')).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    })
  }

  function exportCsv() {
    const rows = [['email', 'дата'], ...filtered.map(s => [s.email, fmtDate(s.created_at)])]
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `subscribers-${filtered.length}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="bg-[var(--primary)] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="text-white/60 hover:text-white"><ArrowLeft size={18} /></Link>
          <div>
            <div className="font-bold">Підписники</div>
            <div className="text-white/60 text-xs">{subscribers.length} email{subscribers.length === 1 ? '' : 'ів'} із форми в футері</div>
          </div>
        </div>
        {subscribers.length > 0 && (
          <div className="flex items-center gap-2">
            <button onClick={copyAll}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
              {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Скопійовано' : 'Копіювати'}
            </button>
            <button onClick={exportCsv}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
              <Download size={15} /> CSV
            </button>
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {subscribers.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Mail size={40} className="mx-auto mb-3 opacity-30" />
            <p>Підписників поки немає.</p>
            <p className="text-xs mt-1">Email зʼявляться тут, коли відвідувачі заповнять форму «Підпишіться на новини» у футері.</p>
          </div>
        ) : (
          <>
            <div className="relative mb-4">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Пошук за email…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm bg-white" />
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">Нічого не знайдено</div>
            ) : (
              <div className="card overflow-hidden divide-y divide-gray-50">
                {filtered.map(s => (
                  <div key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors">
                    <Mail size={16} className="text-gray-300 flex-shrink-0" />
                    <a href={`mailto:${s.email}`} className="flex-1 min-w-0 text-sm text-gray-900 truncate hover:text-[var(--primary)]">
                      {s.email}
                    </a>
                    <span className="text-xs text-gray-400 flex-shrink-0">{fmtDate(s.created_at)}</span>
                    <button onClick={() => { if (confirm(`Видалити ${s.email}?`)) removeSubscriber(s.id) }}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
