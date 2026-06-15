import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, GraduationCap, ArrowUpRight, Check } from 'lucide-react'

const STORAGE_KEY = 'termojet_training_popup_seen'
const REG_URL = 'https://crm.tjheatpump.com.ua/r/724d25775589ca0abf99f80a21143e4a'
const DELAY_MS = 9000

const PERKS = [
  'Безкоштовна участь',
  'Кожен учасник отримує каталоги та маркетингові матеріали',
  'Можна поставити будь-які запитання нашим фахівцям',
]

export default function TrainingPopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return
    } catch { /* ignore */ }
    const timer = setTimeout(() => setOpen(true), DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  const markSeen = () => {
    try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* ignore */ }
  }

  const close = () => {
    markSeen()
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Навчання з теплових насосів"
    >
      <div className="relative w-full max-w-md bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={close} aria-label="Закрити"
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
          <X size={18} />
        </button>

        <div className="p-6 md:p-8">
          <div className="w-11 h-11 bg-[var(--accent)]/10 flex items-center justify-center mb-4">
            <GraduationCap size={22} className="text-[var(--accent)]" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-1.5 leading-tight">Безкоштовні семінари з теплових насосів</h3>
          <p className="text-gray-500 text-sm mb-5 leading-relaxed">
            Проводимо навчання в офісі компанії Termojet у Києві — для монтажників, проєктувальників і власників. Приєднуйтесь до наступного семінару.
          </p>

          <ul className="space-y-2.5 mb-6">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-2.5 text-sm text-gray-700">
                <Check size={16} className="text-[var(--accent)] mt-0.5 flex-shrink-0" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>

          <a href={REG_URL} target="_blank" rel="noopener noreferrer" onClick={close}
            className="w-full inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-white px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity">
            Зареєструватися на семінар <ArrowUpRight size={15} />
          </a>

          <div className="mt-4 text-center">
            <Link to="/navchannya" onClick={close} className="text-xs text-gray-400 hover:text-gray-600">
              Докладніше про навчання
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
