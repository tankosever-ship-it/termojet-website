import { motion } from 'framer-motion'
import LLink from '../components/LLink'
import { Headphones, FileText, Settings, Car, LayoutTemplate, Flame, Phone, Mail } from 'lucide-react'
import SEO from '../components/SEO'
import { useT } from '../i18n/useT'

const fadeUp  = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }
const stagger = { show: { transition: { staggerChildren: 0.1 } } }

export default function TechSupportPage() {
  const t = useT()

  const SERVICES = [
    {
      icon: Headphones,
      title: t('techSupport.service1Title'),
      desc: t('techSupport.service1Desc'),
    },
    {
      icon: FileText,
      title: t('techSupport.service2Title'),
      desc: t('techSupport.service2Desc'),
    },
    {
      icon: Settings,
      title: t('techSupport.service3Title'),
      desc: t('techSupport.service3Desc'),
    },
    {
      icon: Car,
      title: t('techSupport.service4Title'),
      desc: t('techSupport.service4Desc'),
    },
    {
      icon: LayoutTemplate,
      title: t('techSupport.service5Title'),
      desc: t('techSupport.service5Desc'),
    },
    {
      icon: Flame,
      title: t('techSupport.service6Title'),
      desc: t('techSupport.service6Desc'),
    },
  ]

  return (
    <>
      <SEO
        title={t('techSupport.seoTitle')}
        description={t('techSupport.seoDesc')}
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
              {t('techSupport.heroTitle')}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-white/70 max-w-2xl mx-auto">
              {t('techSupport.heroSubtitle')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-10">
          <div className="label-accent mb-2">{t('techSupport.servicesLabel')}</div>
          <h2 className="section-title">{t('techSupport.servicesHeading')}</h2>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
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

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
          className="bg-[var(--primary)] rounded-3xl p-10 text-white"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="label-accent mb-4">{t('nav.contacts')}</div>
              <h2 className="text-3xl font-black mb-4 font-['Archivo',sans-serif]">{t('techSupport.contactHeading')}</h2>
              <p className="text-white/70 mb-6">
                {t('techSupport.contactBody')}
              </p>
              <div className="space-y-3 mb-8">
                <a href="tel:+380507189165" className="flex items-center gap-3 text-white font-medium hover:text-[var(--accent)] transition-colors">
                  <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone size={16} />
                  </div>
                  +380 50 718 91 65
                </a>
                <a href="mailto:termojet@sofievka.kiev.ua" className="flex items-center gap-3 text-white font-medium hover:text-[var(--accent)] transition-colors">
                  <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail size={16} />
                  </div>
                  termojet@sofievka.kiev.ua
                </a>
              </div>
            </div>
            <div className="text-center lg:text-right">
              <LLink to="/contacts" className="btn-primary inline-flex text-base px-8 py-4">
                {t('servicePage.contact.form.title')}
              </LLink>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  )
}
