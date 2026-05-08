import { motion } from 'framer-motion'
import { Factory, Users, Globe, Award, ArrowRight, Check, MapPin, Calendar, Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { useT } from '../i18n/useT'

const TIMELINE = [
  { year: '2002', title: 'Заснування компанії', desc: 'Termojet засновано в Києві. Перша продукція — насосні групи та гідравлічні роздільники для систем опалення.' },
  { year: '2005', title: 'Власне виробництво', desc: 'Відкрито власний виробничий цех площею 1 000 м². Початок серійного виробництва розподільчих колекторів.' },
  { year: '2008', title: 'Вихід на ринок ЄС', desc: 'Перші поставки в країни Євросоюзу. Сертифікація продукції за стандартами ЄС.' },
  { year: '2012', title: 'Розширення виробництва', desc: 'Розширення до 3 000 м² виробничих площ. Запуск автоматизованих ліній. Потужність — 70 000+ одиниць на рік.' },
  { year: '2015', title: '10 000 котелень', desc: 'Оснащено 10 000-у котельню обладнанням Termojet. Запуск серії TERMOJET Mega для промислових об\'єктів.' },
  { year: '2018', title: 'Польська філія', desc: 'Відкрито офіс у Забже (Польща) для обслуговування ринків Центральної та Східної Європи.' },
  { year: '2022', title: 'Продовжуємо в умовах війни', desc: 'Попри повномасштабне вторгнення виробництво не зупинялось. Termojet забезпечує критичну інфраструктуру України.' },
  { year: '2024', title: 'Сьогодні', desc: '50 000+ оснащених об\'єктів. Експорт у 15 країн ЄС. ~100 працівників. Флагман українського виробництва.' },
]

const STATS = [
  { icon: '🏭', value: '3 000 м²', label: 'Виробничих площ' },
  { icon: '📦', value: '2 500 м²', label: 'Складських площ'  },
  { icon: '⚙️', value: '70 000+',  label: 'Одиниць / рік'    },
  { icon: '👷', value: '~100',     label: 'Спеціалістів'     },
  { icon: '🔥', value: '50 000+',  label: 'Котелень'         },
  { icon: '🌍', value: '15',       label: 'Країн ЄС'         },
]

const CERTS = [
  { label: 'ISO 9001:2015 — Система менеджменту якості',   color: 'icon-badge-glass-orange' },
  { label: 'CE маркування — відповідність стандартам ЄС',  color: 'icon-badge-glass-blue'   },
  { label: 'Технічні умови України (ТУ)',                   color: 'icon-badge-glass-orange' },
  { label: 'Дозволи Держпраці України',                    color: 'icon-badge-glass-blue'   },
]

const FEATURES = [
  { icon: Factory, badge: 'icon-badge-orange', title: 'Власне виробництво',   desc: 'Повний цикл від металу до готового виробу' },
  { icon: Award,   badge: 'icon-badge-orange', title: 'Якість та надійність', desc: 'Гарантія, вихідний контроль на кожній позиції' },
  { icon: Globe,   badge: 'icon-badge-blue',   title: 'Міжнародний досвід',   desc: '15 країн ЄС, філія в Польщі з 2018' },
  { icon: Users,   badge: 'icon-badge-blue',   title: 'Команда фахівців',     desc: '~100 інженерів і виробничників' },
]

const fadeUp  = { hidden: { opacity:0, y:20 }, show: { opacity:1, y:0, transition:{ duration:0.45 } } }
const stagger = { show: { transition: { staggerChildren:0.09 } } }

export default function AboutPage() {
  const t     = useT()
  const about = t('about')

  return (
    <>
      <SEO title={about.title}
        description="Termojet — провідний український виробник обладнання для котелень з 2002 року. 3000 м², ~100 фахівців, 50 000+ об'єктів." />

      {/* ═══════════════════════════════════════════
          HERO — dark gradient
      ═══════════════════════════════════════════ */}
      <section className="hero-gradient grain relative overflow-hidden text-white py-20 md:py-28">
        <div className="orb orb-orange w-[400px] h-[400px] -right-20 top-1/2 -translate-y-1/2 opacity-50" />
        <div className="orb orb-blue   w-[300px] h-[300px] -left-16  -top-16              opacity-40" />
        <div className="absolute inset-0 bg-dots pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,85,0,0.7)] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--bg)] to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
              className="inline-flex items-center gap-2 bg-white/8 border border-white/12 rounded-full px-4 py-1.5 text-sm font-semibold mb-6 backdrop-blur-sm">
              🇺🇦 MADE IN UKRAINE &bull; з 2002 року
            </motion.div>
            <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
              className="text-4xl md:text-5xl font-black font-['Montserrat',sans-serif] mb-5 leading-[1.1]">
              {about.title}
            </motion.h1>
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
              className="text-white/65 text-lg leading-relaxed max-w-2xl">
              {about.subtitle}
            </motion.p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          STATS — glass cards on dark band
      ═══════════════════════════════════════════ */}
      <section className="advantages-bg grain relative overflow-hidden py-14 text-white">
        <div className="absolute inset-0 bg-dots pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {STATS.map(s => (
              <motion.div key={s.label} variants={fadeUp} className="stat-card group text-center">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-2xl font-black font-['Montserrat',sans-serif] group-hover:text-[#FF8533] transition-colors">{s.value}</div>
                <div className="text-xs text-white/45 mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════ */}
      <section className="py-16 md:py-20 section-gradient-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

            {/* Left */}
            <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }}
              viewport={{ once:true }} transition={{ duration:0.5 }}>
              <div className="label-accent mb-3">Про нас</div>
              <h2 className="section-title mb-6">
                Виробник, якому{' '}
                <span className="text-gradient-orange">довіряють</span>
              </h2>
              <div className="space-y-4 text-gray-500 leading-relaxed text-sm">
                <p><strong className="text-gray-900">Termojet</strong> — провідний український виробник обладнання для монтажу та обслуговування котельних систем. Компанію засновано в Києві у 2002 році, і з того часу ми ні на день не зупиняли виробництво.</p>
                <p>На наших <strong className="text-gray-900">3 000 м² виробничих площах</strong> щороку виготовляється понад 70 000 одиниць продукції — насосні групи, гідравлічні роздільники, розподільчі колектори, клапани, сепаратори та комплексні системи для котелень будь-якої потужності.</p>
                <p>Кожна одиниця проходить <strong className="text-gray-900">вихідний контроль якості</strong>. Власний склад 2 500 м² дозволяє відвантажувати більшість позицій наступного дня.</p>
                <p>З 2018 року ми присутні в Польщі (Забже) та постачаємо продукцію в <strong className="text-gray-900">15 країн ЄС</strong>. 50 000+ котелень по Україні та за кордоном оснащено нашим обладнанням.</p>
              </div>

              {/* Feature cards */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FEATURES.map(({ icon: Icon, badge, title, desc }) => (
                  <div key={title} className="card p-4 flex gap-3 card-hover">
                    <div className={`icon-badge icon-badge-sm ${badge}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{title}</div>
                      <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right */}
            <motion.div initial={{ opacity:0, x:20 }} whileInView={{ opacity:1, x:0 }}
              viewport={{ once:true }} transition={{ duration:0.5, delay:0.1 }}
              className="space-y-4">

              {/* Production info card */}
              <div className="card p-6">
                <h3 className="font-bold text-base mb-5 flex items-center gap-2">
                  <div className="icon-badge icon-badge-sm icon-badge-orange">
                    <Factory size={16} />
                  </div>
                  Виробництво
                </h3>
                <ul className="space-y-3">
                  {[
                    ['📍', 'Адреса', 'Київ, Україна'],
                    ['📐', 'Виробничі площі', '3 000 м²'],
                    ['📦', 'Склад', '2 500 м², постійна наявність'],
                    ['⚙️', 'Потужність', '70 000+ одиниць на рік'],
                    ['👷', 'Команда', '~100 спеціалістів'],
                    ['🌍', 'Польська філія', 'Забже, з 2018 року'],
                  ].map(([emoji, k, v]) => (
                    <li key={k} className="flex items-start gap-3 text-sm">
                      <span className="text-base mt-0.5">{emoji}</span>
                      <span>
                        <span className="font-semibold text-gray-900">{k}:</span>{' '}
                        <span className="text-gray-500">{v}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Certs */}
              <div className="card p-6">
                <h3 className="font-bold text-base mb-5 flex items-center gap-2">
                  <div className="icon-badge icon-badge-sm icon-badge-blue">
                    <Award size={16} />
                  </div>
                  Сертифікати та дозволи
                </h3>
                <ul className="space-y-3">
                  {CERTS.map(c => (
                    <li key={c.label} className="flex items-start gap-3 text-sm text-gray-600">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.2)' }}>
                        <Check size={11} style={{ color:'#22c55e' }} />
                      </span>
                      {c.label}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="rounded-2xl p-5 relative overflow-hidden"
                style={{ background:'linear-gradient(135deg, rgba(255,85,0,0.07) 0%, rgba(27,63,107,0.05) 100%)', border:'1px solid rgba(255,85,0,0.15)' }}>
                <div className="font-bold text-gray-900 mb-1.5">Хочете дізнатись більше?</div>
                <p className="text-sm text-gray-500 mb-4">Зв'яжіться з нами — розкажемо про виробництво, підберемо обладнання для проекту.</p>
                <Link to="/contacts" className="btn-primary text-sm py-2.5">
                  Зв'язатись з нами <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="gradient-divider" />

      {/* ═══════════════════════════════════════════
          TIMELINE
      ═══════════════════════════════════════════ */}
      <section className="py-16 md:py-24 section-gradient-light">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }}
            className="text-center mb-14">
            <motion.div variants={fadeUp} className="label-primary mb-3">З 2002 до сьогодні</motion.div>
            <motion.h2 variants={fadeUp} className="section-title">{about.history}</motion.h2>
          </motion.div>

          {/* Vertical timeline */}
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-px"
              style={{ background:'linear-gradient(to bottom, transparent, rgba(255,85,0,0.3) 10%, rgba(27,63,107,0.2) 90%, transparent)' }} />

            <div className="space-y-8">
              {TIMELINE.map((item, i) => (
                <motion.div key={item.year}
                  initial={{ opacity:0, x: i%2===0 ? -24 : 24 }}
                  whileInView={{ opacity:1, x:0 }}
                  viewport={{ once:true }}
                  transition={{ duration:0.45, delay:0.05 }}
                  className={`relative flex items-start gap-6 md:gap-0 ${i%2===0 ? 'md:flex-row-reverse' : ''}`}>

                  {/* dot */}
                  <div className="absolute left-[18px] md:left-1/2 md:-translate-x-1/2 mt-5 timeline-dot z-10" />

                  {/* spacer */}
                  <div className="hidden md:block flex-1" />

                  {/* card */}
                  <div className={`ml-14 md:ml-0 flex-1 ${i%2===0 ? 'md:pr-10' : 'md:pl-10'}`}>
                    <div className="card p-5 card-hover">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-black font-['Montserrat',sans-serif] text-gradient-orange">
                          {item.year}
                        </span>
                        <span className="font-bold text-gray-900 text-sm">{item.title}</span>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          DEALERS CTA
      ═══════════════════════════════════════════ */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="cta-gradient grain rounded-2xl p-8 md:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-dots pointer-events-none" />
            <div className="orb orb-orange w-56 h-56 -bottom-12 -right-8 opacity-30" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
                🤝 Партнерська програма
              </div>
              <h2 className="section-title-white mb-3 max-w-lg mx-auto">Станьте партнером Termojet</h2>
              <p className="text-white/55 mb-7 max-w-md mx-auto text-sm leading-relaxed">
                Шукаємо дилерів у всіх регіонах України та за кордоном. Вигідні умови, технічна підтримка.
              </p>
              <Link to="/dealers" className="btn-primary px-8 py-3.5">
                Дізнатись про партнерство <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
