import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CheckCircle, ChevronRight, Globe, TrendingUp, Headphones, FileText } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import ConsentCheckbox from '../components/ConsentCheckbox'
import SEO from '../components/SEO'

export default function DealersPage() {
  const { sendDealerRequest } = useApp()
  const t = useT()
  const dealersT = t('dealers')
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  const BENEFITS = [
    { icon: TrendingUp, title: t('dealers.benefits.discountsTitle'), desc: t('dealers.benefits.discountsDesc') },
    { icon: FileText, title: t('dealers.benefits.marketingTitle'), desc: t('dealers.benefits.marketingDesc') },
    { icon: Headphones, title: t('dealers.benefits.supportTitle'), desc: t('dealers.benefits.supportDesc') },
    { icon: Globe, title: t('dealers.benefits.territoryTitle'), desc: t('dealers.benefits.territoryDesc') },
  ]

  const CONDITIONS = [
    t('dealers.conditions.minOrder'),
    t('dealers.conditions.discount'),
    t('dealers.conditions.freeShipping'),
    t('dealers.conditions.deferredPayment'),
    t('dealers.conditions.priorityReserve'),
    t('dealers.conditions.jointMarketing'),
  ]

  async function onSubmit(data) {
    await sendDealerRequest(data)
    setSuccess(true)
    reset()
  }

  return (
    <>
      <SEO title={t('dealers.seoTitle')} description={t('dealers.seoDesc')} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--primary)] to-[#1e4a7a] text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-5">
              🤝 {t('dealers.heroBadge')}
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-['Archivo',sans-serif] mb-4">{dealersT.title}</h1>
            <p className="text-white/75 text-lg leading-relaxed">{dealersT.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="label-accent mb-2">{t('dealers.benefitsLabel')}</div>
            <h2 className="section-title">{t('dealers.benefitsHeading')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 text-center">
                <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={26} className="text-[var(--primary)]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conditions + Form */}
      <section className="py-14 bg-[var(--bg-subtle)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* Conditions */}
            <div>
              <div className="label-primary mb-2">{t('dealers.conditionsLabel')}</div>
              <h2 className="section-title mb-6">{t('dealers.conditionsHeading')}</h2>
              <ul className="space-y-3 mb-8">
                {CONDITIONS.map(c => (
                  <li key={c} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{c}</span>
                  </li>
                ))}
              </ul>

              <div className="card p-5 bg-[var(--primary)]/5 border-[var(--primary)]/15">
                <p className="font-semibold text-gray-900 mb-1">{t('dealers.ctaCardTitle')}</p>
                <p className="text-sm text-gray-500 mb-3">{t('dealers.ctaCardBody')}</p>
                <a href="tel:+380507189165" className="btn-primary text-sm py-2.5">
                  {t('floatingActions.callUs')} <ChevronRight size={14} />
                </a>
              </div>
            </div>

            {/* Form */}
            <div className="card p-6">
              <h3 className="font-bold text-xl mb-1">{t('dealers.formTitle')}</h3>
              <p className="text-sm text-gray-500 mb-5">{t('dealers.formSubtitle')}</p>

              {success ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-3">🤝</div>
                  <p className="font-semibold text-gray-900 text-lg">{t('dealers.successTitle')}</p>
                  <p className="text-gray-500 text-sm mt-1">{t('dealers.successBody')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input {...register('name', { required: true })} placeholder={t('dealers.form.namePlaceholder')}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{t('dealers.form.required')}</p>}
                    </div>
                    <div>
                      <input {...register('phone', { required: true })} type="tel" inputMode="numeric" maxLength={12} placeholder="0XX XXX XX XX"
                        onInput={e => { e.target.value = e.target.value.replace(/\D/g, '') }}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{t('dealers.form.required')}</p>}
                    </div>
                  </div>
                  <input {...register('email', { required: true })} placeholder="Email *" type="email"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
                  <input {...register('company')} placeholder={t('dealers.form.companyPlaceholder')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
                  <input {...register('region')} placeholder={t('dealers.form.regionPlaceholder')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
                  <textarea {...register('comment')} placeholder={t('dealers.form.commentPlaceholder')}
                    rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm resize-none" />
                  <ConsentCheckbox buttonLabel={t('dealers.formTitle')} />
                  <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3">
                    {dealersT.ctaBecome}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
