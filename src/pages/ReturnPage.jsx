import { motion } from 'framer-motion'
import { Package, RefreshCw, ArrowRight, CheckCircle, XCircle, Phone, Mail } from 'lucide-react'
import SEO from '../components/SEO'

const fadeUp  = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }
const stagger = { show: { transition: { staggerChildren: 0.1 } } }

const RETURN_CONDITIONS = [
  'Товар знаходиться в оригінальній заводській упаковці без пошкоджень',
  'З моменту покупки пройшло не більше 14 календарних днів',
  'Відсутні сліди монтажу, різьбових з\'єднань або слідів ущільнювача',
  'Збережені всі комплектуючі, кріплення та документація',
  'Наявна накладна або касовий чек — підтвердження покупки у Termojet',
]

const NO_RETURN_CONDITIONS = [
  'Товар був у монтажі або використанні',
  'Порушена заводська упаковка без повернення в товарний вигляд',
  'Відсутні документи, що підтверджують покупку',
  'Пошкодження з вини покупця (механічні удари, хімічний вплив)',
  'Продукція виготовлена під індивідуальне замовлення (ОЕМ)',
]

const EXCHANGE_CONDITIONS = [
  'Обмін можливий протягом 30 днів при виявленні виробничого дефекту',
  'Необхідна наявність акту рекламації із описом дефекту',
  'Обмін на аналогічний товар або товар іншої позиції з перерахунком вартості',
  'Доставку при обміні через виробничий дефект оплачує Termojet',
]

const STEPS = [
  {
    num: '01',
    icon: Phone,
    title: 'Подайте заявку',
    desc: 'Зателефонуйте або напишіть нам. Опишіть причину повернення та надайте номер замовлення.',
  },
  {
    num: '02',
    icon: Package,
    title: 'Перевірка та підтвердження',
    desc: 'Менеджер перевірить відповідність умовам повернення та підтвердить адресу для відправки.',
  },
  {
    num: '03',
    icon: RefreshCw,
    title: 'Повернення коштів або обмін',
    desc: 'Після отримання та перевірки товару — повернення коштів протягом 5 робочих днів або відправка нового товару.',
  },
]

export default function ReturnPage() {
  return (
    <>
      <SEO
        title="Повернення та обмін — Termojet"
        description="Умови повернення та обміну промислового обладнання Termojet. Детальний опис процедури та контакти."
      />

      <section className="hero-gradient grain relative overflow-hidden text-white py-20 md:py-28">
        <div className="orb orb-blue   w-[400px] h-[400px] -right-20 top-1/2 -translate-y-1/2 opacity-40" />
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
              Прозора процедура повернення та обміну для нашої продукції
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">

        <section>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-8">
            <div className="label-accent mb-2">Умови</div>
            <h2 className="section-title">Умови повернення товару</h2>
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
                <XCircle size={20} className="text-red-400" /> Повернення не приймається
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

        <section>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-8">
            <div className="label-accent mb-2">Обмін</div>
            <h2 className="section-title">Умови обміну</h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
            className="bg-[var(--primary)]/5 border border-[var(--primary)]/10 rounded-2xl p-8">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EXCHANGE_CONDITIONS.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle size={17} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
                  <span className="text-[var(--text-secondary)] text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </section>

        <section>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-8">
            <div className="label-accent mb-2">Процес</div>
            <h2 className="section-title">Як оформити повернення</h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {STEPS.map(({ num, icon: Icon, title, desc }, i) => (
              <motion.div key={i} variants={fadeUp} className="relative card p-7 flex flex-col gap-4">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight size={20} className="text-[var(--ink-200)]" />
                  </div>
                )}
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

        <motion.section
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
          className="bg-[var(--primary)] rounded-3xl p-10 text-white text-center"
        >
          <div className="label-accent mb-4">Контакти</div>
          <h2 className="text-2xl font-black mb-3 font-['Archivo',sans-serif]">Маєте питання щодо повернення?</h2>
          <p className="text-white/70 mb-8">Звертайтеся до нашого відділу з роботи з клієнтами</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+380507189165" className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl transition-colors">
              <Phone size={18} /> +380 50 718 91 65
            </a>
            <a href="mailto:termojet@sofievka.kiev.ua" className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl transition-colors">
              <Mail size={18} /> termojet@sofievka.kiev.ua
            </a>
          </div>
        </motion.section>

      </div>
    </>
  )
}
