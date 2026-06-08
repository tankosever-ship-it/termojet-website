import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, RotateCcw } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { HOME_DEFAULTS } from '../../data/homeContent'

function Field({ label, value, onChange, textarea, rows = 2, hint }) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      {textarea ? (
        <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={rows}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm resize-none" />
      ) : (
        <input value={value || ''} onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
      )}
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="card p-6">
      <h3 className="font-bold mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export default function AdminContent() {
  const { homeContent, saveSettings, isAdminAuth } = useApp()
  const navigate = useNavigate()
  // homeContent вже злитий з дефолтами — беремо як стартовий стан форми (глибока копія)
  const [form, setForm] = useState(() => JSON.parse(JSON.stringify(homeContent)))
  const [saved, setSaved] = useState(false)

  if (!isAdminAuth) { navigate('/admin'); return null }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setStat = (i, k, v) => setForm(f => ({ ...f, stats: f.stats.map((s, idx) => idx === i ? { ...s, [k]: v } : s) }))
  const setAdv  = (i, k, v) => setForm(f => ({ ...f, advantages: f.advantages.map((a, idx) => idx === i ? { ...a, [k]: v } : a) }))

  async function handleSave() {
    await saveSettings({ homeContent: form })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function resetDefaults() {
    if (!confirm('Скинути всі тексти головної до стандартних?')) return
    setForm(JSON.parse(JSON.stringify(HOME_DEFAULTS)))
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="bg-[var(--primary)] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="text-white/60 hover:text-white"><ArrowLeft size={18} /></Link>
          <div>
            <div className="font-bold">Контент головної</div>
            <div className="text-white/60 text-xs">Тексти, заголовки, кнопки</div>
          </div>
        </div>
        <button onClick={resetDefaults}
          className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
          <RotateCcw size={14} /> Скинути
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        <Section title="Hero — головний банер">
          <Field label="Бейдж над заголовком" value={form.heroBadge} onChange={v => set('heroBadge', v)} />
          <Field label="Заголовок" value={form.heroTitle} onChange={v => set('heroTitle', v)} textarea rows={3}
            hint="Токен #1 буде підсвічено акцентним кольором." />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Кнопка 1 (помаранчева)" value={form.heroBtnPrimary} onChange={v => set('heroBtnPrimary', v)} />
            <Field label="Кнопка 2 (контурна)" value={form.heroBtnSecondary} onChange={v => set('heroBtnSecondary', v)} />
          </div>
        </Section>

        <Section title="Статистика (панель під банером)">
          {form.stats.map((s, i) => (
            <div key={i} className="grid grid-cols-[80px_90px_1fr] gap-2 items-end">
              <Field label={`№${i + 1} число`} value={s.num} onChange={v => setStat(i, 'num', v)} />
              <Field label="суфікс" value={s.suffix} onChange={v => setStat(i, 'suffix', v)} />
              <Field label="підпис" value={s.label} onChange={v => setStat(i, 'label', v)} />
            </div>
          ))}
          <p className="text-[11px] text-gray-400">Для №3 та №4 автоматично додається «000» (тисячі).</p>
        </Section>

        <Section title="Каталог">
          <Field label="Заголовок секції" value={form.catsTitle} onChange={v => set('catsTitle', v)} textarea
            hint="Кожен новий рядок — перенесення." />
        </Section>

        <Section title="Переваги">
          <Field label="Eyebrow (мітка)" value={form.advantagesEyebrow} onChange={v => set('advantagesEyebrow', v)} />
          <Field label="Заголовок" value={form.advantagesTitle} onChange={v => set('advantagesTitle', v)}
            hint="Слово «Termojet» буде з градієнтом." />
          <div className="space-y-3 pt-2">
            {form.advantages.map((a, i) => (
              <div key={i} className="rounded-xl border border-gray-100 p-3 space-y-2">
                <Field label={`Картка ${i + 1} — заголовок`} value={a.title} onChange={v => setAdv(i, 'title', v)} />
                <Field label="опис" value={a.desc} onChange={v => setAdv(i, 'desc', v)} textarea />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Виробництво">
          <Field label="Заголовок" value={form.productionTitle} onChange={v => set('productionTitle', v)} textarea rows={3}
            hint="Кожен новий рядок — перенесення." />
          <Field label="Опис" value={form.productionText} onChange={v => set('productionText', v)} textarea rows={3} />
        </Section>

        <Section title="Заклик (чорна секція)">
          <Field label="Текст" value={form.ctaText} onChange={v => set('ctaText', v)} textarea rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Кнопка 1" value={form.ctaBtnPrimary} onChange={v => set('ctaBtnPrimary', v)} />
            <Field label="Кнопка 2" value={form.ctaBtnSecondary} onChange={v => set('ctaBtnSecondary', v)} />
          </div>
        </Section>

        <Section title="Партнерська програма">
          <Field label="Заголовок" value={form.dealersTitle} onChange={v => set('dealersTitle', v)} />
          <Field label="Текст" value={form.dealersText} onChange={v => set('dealersText', v)} textarea rows={3} />
        </Section>

        <button onClick={handleSave} className={`btn-primary w-full justify-center py-3 ${saved ? 'bg-green-500' : ''}`}>
          <Save size={16} />
          {saved ? '✓ Збережено!' : 'Зберегти контент'}
        </button>
      </div>
    </div>
  )
}
