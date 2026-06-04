import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Phone, Mail, Clock,
  Headphones, FileText, Settings, Car, LayoutTemplate, Flame,
  ShieldCheck, AlertTriangle, CheckCircle, Thermometer, Zap, Wrench,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import ConsentCheckbox from '../components/ConsentCheckbox'
import SEO from '../components/SEO'

const fadeUp  = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }
const stagger = { show: { transition: { staggerChildren: 0.1 } } }
const mono = { fontFamily: "'JetBrains Mono', monospace" }

const TECH_SERVICES = [
  { icon: Headphones,    title: 'Консультація спеціалістів',  desc: 'Відповімо на технічні питання щодо підбору, монтажу та налаштування обладнання. Консультуємо телефоном та електронною поштою.' },
  { icon: FileText,      title: 'Розробка технічних схем',    desc: 'Розробляємо гідравлічні схеми підключення колекторів, насосних груп та теплових насосів під конкретний об\'єкт.' },
  { icon: Settings,      title: 'Підбір обладнання',          desc: 'Розраховуємо параметри та підбираємо оптимальне обладнання виходячи з потужності системи та вимог замовника.' },
  { icon: Car,           title: 'Виїзд спеціаліста',          desc: 'Організовуємо виїзд авторизованого інженера для технічного огляду, запуску або усунення несправностей.' },
  { icon: LayoutTemplate, title: 'Комплексне проектування',   desc: 'Проектуємо системи опалення та гарячого водопостачання під ключ: від технічного завдання до робочих креслень.' },
  { icon: Flame,         title: 'Налаштування котельні',      desc: 'Виконуємо пусконалагодження котелень, програмування контролерів та балансування контурів опалення.' },
]

const WARRANTY_BLOCKS = [
  {
    icon: ShieldCheck,
    badge: '2 роки',
    title: 'Колектори, гідроділювачі, насосні групи',
    items: ['Розподільні колектори всіх модифікацій', 'Гідравлічні розділювачі (гідроділювачі)', 'Насосні групи в зборі', 'Кріплення та монтажне обладнання', 'Автоматика та контролери'],
    color: 'var(--primary)',
  },
  {
    icon: Thermometer,
    badge: '3 роки',
    title: 'Теплові насоси Termojet',
    items: ['За умови щорічного технічного обслуговування', 'Авторизований запуск сертифікованим фахівцем', 'Реєстрація в системі гарантійного обліку', 'Дотримання умов монтажу згідно інструкції'],
    color: 'var(--accent)',
  },
  {
    icon: Clock,
    badge: '2 роки',
    title: 'Циркуляційні насоси, клапани, електроприводи',
    items: ['Безумовна гарантія на циркуляційні насоси', 'Трьохходові та двохходові клапани', 'Електроприводи та сервоприводи', 'Без додаткових умов для стандартної гарантії'],
    color: 'var(--primary)',
  },
]

const HEAT_PUMP_REQUIREMENTS = [
  'Введення в експлуатацію авторизованим сервісним партнером Termojet',
  'Щорічне технічне обслуговування з підписанням акту виконаних робіт',
  'Заповнення та реєстрація гарантійного талону в день монтажу',
  'Дотримання параметрів теплоносія відповідно до вимог технічної документації',
  'Встановлення захисних фільтрів та обладнання відповідно до схеми підключення',
]

const VOID_CASES = [
  'Монтаж та обслуговування некваліфікованим персоналом',
  'Забруднення теплоносія або системи механічними частинками',
  'Стрибки напруги та відхилення від норм електромережі',
  'Неправильний монтаж, що суперечить схемі підключення',
  'Хімічний склад теплоносія поза допустимими межами',
  'Механічне пошкодження ущільнень, різьб або корпусних елементів',
]

const TABS = ['Технічна підтримка', 'Гарантія', 'Зворотній зв\'язок']

