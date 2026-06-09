import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Package, RefreshCw, ArrowRight, CheckCircle, XCircle, Phone, Mail, Wrench, Clock, Scale } from 'lucide-react'
import SEO from '../components/SEO'

const fadeUp  = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }
const stagger = { show: { transition: { staggerChildren: 0.1 } } }

const RETURN_CONDITIONS = [
  'Товар не був у використанні — збережений товарний вигляд, пломби, ярлики.',
  'Наявна оригінальна упаковка та всі комплектуючі.',
  'Є документ, що підтверджує покупку (накладна, чек).',
  'Технічно складні товари (теплові насоси) повертаються за умови відсутності слідів монтажу та підключення.',
  'Товар не має механічних пошкоджень, слідів ремонту або стороннього втручання.',
  'Не підлягають поверненню: товари, виготовлені за індивідуальними специфікаціями замовника.',
]

const NO_RETURN_CONDITIONS = [
  'Обладнання, виготовлене за індивідуальним замовленням або нестандартними специфікаціями.',
  'Товари зі слідами монтажу, підключення до системи, або які перебували в експлуатації.',
  'Обладнання з порушеною заводською пломбою без наявності гарантійного випадку.',
  'Комплектуючі та витратні матеріали (фільтри, фреон, ущільнювачі) після відкриття упаковки.',
  'Програмне забезпечення та електронні ліцензії після активації.',
]

const WARRANTY_EXCLUSIONS = [
  'Пошкодження внаслідок неправильного монтажу або підключення сторонньою організацією.',
  'Механічні пошкодження та пошкодження внаслідок стихійного лиха.',
  'Наслідки використання обладнання не за призначенням.',
  'Природне зношення фільтрів, ущільнювачів та інших витратних матеріалів.',
]

const STEPS = [
  {
    num: '01',
    icon: Phone,
    title: 'Зв\'яжіться з нами',
    desc: 'Подзвоніть або напишіть нам, вказавши номер замовлення та причину повернення.',
  },
  {
    num: '02',
    icon: Package,
    title: 'Отримайте підтвердження',
    desc: 'Менеджер погодить умови повернення та надасть інструкції щодо пакування та відправки.',
  },
  {
    num: '03',
    icon: RefreshCw,
    title: 'Відправте товар',
    desc: 'Упакуйте товар в оригінальну упаковку та відправте на наш склад: Нова Пошта, м. Вишневе, склад №1. Вартість доставки при поверненні оплачує покупець (крім гарантійних випадків).',
  },
  {
    num: '04',
    icon: CheckCircle,
    title: 'Отримайте кошти',
    desc: 'Після перевірки товару повертаємо кошти протягом 7 робочих днів на ваш банківський рахунок.',
  },
]

