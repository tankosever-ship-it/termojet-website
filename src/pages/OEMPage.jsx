import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Factory, Tag, Palette, Stamp, Wrench, Package, Phone, Mail, CheckCircle } from 'lucide-react'
import SEO from '../components/SEO'

const fadeUp  = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }
const stagger = { show: { transition: { staggerChildren: 0.1 } } }

const SERVICES = [
  { icon: Tag,     title: 'Виробництво під торговими марками партнерів', desc: 'Повний цикл виробництва з нанесенням бренду замовника на готову продукцію.' },
  { icon: Wrench,  title: 'Користувальницькі конфігурації',              desc: 'Індивідуальне компонування колекторів, гідроділювачів та насосних груп під технічне завдання.' },
  { icon: Palette, title: 'Кольорування в обраних кольорах',             desc: 'Фарбування корпусних деталей у кольори RAL за стандартами бренду партнера.' },
  { icon: Stamp,   title: 'Нанесення логотипу',                          desc: 'Лазерне різання, гравіювання та друк — стійке маркування на металі та пластику.' },
  { icon: Factory, title: 'Трьохходові клапани для ОЕМ замовлень',       desc: 'Виробництво та постачання трьохходових клапанів з кастомним маркуванням та упаковкою.' },
  { icon: Package, title: 'Кастомізація упаковки',                       desc: 'Дизайн та виготовлення упаковки з логотипом, кольорами та текстами партнера.' },
]

const GALLERY = [
  { src: '/images/oem/oem-kollektor-logo.jpg',     caption: 'Колектор з логотипом партнера' },
  { src: '/images/oem/oem-gs25-colors.jpg',        caption: 'Гідрострілка ГС-25 у фірмових кольорах' },
  { src: '/images/oem/oem-ng27-logo.jpg',          caption: 'Насосна група НГ-27 з брендуванням партнера' },
  { src: '/images/oem/oem-kollektor-color.jpg',    caption: 'Колектори у кольорах за RAL' },
  { src: '/images/oem/oem-kollektor-sk312.jpg',    caption: 'Колектор SK-312 — постачання на експорт' },
  { src: '/images/oem/oem-podstavka-logo.jpg',     caption: 'Підставка під тепловий насос з логотипом' },
  { src: '/images/oem/oem-photo-1.jpg',            caption: 'Продукція під торговими марками партнерів' },
  { src: '/images/oem/oem-photo-2.jpg',            caption: 'ОЕМ-виробництво систем швидкого монтажу' },
]

export default function OEMPage() {
  return (
    <>
      <SEO
        title="ОЕМ виробництво — Termojet"
        description="Termojet спеціалізується на виробництві систем швидкого монтажу під торговими марками партнерів в Україні та Європі."
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
              ОЕМ виробництво
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-white/70 max-w-2xl mx-auto">
              Виробляємо системи швидкого монтажу більш ніж під 10 торговими марками для партнерів в Україні та Європі
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-10">
          <div className="label-accent mb-2">Партнерство</div>
          <h2 className="section-title">Що ми виробляємо для партнерів</h2>
          <p className="text-[var(--text-secondary)] mt-3 max-w-2xl">
            Один із напрямків нашого виробництва — виготовлення систем швидкого монтажу
            (колекторів, гідрострілок та насосних груп), трьохходових кранів із сервоприводами
            та іншої продукції під торговими марками партнерів. Пропонуємо повний цикл ОЕМ —
            від розробки конфігурації та кольорування до нанесення логотипу й кастомної упаковки.
          </p>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {SERVICES.map(({ icon: Icon, title, desc }, i) => (
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

      {/* Галерея ОЕМ-прикладів */}
      <section className="bg-[var(--bg)] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-10 text-center">
            <div className="label-accent mb-2">Приклади робіт</div>
            <h2 className="section-title">Продукція під брендами партнерів</h2>
            <p className="text-[var(--text-secondary)] mt-3 max-w-2xl mx-auto">
              Наразі ми виготовляємо продукцію більш ніж під 10 торговими марками для партнерів в Україні та Європі.
            </p>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {GALLERY.map(({ src, caption }, i) => (
              <motion.figure key={i} variants={fadeUp} className="card overflow-hidden group">
                <div className="aspect-square bg-white overflow-hidden">
                  <img src={src} alt={caption} loading="lazy" decoding="async"
                    className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
                </div>
                <figcaption className="px-3 py-2.5 text-xs text-[var(--text-secondary)] leading-snug border-t border-[var(--ink-200)]">
                  {caption}
                </figcaption>
              </motion.figure>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
            className="bg-[var(--primary)] rounded-3xl p-10 text-white text-center">
            <div className="label-accent mb-4">Зв'яжіться з нами</div>
            <h2 className="text-3xl font-black mb-4 font-['Archivo',sans-serif]">Готові обговорити ваш проект</h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">
              Надішліть запит або зателефонуйте — наш менеджер розрахує умови ОЕМ співпраці під ваш бренд.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a href="tel:+380507189165" className="flex items-center gap-2 text-white font-medium hover:text-[var(--accent)] transition-colors">
                <Phone size={18} /> +380 50 718 91 65
              </a>
              <span className="hidden sm:block text-white/30">|</span>
              <a href="mailto:termojet@sofievka.kiev.ua" className="flex items-center gap-2 text-white font-medium hover:text-[var(--accent)] transition-colors">
                <Mail size={18} /> termojet@sofievka.kiev.ua
              </a>
            </div>
            <Link to="/contacts" className="btn-primary inline-flex">
              Залишити заявку
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
