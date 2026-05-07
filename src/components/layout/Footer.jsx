import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Clock, ArrowRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useT } from '../../i18n/useT'
import { assetPath } from '../../utils/assetPath'

export default function Footer() {
  const { siteSettings, lang } = useApp()
  const t = useT()
  const footer = t('footer')
  const nav = t('nav')

  return (
    <footer className="bg-[var(--primary)] text-white mt-auto">
      {/* CTA strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-black text-xl font-['Montserrat',sans-serif]">Готові до співпраці?</div>
            <div className="text-white/70 text-sm mt-0.5">Зв'яжіться з нами — підберемо оптимальне рішення для вашого проекту</div>
          </div>
          <div className="flex gap-3">
            <Link to="/contacts" className="btn-primary text-sm">
              Отримати консультацію <ArrowRight size={14} />
            </Link>
            <Link to="/catalog" className="btn-outline-white text-sm">
              Каталог обладнання
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src={assetPath('/logo.png')} alt="Termojet" className="h-8 w-auto brightness-0 invert" onError={e => { e.target.style.display='none' }} />
              <span className="font-black text-lg font-['Montserrat',sans-serif]">TERMOJET</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-4">{footer.company}</p>
            <div className="inline-flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 text-xs font-bold tracking-widest">
              🇺🇦 MADE IN UKRAINE
            </div>
          </div>

          {/* Catalog */}
          <div>
            <div className="font-semibold mb-4 text-white/90">{footer.catalog}</div>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link to="/catalog/nasosy" className="hover:text-white transition-colors">Насоси</Link></li>
              <li><Link to="/catalog/nasosni-hrupy" className="hover:text-white transition-colors">Насосні групи</Link></li>
              <li><Link to="/catalog/klapany" className="hover:text-white transition-colors">Клапани і приводи</Link></li>
              <li><Link to="/catalog/termojet-mega" className="hover:text-white transition-colors">TERMOJET Mega</Link></li>
              <li><Link to="/catalog/termojet-mini" className="hover:text-white transition-colors">TERMOJET Mini</Link></li>
              <li><Link to="/catalog/termojet-box" className="hover:text-white transition-colors">TERMOJET BOX</Link></li>
              <li><Link to="/catalog" className="text-[var(--accent-light)] hover:text-white transition-colors font-medium">Весь каталог →</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <div className="font-semibold mb-4 text-white/90">{footer.info}</div>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link to="/about" className="hover:text-white transition-colors">{nav.about}</Link></li>
              <li><Link to="/portfolio" className="hover:text-white transition-colors">{nav.portfolio}</Link></li>
              <li><Link to="/dealers" className="hover:text-white transition-colors">{nav.dealers}</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">{nav.blog}</Link></li>
              <li><Link to="/files" className="hover:text-white transition-colors">{nav.files}</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/delivery" className="hover:text-white transition-colors">{footer.delivery}</Link></li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <div className="font-semibold mb-4 text-white/90">{footer.contacts}</div>
            <ul className="space-y-3 text-sm text-white/60">
              <li>
                <a href={`tel:${siteSettings.phone}`} className="flex items-start gap-2 hover:text-white transition-colors">
                  <Phone size={14} className="mt-0.5 flex-shrink-0" />
                  {siteSettings.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${siteSettings.email}`} className="flex items-start gap-2 hover:text-white transition-colors">
                  <Mail size={14} className="mt-0.5 flex-shrink-0" />
                  {siteSettings.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                <span>{siteSettings.address}</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock size={14} className="mt-0.5 flex-shrink-0" />
                <span>{siteSettings.workHours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <span>© {new Date().getFullYear()} Termojet. {footer.rights}.</span>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white/70 transition-colors">{footer.privacy}</Link>
            <Link to="/terms" className="hover:text-white/70 transition-colors">{footer.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
