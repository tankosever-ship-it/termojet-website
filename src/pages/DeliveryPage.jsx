import { motion } from 'framer-motion'
import { Truck, Warehouse, Package, Home, Building2, Banknote, Info, CheckCircle } from 'lucide-react'
import { useT } from '../i18n/useT'
import SEO from '../components/SEO'

const DELIVERY_ICONS = [Truck, Warehouse, Package, Home]
const PAYMENT_ICONS  = [Building2, Banknote, Banknote]

const fadeUp  = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }
const stagger = { show: { transition: { staggerChildren: 0.1 } } }

export default function DeliveryPage() {
  const t    = useT()
  const page = t('deliveryPage')

  return (
    <>
      <SEO title={page.title} description={page.subtitle} />

      {/* Hero */}
      <section className="hero-gradient grain relative overflow-hidden text-white pb-20 md:pb-28" style={{ marginTop: '-60px', paddingTop: 'calc(5rem + 60px)' }}>
        <div className="orb orb-orange w-[400px] h-[400px] -right-20 top-1/2 -translate-y-1/2 opacity-40" />
        <div className="orb orb-warm   w-[300px] h-[300px] -left-16  -top-16              opacity-30" />
        <div className="absolute inset-0 bg-dots pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,85,0,0.6)] to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div variants={fadeUp} className="label-accent mb-4">Termojet</motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-black mb-4 leading-tight">
              {page.title}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-white/70 max-w-2xl mx-auto">
              {page.subtitle}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">

        {/* Delivery methods */}
        <section>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
            className="mb-8">
            <div className="label-accent mb-2">Logistyka</div>
            <h2 className="section-title">{page.delivery.title}</h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {page.delivery.methods.map((method, i) => {
              const Icon = DELIVERY_ICONS[i] || Truck
              return (
                <motion.div key={i} variants={fadeUp} className="card p-7 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="icon-badge-dark">
                      <Icon size={22} />
                    </div>
                    <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1 rounded-full">
                      {method.days}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2">{method.title}</h3>
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{method.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </section>

        {/* Payment methods */}
        <section>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
            className="mb-8">
            <div className="label-accent mb-2">Finance</div>
            <h2 className="section-title">{page.payment.title}</h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {page.payment.methods.map((method, i) => {
              const Icon = PAYMENT_ICONS[i]
              return (
                <motion.div key={i} variants={fadeUp} className="card p-7 flex flex-col gap-4">
                  <div className="icon-badge-orange">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2">{method.title}</h3>
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{method.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </section>

        {/* Info block */}
        <motion.section
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
          className="bg-[var(--primary)]/5 border border-[var(--primary)]/10 rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="icon-badge-dark"><Info size={20} /></div>
            <h2 className="font-bold text-xl text-[var(--text-primary)]">{page.info.title}</h2>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {page.info.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle size={17} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
                <span className="text-[var(--text-secondary)] text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </motion.section>

      </div>
    </>
  )
}
