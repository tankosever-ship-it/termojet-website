import { Download, FileText, Search } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import SEO from '../components/SEO'

const FILE_TYPES = {
  pdf: { label: 'PDF', color: 'bg-red-50 text-red-600' },
  xlsx: { label: 'Excel', color: 'bg-green-50 text-green-600' },
  dwg: { label: 'DWG', color: 'bg-blue-50 text-blue-600' },
  doc: { label: 'Word', color: 'bg-blue-50 text-blue-700' },
}

function getExt(file) {
  // Prefer explicit format field, fall back to URL extension
  if (file.format) return file.format.toLowerCase().split('/')[0]
  return (file.url || '').split('.').pop()?.toLowerCase() || 'pdf'
}

export default function FilesPage() {
  const { files } = useApp()
  const t = useT()
  const filesT = t('files')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const categories = [...new Set(files.map(f => f.category).filter(Boolean))]

  const filtered = files.filter(f => {
    const matchSearch = !search || f.name?.toLowerCase().includes(search.toLowerCase())
    const matchCat = !category || f.category === category
    return matchSearch && matchCat
  })

  return (
    <>
      <SEO title={filesT.title} description={filesT.subtitle} />

      <div className="bg-gradient-to-br from-[var(--primary)] to-[#1e4a7a] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="label-accent mb-2" style={{ color: '#fb923c' }}>Termojet</div>
          <h1 className="text-4xl font-black font-['Archivo',sans-serif] mb-2">{filesT.title}</h1>
          <p className="text-white/70">{filesT.subtitle}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-52">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Пошук документів..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm bg-white" />
          </div>
          {categories.length > 0 && (
            <div className="flex gap-2">
              <button onClick={() => setCategory('')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!category ? 'bg-[var(--primary)] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                Всі
              </button>
              {categories.map(c => (
                <button key={c} onClick={() => setCategory(c === category ? '' : c)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${category === c ? 'bg-[var(--primary)] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FileText size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-1">Документів поки немає</p>
            <p className="text-sm">Незабаром тут з'являться каталоги та документація</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(file => {
              const ext = getExt(file)
              const typeInfo = FILE_TYPES[ext] || FILE_TYPES.pdf
              return (
                <div key={file.id} className="card p-4 flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText size={22} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{file.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${typeInfo.color}`}>{(file.format || typeInfo.label).toUpperCase()}</span>
                      {file.category && <span className="text-xs text-gray-400">{file.category}</span>}
                      {file.size && <span className="text-xs text-gray-400">{file.size}</span>}
                    </div>
                    {file.desc && <p className="text-xs text-gray-400 mt-1 truncate">{file.desc}</p>}
                  </div>
                  {file.url ? (
                    <>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="hidden sm:flex items-center gap-2 btn-secondary text-sm py-2 px-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Download size={14} />
                        {filesT.download}
                      </a>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="sm:hidden flex items-center gap-2 text-[var(--primary)]"
                      >
                        <Download size={18} />
                      </a>
                    </>
                  ) : (
                    <span className="text-xs text-gray-300 flex-shrink-0 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
                      Незабаром
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
