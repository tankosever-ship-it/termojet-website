import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import ConsentCheckbox from '../components/ConsentCheckbox'
import SEO from '../components/SEO'

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

  return (
    <>
      <SEO title={contact.title} />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-10">
          <div className="label-accent mb-2">Termojet</div>
          <h1 className="section-title">{contact.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact info */}
          <div>
            <div className="space-y-5 mb-8">
              {[
                { icon: Phone, label: contact.phone, value: siteSettings.phone, href: `tel:${siteSettings.phone}` },
                { icon: Mail, label: contact.email, value: siteSettings.email, href: `mailto:${siteSettings.email}` },
                { icon: MapPin, label: contact.address, value: siteSettings.address },
                { icon: Clock, label: contact.workHours, value: siteSettings.workHours },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-[var(--primary)]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{label}</div>
                    {href ? (
                      <a href={href} className="font-medium text-gray-900 hover:text-[var(--primary)] transition-colors">{value}</a>
                    ) : (
                      <div className="font-medium text-gray-900">{value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="card overflow-hidden h-64 bg-gray-100 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MapPin size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Київ, Україна</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="card p-6">
            <h2 className="font-bold text-xl mb-5">{contact.sendMessage}</h2>
            {success ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-medium text-gray-900">{contact.form.success}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <input {...register('name', { required: true })} placeholder={contact.form.name}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
                  {errors.name && <p className="text-xs text-red-500 mt-1">Введіть ім'я</p>}
                </div>
                <div>
                  <input {...register('phone', { required: true })} placeholder={contact.form.phone} type="tel"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">Введіть телефон</p>}
                </div>
                <input {...register('email')} placeholder={contact.form.email} type="email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
                <textarea {...register('message')} placeholder={contact.form.message} rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm resize-none" />
                <ConsentCheckbox register={register} error={errors.consent} />
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3">
                  {contact.form.submit}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
