import { motion } from 'framer-motion'
import { useState } from 'react'
import { Percent, Megaphone, GraduationCap, Truck, User, Star, CheckCircle, Phone, Mail } from 'lucide-react'
import SEO from '../components/SEO'

const fadeUp  = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }
const stagger = { show: { transition: { staggerChildren: 0.1 } } }

const BENEFITS = [
  { icon: Percent,      title: 'Дилерські знижки',          desc: 'Спеціальні ціни та знижки залежно від обсягів закупівлі. Чим більше — тим вигідніше.' },
  { icon: Megaphone,    title: 'Маркетингова підтримка',    desc: 'Надаємо рекламні матеріали, банери, каталоги та допомагаємо просувати продукцію Termojet.' },
  { icon: GraduationCap, title: 'Технічні навчання',        desc: 'Регулярні навчальні сесії для ваших менеджерів та монтажників — онлайн та офлайн.' },
  { icon: Truck,        title: 'Пріоритетне відвантаження', desc: 'Партнери отримують пріоритет при відвантаженні у сезон підвищеного попиту.' },
  { icon: User,         title: 'Персональний менеджер',     desc: 'Закріплений менеджер, який знає ваш бізнес і оперативно вирішує будь-які питання.' },
  { icon: Star,         title: 'Ексклюзивні умови',         desc: 'Ексклюзивні умови для регіональних дистриб\'юторів та можливість спільних акцій.' },
]

const REQUIREMENTS = [
  'Юридична особа або ФОП із відповідним КВЕД',
  'Наявність офісу, магазину або шоуруму в регіоні',
  'Технічна компетентність персоналу у сфері інженерних систем',
  'Орієнтованість на монтаж або оптовий/роздрібний продаж',
]

const ACTIVITY_OPTIONS = [
  'Монтажна організація',
  'Оптовий продавець',
  'Роздрібний магазин',
  'Проектна організація',
]

export default function PartnersPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    company: '',
    name: '',
    phone: '',
    email: '',
    city: '',
    activity: '',
    message: '',
  })

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <SEO
        title="Стати партнером — Termojet"
        description="Приєднуйтесь до дилерської мережі Termojet. Спеціальні умови, маркетингова підтримка та навчання для партнерів."
      />

      <section className="hero-gradient grain relative overflow-hidden text-white py-20 md:py-28">
        <div className="orb orb-blue   w-[500px] h-[500px] -right-24 top-1/2 -translate-y-1/2 opacity-40" />
        <div className="orb orb-orange w-[300px] h-[300px] -left-16  -top-16              opacity-30" />
        <div className="absolute inset-0 bg-dots pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,85,0,0.6)] to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div variants={fadeUp} className="label-accent mb-4">Партнерська програма</motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-black mb-4 leading-tight font-['Archivo',sans-serif]">
              Стати партнером Termojet
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-white/70 max-w-2xl mx-auto">
              Приєднуйтесь до дилерської мережі — розвивайте бізнес разом із виробником №1 в Україні
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-10">
          <div className="label-accent mb-2">Переваги</div>
          <h2 className="section-title">Що отримують партнери</h2>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {BENEFITS.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={i} variants={fadeUp} className="card p-7 flex flex-col gap-4">
              <div className="icon-badge-orange">
                <Icon size={22} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2">{title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="bg-[var(--bg)] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <div className="label-accent mb-3">Вимоги</div>
              <h2 className="section-title mb-6">Хто може стати партнером</h2>
              <ul className="space-y-4 mb-10">
                {REQUIREMENTS.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
                    <span className="text-[var(--text-secondary)]">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="card p-6 space-y-4">
                <h3 className="font-bold text-base text-[var(--text-primary)]">Залишились питання?</h3>
                <a href="tel:+380507189165" className="flex items-center gap-3 text-sm font-medium text-gray-900 hover:text-[var(--primary)] transition-colors">
                  <div className="w-9 h-9 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone size={16} className="text-[var(--primary)]" />
                  </div>
                  +380 50 718 91 65
                </a>
                <a href="mailto:termojet@sofievka.kiev.ua" className="flex items-center gap-3 text-sm font-medium text-gray-900 hover:text-[var(--primary)] transition-colors">
                  <div className="w-9 h-9 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail size={16} className="text-[var(--primary)]" />
                  </div>
                  termojet@sofievka.kiev.ua
                </a>
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <div className="card p-8">
                <div className="label-accent mb-3">Заявка</div>
                <h2 className="font-bold text-2xl text-[var(--text-primary)] mb-6 font-['Archivo',sans-serif]">
                  Подати заявку на партнерство
                </h2>

                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} className="text-green-500" />
                    </div>
                    <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2">Заявку отримано!</h3>
                    <p className="text-[var(--text-secondary)] text-sm">
                      Наш менеджер зв'яжеться з вами протягом 1 робочого дня для обговорення умов партнерства.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      name="company" value={form.company} onChange={handleChange} required
                      placeholder="Назва компанії"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm"
                    />
                    <input
                      name="name" value={form.name} onChange={handleChange} required
                      placeholder="ПІБ контактної особи"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        name="phone" value={form.phone} onChange={handleChange} required type="tel"
                        placeholder="Телефон"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm"
                      />
                      <input
                        name="email" value={form.email} onChange={handleChange} required type="email"
                        placeholder="Email"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm"
                      />
                    </div>
                    <input
                      name="city" value={form.city} onChange={handleChange} required
                      placeholder="Місто"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm"
                    />
                    <select
                      name="activity" value={form.activity} onChange={handleChange} required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm bg-white text-[var(--text-secondary)]"
                    >
                      <option value="" disabled>Сфера діяльності</option>
                      {ACTIVITY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <textarea
                      name="message" value={form.message} onChange={handleChange}
                      placeholder="Повідомлення (необов'язково)" rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm resize-none"
                    />
                    <button
                      type="submit"
                      className="w-full py-3 px-6 rounded-xl font-bold text-white transition-colors"
                      style={{ background: 'var(--accent)' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#e04a00'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
                    >
                      Подати заявку
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </>
  )
}
