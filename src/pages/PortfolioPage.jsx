import { useState } from 'react'
import { MapPin, Calendar, Zap, X, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import SEO from '../components/SEO'

const mono = { fontFamily: "'JetBrains Mono', monospace" }

export default function PortfolioPage() {
  const { portfolio } = useApp()
  const t = useT()
  const portT = t('portfolio')
  const [selected, setSelected] = useState(null)

  return (
    <>
      <SEO title={portT.title} description={portT.subtitle} />

      {/* Hero */}
      <section style={{ background: '#0C0B0A' }} className="py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots pointer-events-none opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4">
          <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.18em', color: 'var(--accent)' }} className="uppercase">
            РЕАЛІЗОВАНІ ОБ'ЄКТИ · TERMOJET
          </span>
          <h1 className="text-4xl md:text-5xl font-black font-['Archivo',sans-serif] text-white mt-3 mb-3 leading-tight">
            {portT.title}
          </h1>
          <p className="text-white/50 max-w-xl">{portT.subtitle}</p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              ['50 000+', 'ОСНАЩЕНИХ ОБ\'ЄКТІВ'],
              ['15', 'КРАЇН ЄС'],
              ['22', 'РОКИ ДОСВІДУ'],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="text-2xl font-black text-white">{v}</div>
                <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)' }} className="uppercase mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {portfolio.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🏗️</p>
            <p className="text-lg font-medium mb-1">Проекти в процесі додавання</p>
          </div>
        ) : (
          <>
            <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'var(--text-muted)' }}
              className="uppercase mb-6">
              {portfolio.length} ПРОЕКТІВ — ВИБЕРИ ДЛЯ ДЕТАЛЕЙ
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolio.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="group card overflow-hidden text-left w-full hover:shadow-xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden h-52">
                    {item.image ? (
                      <img src={item.image} alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-5xl text-gray-300">🏭</div>
                    )}
                    {/* Type badge */}
                    {item.type && (
                      <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1"
                        style={{ ...mono, fontSize: '9px', letterSpacing: '0.1em' }}>
                        {item.type.toUpperCase()}
                      </span>
                    )}
                    {/* Number */}
                    <span className="absolute top-3 right-3 text-white/40"
                      style={{ ...mono, fontSize: '11px' }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      {item.location && (
                        <span className="flex items-center gap-1 text-gray-400"
                          style={{ ...mono, fontSize: '10px' }}>
                          <MapPin size={10} />{item.location}
                        </span>
                      )}
                      {item.year && (
                        <span className="flex items-center gap-1 text-gray-400"
                          style={{ ...mono, fontSize: '10px' }}>
                          <Calendar size={10} />{item.year}
                        </span>
                      )}
                      {item.power && (
                        <span className="flex items-center gap-1"
                          style={{ ...mono, fontSize: '10px', color: 'var(--accent)' }}>
                          <Zap size={10} />{item.power}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[var(--primary)] transition-colors">
                      {item.title}
                    </h3>
                    {item.desc && (
                      <p className="text-sm text-gray-500 line-clamp-2">{item.desc}</p>
                    )}
                    <span className="inline-flex items-center gap-1 mt-3 text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ ...mono, fontSize: '10px', letterSpacing: '0.08em' }}>
                      ДЕТАЛІ <ChevronRight size={11} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white max-w-2xl w-full overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}>
            {selected.image && (
              <img src={selected.image} alt={selected.title} className="w-full h-64 object-cover" />
            )}
            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  {selected.type && (
                    <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'var(--accent)' }}
                      className="uppercase block mb-1">
                      {selected.type}
                    </span>
                  )}
                  <h2 className="font-black text-xl text-gray-900">{selected.title}</h2>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-gray-100">
                {selected.location && (
                  <span className="flex items-center gap-1.5 text-gray-500"
                    style={{ ...mono, fontSize: '11px' }}>
                    <MapPin size={12} /> {selected.location}
                  </span>
                )}
                {selected.year && (
                  <span className="flex items-center gap-1.5 text-gray-500"
                    style={{ ...mono, fontSize: '11px' }}>
                    <Calendar size={12} /> {selected.year}
                  </span>
                )}
                {selected.power && (
                  <span className="flex items-center gap-1.5 font-semibold"
                    style={{ ...mono, fontSize: '11px', color: 'var(--accent)' }}>
                    <Zap size={12} /> {selected.power}
                  </span>
                )}
              </div>

              {selected.desc && (
                <p className="text-gray-600 leading-relaxed text-sm">{selected.desc}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
