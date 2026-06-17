import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Package, RefreshCw, ArrowRight, CheckCircle, XCircle, Phone, Mail, Wrench, Clock, Scale } from 'lucide-react'
import SEO from '../components/SEO'
import { useT } from '../i18n/useT'

const fadeUp  = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }
const stagger = { show: { transition: { staggerChildren: 0.1 } } }

export default function ReturnPage() {
  const t = useT()

  const RETURN_CONDITIONS = [
    t('returns.returnConditions.item1'),
    t('returns.returnConditions.item2'),
    t('returns.returnConditions.item3'),
    t('returns.returnConditions.item4'),
    t('returns.returnConditions.item5'),
    t('returns.returnConditions.item6'),
  ]

  const NO_RETURN_CONDITIONS = [
    t('returns.noReturnConditions.item1'),
    t('returns.noReturnConditions.item2'),
    t('returns.noReturnConditions.item3'),
    t('returns.noReturnConditions.item4'),
    t('returns.noReturnConditions.item5'),
  ]

  const WARRANTY_EXCLUSIONS = [
    t('returns.warrantyExclusions.item1'),
    t('returns.warrantyExclusions.item2'),
    t('returns.warrantyExclusions.item3'),
    t('returns.warrantyExclusions.item4'),
  ]

  const STEPS = [
    {
      num: '01',
      icon: Phone,
      title: t('returns.steps.step1.title'),
      desc: t('returns.steps.step1.desc'),
    },
    {
      num: '02',
      icon: Package,
      title: t('returns.steps.step2.title'),
      desc: t('returns.steps.step2.desc'),
    },
    {
      num: '03',
      icon: RefreshCw,
      title: t('returns.steps.step3.title'),
      desc: t('returns.steps.step3.desc'),
    },
    {
      num: '04',
      icon: CheckCircle,
      title: t('returns.steps.step4.title'),
      desc: t('returns.steps.step4.desc'),
    },
  ]

  return (
    <>
      <SEO
        title={t('returns.seoTitle')}
        description={t('returns.seoDescription')}
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
              {t('returns.heroTitle')}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-white/70 max-w-2xl mx-auto">
              {t('returns.heroSubtitle')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">

        {/* Умови повернення товару належної якості */}
        <section>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-8">
            <div className="label-accent mb-2">{t('returns.conditionsLabel')}</div>
            <h2 className="section-title">{t('returns.conditionsTitle')}</h2>
            <p className="text-[var(--text-secondary)] mt-3 max-w-3xl">
              {t('returns.conditionsBody')}
            </p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <motion.div variants={fadeUp} className="card p-8">
              <h3 className="font-bold text-lg text-[var(--text-primary)] mb-5 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" /> {t('returns.acceptedHeading')}
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
                <XCircle size={20} className="text-red-400" /> {t('returns.notAcceptedHeading')}
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
            <div className="label-accent mb-2">{t('returns.exchangeLabel')}</div>
            <h2 className="section-title">{t('returns.exchangeTitle')}</h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
            className="card p-8">
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {t('returns.exchangeBody')}
            </p>
          </motion.div>
        </section>

        {/* Гарантійний обмін та ремонт */}
        <section>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-8">
            <div className="label-accent mb-2">{t('returns.warrantyLabel')}</div>
            <h2 className="section-title">{t('returns.warrantyTitle')}</h2>
            <p className="text-[var(--text-secondary)] mt-3 max-w-3xl">
              {t('returns.warrantyBody')}
            </p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
          >
            <motion.div variants={fadeUp} className="card p-8">
              <h3 className="font-bold text-lg text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Wrench size={20} className="text-[var(--accent)]" /> {t('returns.warrantyRepairTitle')}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                {t('returns.warrantyRepairBody')}
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="card p-8">
              <h3 className="font-bold text-lg text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <RefreshCw size={20} className="text-[var(--accent)]" /> {t('returns.warrantyExchangeTitle')}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                {t('returns.warrantyExchangeBody')}
              </p>
            </motion.div>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
            className="card p-8">
            <h3 className="font-bold text-base text-[var(--text-primary)] mb-4">{t('returns.warrantyExclusionsTitle')}</h3>
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
            <div className="label-accent mb-2">{t('returns.processLabel')}</div>
            <h2 className="section-title">{t('returns.processTitle')}</h2>
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
              <Clock size={20} className="text-[var(--accent)]" /> {t('returns.refundTimingTitle')}
            </h3>
            <div className="flex items-start justify-between gap-4 border-t border-[var(--border)] pt-4">
              <span className="text-[var(--text-primary)] text-sm font-medium">{t('returns.refundTimingMethod')}</span>
              <span className="text-[var(--text-secondary)] text-sm text-right">{t('returns.refundTimingDuration')}</span>
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
            className="card p-8">
            <h3 className="font-bold text-lg text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Scale size={20} className="text-[var(--accent)]" /> {t('returns.legalBasisTitle')}
            </h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              {t('returns.legalBasisBody')}
            </p>
          </motion.div>
        </section>

        {/* Контакти для повернень — приглушений темний блок */}
        <motion.section
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
          className="rounded-3xl p-10 text-white text-center border border-white/10"
          style={{ background: 'var(--bg-dark-2)' }}
        >
          <div className="label-accent mb-4">{t('returns.contactLabel')}</div>
          <h2 className="text-2xl font-black mb-3 font-['Archivo',sans-serif]">{t('returns.contactTitle')}</h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            {t('returns.contactBody')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <a href="tel:+380504506424" className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/15 border border-white/10 text-white font-medium px-6 py-3 rounded-lg transition-colors">
              <Phone size={18} className="text-[var(--accent)]" /> +380 (50) 450-64-24
            </a>
            <a href="mailto:termojet@sofievka.kiev.ua" className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/15 border border-white/10 text-white font-medium px-6 py-3 rounded-lg transition-colors">
              <Mail size={18} className="text-[var(--accent)]" /> termojet@sofievka.kiev.ua
            </a>
            <Link to="/contacts" className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/15 border border-white/10 text-white font-medium px-6 py-3 rounded-lg transition-colors">
              {t('returns.contactWriteUs')} <ArrowRight size={18} className="text-[var(--accent)]" />
            </Link>
          </div>
        </motion.section>

      </div>
    </>
  )
}
