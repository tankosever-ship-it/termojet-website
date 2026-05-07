import { Phone } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function FloatingActions() {
  const { siteSettings } = useApp()

  return (
    <div className="fixed bottom-6 right-4 z-40 flex flex-col gap-3 md:bottom-8 md:right-6">
      <a
        href={`tel:${siteSettings.phone}`}
        className="w-12 h-12 bg-[var(--primary)] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Зателефонувати"
      >
        <Phone size={20} />
      </a>
    </div>
  )
}
