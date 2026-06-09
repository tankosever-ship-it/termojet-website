import { Phone } from 'lucide-react'
import { useApp } from '../context/AppContext'

// Інлайн Telegram-іконка (у lucide немає бренд-іконки)
function TelegramIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.94 4.36l-3.32 15.66c-.25 1.1-.9 1.38-1.83.86l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.14L17.4 6.9c.4-.36-.09-.56-.62-.2L6.9 13.02l-4.96-1.55c-1.08-.34-1.1-1.08.23-1.6L20.5 2.5c.9-.34 1.69.2 1.44 1.86z"/>
    </svg>
  )
}

// Спільний бот @termojet_ua_bot; ?start=termojet → менеджер бачить мітку 🔵 Termojet.
// Fallback на випадок, якщо в налаштуваннях (БД) telegram порожній.
const DEFAULT_TG = 'https://t.me/termojet_ua_bot?start=termojet'

export default function FloatingActions() {
  const { siteSettings } = useApp()
  const tg = (siteSettings.telegram || '').trim() || DEFAULT_TG
  const tgHref = tg.startsWith('http') ? tg : `https://t.me/${tg.replace(/^@/, '')}`

  return (
    <div className="fixed right-4 z-40 flex flex-col gap-3 md:right-6 bottom-[calc(64px+env(safe-area-inset-bottom,12px)+16px)] md:bottom-8">
      {/* Telegram — слот під бота (з tjheatpump). Показується коли заданий у налаштуваннях. */}
      {tgHref && (
        <a
          href={tgHref}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          style={{ background: '#229ED9' }}
          aria-label="Telegram"
        >
          <TelegramIcon size={20} />
        </a>
      )}

      {/* Телефон — постійно присутній */}
      <a
        href={`tel:${(siteSettings.phone || '').replace(/[^\d+]/g, '')}`}
        className="w-12 h-12 bg-[var(--accent)] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Зателефонувати"
      >
        <Phone size={20} />
      </a>
    </div>
  )
}
