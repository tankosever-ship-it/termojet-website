import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Wrench, BookOpen, Truck, BarChart2, Headphones, CheckCircle, Building2, UserCheck } from 'lucide-react'
import SEO from '../components/SEO'
import ConsentCheckbox from '../components/ConsentCheckbox'
import { assetPath } from '../utils/assetPath'

const BENEFIT_ICONS = [TrendingUp, Wrench, BookOpen, Truck, BarChart2, Headphones]

const BENEFITS = [
  { title: 'Вигідне ціноутворення',      desc: 'Гнучка система знижок та дилерські ціни залежно від обсягу продажів.' },
  { title: 'Технічна підтримка',          desc: 'Навчання персоналу, сервісна документація та консультації інженерів.' },
  { title: 'Маркетингова допомога',       desc: 'Надаємо рекламні матеріали, каталоги та підтримку у просуванні.' },
  { title: 'Гнучкі поставки',            desc: 'Широкий асортимент в наявності, швидка доставка по всій Україні.' },
  { title: 'Стабільний прибуток',         desc: 'Якісна продукція з попитом, що постійно зростає на ринку.' },
  { title: 'Підтримка на кожному кроці', desc: 'Персональний менеджер, допомога з тендерами і складними об\'єктами.' },
]

const TYPES = [
  { title: 'Системний партнер',  desc: 'Взаємовигідний бізнес на узгоджених умовах із регулярними поставками та спільним плануванням продажів.' },
  { title: 'Договір поставки',   desc: 'Для разових закупівель або тестового запуску без довгострокових зобов\'язань.' },
]

const DEALER_REQ = [
  'Юридична особа або ФОП з банківським рахунком',
  'Спеціалізована діяльність у сфері інженерних систем',
  'Офіс і хоча б один виставковий зразок обладнання',
  'Штатний фахівець з продажу котельного обладнання',
  'Персонал і обладнання для сервісного обслуговування',
  'Підписані дилерська і сервісна угоди',
]

const INSTALLER_REQ = [
  'Статус ФОП або юридичної особи',
  'Спеціалізація у монтажі котельного обладнання або ВК',
  'Досвід монтажу інженерних систем',
  'Підписана партнерська угода',
]

