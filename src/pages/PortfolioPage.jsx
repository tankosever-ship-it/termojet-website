import { useState } from 'react'
import LLink from '../components/LLink'
import { MapPin, Calendar, Zap, X, ChevronRight, ArrowUpRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import SEO from '../components/SEO'
import PageHero from '../components/PageHero'

const mono = { fontFamily: "'JetBrains Mono', monospace" }

export default function PortfolioPage() {
  const { portfolio, lang } = useApp()
  const t = useT()
  const portT = t('portfolio')
  const [selected, setSelected] = useState(null)

  return (
    <>
      <SEO title={portT.title} description={portT.subtitle} />

      {/* Hero */}
      <PageHero
        eyebrow={t('portfolio.heroBadge')}
        title={portT.title}
        subtitle={portT.subtitle}
        image="/banner-portfolio.webp"
      >
        {/* Stats */}
        <div className="flex flex-wrap gap-6 mt-8">
          {[
            ['50 000+', t('portfolio.statObjects')],
            ['15', t('portfolio.statCountries')],
            ['22', t('portfolio.statYears')],
          ].map(([v, l]) => (
            <div key={l}>
              <div className="text-2xl font-black text-white">{v}</div>
              <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)' }} className="uppercase mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </PageHero>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {portfolio.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🏗️</p>
            <p className="text-lg font-medium mb-1">{t('portfolio.emptyState')}</p>
          </div>
        ) : (
          <>
            <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'var(--text-muted)' }}
              className="uppercase mb-6">
              {portfolio.length} {t('portfolio.projectsLabel')}
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
                        {((lang !== 'uk' && item[`type_${lang}`]) ? item[`type_${lang}`] : item.type).toUpperCase()}
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
                          <MapPin size={10} />{(lang !== 'uk' && item[`location_${lang}`]) ? item[`location_${lang}`] : item.location}
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
                          <Zap size={10} />{(lang !== 'uk' && item[`power_${lang}`]) ? item[`power_${lang}`] : item.power}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[var(--primary)] transition-colors">
                      {(lang !== 'uk' && item[`title_${lang}`]) ? item[`title_${lang}`] : item.title}
                    </h3>
                    {item.desc && (
                      <p className="text-sm text-gray-500 line-clamp-2">{(lang !== 'uk' && item[`desc_${lang}`]) ? item[`desc_${lang}`] : item.desc}</p>
                    )}
                    <span className="inline-flex items-center gap-1 mt-3 text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ ...mono, fontSize: '10px', letterSpacing: '0.08em' }}>
                      {t('portfolio.details')} <ChevronRight size={11} />
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
                      {(lang !== 'uk' && selected[`type_${lang}`]) ? selected[`type_${lang}`] : selected.type}
                    </span>
                  )}
                  <h2 className="font-black text-xl text-gray-900">{(lang !== 'uk' && selected[`title_${lang}`]) ? selected[`title_${lang}`] : selected.title}</h2>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-gray-100">
                {selected.location && (
                  <span className="flex items-center gap-1.5 text-gray-500"
                    style={{ ...mono, fontSize: '11px' }}>
                    <MapPin size={12} /> {(lang !== 'uk' && selected[`location_${lang}`]) ? selected[`location_${lang}`] : selected.location}
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
                    <Zap size={12} /> {(lang !== 'uk' && selected[`power_${lang}`]) ? selected[`power_${lang}`] : selected.power}
                  </span>
                )}
              </div>

              {selected.desc && (
                <p className="text-gray-600 leading-relaxed text-sm">{(lang !== 'uk' && selected[`desc_${lang}`]) ? selected[`desc_${lang}`] : selected.desc}</p>
              )}

              {selected.links?.length > 0 && (
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'var(--text-muted)' }}
                    className="uppercase mb-2.5">{t('portfolio.equipmentLabel')}</div>
                  <div className="flex flex-wrap gap-2">
                    {selected.links.map(l => l.ext ? (
                      <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 hover:bg-[var(--primary)] hover:text-white text-gray-700 text-xs font-medium rounded transition-colors">
                        {(lang !== 'uk' && l[`label_${lang}`]) ? l[`label_${lang}`] : l.label} <ArrowUpRight size={12} />
                      </a>
                    ) : (
                      <LLink key={l.label} to={l.url} onClick={() => setSelected(null)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 hover:bg-[var(--primary)] hover:text-white text-gray-700 text-xs font-medium rounded transition-colors">
                        {(lang !== 'uk' && l[`label_${lang}`]) ? l[`label_${lang}`] : l.label} <ChevronRight size={12} />
                      </LLink>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