export default function ServicePage() {
  const t    = useT()
  const { siteSettings, sendConsultation } = useApp()
  const [activeTab, setActiveTab] = useState(0)
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  async function onSubmit(data) {
    await sendConsultation({ ...data, type: 'service' })
    setSuccess(true)
    reset()
  }

  return (
    <>
      <SEO
        title="Сервіс та підтримка — Termojet"
        description="Технічна підтримка, гарантія та сервіс обладнання Termojet: консультації, підбір, виїзд спеціаліста, гарантія 2–3 роки."
      />

      {/* Hero */}
      <section className="hero-gradient grain relative overflow-hidden text-white py-20 md:py-28">
        <div className="orb orb-warm   w-[400px] h-[400px] -right-20 top-1/2 -translate-y-1/2 opacity-40" />
        <div className="orb orb-orange w-[280px] h-[280px] -left-16  -top-16              opacity-30" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,85,0,0.6)] to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div variants={fadeUp}>
              <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.18em', color: 'var(--accent)' }} className="uppercase">
                СЕРВІС · ГАРАНТІЯ · ПІДТРИМКА
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-black mt-3 mb-4 leading-tight font-['Archivo',sans-serif]">
              Сервіс та підтримка
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-white/70 max-w-2xl mx-auto">
              Технічна підтримка, гарантія виробника та зворотній зв'язок — все в одному місці
            </motion.p>
            <motion.div variants={fadeUp} className="flex justify-center flex-wrap gap-4 mt-8">
              {[['ГАРАНТІЯ', '2–3 РОКИ'], ['ВІДПОВІДЬ', 'ДО 24 ГОДИН'], ['ІНЖЕНЕРИ', '~100 ФАХІВЦІВ']].map(([k, v]) => (
                <div key={k} className="bg-white/8 border border-white/12 px-5 py-2.5 backdrop-blur-sm text-center">
                  <div style={{ ...mono, fontSize: '18px', fontWeight: 900, color: 'var(--accent)' }}>{v}</div>
                  <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)' }} className="uppercase">{k}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Tab switcher */}
      <div className="sticky top-[60px] z-10 bg-white border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-0">
            {TABS.map((tab, i) => (
              <button key={i} onClick={() => setActiveTab(i)}
                className="px-6 py-4 transition-all text-sm font-bold"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: activeTab === i ? 'var(--accent)' : 'var(--text-secondary)',
                  borderBottom: activeTab === i ? '2px solid var(--accent)' : '2px solid transparent',
                }}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab 0: Технічна підтримка ── */}
      {activeTab === 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">

          {/* Intro block */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mb-16">
            <motion.p variants={fadeUp} className="text-[var(--text-secondary)] text-base leading-relaxed max-w-4xl mb-10">
              Компанія Termojet надає повний спектр сервісних послуг що стосуються обладнання Termojet — теплових насосів, насосів, автоматики для котельних, насосних груп, колекторів, гідрострілок. Одним із головних принципів нашої компанії є забезпечення клієнтів якісним сервісним обслуговуванням.
            </motion.p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Виконуємо роботи */}
              <motion.div variants={fadeUp}>
                <div className="label-accent mb-4">Ми виконуємо</div>
                <ul className="space-y-3">
                  {[
                    'Пуско-налагодження та введення в експлуатацію теплових насосів та автоматики для котельних Termojet',
                    'Встановлення та налаштування автоматики Termojet Light та Termojet Profi Plus',
                    'Гарантійне, післягарантійне та технічне обслуговування теплових насосів, котелень та систем швидкого монтажу',
                    'Гарантійний та післягарантійний ремонт обладнання Termojet (насоси, теплові насоси, автоматика)',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 mt-0.5 flex items-center justify-center rounded-full"
                        style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}>
                        <Wrench size={11} style={{ color: 'var(--accent)' }} />
                      </div>
                      <span className="text-[var(--text-secondary)] text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Переваги */}
              <motion.div variants={fadeUp}>
                <div className="label-accent mb-4">Переваги сервісного центру</div>
                <ul className="space-y-3">
                  {[
                    'Договірні відносини з партнерами',
                    'Подання заявки у телефонному режимі або у месенджер',
                    'Наявність всіх запчастин на складі',
                    'Приїзд інженера в найкоротший термін',
                    'Кваліфікована консультація спеціаліста',
                    'Спеціалізований інструмент з вимірюванням усіх параметрів обладнання',
                    'Щорічне профілактичне обслуговування теплових насосів (спліт та моноблок) для стабільної роботи з максимальним COP',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                      <span className="text-[var(--text-secondary)] text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            <motion.p variants={fadeUp} className="mt-8 text-[var(--text-secondary)] text-sm leading-relaxed max-w-4xl"
              style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '16px' }}>
              У сервісному відділі працюють фахівці високої кваліфікації, які пройшли повний курс навчання та оснащені сучасними приладами для діагностики, ремонтних робіт та обслуговування обладнання. Вас не залишать віч-на-віч з вашою проблемою і допоможуть попередити можливі проблеми в майбутньому.
            </motion.p>
          </motion.div>

          <div className="h-px bg-[var(--border)] mb-16" />

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-10">
            <div className="label-accent mb-2">Послуги</div>
            <h2 className="section-title">Як ми допоможемо</h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
          >
            {TECH_SERVICES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={i} variants={fadeUp} className="card p-7 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="icon-badge-orange"><Icon size={22} /></div>
                  <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'var(--text-muted)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2">{title}</h3>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
            className="bg-[var(--primary)] rounded-3xl p-10 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="label-accent mb-4">Контакти</div>
                <h2 className="text-3xl font-black mb-4 font-['Archivo',sans-serif]">Зв'яжіться з технічним відділом</h2>
                <p className="text-white/70 mb-6">Наші інженери готові відповісти на питання в робочий час. Для термінових — телефонуйте.</p>
                <div className="space-y-3">
                  <a href="tel:+380507189165" className="flex items-center gap-3 text-white font-medium hover:text-[var(--accent)] transition-colors">
                    <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center"><Phone size={16} /></div>
                    +380 50 718 91 65
                  </a>
                  <a href="mailto:termojet@sofievka.kiev.ua" className="flex items-center gap-3 text-white font-medium hover:text-[var(--accent)] transition-colors">
                    <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center"><Mail size={16} /></div>
                    termojet@sofievka.kiev.ua
                  </a>
                </div>
              </div>
              <div className="text-center lg:text-right">
                <button onClick={() => setActiveTab(2)} className="btn-primary inline-flex text-base px-8 py-4">
                  Залишити заявку
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* ── Tab 1: Гарантія ── */}
      {activeTab === 1 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-10">
            <div className="label-accent mb-2">Гарантійні умови</div>
            <h2 className="section-title">Терміни гарантії на продукцію</h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {WARRANTY_BLOCKS.map(({ icon: Icon, badge, title, items, color }, i) => (
              <motion.div key={i} variants={fadeUp} className="card p-7 flex flex-col gap-5">
                <div className="flex items-start justify-between">
                  <div className="icon-badge-dark"><Icon size={22} /></div>
                  <span className="px-3 py-1 font-black"
                    style={{ ...mono, fontSize: '13px', color, background: `color-mix(in srgb, ${color} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 30%, transparent)` }}>
                    {badge}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--text-primary)] mb-3">{title}</h3>
                  <ul className="space-y-2">
                    {items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <CheckCircle size={15} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--text-secondary)] text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="icon-badge-dark"><ShieldCheck size={20} /></div>
                  <h2 className="font-bold text-xl text-[var(--text-primary)]">Вимоги для теплових насосів</h2>
                </div>
                <ul className="space-y-3">
                  {HEAT_PUMP_REQUIREMENTS.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
                      <span className="text-[var(--text-secondary)] text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <div className="bg-red-50 border border-red-100 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle size={20} className="text-red-500" />
                  </div>
                  <h2 className="font-bold text-xl text-[var(--text-primary)]">Випадки відмови в гарантії</h2>
                </div>
                <ul className="space-y-3">
                  {VOID_CASES.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Zap size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-[var(--text-secondary)] text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Tab 2: Зворотній зв'язок ── */}
      {activeTab === 2 && (
        <section className="max-w-4xl mx-auto px-4 py-16">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="card p-8 md:p-10">
            <div className="label-accent mb-3">Сервісний запит</div>
            <h2 className="font-bold text-2xl text-[var(--text-primary)] mb-2">Залишити заявку</h2>
            <p className="text-[var(--text-secondary)] text-sm mb-8">Опишіть вашу ситуацію — наш технічний відділ зв'яжеться протягом 1 робочого дня.</p>

            {success ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">✅</div>
                <p className="font-medium text-gray-900">Заявку отримано! Ми зв'яжемося найближчим часом.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <select {...register('requestType')}
                  className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm bg-white text-[var(--text-secondary)]">
                  <option value="consultation">Технічна консультація</option>
                  <option value="warranty">Гарантійний випадок</option>
                  <option value="repair">Ремонт обладнання</option>
                  <option value="selection">Підбір обладнання</option>
                  <option value="project">Проектування системи</option>
                </select>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input {...register('name', { required: true })} placeholder="Ім'я та прізвище"
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
                    {errors.name && <p className="text-xs text-red-500 mt-1">Введіть ім'я</p>}
                  </div>
                  <div>
                    <input {...register('phone', { required: true })} placeholder="Номер телефону" type="tel"
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">Введіть телефон</p>}
                  </div>
                </div>
                <textarea {...register('message')} placeholder="Опишіть вашу ситуацію або питання..." rows={5}
                  className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm resize-none" />
                <ConsentCheckbox buttonLabel="Надіслати заявку" />
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3.5 text-base">
                  {isSubmitting ? 'Надсилаємо...' : 'Надіслати заявку'}
                </button>
              </form>
            )}

            <div className="mt-8 pt-8 border-t border-[var(--border)] flex flex-wrap gap-6">
              <a href="tel:+380507189165" className="flex items-center gap-3 text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                <div className="w-9 h-9 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center"><Phone size={16} className="text-[var(--primary)]" /></div>
                <span className="text-sm font-medium">+380 50 718 91 65</span>
              </a>
              <a href="mailto:termojet@sofievka.kiev.ua" className="flex items-center gap-3 text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                <div className="w-9 h-9 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center"><Mail size={16} className="text-[var(--primary)]" /></div>
                <span className="text-sm font-medium">termojet@sofievka.kiev.ua</span>
              </a>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center"><Clock size={16} className="text-[var(--primary)]" /></div>
                <span className="text-sm text-[var(--text-secondary)]">Пн–Пт: 09:00–18:00</span>
              </div>
            </div>
          </motion.div>
        </section>
      )}
    </>
  )
}