function PartnerForm() {
  const [type, setType] = useState('dealer')
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', company: '', message: '' })

  function set(field) { return e => setForm(prev => ({ ...prev, [field]: e.target.value })) }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Введіть ім\'я'
    if (form.phone.replace(/\D/g, '').length < 10) errs.phone = 'Введіть коректний номер'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Некоректний email'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})

    fetch('/api-partners.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, partnerType: type }),
    }).catch(() => {})
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Заявку надіслано!</h3>
        <p className="text-[var(--text-secondary)] text-sm max-w-xs">Наш менеджер зв'яжеться з вами протягом 1 робочого дня.</p>
        <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', city: '', company: '', message: '' }) }}
          className="mt-6 text-[var(--accent)] hover:opacity-80 text-sm font-medium transition-colors">
          Подати ще одну заявку
        </button>
      </div>
    )
  }

  const inp = `w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)] transition-colors`

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type selector */}
      <div>
        <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2 block">Тип співпраці</label>
        <div className="flex gap-2">
          {[{ value: 'dealer', label: 'Дилер' }, { value: 'installer', label: 'Інсталятор' }].map(ft => (
            <button key={ft.value} type="button" onClick={() => setType(ft.value)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                type === ft.value ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'border-gray-200 text-gray-600 hover:border-[var(--accent)]/40'
              }`}>
              {ft.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Ім'я та прізвище *</label>
          <input value={form.name} onChange={set('name')} placeholder="Іван Петренко"
            className={`${inp} ${errors.name ? 'border-red-400' : 'border-gray-200'}`} />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Компанія</label>
          <input value={form.company} onChange={set('company')} placeholder="ТОВ «Назва»"
            className={`${inp} border-gray-200`} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Email *</label>
          <input type="email" value={form.email} onChange={set('email')} placeholder="email@company.ua"
            className={`${inp} ${errors.email ? 'border-red-400' : 'border-gray-200'}`} />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Телефон *</label>
          <input type="tel" value={form.phone} onChange={set('phone')}
            onInput={e => { e.target.value = e.target.value.replace(/[^\d\s+\-()]/g, '') }}
            placeholder="+380 XX XXX XX XX"
            className={`${inp} ${errors.phone ? 'border-red-400' : 'border-gray-200'}`} />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-1 block">Місто</label>
        <input value={form.city} onChange={set('city')} placeholder="Київ"
          className={`${inp} border-gray-200`} />
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-1 block">Повідомлення</label>
        <textarea value={form.message} onChange={set('message')} rows={3}
          placeholder="Розкажіть про ваш бізнес і досвід роботи у сфері..."
          className={`${inp} border-gray-200 resize-none`} />
      </div>

      <ConsentCheckbox buttonLabel="Надіслати заявку на партнерство" />
      <button type="submit"
        className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90"
        style={{ background: 'var(--accent)' }}>
        Надіслати заявку на партнерство
      </button>
      <p className="text-gray-400 text-xs text-center">Після отримання заявки наш менеджер зв'яжеться з вами протягом 1 робочого дня</p>
    </form>
  )
}

export default function PartnersPage() {
  const [activeTab, setActiveTab] = useState('dealer')
  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  return (
    <>
      <SEO
        title="Стати партнером — Termojet"
        description="Партнерська програма Termojet для дилерів та монтажних організацій. Вигідні умови, маркетингова підтримка, навчання."
      />

      {/* Hero banner — фон рукостискання (як на /about) */}
      <section className="relative overflow-hidden text-white py-24 md:py-32">
        <img src={assetPath('/partners-handshake.jpg')} alt="" aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(8,10,14,0.80) 0%, rgba(8,10,14,0.62) 45%, rgba(8,10,14,0.82) 100%)' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,85,0,0.6)] to-transparent" />
        <motion.div initial="hidden" animate="show" variants={fadeUp} transition={{ duration: 0.45 }}
          className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="label-accent mb-3" style={{ color: 'var(--accent)' }}>Партнерська програма</div>
          <h1 className="text-3xl md:text-5xl font-black mb-4 font-['Archivo',sans-serif] drop-shadow">
            Станьте партнером Termojet
          </h1>
          <p className="text-white/85 max-w-2xl mx-auto leading-relaxed">
            Приєднуйтесь до мережі дилерів та монтажних організацій, що успішно розвивають бізнес на якісному котельному обладнанні українського виробника.
          </p>
        </motion.div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {BENEFITS.map((b, i) => {
              const Icon = BENEFIT_ICONS[i]
              return (
                <motion.div key={b.title}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="card rounded-2xl p-6 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,85,0,0.08)' }}>
                    <Icon size={18} className="text-[var(--accent)]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--text-primary)] text-sm mb-1">{b.title}</div>
                    <div className="text-[var(--text-secondary)] text-sm leading-relaxed">{b.desc}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Cooperation types */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 text-center">Формати співпраці</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {TYPES.map((tp, i) => (
                <div key={tp.title} className="rounded-2xl border border-[var(--ink-200)] p-6">
                  <div className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-sm mb-4"
                    style={{ background: 'var(--accent)' }}>
                    {i + 1}
                  </div>
                  <h4 className="font-bold text-[var(--text-primary)] mb-2">{tp.title}</h4>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{tp.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Requirements + Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Requirements */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Вимоги до партнерів</h3>

              <div className="flex gap-2 mb-6">
                {[
                  { key: 'dealer', label: 'Дилер', icon: Building2 },
                  { key: 'installer', label: 'Інсталятор', icon: UserCheck },
                ].map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => setActiveTab(key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                      activeTab === key
                        ? 'text-white border-[var(--accent)]'
                        : 'border-[var(--ink-200)] text-gray-600 hover:border-[var(--accent)]/40'
                    }`}
                    style={activeTab === key ? { background: 'var(--accent)' } : {}}>
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </div>

              <ul className="space-y-3">
                {(activeTab === 'dealer' ? DEALER_REQ : INSTALLER_REQ).map(req => (
                  <li key={req} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                    <CheckCircle size={16} className="text-[var(--accent)] shrink-0 mt-0.5" />
                    {req}
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-2xl p-5" style={{ background: 'rgba(255,85,0,0.06)', border: '1px solid rgba(255,85,0,0.15)' }}>
                <p className="text-sm font-medium mb-1" style={{ color: '#c44000' }}>Маєте питання?</p>
                <p className="text-sm" style={{ color: '#c44000' }}>
                  Зателефонуйте нам:{' '}
                  <a href="tel:+380507189165" className="font-bold hover:underline">+380 50 718 91 65</a>
                </p>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="card rounded-3xl p-8">
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Реєстрація партнера</h3>
              <PartnerForm />
            </motion.div>

          </div>
        </div>
      </section>
    </>
  )
}
