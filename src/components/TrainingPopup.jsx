import { useEffect, useState } from 'react'
import { X, GraduationCap, ArrowUpRight, Check } from 'lucide-react'
import { useT } from '../i18n/useT'
import LLink from './LLink'

const STORAGE_KEY = 'termojet_training_popup_seen'
const REG_URL = 'https://crm.tjheatpump.com.ua/r/724d25775589ca0abf99f80a21143e4a'
const BG_IMAGE = 'https://tjheatpump.com.ua/catalog-images/suntide-large/1.jpg'

// ⚠️ ЧОМУ НЕ ПО ТАЙМЕРУ. Раніше попап відкривався через setTimeout(9000) — і ставав
// LCP-елементом сторінки: велике біле вікно з фоновим зображенням, намальоване на
// ~17-й секунді. Заміряно на проді (дросель 1.6 Мбіт + CPU ×4, головна):
//     як було          LCP = 16 840 мс
//     попап вимкнено   LCP =  4 460 мс
// Тобто сам лише попап давав +12.4 с до LCP (норма Google — до 2.5 с).
//
// Ключове: LCP перестає оновлюватись тільки після ПЕРШОГО ВВОДУ (click / tap /
// keydown). Скрол його НЕ зупиняє — перевірено окремо: із прокруткою на 5-й
// секунді LCP лишався 17.1 с. Тому будь-який показ «по таймеру» чи «по глибині
// скролу» так само отруює метрику.
//
// Рішення: чекаємо на першу реальну взаємодію — вона фіксує LCP, і вікно, показане
// після неї, на метрику вже не впливає. Побічно це й краще таргетування: семінар
// бачить той, хто взаємодіяв зі сторінкою, а не будь-хто, хто протримався 9 секунд.
// Прямі посилання кампаній (?seminar) працюють як і раніше — миттєво.
const MIN_DWELL_MS = 6000     // не показувати одразу після заходу
const AFTER_INPUT_MS = 1200   // пауза, щоб вікно не виглядало реакцією на клік
const TRIGGER_EVENTS = ['pointerdown', 'keydown']

export default function TrainingPopup() {
  const t = useT()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Force-open via ?seminar — shareable direct link, bypasses delay + seen-flag.
    try {
      if (new URLSearchParams(window.location.search).has('seminar')) { setOpen(true); return }
    } catch { /* ignore */ }
    try {
      if (localStorage.getItem(STORAGE_KEY)) return
    } catch { /* ignore */ }

    const mountedAt = Date.now()
    let openTimer
    const stopListening = () => TRIGGER_EVENTS.forEach(e => window.removeEventListener(e, onFirstInput))
    const onFirstInput = () => {
      stopListening()
      const wait = Math.max(AFTER_INPUT_MS, MIN_DWELL_MS - (Date.now() - mountedAt))
      openTimer = setTimeout(() => setOpen(true), wait)
    }
    TRIGGER_EVENTS.forEach(e => window.addEventListener(e, onFirstInput, { passive: true }))
    return () => { stopListening(); clearTimeout(openTimer) }
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

  const perks = [
    t('trainingPopup.perk1'),
    t('trainingPopup.perk2'),
    t('trainingPopup.perk3'),
  ]

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={t('trainingPopup.ariaDialog')}
    >
      <div
        className="relative w-full max-w-md bg-white shadow-2xl overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Напівпрозорий шар поверх фото — щоб текст лишався читабельним */}
        <div className="absolute inset-0 bg-white/88" aria-hidden="true" />
        <button onClick={close} aria-label={t('trainingPopup.ariaClose')}
          className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors">
          <X size={18} />
        </button>

        <div className="relative z-10 p-6 md:p-8">
          <div className="w-11 h-11 bg-[var(--accent)]/10 flex items-center justify-center mb-4">
            <GraduationCap size={22} className="text-[var(--accent)]" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-1.5 leading-tight">{t('trainingPopup.title')}</h3>
          <p className="text-gray-500 text-sm mb-5 leading-relaxed">
            {t('trainingPopup.description')}
          </p>

          <ul className="space-y-2.5 mb-6">
            {perks.map((perk) => (
              <li key={perk} className="flex items-start gap-2.5 text-sm text-gray-700">
                <Check size={16} className="text-[var(--accent)] mt-0.5 flex-shrink-0" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>

          <a href={REG_URL} target="_blank" rel="noopener noreferrer" onClick={close}
            className="w-full inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-white px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity">
            {t('trainingPopup.cta')} <ArrowUpRight size={15} />
          </a>

          <div className="mt-4 text-center">
            <LLink to="/navchannya" onClick={close} className="text-xs text-gray-400 hover:text-gray-600">
              {t('trainingPopup.learnMore')}
            </LLink>
          </div>
        </div>
      </div>
    </div>
  )
}
