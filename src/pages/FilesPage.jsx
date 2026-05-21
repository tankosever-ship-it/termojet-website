import { Download, FileText, FileSpreadsheet, Search, FileCheck } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import SEO from '../components/SEO'

const mono = { fontFamily: "'JetBrains Mono', monospace" }

const EXT_CONFIG = {
  pdf:  { label: 'PDF',   icon: FileText,        bg: 'bg-red-50',   text: 'text-red-600',   border: 'border-red-100' },
  xlsx: { label: 'XLSX',  icon: FileSpreadsheet,  bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
  xls:  { label: 'XLS',   icon: FileSpreadsheet,  bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
  dwg:  { label: 'DWG',   icon: FileCheck,        bg: 'bg-blue-50',  text: 'text-blue-600',  border: 'border-blue-100' },
}

function getExt(file) {
  if (file.format) return file.format.toLowerCase()
  return (file.url || '').split('.').pop()?.toLowerCase() || 'pdf'
}

const CATEGORY_ORDER = [
  'Каталоги та прайси',
  'Інструкції',
  'Брошури',
  'Сертифікати та декларації',
]

export default function FilesPage() {
  const { files } = useApp()
  const t = useT()
  const filesT = t('files')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const categories = CATEGORY_ORDER.filter(c => files.some(f => f.category === c))

  const filtered = files.filter(f => {
    const matchSearch = !search || f.name?.toLowerCase().includes(search.toLowerCase()) || f.desc?.toLowerCase().includes(search.toLowerCase())
    const matchCat = !category || f.category === category
    return matchSearch && matchCat
  })

  const grouped = categories
    .filter(c => !category || c === category)
    .map(c => ({ cat: c, items: filtered.filter(f => f.category === c) }))
    .filter(g => g.items.length > 0)

  return (
    <>
      <SEO title={filesT.title} description={filesT.subtitle} />

      {/* Hero */}
      <section style={{ background: '#0C0B0A' }} className="py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots pointer-events-none opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4">
          <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.18em', color: 'var(--accent)' }} className="uppercase">
            ДОКУМЕНТАЦІЯ · TERMOJET
          </span>
          <h1 className="text-4xl md:text-5xl font-black font-['Archivo',sans-serif] text-white mt-3 mb-3 leading-tight">
            {filesT.title}
          </h1>
          <p className="text-white/50 max-w-lg text-sm">
            Інструкції, сертифікати, декларації відповідності, каталоги та прайси — всі документи для завантаження
          </p>
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              [String(files.length), 'ДОКУМЕНТІВ'],
              ['14', 'ІНСТРУКЦІЙ'],
              ['4', 'БРОШУРИ'],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="text-2xl font-black text-white">{v}</div>
                <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)' }} className="uppercase mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Search + filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-52">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Пошук документів..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 focus:outline-none focus:border-[var(--accent)] text-sm bg-white transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory('')}
              className={`px-4 py-2 text-sm font-medium transition-colors border ${!category ? 'border-[var(--accent)] text-[var(--accent)] bg-orange-50' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'}`}
              style={mono}
            >
              ВСІ
            </button>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c === category ? '' : c)}
                className={`px-4 py-2 text-sm font-medium transition-colors border ${category === c ? 'border-[var(--accent)] text-[var(--accent)] bg-orange-50' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'}`}
                style={{ ...mono, fontSize: '10px', letterSpacing: '0.06em' }}
              >
                {c.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FileText size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-1">Нічого не знайдено</p>
            <p className="text-sm">Спробуйте змінити пошуковий запит</p>
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map(({ cat, items }) => (
              <div key={cat}>
                {/* Category heading */}
                <div className="flex items-center gap-3 mb-4">
                  <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.16em', color: 'var(--text-muted)' }} className="uppercase">
                    {cat}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                  <span style={{ ...mono, fontSize: '9px', color: 'var(--text-muted)' }}>{items.length}</span>
                </div>

                <div className="space-y-2">
                  {items.map(file => {
                    const ext = getExt(file)
                    const cfg = EXT_CONFIG[ext] || EXT_CONFIG.pdf
                    const Icon = cfg.icon

                    return (
                      <div key={file.id} className={`flex items-center gap-4 p-4 border ${cfg.border} bg-white hover:shadow-sm transition-all group`}>
                        {/* Icon */}
                        <div className={`w-10 h-10 ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
                          <Icon size={16} className={cfg.text} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm leading-tight">{file.name}</div>
                          {file.desc && (
                            <div className="text-xs text-gray-400 mt-0.5 truncate">{file.desc}</div>
                          )}
                          <div className="flex items-center gap-3 mt-1">
                            <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.1em' }} className={`${cfg.text} uppercase`}>
                              {cfg.label}
                            </span>
                            {file.year && (
                              <span style={{ ...mono, fontSize: '9px', color: 'var(--text-muted)' }}>{file.year}</span>
                            )}
                          </div>
                        </div>

                        {/* Download button */}
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-[var(--accent)] hover:text-[var(--accent)] text-gray-500 transition-all flex-shrink-0"
                          onClick={e => e.stopPropagation()}
                        >
                          <Download size={14} />
                          <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.08em' }} className="hidden sm:inline uppercase">
                            Завантажити
                          </span>
                        </a>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
