import { motion } from 'framer-motion'
import { ShieldCheck, AlertTriangle, CheckCircle, Clock, Thermometer, Zap } from 'lucide-react'
import SEO from '../components/SEO'
import { useT } from '../i18n/useT'

const fadeUp  = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }
const stagger = { show: { transition: { staggerChildren: 0.1 } } }

export default function WarrantyPage() {
  const t = useT()

  const WARRANTY_BLOCKS = [
    {
      icon: ShieldCheck,
      badge: t('warranty.blocks.collectors.badge'),
      title: t('warranty.blocks.collectors.title'),
      items: [
        t('warranty.blocks.collectors.item1'),
        t('warranty.blocks.collectors.item2'),
        t('warranty.blocks.collectors.item3'),
        t('warranty.blocks.collectors.item4'),
        t('warranty.blocks.collectors.item5'),
      ],
      color: 'var(--primary)',
    },
    {
      icon: Thermometer,
      badge: t('warranty.blocks.heatPumps.badge'),
      title: t('warranty.blocks.heatPumps.title'),
      items: [
        t('warranty.blocks.heatPumps.item1'),
        t('warranty.blocks.heatPumps.item2'),
        t('warranty.blocks.heatPumps.item3'),
        t('warranty.blocks.heatPumps.item4'),
      ],
      color: 'var(--accent)',
    },
    {
      icon: Clock,
      badge: t('warranty.blocks.pumpsValves.badge'),
      title: t('warranty.blocks.pumpsValves.title'),
      items: [
        t('warranty.blocks.pumpsValves.item1'),
        t('warranty.blocks.pumpsValves.item2'),
        t('warranty.blocks.pumpsValves.item3'),
        t('warranty.blocks.pumpsValves.item4'),
      ],
      color: 'var(--primary)',
    },
  ]

  const HEAT_PUMP_REQUIREMENTS = [
    t('warranty.requirements.item1'),
    t('warranty.requirements.item2'),
    t('warranty.requirements.item3'),
    t('warranty.requirements.item4'),
    t('warranty.requirements.item5'),
    t('warranty.requirements.item6'),
  ]

  const VOID_CASES = [
    t('warranty.voidCases.item1'),
    t('warranty.voidCases.item2'),
    t('warranty.voidCases.item3'),
    t('warranty.voidCases.item4'),
    t('warranty.voidCases.item5'),
    t('warranty.voidCases.item6'),
    t('warranty.voidCases.item7'),
  ]

  return (
    <>
      <SEO
        title={t('warranty.seo.title')}
        description={t('warranty.seo.description')}
      />

      <section className="hero-gradient grain relative overflow-hidden text-white py-20 md:py-28">
        <div className="orb orb-warm   w-[400px] h-[400px] -right-20 top-1/2 -translate-y-1/2 opacity-40" />
        <div className="orb orb-orange w-[280px] h-[280px] -left-16  -top-16              opacity-30" />
        <div className="absolute inset-0 bg-dots pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,85,0,0.6)] to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div variants={fadeUp} className="label-accent mb-4">Termojet</motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-black mb-4 leading-tight font-['Archivo',sans-serif]">
              {t('warranty.hero.title')}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-white/70 max-w-2xl mx-auto">
              {t('warranty.hero.subtitle')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-10">
          <div className="label-accent mb-2">{t('warranty.section.label')}</div>
          <h2 className="section-title">{t('warranty.section.heading')}</h2>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {WARRANTY_BLOCKS.map(({ icon: Icon, badge, title, items, color }, i) => (
            <motion.div key={i} variants={fadeUp} className="card p-7 flex flex-col gap-5">
              <div className="flex items-start justify-between">
                <div className="icon-badge-dark">
                  <Icon size={22} />
                </div>
                <span className="text-sm font-black px-4 py-1.5 rounded-full"
                  style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
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
                <h2 className="font-bold text-xl text-[var(--text-primary)]">{t('warranty.requirements.title')}</h2>
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
                <h2 className="font-bold text-xl text-[var(--text-primary)]">{t('warranty.voidCases.title')}</h2>
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
    </>
  )
}
