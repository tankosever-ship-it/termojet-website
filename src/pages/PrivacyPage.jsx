import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import { useT } from '../i18n/useT'

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-bold text-slate-900 mb-3">{title}</h2>
    <div className="text-slate-600 leading-relaxed space-y-2">{children}</div>
  </div>
)

const Li = ({ children }) => <li>{children}</li>
const Ul = ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>
const A = ({ href, children }) => <a href={href} className="text-orange-500 hover:underline">{children}</a>

export default function PrivacyPage() {
  const t = useT()

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-24">
      <SEO
        title={t('privacy.seoTitle')}
        description={t('privacy.seoDescription')}
        canonical="/privacy"
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto px-6"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          {t('privacy.title')}
        </h1>
        <p className="text-slate-400 text-sm mb-10">
          {t('privacy.effectiveDate')}
        </p>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">

          <Section title={t('privacy.sections.general.title')}>
            <p dangerouslySetInnerHTML={{ __html: t('privacy.sections.general.body') }} />
            <p><strong>{t('privacy.sections.general.controllerLabel')}</strong></p>
            <ul className="list-none space-y-1 bg-slate-50 rounded-xl p-4 text-sm">
              <li><strong>{t('privacy.sections.general.fields.fullName')}</strong> {t('privacy.sections.general.values.fullName')}</li>
              <li><strong>{t('privacy.sections.general.fields.edrpou')}</strong> 37074476</li>
              <li><strong>{t('privacy.sections.general.fields.legalAddress')}</strong> {t('privacy.sections.general.values.legalAddress')}</li>
              <li><strong>{t('privacy.sections.general.fields.actualAddress')}</strong> {t('privacy.sections.general.values.actualAddress')}</li>
              <li><strong>{t('privacy.sections.general.fields.email')}</strong> <A href="mailto:termojet@sofievka.kiev.ua">termojet@sofievka.kiev.ua</A></li>
              <li><strong>{t('privacy.sections.general.fields.phone')}</strong> +380 (50) 718-91-65, +380 (50) 450-64-24</li>
            </ul>
            <p>{t('privacy.sections.general.consent')}</p>
          </Section>

          <Section title={t('privacy.sections.definitions.title')}>
            <Ul>
              <Li><strong>{t('privacy.sections.definitions.terms.personalData.term')}</strong> {t('privacy.sections.definitions.terms.personalData.def')}</Li>
              <Li><strong>{t('privacy.sections.definitions.terms.processing.term')}</strong> {t('privacy.sections.definitions.terms.processing.def')}</Li>
              <Li><strong>{t('privacy.sections.definitions.terms.controller.term')}</strong> {t('privacy.sections.definitions.terms.controller.def')}</Li>
              <Li><strong>{t('privacy.sections.definitions.terms.dataSubject.term')}</strong> {t('privacy.sections.definitions.terms.dataSubject.def')}</Li>
              <Li><strong>{t('privacy.sections.definitions.terms.cookies.term')}</strong> {t('privacy.sections.definitions.terms.cookies.def')}</Li>
            </Ul>
          </Section>

          <Section title={t('privacy.sections.dataCollected.title')}>
            <p><strong>{t('privacy.sections.dataCollected.items.contact.label')}</strong> {t('privacy.sections.dataCollected.items.contact.body')}</p>
            <p><strong>{t('privacy.sections.dataCollected.items.order.label')}</strong> {t('privacy.sections.dataCollected.items.order.body')}</p>
            <p><strong>{t('privacy.sections.dataCollected.items.requests.label')}</strong> {t('privacy.sections.dataCollected.items.requests.body')}</p>
            <p><strong>{t('privacy.sections.dataCollected.items.technical.label')}</strong> {t('privacy.sections.dataCollected.items.technical.body')}</p>
            <p><strong>{t('privacy.sections.dataCollected.items.marketing.label')}</strong> {t('privacy.sections.dataCollected.items.marketing.body')}</p>
            <p>{t('privacy.sections.dataCollected.minors')}</p>
          </Section>

          <Section title={t('privacy.sections.legalBasis.title')}>
            <Ul>
              <Li><strong>{t('privacy.sections.legalBasis.items.orderFulfillment.label')}</strong> {t('privacy.sections.legalBasis.items.orderFulfillment.body')}</Li>
              <Li><strong>{t('privacy.sections.legalBasis.items.communication.label')}</strong> {t('privacy.sections.legalBasis.items.communication.body')}</Li>
              <Li><strong>{t('privacy.sections.legalBasis.items.legal.label')}</strong> {t('privacy.sections.legalBasis.items.legal.body')}</Li>
              <Li><strong>{t('privacy.sections.legalBasis.items.analytics.label')}</strong> {t('privacy.sections.legalBasis.items.analytics.body')}</Li>
              <Li><strong>{t('privacy.sections.legalBasis.items.marketing.label')}</strong> {t('privacy.sections.legalBasis.items.marketing.body')}</Li>
              <Li><strong>{t('privacy.sections.legalBasis.items.security.label')}</strong> {t('privacy.sections.legalBasis.items.security.body')}</Li>
            </Ul>
          </Section>

          <Section title={t('privacy.sections.thirdParties.title')}>
            <p>{t('privacy.sections.thirdParties.intro')}</p>
            <Ul>
              <Li><strong>{t('privacy.sections.thirdParties.items.delivery.label')}</strong> {t('privacy.sections.thirdParties.items.delivery.body')}</Li>
              <Li><strong>{t('privacy.sections.thirdParties.items.payment.label')}</strong> {t('privacy.sections.thirdParties.items.payment.body')}</Li>
              <Li><strong>{t('privacy.sections.thirdParties.items.analyticsServices.label')}</strong> {t('privacy.sections.thirdParties.items.analyticsServices.body')}</Li>
              <Li><strong>{t('privacy.sections.thirdParties.items.hosting.label')}</strong> {t('privacy.sections.thirdParties.items.hosting.body')}</Li>
              <Li><strong>{t('privacy.sections.thirdParties.items.messengers.label')}</strong> {t('privacy.sections.thirdParties.items.messengers.body')}</Li>
              <Li><strong>{t('privacy.sections.thirdParties.items.authorities.label')}</strong> {t('privacy.sections.thirdParties.items.authorities.body')}</Li>
            </Ul>
          </Section>

          <Section title={t('privacy.sections.crossBorder.title')}>
            <p>{t('privacy.sections.crossBorder.body')}</p>
          </Section>

          <Section title={t('privacy.sections.analyticsServices.title')}>
            <p>{t('privacy.sections.analyticsServices.intro')}</p>
            <Ul>
              <Li><strong>Google Analytics 4</strong> — {t('privacy.sections.analyticsServices.items.ga4')}</Li>
              <Li><strong>Google Ads</strong> {t('privacy.sections.analyticsServices.items.googleAds')}</Li>
              <Li><strong>Google Tag Manager</strong> — {t('privacy.sections.analyticsServices.items.gtm')}</Li>
              <Li><strong>Google Merchant Center / Shopping</strong> — {t('privacy.sections.analyticsServices.items.merchantCenter')}</Li>
              <Li><strong>Google reCAPTCHA</strong> — {t('privacy.sections.analyticsServices.items.recaptcha')}</Li>
              <Li><strong>Google Maps</strong> — {t('privacy.sections.analyticsServices.items.googleMaps')}</Li>
              <Li><strong>Meta Pixel</strong> — {t('privacy.sections.analyticsServices.items.metaPixel')}</Li>
              <Li><strong>Meta Conversions API (CAPI)</strong> — {t('privacy.sections.analyticsServices.items.metaCapi')}</Li>
              <Li><strong>Meta Custom Audiences</strong> — {t('privacy.sections.analyticsServices.items.metaAudiences')}</Li>
              <Li><strong>TikTok Pixel {t('privacy.sections.analyticsServices.items.tiktokConnector')} Events API</strong> — {t('privacy.sections.analyticsServices.items.tiktok')}</Li>
              <Li><strong>LinkedIn Insight Tag</strong> — {t('privacy.sections.analyticsServices.items.linkedin')}</Li>
              <Li><strong>SendPulse</strong> — {t('privacy.sections.analyticsServices.items.sendpulse')}</Li>
            </Ul>
          </Section>

          <Section title={t('privacy.sections.cookies.title')}>
            <p>{t('privacy.sections.cookies.intro')}</p>
            <Ul>
              <Li><strong>{t('privacy.sections.cookies.items.necessary.label')}</strong> — {t('privacy.sections.cookies.items.necessary.body')}</Li>
              <Li><strong>{t('privacy.sections.cookies.items.functional.label')}</strong> — {t('privacy.sections.cookies.items.functional.body')}</Li>
              <Li><strong>{t('privacy.sections.cookies.items.analytics.label')}</strong> — {t('privacy.sections.cookies.items.analytics.body')}</Li>
              <Li><strong>{t('privacy.sections.cookies.items.marketing.label')}</strong> — {t('privacy.sections.cookies.items.marketing.body')}</Li>
            </Ul>
            <p>{t('privacy.sections.cookies.manage')}</p>
          </Section>

          <Section title={t('privacy.sections.retention.title')}>
            <p>{t('privacy.sections.retention.measures')}</p>
            <p>{t('privacy.sections.retention.periodsIntro')}</p>
            <Ul>
              <Li>{t('privacy.sections.retention.periods.consultations')}</Li>
              <Li>{t('privacy.sections.retention.periods.orders')}</Li>
              <Li>{t('privacy.sections.retention.periods.reviews')}</Li>
              <Li>{t('privacy.sections.retention.periods.emailMarketing')}</Li>
              <Li>{t('privacy.sections.retention.periods.technical')}</Li>
              <Li>{t('privacy.sections.retention.periods.remarketing')}</Li>
            </Ul>
            <p>{t('privacy.sections.retention.afterExpiry')}</p>
          </Section>

          <Section title={t('privacy.sections.breach.title')}>
            <p>{t('privacy.sections.breach.body')}</p>
          </Section>

          <Section title={t('privacy.sections.rights.title')}>
            <p>{t('privacy.sections.rights.intro')}</p>
            <Ul>
              <Li><strong>{t('privacy.sections.rights.items.know.label')}</strong> — {t('privacy.sections.rights.items.know.body')}</Li>
              <Li><strong>{t('privacy.sections.rights.items.access.label')}</strong> — {t('privacy.sections.rights.items.access.body')}</Li>
              <Li><strong>{t('privacy.sections.rights.items.rectification.label')}</strong> — {t('privacy.sections.rights.items.rectification.body')}</Li>
              <Li><strong>{t('privacy.sections.rights.items.erasure.label')}</strong> {t('privacy.sections.rights.items.erasure.body')}</Li>
              <Li><strong>{t('privacy.sections.rights.items.restriction.label')}</strong> — {t('privacy.sections.rights.items.restriction.body')}</Li>
              <Li><strong>{t('privacy.sections.rights.items.portability.label')}</strong> — {t('privacy.sections.rights.items.portability.body')}</Li>
              <Li><strong>{t('privacy.sections.rights.items.objection.label')}</strong> — {t('privacy.sections.rights.items.objection.body')}</Li>
              <Li><strong>{t('privacy.sections.rights.items.withdraw.label')}</strong> — {t('privacy.sections.rights.items.withdraw.body')}</Li>
              <Li><strong>{t('privacy.sections.rights.items.complaint.label')}</strong> — {t('privacy.sections.rights.items.complaint.bodyPre')} <A href="https://ombudsman.gov.ua">ombudsman.gov.ua</A>{t('privacy.sections.rights.items.complaint.bodyPost')}</Li>
            </Ul>
            <p>{t('privacy.sections.rights.contact')} <A href="mailto:termojet@sofievka.kiev.ua">termojet@sofievka.kiev.ua</A>. {t('privacy.sections.rights.contactDetails')}</p>
          </Section>

          <Section title={t('privacy.sections.contactUs.title')}>
            <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-1">
              <p><strong>{t('privacy.sections.contactUs.company')}</strong></p>
              <p>📧 <A href="mailto:termojet@sofievka.kiev.ua">termojet@sofievka.kiev.ua</A></p>
              <p>📞 +380 (50) 718-91-65, +380 (50) 450-64-24</p>
              <p>📍 {t('privacy.sections.contactUs.address')}</p>
              <p><strong>{t('privacy.sections.contactUs.dpoLabel')}</strong> {t('privacy.sections.contactUs.dpoName')}</p>
            </div>
          </Section>

          <Section title={t('privacy.sections.changes.title')}>
            <p>{t('privacy.sections.changes.body1')}</p>
            <p>{t('privacy.sections.changes.body2')}</p>
            <p className="text-slate-400 text-xs">{t('privacy.sections.changes.lastUpdated')}</p>
          </Section>

        </div>
      </motion.div>
    </div>
  )
}
