import { useState } from 'react'
import { MapPin, Calendar, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import SEO from '../components/SEO'

export default function PortfolioPage() {
  const { portfolio } = useApp()
  const t = useT()
  const portT = t('portfolio')
  const [selected, setSelected] = useState(null)

  return (
    <>
      <SEO title={portT.title} description={portT.subtitle} />

      <div className="bg-gradient-to-br from-[var(--primary)] to-[#1e4a7a] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="label-accent mb-2" style={{ color: '#fb923c' }}>Наші об'єкти</div>
          <h1 className="text-4xl font-black font-['Montserrat',sans-serif] mb-2">{portT.title}</h1>
          <p className="text-white/70">{portT.subtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {portfolio.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🏗️</p>
            <p className="text-lg font-medium mb-1">Проекти в процесі додавання</p>
            <p className="text-sm">Незабаром тут з'являться реалізовані об'єкти</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {portfolio.map(item => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="card card-hover overflow-hidden text-left w-full"
              >
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-52 object-cover" />
                ) : (
                  <div className="w-full h-52 bg-gray-100 flex items-center justify-center text-5xl text-gray-300">🏭</div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-2 text-xs text-gray-400">
                    {item.location && <span className="flex items-center gap-1"><MapPin size={11} />{item.location}</span>}
                    {item.year && <span className="flex items-center gap-1"><Calendar size={11} />{item.year}</span>}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  {item.power && <p className="text-xs text-[var(--primary)] font-medium">Потужність: {item.power}</p>}
                  {item.desc && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.desc}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            {selected.image && <img src={selected.image} alt={selected.title} className="w-full h-64 object-cover" />}
            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="font-bold text-xl text-gray-900">{selected.title}</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <X size={20} />
                </button>
              </div>
              <div className="flex gap-4 text-sm text-gray-500 mb-3">
                {selected.location && <span className="flex items-center gap-1"><MapPin size={13} />{selected.location}</span>}
                {selected.year && <span className="flex items-center gap-1"><Calendar size={13} />{selected.year}</span>}
                {selected.power && <span className="text-[var(--primary)] font-medium">{selected.power}</span>}
              </div>
              {selected.desc && <p className="text-gray-600 leading-relaxed">{selected.desc}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
