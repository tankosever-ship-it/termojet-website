import { useState, useRef } from 'react'
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { imgUrl } from '../../utils/imgUrl'

// Прев'ю зображення + завантаження з компʼютера + ручний URL.
// value — поточний URL/шлях, onChange(url) — колбек при зміні.
export default function ImageUpload({ value, onChange, label = 'Зображення' }) {
  const { uploadFile } = useApp()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const inputRef = useRef(null)

  async function pick(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // дозволити повторний вибір того ж файлу
    if (!file) return
    setErr(''); setBusy(true)
    const res = await uploadFile(file)
    setBusy(false)
    if (res.url) onChange(res.url)
    else setErr(res.error || 'Помилка завантаження')
  }

  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <div className="flex items-start gap-3">
        <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
          {value
            ? <img src={imgUrl(value)} alt="" className="w-full h-full object-contain" />
            : <ImageIcon size={22} className="text-gray-300" />}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="URL або завантажте файл нижче"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50">
              {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {busy ? 'Завантаження…' : 'Завантажити з компʼютера'}
            </button>
            {value && (
              <button type="button" onClick={() => onChange('')}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors">Прибрати</button>
            )}
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <input ref={inputRef} type="file" accept="image/*" onChange={pick} className="hidden" />
        </div>
      </div>
    </div>
  )
}
