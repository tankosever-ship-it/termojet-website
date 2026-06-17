import { GraduationCap, Users, Wrench, Check, ArrowUpRight } from 'lucide-react'
import SEO from '../components/SEO'
import { useT } from '../i18n/useT'

const mono = { fontFamily: "'JetBrains Mono', monospace" }
const REG_URL = 'https://crm.tjheatpump.com.ua/r/724d25775589ca0abf99f80a21143e4a'

export default function TrainingPage() {
  const t = useT()

  const benefits = [
    { icon: Wrench, title: t('training.benefit1Title'), text: t('training.benefit1Text') },
    { icon: Users, title: t('training.benefit2Title'), text: t('training.benefit2Text') },
    { icon: GraduationCap, title: t('training.benefit3Title'), text: t('training.benefit3Text') },
  ]

  const perks = [
    t('trainingPopup.perk1'),
    t('trainingPopup.perk2'),
    t('trainingPopup.perk3'),
  ]

  return (
    <>
      <SEO
        title={t('training.seoTitle')}
        description={t('training.seoDescription')}
        canonical="/navchannya"
      />

      {/* Hero */}
      <section style={{ background: '#0C0B0A', marginTop: '-60px', paddingTop: 'calc(3.5rem + 60px)' }} className="pb-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots pointer-events-none opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4">
          <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.18em', color: 'var(--accent)' }} className="uppercase">
            {t('training.eyebrow')}
          </span>
          <h1 className="text-4xl md:text-5xl font-black font-['Archivo',sans-serif] text-white mt-3 mb-3 leading-tight">
            {t('trainingPopup.title')}
          </h1>
          <p className="text-white/50 max-w-xl text-sm">
            {t('training.heroSubtitle')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Left: benefits */}
          <div>
            <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.16em', color: 'var(--text-muted)' }} className="uppercase block mb-6">
              {t('training.sectionBenefits')}
            </span>
            <div className="space-y-1">
              {benefits.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="w-10 h-10 border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 text-sm mb-1">{title}</div>
                    <div className="text-gray-500 text-sm leading-relaxed">{text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: registration CTA */}
          <div>
            <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.16em', color: 'var(--text-muted)' }} className="uppercase block mb-6">
              {t('training.sectionRegister')}
            </span>

            <div className="card p-6 md:p-8">
              <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                {t('training.registerIntro')}
              </p>

              <ul className="space-y-3 mb-7">
                {perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-3 text-sm text-gray-700">
                    <Check size={18} className="text-[var(--accent)] mt-0.5 flex-shrink-0" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <a href={REG_URL} target="_blank" rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-white px-6 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity">
                {t('trainingPopup.cta')} <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