export default function ReturnPage() {
  return (
    <>
      <SEO
        title="Повернення та обмін — Termojet"
        description="Умови повернення та обміну обладнання Termojet згідно із Законом України «Про захист прав споживачів». Процедура, гарантія та контакти."
      />

      <section className="hero-gradient grain relative overflow-hidden text-white pb-20 md:pb-28" style={{ marginTop: '-60px', paddingTop: 'calc(5rem + 60px)' }}>
        <div className="orb orb-warm   w-[400px] h-[400px] -right-20 top-1/2 -translate-y-1/2 opacity-40" />
        <div className="orb orb-orange w-[280px] h-[280px] -left-16  -top-16              opacity-30" />
        <div className="absolute inset-0 bg-dots pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,85,0,0.6)] to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div variants={fadeUp} className="label-accent mb-4">Termojet</motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-black mb-4 leading-tight font-['Archivo',sans-serif]">
              Повернення та обмін
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-white/70 max-w-2xl mx-auto">
              Ми дотримуємося всіх норм Закону України «Про захист прав споживачів».
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">

        {/* Умови повернення товару належної якості */}
        <section>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-8">
            <div className="label-accent mb-2">Умови</div>
            <h2 className="section-title">Умови повернення товару належної якості</h2>
            <p className="text-[var(--text-secondary)] mt-3 max-w-3xl">
              Відповідно до законодавства України, ви маєте право повернути товар належної якості протягом
              14 календарних днів з моменту отримання, якщо він не підійшов вам за формою, габаритами,
              фасоном, кольором або комплектацією.
            </p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <motion.div variants={fadeUp} className="card p-8">
              <h3 className="font-bold text-lg text-[var(--text-primary)] mb-5 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" /> Товар приймається до повернення
              </h3>
              <ul className="space-y-3">
                {RETURN_CONDITIONS.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-[var(--text-secondary)] text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={fadeUp} className="card p-8">
              <h3 className="font-bold text-lg text-[var(--text-primary)] mb-5 flex items-center gap-2">
                <XCircle size={20} className="text-red-400" /> Товари, що не підлягають поверненню
              </h3>
              <ul className="space-y-3">
                {NO_RETURN_CONDITIONS.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <XCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-[var(--text-secondary)] text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </section>

        {/* Обмін товару */}
        <section>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-8">
            <div className="label-accent mb-2">Обмін</div>
            <h2 className="section-title">Обмін товару</h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
            className="card p-8">
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Якщо придбаний товар не підійшов за технічними характеристиками, ви можете обміняти його
              протягом 14 календарних днів на інший товар з нашого асортименту. Різниця у вартості
              перераховується або доплачується покупцем.
            </p>
          </motion.div>
        </section>

        {/* Гарантійний обмін та ремонт */}
        <section>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-8">
            <div className="label-accent mb-2">Гарантія</div>
            <h2 className="section-title">Гарантійний обмін та ремонт</h2>
            <p className="text-[var(--text-secondary)] mt-3 max-w-3xl">
              Гарантійне обслуговування здійснюється відповідно до гарантійного талона, що додається
              до кожного виробу. Гарантійний термін — 3 роки з дати введення в експлуатацію.
            </p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
          >
            <motion.div variants={fadeUp} className="card p-8">
              <h3 className="font-bold text-lg text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Wrench size={20} className="text-[var(--accent)]" /> Гарантійний ремонт
              </h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Безкоштовний ремонт або заміна несправних вузлів протягом гарантійного терміну.
                Виїзд сервісного інженера по Київській області — безкоштовно, в інших регіонах — за домовленістю.
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="card p-8">
              <h3 className="font-bold text-lg text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <RefreshCw size={20} className="text-[var(--accent)]" /> Гарантійний обмін
              </h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Якщо обладнання не підлягає ремонту або несправність виникає повторно, здійснюємо
                заміну на аналогічний або рівноцінний товар.
              </p>
            </motion.div>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
            className="card p-8">
            <h3 className="font-bold text-base text-[var(--text-primary)] mb-4">Гарантія не поширюється на:</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {WARRANTY_EXCLUSIONS.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <XCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-[var(--text-secondary)] text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </section>

        {/* Як оформити повернення */}
        <section>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-8">
            <div className="label-accent mb-2">Процес</div>
            <h2 className="section-title">Як оформити повернення</h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {STEPS.map(({ num, icon: Icon, title, desc }, i) => (
              <motion.div key={i} variants={fadeUp} className="relative card p-7 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="icon-badge-orange">
                    <Icon size={22} />
                  </div>
                  <span className="text-4xl font-black text-[var(--primary)]/10">{num}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2">{title}</h3>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Строки повернення коштів + Правова основа */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
            className="card p-8">
            <h3 className="font-bold text-lg text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Clock size={20} className="text-[var(--accent)]" /> Строки повернення коштів
            </h3>
            <div className="flex items-start justify-between gap-4 border-t border-[var(--border)] pt-4">
              <span className="text-[var(--text-primary)] text-sm font-medium">Банківський переказ</span>
              <span className="text-[var(--text-secondary)] text-sm text-right">до 5–7 робочих днів після підтвердження повернення</span>
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
            className="card p-8">
            <h3 className="font-bold text-lg text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Scale size={20} className="text-[var(--accent)]" /> Правова основа
            </h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Всі умови повернення та обміну регулюються Законом України «Про захист прав споживачів»
              (стаття 9) та Цивільним кодексом України. Ми зобов'язуємося дотримуватись усіх вимог
              чинного законодавства та гарантуємо захист ваших прав як покупця.
            </p>
          </motion.div>
        </section>

        {/* Контакти для повернень — приглушений темний блок */}
        <motion.section
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
          className="rounded-3xl p-10 text-white text-center border border-white/10"
          style={{ background: 'var(--bg-dark-2)' }}
        >
          <div className="label-accent mb-4">Контакти для повернень</div>
          <h2 className="text-2xl font-black mb-3 font-['Archivo',sans-serif]">Маєте питання щодо повернення?</h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            Для оформлення повернення або гарантійного звернення зв'яжіться з нашим відділом сервісу.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <a href="tel:+380504506424" className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/15 border border-white/10 text-white font-medium px-6 py-3 rounded-lg transition-colors">
              <Phone size={18} className="text-[var(--accent)]" /> +380 (50) 450-64-24
            </a>
            <a href="mailto:termojet@sofievka.kiev.ua" className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/15 border border-white/10 text-white font-medium px-6 py-3 rounded-lg transition-colors">
              <Mail size={18} className="text-[var(--accent)]" /> termojet@sofievka.kiev.ua
            </a>
            <Link to="/contacts" className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/15 border border-white/10 text-white font-medium px-6 py-3 rounded-lg transition-colors">
              Написати нам <ArrowRight size={18} className="text-[var(--accent)]" />
            </Link>
          </div>
        </motion.section>

      </div>
    </>
  )
}
