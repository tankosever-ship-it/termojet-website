import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import ConsentCheckbox from '../components/ConsentCheckbox'
import SEO from '../components/SEO'
import PageHero from '../components/PageHero'

const mono = { fontFamily: "'JetBrains Mono', monospace" }

export default function ContactPage() {
  const { siteSettings, sendConsultation } = useApp()
  const t = useT()
  const contact = t('contact')
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  async function onSubmit(data) {
    await sendConsultation(data)
    setSuccess(true)
    reset()
  }

  const contactItems = [
    { icon: Phone, label: t('contact.phone'), value: siteSettings.phone, href: `tel:${siteSettings.phone}` },
    { icon: Mail, label: t('contact.email'), value: siteSettings.email, href: `mailto:${siteSettings.email}` },
    { icon: MapPin, label: t('contact.address'), value: siteSettings.address },
    { icon: Clock, label: t('contact.workHours'), value: siteSettings.workHours },
  ]

  return (
    <>
      <SEO title={contact.title} />

      {/* Hero */}
      <PageHero
        eyebrow="КОНТАКТИ · TERMOJET"
        title={contact.title}
        subtitle={t('contact.subtitle')}
        image="/banner-contacts.webp"
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Left: contact info */}
          <div>
            <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.16em', color: 'var(--text-muted)' }}
              className="uppercase block mb-6">
              {t('contact.requisites')}
            </span>

            <div className="space-y-1 mb-8">
              {contactItems.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="w-10 h-10 border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'var(--text-muted)' }}
                      className="uppercase mb-0.5">
                      {label}
                    </div>
                    {href ? (
                      <a href={href} className="font-semibold text-gray-900 hover:text-[var(--accent)] transition-colors text-sm truncate block">
                        {value}
                      </a>
                    ) : (
                      <span className="font-semibold text-gray-900 text-sm">{value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Offices */}
            <div>
              <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.16em', color: 'var(--text-muted)' }}
                className="uppercase block mb-4">
                {t('contact.offices')}
              </span>
              <div className="space-y-3">
                {[
                  { city: 'КИЇВ', addr: 'Софіївська Борщагівка, вул. Київська 3', note: t('contact.kyivNote') },
                  { city: 'ЖИТОМИР', addr: 'пр. Незалежності, 79', note: t('contact.zhytomyrNote') },
                  { city: 'ЗАБЖЕ, ПОЛЬЩА', addr: '', note: t('contact.zabrzeNote') },
                ].map(({ city, addr, note }) => (
                  <div key={city} className="border border-gray-100 p-4">
                    <div style={{ ...mono, fontSize: '10px', letterSpacing: '0.14em', color: 'var(--accent)' }} className="uppercase mb-1">
                      {city}
                    </div>
                    {addr && <div className="text-sm font-medium text-gray-900 mb-0.5">{addr}</div>}
                    <div style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)' }}>{note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div>
            <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.16em', color: 'var(--text-muted)' }}
              className="uppercase block mb-6">
              {t('contact.sendMessage')}
            </span>

            <div className="card p-6 md:p-8">
              {success ? (
                <div className="text-center py-12">
                  <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
                  <div className="font-black text-xl text-gray-900 mb-2">{t('contact.form.successTitle')}</div>
                  <div style={{ ...mono, fontSize: '11px', color: 'var(--text-muted)' }}>
                    {t('contact.form.successSub')}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'var(--text-muted)' }}
                      className="uppercase block mb-1.5">
                      {t('contact.form.nameLabel')}
                    </label>
                    <input {...register('name', { required: true })} placeholder={t('contact.form.namePlaceholder')}
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-[var(--accent)] text-sm transition-colors" />
                    {errors.name && <p className="text-xs text-red-500 mt-1" style={mono}>{t('contact.form.nameError')}</p>}
                  </div>

                  <div>
                    <label style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'var(--text-muted)' }}
                      className="uppercase block mb-1.5">
                      {t('contact.form.phoneLabel')}
                    </label>
                    <input {...register('phone', { required: true })} type="tel" inputMode="numeric" maxLength={12} placeholder="0XX XXX XX XX"
                      onInput={e => { e.target.value = e.target.value.replace(/\D/g, '') }}
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-[var(--accent)] text-sm transition-colors" />
                    {errors.phone && <p className="text-xs text-red-500 mt-1" style={mono}>{t('contact.form.phoneError')}</p>}
                  </div>

                  <div>
                    <label style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'var(--text-muted)' }}
                      className="uppercase block mb-1.5">
                      {t('contact.form.emailLabel')}
                    </label>
                    <input {...register('email')} placeholder="your@email.com" type="email"
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-[var(--accent)] text-sm transition-colors" />
                  </div>

                  <div>
                    <label style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'var(--text-muted)' }}
                      className="uppercase block mb-1.5">
                      {t('contact.form.messageLabel')}
                    </label>
                    <textarea {...register('message')} placeholder={t('contact.form.messagePlaceholder')} rows={5}
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-[var(--accent)] text-sm transition-colors resize-none" />
                  </div>

                  <ConsentCheckbox buttonLabel={t('contact.form.submit')} />

                  <button type="submit" disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 font-bold text-white transition-all"
                    style={{ background: 'var(--accent)' }}>
                    <Send size={16} />
                    <span style={{ ...mono, fontSize: '12px', letterSpacing: '0.08em' }}>
                      {isSubmitting ? t('contact.form.submitting') : t('contact.form.submitLabel')}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Maps — Київ + Житомир */}
        <div className="mt-14">
          <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.16em', color: 'var(--text-muted)' }}
            className="uppercase block mb-5">
            {t('contact.map')}
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                city: 'КИЇВ',
                addr: 'Софіївська Борщагівка, вул. Київська 3',
                note: t('contact.kyivNote'),
                src: 'https://maps.google.com/maps?q=' + encodeURIComponent('Termojet, вул. Київська 3, Софіївська Борщагівка') + '&z=16&output=embed',
              },
              {
                city: 'ЖИТОМИР',
                addr: 'пр. Незалежності, 79',
                note: t('contact.zhytomyrNote'),
                src: 'https://maps.google.com/maps?q=' + encodeURIComponent('Житомир, проспект Незалежності 79') + '&z=15&output=embed',
              },
            ].map(({ city, addr, note, src }) => (
              <div key={city} className="border border-gray-200">
                <div className="flex items-start gap-3 p-4 border-b border-gray-100">
                  <div className="w-9 h-9 border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <MapPin size={15} className="text-[var(--accent)]" />
                  </div>
                  <div className="min-w-0">
                    <div style={{ ...mono, fontSize: '10px', letterSpacing: '0.14em', color: 'var(--accent)' }} className="uppercase mb-0.5">
                      {city}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 leading-tight">{addr}</div>
                    <div style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)' }} className="mt-0.5">{note}</div>
                  </div>
                </div>
                <iframe
                  title={`${t('contact.map')} — ${city}`}
                  src={src}
                  width="100%" height="300"
                  style={{ border: 0, display: 'block' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
