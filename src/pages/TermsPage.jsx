import LLink from '../components/LLink'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { useT } from '../i18n/useT'

export default function TermsPage() {
  const t = useT()

  return (
    <div className="min-h-screen bg-white pb-24">
      <SEO
        title={t('terms.seoTitle')}
        description={t('terms.seoDescription')}
        canonical="/terms"
      />

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('terms.title')}</h1>
        <p className="text-slate-400 text-sm mb-10">
          {t('terms.effectiveDate')}
        </p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t('terms.s1.heading')}</h2>
            <p>{t('terms.s1.body')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t('terms.s2.heading')}</h2>
            <p>{t('terms.s2.intro')}</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>{t('terms.s2.li1')}</li>
              <li>{t('terms.s2.li2')}</li>
              <li>{t('terms.s2.li3')}</li>
              <li>{t('terms.s2.li4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t('terms.s3.heading')}</h2>
            <p>{t('terms.s3.body')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t('terms.s4.heading')}</h2>
            <p>{t('terms.s4.body')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t('terms.s5.heading')}</h2>
            <p>{t('terms.s5.intro')}</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>{t('terms.s5.li1')}</li>
              <li>{t('terms.s5.li2')}</li>
              <li>{t('terms.s5.li3')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t('terms.s6.heading')}</h2>
            <p>{t('terms.s6.body')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t('terms.s7.heading')}</h2>
            <p>
              {t('terms.s7.bodyBefore')}{' '}
              <LLink to="/privacy" className="text-orange-500 hover:underline">{t('terms.s7.privacyLink')}</LLink>
              {t('terms.s7.bodyAfter')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t('terms.s8.heading')}</h2>
            <p>{t('terms.s8.body')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t('terms.s9.heading')}</h2>
            <p>{t('terms.s9.body')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t('terms.s10.heading')}</h2>
            <p>{t('terms.s10.intro')}</p>
            <ul className="list-none mt-2 space-y-1">
              <li><strong>{t('terms.s10.company')}</strong></li>
              <li>{t('terms.s10.address')}</li>
              <li>Email: <a href="mailto:termojet@sofievka.kiev.ua" className="text-orange-500 hover:underline">termojet@sofievka.kiev.ua</a></li>
              <li>{t('terms.s10.phone')}: <a href="tel:+380507189165" className="text-orange-500 hover:underline">+380 (50) 718-91-65</a>, <a href="tel:+380504506424" className="text-orange-500 hover:underline">+380 (50) 450-64-24</a></li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  )
}
