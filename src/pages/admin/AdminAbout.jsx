import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, RotateCcw, Plus, Trash2, Upload, Loader2, Film } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ABOUT_DEFAULTS, youtubeId } from '../../data/aboutContent'
import ImageUpload from '../../components/admin/ImageUpload'

function Section({ title, children }) {
  return (
    <div className="card p-6">
      <h3 className="font-bold mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, value, onChange, textarea, rows = 2, hint, placeholder }) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      {textarea ? (
        <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm resize-none" />
      ) : (
        <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
      )}
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

// Завантаження відео з компʼютера (mp4/webm/mov) → url
function VideoUpload({ value, onChange }) {
  const { uploadFile } = useApp()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const inputRef = useRef(null)

  async function pick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setErr(''); setBusy(true)
    const res = await uploadFile(file)
    setBusy(false)
    if (res.url) onChange(res.url)
    else setErr(res.error || 'Помилка завантаження')
  }

  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">Власне відео цеху (mp4)</label>
      <div className="flex items-center gap-3 flex-wrap">
        <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="/about-factory.mp4 або URL"
          className="flex-1 min-w-52 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50">
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {busy ? 'Завантаження…' : 'Завантажити відео'}
        </button>
        <input ref={inputRef} type="file" accept="video/mp4,video/webm,video/quicktime,.mov,.m4v" onChange={pick} className="hidden" />
      </div>
      {value && <video src={value} className="mt-2 w-48 rounded-lg bg-black" muted controls />}
      {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
    </div>
  )
}

export default function AdminAbout() {
  const { aboutContent, saveSettings, isAdminAuth } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState(() => JSON.parse(JSON.stringify(aboutContent)))
  const [saved, setSaved] = useState(false)

  if (!isAdminAuth) { navigate('/admin'); return null }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setPhoto = (i, k, v) => setForm(f => ({ ...f, photos: f.photos.map((p, idx) => idx === i ? { ...p, [k]: v } : p) }))
  const addPhoto = () => setForm(f => ({ ...f, photos: [...(f.photos || []), { url: '', caption: '' }] }))
  const removePhoto = (i) => setForm(f => ({ ...f, photos: f.photos.filter((_, idx) => idx !== i) }))

  async function handleSave() {
    // прибираємо порожні фото
    const clean = { ...form, photos: (form.photos || []).filter(p => p.url) }
    await saveSettings({ aboutContent: clean })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function resetDefaults() {
    if (!confirm('Скинути контент сторінки «Про нас» до стандартного?')) return
    setForm(JSON.parse(JSON.stringify(ABOUT_DEFAULTS)))
  }

  const ytOk = youtubeId(form.youtubeUrl)

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="bg-[var(--primary)] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="text-white/60 hover:text-white"><ArrowLeft size={18} /></Link>
          <div>
            <div className="font-bold">Сторінка «Про нас»</div>
            <div className="text-white/60 text-xs">Тексти, відео, фото виробництва</div>
          </div>
        </div>
        <button onClick={resetDefaults} className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
          <RotateCcw size={14} /> Скинути
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        <Section title="Секція виробництва — тексти">
          <Field label="Мітка (eyebrow)" value={form.manufEyebrow} onChange={v => set('manufEyebrow', v)} />
          <Field label="Заголовок" value={form.manufTitle} onChange={v => set('manufTitle', v)} textarea rows={2}
            hint="Кожен новий рядок — перенесення; останній рядок підсвічується акцентом." />
          <Field label="Підзаголовок" value={form.manufSubtitle} onChange={v => set('manufSubtitle', v)} textarea rows={2} />
        </Section>

        <Section title="Відео">
          <VideoUpload value={form.localVideo} onChange={v => set('localVideo', v)} />
          <div>
            <Field label="Оглядове відео (YouTube)" value={form.youtubeUrl} onChange={v => set('youtubeUrl', v)}
              placeholder="https://youtu.be/..." />
            {form.youtubeUrl && !ytOk && <p className="text-[11px] text-red-500 mt-1">Не вдалося розпізнати YouTube-посилання</p>}
            {ytOk && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-green-600">
                <Film size={13} /> Розпізнано відео: {ytOk}
              </div>
            )}
          </div>
        </Section>

        <Section title="Фотогалерея виробництва">
          <p className="text-[11px] text-gray-400 -mt-2">Ці фото показуються і на сторінці «Про нас», і на головній у секції «Від листа сталі».</p>
          <div className="space-y-4">
            {(form.photos || []).map((p, i) => (
              <div key={i} className="rounded-xl border border-gray-100 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Фото {i + 1}</span>
                  <button onClick={() => removePhoto(i)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
                </div>
                <ImageUpload value={p.url} onChange={v => setPhoto(i, 'url', v)} label="Зображення" />
                <Field label="Підпис" value={p.caption} onChange={v => setPhoto(i, 'caption', v)} placeholder="Напр.: Лазерний листоріз" />
              </div>
            ))}
          </div>
          <button onClick={addPhoto} className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
            <Plus size={15} /> Додати фото
          </button>
        </Section>

        <button onClick={handleSave} className={`btn-primary w-full justify-center py-3 ${saved ? 'bg-green-500' : ''}`}>
          <Save size={16} />
          {saved ? '✓ Збережено!' : 'Зберегти'}
        </button>
      </div>
    </div>
  )
}
