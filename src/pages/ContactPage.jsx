import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import ConsentCheckbox from '../components/ConsentCheckbox'
import SEO from '../components/SEO'

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
    { icon: Phone, label: 'ТЕЛЕФОН', value: siteSettings.phone, href: `tel:${siteSettings.phone}` },
    { icon: Mail, label: 'EMAIL', value: siteSettings.email, href: `mailto:${siteSettings.email}` },
    { icon: MapPin, label: 'АДРЕСА', value: siteSettings.address },
    { icon: Clock, label: 'ГРАФІК', value: siteSettings.workHours },
  ]

  return (
    <>
      <SEO title={contact.title} />

      {/* Hero */}
      <section style={{ background: '#0C0B0A' }} className="py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots pointer-events-none opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4">
          <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.18em', color: 'var(--accent)' }} className="uppercase">
            КОНТАКТИ · TERMOJET
          </span>
          <h1 className="text-4xl md:text-5xl font-black font-['Archivo',sans-serif] text-white mt-3 mb-3 leading-tight">
            {contact.title}
          </h1>
          <p className="text-white/50 max-w-lg text-sm">
            Зв'яжіться з нами будь-яким зручним способом — відповімо швидко
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Left: contact info */}
          <div>
            <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.16em', color: 'var(--text-muted)' }}
              className="uppercase block mb-6">
              РЕКВІЗИТИ ТА АДРЕСИ
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
                ОФІСИ ТА ВИРОБНИЦТВО
              </span>
              <div className="space-y-3">
                {[
                  { city: 'КИЇВ', addr: 'Софіївська Борщагівка, вул. Київська 3', note: 'Виробництво + головний офіс' },
                  { city: 'ЖИТОМИР', addr: 'пр. Незалежності, 79', note: 'Регіональний офіс' },
                  { city: 'ЗАБЖЕ, ПОЛЬЩА', addr: '', note: 'Офіс для ринків ЄС · з 2018 року' },
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
              НАПИСАТИ НАМ
            </span>

            <div className="card p-6 md:p-8">
              {success ? (
                <div className="text-center py-12">
                  <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
                  <div className="font-black text-xl text-gray-900 mb-2">Повідомлення надіслано</div>
                  <div style={{ ...mono, fontSize: '11px', color: 'var(--text-muted)' }}>
                    Ми зв'яжемося з вами найближчим часом
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'var(--text-muted)' }}
                      className="uppercase block mb-1.5">
                      ІМ'Я *
                    </label>
                    <input {...register('name', { required: true })} placeholder="Ваше ім'я"
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-[var(--accent)] text-sm transition-colors" />
                    {errors.name && <p className="text-xs text-red-500 mt-1" style={mono}>ВВЕДІТЬ ІМ'Я</p>}
                  </div>

                  <div>
                    <label style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'var(--text-muted)' }}
                      className="uppercase block mb-1.5">
                      ТЕЛЕФОН *
                    </label>
                    <input {...register('phone', { required: true })} placeholder="+380 XX XXX XX XX" type="tel"
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-[var(--accent)] text-sm transition-colors" />
                    {errors.phone && <p className="text-xs text-red-500 mt-1" style={mono}>ВВЕДІТЬ ТЕЛЕФОН</p>}
                  </div>

                  <div>
                    <label style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'var(--text-muted)' }}
                      className="uppercase block mb-1.5">
                      EMAIL
                    </label>
                    <input {...register('email')} placeholder="your@email.com" type="email"
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-[var(--accent)] text-sm transition-colors" />
                  </div>

                  <div>
                    <label style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'var(--text-muted)' }}
                      className="uppercase block mb-1.5">
                      ПОВІДОМЛЕННЯ
                    </label>
                    <textarea {...register('message')} placeholder="Ваше запитання або повідомлення..." rows={5}
                      className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-[var(--accent)] text-sm transition-colors resize-none" />
                  </div>

                  <ConsentCheckbox buttonLabel="Надіслати" />

                  <button type="submit" disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 font-bold text-white transition-all"
                    style={{ background: 'var(--accent)' }}>
                    <Send size={16} />
                    <span style={{ ...mono, fontSize: '12px', letterSpacing: '0.08em' }}>
                      {isSubmitting ? 'НАДСИЛАННЯ...' : 'НАДІСЛАТИ'}
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
            НА КАРТІ
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                city: 'КИЇВ',
                addr: 'Софіївська Борщагівка, вул. Київська 3',
                note: 'Виробництво + головний офіс',
                src: 'https://maps.google.com/maps?q=' + encodeURIComponent('Termojet, вул. Київська 3, Софіївська Борщагівка') + '&z=16&output=embed',
              },
              {
                city: 'ЖИТОМИР',
                addr: 'пр. Незалежності, 79',
                note: 'Регіональний офіс',
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
                  title={`Карта — ${city}`}
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
