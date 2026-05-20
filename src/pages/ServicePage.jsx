import { motion } from 'framer-motion'
import { useState } from 'react'
import { Phone, Mail, Clock, Headphones, Wrench, ShieldCheck, GraduationCap, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import ConsentCheckbox from '../components/ConsentCheckbox'
import SEO from '../components/SEO'

const ICONS = [Headphones, Wrench, ShieldCheck, GraduationCap]

const fadeUp  = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }
const stagger = { show: { transition: { staggerChildren: 0.1 } } }

export default function ServicePage() {
  const t    = useT()
  const page = t('servicePage')
  const { siteSettings, sendConsultation } = useApp()
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  async function onSubmit(data) {
    await sendConsultation({ ...data, type: 'service' })
    setSuccess(true)
    reset()
  }

  return (
    <>
      <SEO title={page.title} description={page.subtitle} />

      {/* Hero */}
      <section className="hero-gradient grain relative overflow-hidden text-white py-20 md:py-28">
        <div className="orb orb-warm   w-[400px] h-[400px] -right-20 top-1/2 -translate-y-1/2 opacity-40" />
        <div className="orb orb-orange w-[280px] h-[280px] -left-16  -top-16              opacity-30" />
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

      {/* Services grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {page.services.map((svc, i) => {
            const Icon = ICONS[i]
            return (
              <motion.div key={i} variants={fadeUp} className="card p-7 flex gap-5">
                <div className="icon-badge-orange flex-shrink-0">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2">{svc.title}</h3>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{svc.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* Warranty + Contact form */}
      <section className="bg-[var(--bg)] py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Warranty block */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <div className="label-accent mb-3">{page.warranty.title}</div>
            <ul className="space-y-3 mb-8">
              {page.warranty.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
                  <span className="text-[var(--text-secondary)] text-sm">{item}</span>
                </li>
              ))}
            </ul>

            {/* Contact info */}
            <div className="card p-6 space-y-4">
              <h3 className="font-bold text-base text-[var(--text-primary)]">{page.contact.title}</h3>
              {[
                { Icon: Phone, label: page.contact.phone, value: siteSettings.phone, href: `tel:${siteSettings.phone}` },
                { Icon: Mail,  label: page.contact.email, value: siteSettings.email, href: `mailto:${siteSettings.email}` },
                { Icon: Clock, label: page.contact.hours, value: page.contact.hours },
              ].map(({ Icon, label, value, href }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-[var(--primary)]" />
                  </div>
                  {href
                    ? <a href={href} className="text-sm font-medium text-gray-900 hover:text-[var(--primary)] transition-colors">{value}</a>
                    : <span className="text-sm text-[var(--text-secondary)]">{value}</span>
                  }
                </div>
              ))}
            </div>
          </motion.div>

          {/* Request form */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <div className="card p-7">
              <h2 className="font-bold text-xl text-[var(--text-primary)] mb-5">{page.contact.form.title}</h2>
              <p className="text-[var(--text-secondary)] text-sm mb-6">{page.contact.subtitle}</p>

              {success ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-4">✅</div>
                  <p className="font-medium text-gray-900">{page.contact.form.success}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <select {...register('requestType')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm bg-white text-[var(--text-secondary)]">
                    {page.contact.form.types.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <input {...register('name', { required: true })} placeholder={t('contact').form.name}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
                  {errors.name && <p className="text-xs text-red-500">Введіть ім'я</p>}
                  <input {...register('phone', { required: true })} placeholder={t('contact').form.phone} type="tel"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
                  {errors.phone && <p className="text-xs text-red-500">Введіть телефон</p>}
                  <textarea {...register('message')} placeholder={page.contact.form.message} rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm resize-none" />
                  <ConsentCheckbox register={register} error={errors.consent} />
                  <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3">
                    {page.contact.form.submit}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
