import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { assetPath } from '../utils/assetPath'

const mono = { fontFamily: "'JetBrains Mono', monospace" }

// Повноширинна шапка-банер для контентних сторінок (Блог, Проєкти, Контакти…).
// Той самий патерн, що в шапці Каталогу: фонове фото + темний градієнт-оверлей
// зліва (щоб текст читався) + eyebrow / H1 / підзаголовок. Заходить під прозорий
// навбар (marginTop -60px). `children` — для додаткового контенту (напр. статистика).
export default function PageHero({ eyebrow = 'TERMOJET', title, subtitle, image, breadcrumbs = [], children }) {
  return (
    <section
      className="relative overflow-hidden text-white flex flex-col justify-end"
      style={{
        marginTop: '-60px',
        paddingTop: 'calc(3.5rem + 60px)',
        paddingBottom: '2.75rem',
        minHeight: 340,
        background: 'linear-gradient(160deg, #0C0B0A, #141414)',
      }}
    >
      {image && (
        <>
          <img
            src={assetPath(image)}
            alt=""
            aria-hidden="true"
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ objectPosition: 'center' }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to right, rgba(8,7,6,0.85) 0%, rgba(8,7,6,0.55) 45%, rgba(8,7,6,0.2) 100%)' }}
          />
        </>
      )}
      {/* помаранчева лінія зверху */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(232,93,4,0.45)] to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 w-full">
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight size={12} />}
                {b.to
                  ? <Link to={b.to} className="hover:text-white/70 transition-colors">{b.name}</Link>
                  : <span className="text-white/70">{b.name}</span>}
              </span>
            ))}
          </div>
        )}
        <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.18em', color: 'var(--accent)' }} className="uppercase font-bold">
          {eyebrow}
        </span>
        <h1 className="text-4xl md:text-5xl font-black font-['Archivo',sans-serif] text-white mt-3 mb-3 leading-tight">
          {title}
        </h1>
        {subtitle && <p className="text-white/55 max-w-xl text-sm md:text-base">{subtitle}</p>}
        {children}
      </div>
    </section>
  )
}
