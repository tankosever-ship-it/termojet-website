import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Clock, ArrowRight, ExternalLink } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useT } from '../../i18n/useT'
import { assetPath } from '../../utils/assetPath'

export default function Footer() {
  const { siteSettings, lang } = useApp()
  const t = useT()
  const footer = t('footer')
  const nav = t('nav')

  return (
    <footer className="relative mt-auto overflow-hidden text-white"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 100% 100%, rgba(255,85,0,0.20) 0%, transparent 55%),
          radial-gradient(ellipse 50% 60% at 0% 0%, rgba(255,255,255,0.03) 0%, transparent 50%),
          linear-gradient(160deg, #0A0A0A 0%, #111111 50%, #0A0A0A 100%)
        `
      }}>
      {/* subtle grain */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(232,93,4,0.5)] to-transparent" />

      {/* ─── Main footer content ─── */}
      <div className="relative max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={assetPath('/logo.png')} alt="Termojet" className="h-8 w-auto brightness-0 invert" onError={e => { e.target.style.display='none' }} />
              <span className="font-black text-xl font-['Archivo',sans-serif]">TERMOJET</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-5">{footer.company}</p>

            {/* Made in UA badge */}
            <div className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold tracking-wider border border-white/10"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              🇺🇦 <span>MADE IN UKRAINE</span>
            </div>

            {/* Stats mini */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              {[
                { val: '20+', label: 'років' },
                { val: '50K+', label: "об'єктів" },
              ].map(s => (
                <div key={s.val} className="rounded-lg p-2.5 text-center border border-white/8"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="font-black text-lg font-['Archivo',sans-serif] text-white">{s.val}</div>
                  <div className="text-xs text-white/40">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Catalog */}
          <div>
            <div className="font-semibold mb-5 text-white/90 flex items-center gap-2">
              <span className="w-1 h-4 rounded bg-[var(--accent)] inline-block" />
              {footer.catalog}
            </div>
            <ul className="space-y-2.5 text-sm">
              {[
                ['Насоси', '/catalog/nasosy'],
                ['Насосні групи', '/catalog/nasosni-hrupy'],
                ['Клапани і приводи', '/catalog/klapany'],
                ['Розподільчі колектори', '/catalog/rozpodilchi-kolektory'],
                ['TERMOJET Mega', '/catalog/termojet-mega'],
                ['TERMOJET Mini', '/catalog/termojet-mini'],
                ['TERMOJET BOX', '/catalog/termojet-box'],
              ].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-white/50 hover:text-white transition-colors flex items-center gap-1.5 group">
                    <span className="w-0 group-hover:w-3 overflow-hidden transition-all text-[var(--accent)] flex-shrink-0">›</span>
                    {label}
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link to="/catalog" className="text-[var(--accent-light)] hover:text-white transition-colors font-semibold text-xs uppercase tracking-wide flex items-center gap-1">
                  Весь каталог <ArrowRight size={12} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <div className="font-semibold mb-5 text-white/90 flex items-center gap-2">
              <span className="w-1 h-4 rounded bg-[var(--accent)] inline-block" />
              {footer.info}
            </div>
            <ul className="space-y-2.5 text-sm">
              {[
                [nav.about, '/about'],
                [nav.portfolio, '/portfolio'],
                [nav.dealers, '/dealers'],
                [nav.blog, '/blog'],
                [nav.files, '/files'],
                ['FAQ', '/faq'],
                [footer.delivery, '/delivery'],
              ].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-white/50 hover:text-white transition-colors flex items-center gap-1.5 group">
                    <span className="w-0 group-hover:w-3 overflow-hidden transition-all text-[var(--accent)] flex-shrink-0">›</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <div className="font-semibold mb-5 text-white/90 flex items-center gap-2">
              <span className="w-1 h-4 rounded bg-[var(--accent)] inline-block" />
              {footer.contacts}
            </div>
            <ul className="space-y-4 text-sm">
              <li>
                <a href={`tel:${siteSettings.phone}`}
                  className="flex items-start gap-3 text-white/60 hover:text-white transition-colors group">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[var(--accent)]/20"
                    style={{ background: 'rgba(232,93,4,0.12)' }}>
                    <Phone size={14} className="text-[var(--accent-light)]" />
                  </span>
                  <span className="mt-1">{siteSettings.phone}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${siteSettings.email}`}
                  className="flex items-start gap-3 text-white/60 hover:text-white transition-colors group">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,85,0,0.12)' }}>
                    <Mail size={14} className="text-[var(--accent-light)]" />
                  </span>
                  <span className="mt-1 break-all">{siteSettings.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-white/50">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,85,0,0.10)' }}>
                  <MapPin size={14} className="text-[var(--accent-light)]" />
                </span>
                <span className="mt-1">{siteSettings.address}</span>
              </li>
              <li className="flex items-start gap-3 text-white/50">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Clock size={14} className="text-white/40" />
                </span>
                <span className="mt-1">{siteSettings.workHours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ─── Bottom bar ─── */}
      <div className="relative border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/30">
          <span>© {new Date().getFullYear()} Termojet. {footer.rights}.</span>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-white/60 transition-colors">{footer.privacy}</Link>
            <Link to="/terms" className="hover:text-white/60 transition-colors">{footer.terms}</Link>
            <a href="https://termojet.com.ua" target="_blank" rel="noopener noreferrer"
              className="hover:text-white/60 transition-colors flex items-center gap-1">
              termojet.com.ua <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
