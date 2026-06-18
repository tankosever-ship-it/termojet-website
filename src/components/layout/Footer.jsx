import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Clock, ArrowRight, ExternalLink } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useT } from '../../i18n/useT'
import { assetPath } from '../../utils/assetPath'

// ─── Форма підписки на новини ───
function SubscribeForm() {
  const { subscribe } = useApp()
  const t = useT()
  const footer = t('footer')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null) // null | 'loading' | 'ok' | 'err'

  async function onSubmit(e) {
    e.preventDefault()
    if (!email.trim() || status === 'loading') return
    setStatus('loading')
    const res = await subscribe(email.trim())
    if (res.ok) { setStatus('ok'); setEmail('') }
    else setStatus('err')
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-2 max-w-sm">
        <input
          type="email"
          required
          value={email}
          onChange={e => { setEmail(e.target.value); if (status) setStatus(null) }}
          placeholder={footer.emailPlaceholder}
          className="w-full px-3.5 py-2.5 text-sm text-white rounded-lg outline-none focus:border-[var(--accent)] transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
        />
        <button type="submit" disabled={status === 'loading'}
          className="btn-primary w-full justify-center px-4 py-2.5 text-sm disabled:opacity-60">
          {status === 'loading' ? '...' : footer.subscribe}
        </button>
      </form>
      {status === 'ok'  && <p className="text-[var(--accent-light)] text-xs mt-2">{footer.subscribeSuccess}</p>}
      {status === 'err' && <p className="text-red-400 text-xs mt-2">{footer.subscribeError}</p>}
      <p className="text-white/35 text-xs leading-relaxed mt-2">
        {footer.subscribeConsentPre}{' '}
        <Link to="/privacy" className="underline hover:text-white/60" target="_blank">{footer.subscribeConsentPrivacy}</Link>
        {' '}{footer.subscribeConsentPost}
      </p>
    </div>
  )
}

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
            <div className="mb-4">
              <img src={assetPath('/logo-white.png')} alt="Termojet" className="h-12 w-auto" />
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-4">{footer.company}</p>

            {/* Підписка — одразу під описом */}
            <div className="mb-5">
              <div className="font-semibold text-white/90 text-sm mb-2 flex items-center gap-2">
                <span className="w-1 h-4 rounded bg-[var(--accent)] inline-block" />
                {footer.newsletterTitle}
              </div>
              <SubscribeForm />
            </div>

            {/* Made in UA */}
            <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold tracking-wider border border-white/10"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              🇺🇦 <span>MADE IN UKRAINE</span>
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
                [footer.catPumps, '/catalog/nasosy'],
                [footer.catPumpGroups, '/catalog/nasosni-hrupy'],
                [footer.catValves, '/catalog/klapany'],
                [footer.catManifolds, '/catalog/rozpodilchi-kolektory'],
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
                  {footer.allCatalog} <ArrowRight size={12} />
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
                <span className="mt-1">{(lang !== 'uk' && siteSettings[`address_${lang}`]) ? siteSettings[`address_${lang}`] : siteSettings.address}</span>
              </li>
              <li className="flex items-start gap-3 text-white/50">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Clock size={14} className="text-white/40" />
                </span>
                <span className="mt-1">{(lang !== 'uk' && siteSettings[`workHours_${lang}`]) ? siteSettings[`workHours_${lang}`] : siteSettings.workHours}</span>
              </li>
            </ul>

            {/* Соцмережі */}
            <div className="mt-6">
              <div className="text-white/40 text-xs uppercase tracking-wider mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {footer.followUs}
              </div>
              <div className="flex gap-2.5">
                {[
                  {
                    href: 'https://www.facebook.com/Termojet.ukr/', label: 'Facebook',
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z"/>
                      </svg>
                    ),
                  },
                  {
                    href: 'https://www.instagram.com/termojetua/', label: 'Instagram',
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                      </svg>
                    ),
                  },
                  {
                    href: 'https://share.google/K9c85Dx6byTlB8XN9',
                    label: 'Google',
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#EA4335" d="M12 5.8c1.6 0 3.1.6 4.2 1.6l3.1-3.1C17.5 2.4 14.9 1.3 12 1.3 7.7 1.3 4 3.8 2.2 7.4l3.7 2.8C6.7 7.6 9.1 5.8 12 5.8z"/>
                        <path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.9c-.3 1.4-1 2.5-2.2 3.3l3.6 2.8c2.1-1.9 3.2-4.8 3.2-8z"/>
                        <path fill="#FBBC05" d="M5.9 14.2c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2L2.2 7.4C1.5 8.8 1.1 10.4 1.1 12.2s.4 3.4 1.1 4.8l3.7-2.8z"/>
                        <path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.6 1.1-2.9 0-5.3-1.9-6.1-4.5l-3.7 2.8C4 20.5 7.7 23 12 23z"/>
                      </svg>
                    ),
                  },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    aria-label={s.label} title={s.label}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white transition-all hover:bg-[var(--accent)]/20"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Service / legal links ─── */}
      <div className="relative border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/50">
          {[
            [footer.delivery, '/delivery'],
            [footer.returns, '/returns'],
            [footer.privacy, '/privacy'],
            [footer.terms, '/terms'],
            [footer.consultation, '/contacts'],
          ].map(([label, to]) => (
            <Link key={to} to={to} className="hover:text-white transition-colors">{label}</Link>
          ))}
        </div>
      </div>

      {/* ─── Bottom bar ─── */}
      <div className="relative border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/30">
          <span>© {new Date().getFullYear()} Termojet. {footer.rights}.</span>
          <div className="flex gap-5">
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
