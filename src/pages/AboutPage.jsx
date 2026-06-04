import { useState } from 'react'
import { motion } from 'framer-motion'
import { Factory, Globe, Award, ArrowRight, Check, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { useT } from '../i18n/useT'
import { assetPath } from '../utils/assetPath'

const BASE = 'https://termojet.com.ua/wp-content/uploads'

const MANUFACTURING_VIDEO = `${BASE}/2024/04/0-02-05-973ce8523dda389f497460d406b3d1195952436349faf993e798fb4d3b5d0980_7323ef3df1f7be93.mp4`

const MANUFACTURING_PHOTOS = [
  `${BASE}/2024/04/photo_2024-04-05_18-35-38.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-35-34.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-35-47.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-35-41.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-35-44.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-34-39.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-34-32.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-34-36.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-34-26.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-34-29.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-34-22.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-34-19.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-34-15.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-34-12.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-34-09.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-33-55.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-33-49.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-34-04.jpg`,
]

const PROCESS_STEPS = [
  { num: '01', label: 'ЛАЗЕРНЕ РІЗАННЯ' },
  { num: '02', label: 'ЛИСТОГИН' },
  { num: '03', label: 'ЗВАРЮВАННЯ' },
  { num: '04', label: 'ПОРОШКОВЕ ФАРБУВАННЯ' },
  { num: '05', label: 'ТЕПЛОІЗОЛЯЦІЯ' },
  { num: '06', label: 'КОНТРОЛЬ ЯКОСТІ' },
]

const TIMELINE = [
  { year: '2002', title: 'Заснування', desc: 'Перша гідрострілка Termojet виготовлена у невеликому гаражі в Києві.' },
  { year: '2005', title: 'Власний цех', desc: 'Відкрито перший виробничий цех площею 1 000 м². Серійне виробництво колекторів.' },
  { year: '2008', title: 'Вихід до ЄС', desc: 'Перші поставки в країни Євросоюзу. Сертифікація продукції за стандартами ЄС.' },
  { year: '2012', title: 'Розширення', desc: 'Виробничі площі зросли до 3 000 м². Потужність — 70 000+ одиниць на рік.' },
  { year: '2015', title: '10 000 котелень', desc: 'Оснащено 10 000-у котельню. Запуск серії TERMOJET Mega для промислових об\'єктів.' },
  { year: '2018', title: 'Польська філія', desc: 'Відкрито офіс у Забже (Польща) для ринків Центральної та Східної Європи.' },
  { year: '2022', title: 'Не зупиняємось', desc: 'Попри повномасштабне вторгнення виробництво не зупинялось. Забезпечуємо критичну інфраструктуру.' },
  { year: '2024', title: 'Сьогодні', desc: '50 000+ оснащених об\'єктів. Експорт у 15 країн ЄС. ~100 працівників.' },
]

const STATS = [
  { value: '2002', label: 'РІК ЗАСНУВАННЯ' },
  { value: '3 000', label: 'М² ВИРОБНИЦТВА' },
  { value: '70 000+', label: 'ОДИНИЦЬ / РІК' },
  { value: '~100', label: 'СПЕЦІАЛІСТІВ' },
  { value: '50 000+', label: 'КОТЕЛЕНЬ' },
  { value: '15', label: 'КРАЇН ЄС' },
]

const mono = { fontFamily: "'JetBrains Mono', monospace" }
const fadeUp  = { hidden: { opacity:0, y:20 }, show: { opacity:1, y:0, transition:{ duration:0.45 } } }
const stagger = { show: { transition: { staggerChildren:0.07 } } }

function PhotoGallery({ photos }) {
  const [lightbox, setLightbox] = useState(null)

  function prev() { setLightbox(i => (i - 1 + photos.length) % photos.length) }
  function next() { setLightbox(i => (i + 1) % photos.length) }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
        {photos.map((photo, i) => (
          <button
            key={i}
            onClick={() => setLightbox(i)}
            className="overflow-hidden aspect-square group"
          >
            <img
              src={photo}
              alt={`Виробництво Termojet ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/95"
          onClick={() => setLightbox(null)}
        >
          <button onClick={e => { e.stopPropagation(); prev() }}
            className="absolute left-4 text-white/70 hover:text-white p-3">
            <ChevronLeft size={32} />
          </button>
          <img
            src={photos[lightbox]}
            alt=""
            className="max-h-[90vh] max-w-[85vw] object-contain"
            onClick={e => e.stopPropagation()}
          />
          <button onClick={e => { e.stopPropagation(); next() }}
            className="absolute right-4 text-white/70 hover:text-white p-3">
            <ChevronRight size={32} />
          </button>
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X size={24} />
          </button>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40"
            style={{ ...mono, fontSize: '11px' }}>
            {lightbox + 1} / {photos.length}
          </span>
        </div>
      )}
    </>
  )
}

export default function AboutPage() {
  const t     = useT()
  const about = t('about')
  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <>
      <SEO title={about.title}
        description="Termojet — провідний український виробник обладнання для котелень з 2002 року. 3000 м², ~100 фахівців, 50 000+ об'єктів." />

      {/* ═══ HERO ══════════════════════════════════════════════════════ */}
      <section className="hero-gradient grain relative overflow-hidden text-white py-20 md:py-28">
        {/* Фонове фото котельні */}
        <img src={assetPath('/about-hero.png')} alt="" aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ objectPosition: 'center right' }} />
        {/* Затемнення — сильніше зліва, де текст */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(8,7,6,0.70) 0%, rgba(8,7,6,0.48) 45%, rgba(8,7,6,0.18) 100%)' }} />
        <div className="orb orb-orange w-[400px] h-[400px] -right-20 top-1/2 -translate-y-1/2 opacity-50" />
        <div className="orb orb-warm   w-[300px] h-[300px] -left-16  -top-16 opacity-40" />
        <div className="absolute inset-0 bg-dots pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--bg)] to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
            <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(255,85,0,0.9)' }}
              className="uppercase">
              ПРО КОМПАНІЮ · TERMOJET · З 2002 РОКУ
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="text-4xl md:text-6xl font-black font-['Archivo',sans-serif] mt-4 mb-5 leading-[1.05]">
            Виробляємо в Україні.<br />
            <span style={{ color: 'var(--accent)' }}>Власними руками.</span>
          </motion.h1>
          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
            className="text-white/60 text-lg leading-relaxed max-w-2xl mb-8">
            З 2002 року виробляємо насосні групи, колектори та гідрострілки на власному заводі у Києві.
            Повний цикл — від лазерного різання до фінального контролю якості.
          </motion.p>
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
            className="flex flex-wrap gap-3">
            {['🇺🇦 MADE IN UKRAINE', '🏭 3 000 М² ЗАВОДУ', '⚙️ 70 000+ ВИРОБІВ / РІК'].map(tag => (
              <span key={tag} className="bg-white/8 border border-white/15 px-4 py-1.5 text-sm backdrop-blur-sm"
                style={{ ...mono, fontSize: '10px', letterSpacing: '0.1em' }}>
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ STATS ══════════════════════════════════════════════════════ */}
      <section className="advantages-bg grain relative overflow-hidden py-12 text-white">
        <div className="absolute inset-0 bg-dots pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }}
            className="grid grid-cols-3 md:grid-cols-6 gap-px bg-white/5">
            {STATS.map(s => (
              <motion.div key={s.label} variants={fadeUp}
                className="bg-[#0C0B0A] px-4 py-6 text-center hover:bg-[#141312] transition-colors">
                <div className="text-3xl font-black font-['Archivo',sans-serif] text-white mb-1"
                  style={{ color: s.value.includes('2002') ? 'rgba(255,85,0,0.8)' : undefined }}>
                  {s.value}
                </div>
                <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.16em', color: 'rgba(255,255,255,0.35)' }}
                  className="uppercase">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ ABOUT TEXT ═════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 section-gradient-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

            <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }}
              viewport={{ once:true }} transition={{ duration:0.5 }}>
              <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.18em', color: 'var(--accent)' }} className="uppercase">
                ПРО НАС
              </span>
              <h2 className="text-3xl md:text-4xl font-black font-['Archivo',sans-serif] mt-3 mb-6 leading-tight">
                Сімейна компанія.<br />
                <span className="text-gradient-orange">Національний виробник.</span>
              </h2>
              <div className="space-y-4 text-gray-500 leading-relaxed text-sm">
                <p><strong className="text-gray-900">Termojet</strong> — виробнича сімейна компанія, заснована у 2002 році у Києві на базі торгової компанії «Софіївка». Двадцять два роки тому в невеликому гаражі було виготовлено першу сталеву гідрострілку Termojet.</p>
                <p>За ці роки компанія перетворилась з невеликого виробництва у <strong className="text-gray-900">найбільший в Україні завод-виробник систем швидкого монтажу для котелень</strong> — колекторів, гідрострілок, насосних груп.</p>
                <p>Колектори, гідрострілки та насосні групи Termojet виготовляються на <strong className="text-gray-900">високотехнологічному обладнанні</strong>: лазерних верстатах, листогинах, напівавтоматичних зварювальних апаратах та лінії порошкового фарбування.</p>
                <p>В цеху фінальної збірки обладнання додатково перевіряється, вдягається в теплоізоляцію, пакується та передається на склад готової продукції.</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity:0, x:20 }} whileInView={{ opacity:1, x:0 }}
              viewport={{ once:true }} transition={{ duration:0.5, delay:0.1 }}
              className="space-y-3">

              {/* Production specs */}
              <div className="card p-6">
                <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.16em', color: 'var(--text-muted)' }}
                  className="uppercase mb-4">
                  ВИРОБНИЧІ ДАНІ · КИЇВ, УКРАЇНА
                </div>
                <div className="space-y-0 divide-y divide-gray-100">
                  {[
                    ['ВИРОБНИЧІ ПЛОЩІ', '3 000 м²'],
                    ['СКЛАДСЬКІ ПЛОЩІ', '2 500 м²'],
                    ['ВИРОБНИЧА ПОТУЖНІСТЬ', '70 000+ одиниць / рік'],
                    ['КОМАНДА', '~100 спеціалістів'],
                    ['ПОЛЬСЬКА ФІЛІЯ', 'Забже, з 2018 року'],
                    ['РИНКИ ЗБУТУ', '15 країн ЄС + Україна'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center py-3">
                      <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.1em', color: 'var(--text-muted)' }} className="uppercase">{k}</span>
                      <span className="text-sm font-semibold text-gray-900">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certs */}
              <div className="card p-6">
                <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.16em', color: 'var(--text-muted)' }}
                  className="uppercase mb-4">
                  СЕРТИФІКАЦІЯ
                </div>
                <ul className="space-y-2.5">
                  {[
                    'ISO 9001:2015 — Система менеджменту якості',
                    'CE маркування — відповідність стандартам ЄС',
                    'Технічні умови України (ТУ)',
                    'Дозволи Держпраці України',
                  ].map(c => (
                    <li key={c} className="flex items-start gap-3 text-sm text-gray-600">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.2)' }}>
                        <Check size={11} style={{ color:'#22c55e' }} />
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ MANUFACTURING VIDEO + PHOTOS ══════════════════════════════ */}
      <section style={{ background: '#0C0B0A' }} className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">

          {/* Header */}
          <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} className="mb-10 text-center">
            <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.18em', color: 'var(--accent)' }}
              className="uppercase">
              ВИРОБНИЧИЙ ЦЕХ · КИЇВ
            </span>
            <h2 className="text-3xl md:text-4xl font-black font-['Archivo',sans-serif] text-white mt-3 mb-3 leading-tight">
              Від листа сталі —<br />
              <span style={{ color: 'var(--accent)' }}>до готового виробу</span>
            </h2>
            <p className="text-white/40 text-sm max-w-lg mx-auto">
              Весь виробничий цикл під одним дахом: лазерне різання, зварювання, порошкове фарбування та контроль якості
            </p>
          </motion.div>

          {/* Process steps */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {PROCESS_STEPS.map(({ num, label }) => (
              <div key={num} className="flex items-center gap-2 border border-white/10 px-4 py-2">
                <span style={{ ...mono, fontSize: '10px', color: 'var(--accent)' }}>{num}</span>
                <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)' }}
                  className="uppercase">{label}</span>
              </div>
            ))}
          </div>

          {/* Video — невелике вікно, клік розгортає на весь екран */}
          <motion.div initial={{ opacity:0, scale:0.98 }} whileInView={{ opacity:1, scale:1 }}
            viewport={{ once:true }} transition={{ duration:0.5 }}
            onClick={() => setVideoOpen(true)}
            className="relative overflow-hidden mb-3 max-w-lg mx-auto rounded-xl cursor-pointer group aspect-video bg-black ring-1 ring-white/10">
            <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.55)' }}
              className="absolute top-3 left-3 z-10 uppercase bg-black/50 px-2 py-1">
              ● LIVE / ВИРОБНИЧИЙ ЦЕХ
            </div>
            <video
              autoPlay muted loop playsInline preload="metadata"
              poster={MANUFACTURING_PHOTOS[0]}
              className="w-full h-full object-cover block"
            >
              <source src={MANUFACTURING_VIDEO} type="video/mp4" />
            </video>
            {/* play / expand overlay */}
            <div className="absolute inset-0 flex items-center justify-center transition-colors group-hover:bg-black/30">
              <span className="w-14 h-14 rounded-full bg-white/15 border border-white/40 backdrop-blur-sm flex items-center justify-center opacity-80 transition-all group-hover:opacity-100 group-hover:scale-110">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
              </span>
            </div>
            <div className="absolute bottom-3 right-3 z-10 bg-black/50 px-2 py-1 uppercase"
              style={{ ...mono, fontSize: '9px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.65)' }}>
              Натисніть, щоб розгорнути ↗
            </div>
          </motion.div>

          {/* Video modal — окреме вікно на весь екран */}
          {videoOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setVideoOpen(false)}>
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
              <div className="relative w-full max-w-4xl aspect-video z-10" onClick={e => e.stopPropagation()}>
                <video className="w-full h-full rounded-2xl shadow-2xl bg-black"
                  src={MANUFACTURING_VIDEO} controls autoPlay playsInline />
                <button onClick={() => setVideoOpen(false)}
                  className="absolute -top-5 -right-5 w-10 h-10 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Photo count label */}
          <div className="text-center mb-3">
            <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.25)' }}
              className="uppercase">
              ФОТОГАЛЕРЕЯ · {MANUFACTURING_PHOTOS.length} ЗНІМКІВ · КВІТЕНЬ 2024
            </span>
          </div>

          {/* Photo grid */}
          <PhotoGallery photos={MANUFACTURING_PHOTOS} />
        </div>
      </section>

      {/* ═══ TIMELINE ═══════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 section-gradient-light">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} className="text-center mb-14">
            <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.18em', color: 'var(--accent)' }} className="uppercase">
              ХРОНОЛОГІЯ
            </span>
            <h2 className="text-3xl md:text-4xl font-black font-['Archivo',sans-serif] mt-3 leading-tight">
              22 роки росту
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px md:-translate-x-px"
              style={{ background:'linear-gradient(to bottom, transparent, rgba(255,85,0,0.3) 10%, rgba(255,85,0,0.15) 90%, transparent)' }} />

            <div className="space-y-6">
              {TIMELINE.map((item, i) => (
                <motion.div key={item.year}
                  initial={{ opacity:0, x: i%2===0 ? -24 : 24 }}
                  whileInView={{ opacity:1, x:0 }}
                  viewport={{ once:true }}
                  transition={{ duration:0.4, delay:0.04 }}
                  className={`relative flex items-start gap-6 md:gap-0 ${i%2===0 ? 'md:flex-row-reverse' : ''}`}>

                  {/* dot */}
                  <div className="absolute left-[22px] md:left-1/2 md:-translate-x-1/2 mt-5 w-3 h-3 rounded-full border-2 z-10"
                    style={{ background: '#0C0B0A', borderColor: 'var(--accent)' }} />

                  <div className="hidden md:block flex-1" />

                  <div className={`ml-14 md:ml-0 flex-1 ${i%2===0 ? 'md:pr-10' : 'md:pl-10'}`}>
                    <div className="card p-5 card-hover">
                      <div className="flex items-center gap-3 mb-2">
                        <span style={{ ...mono, fontSize: '22px', fontWeight: 900, color: 'var(--accent)' }}>
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

      {/* ═══ CTA ════════════════════════════════════════════════════════ */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="cta-gradient grain rounded-2xl p-8 md:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-dots pointer-events-none" />
            <div className="orb orb-orange w-56 h-56 -bottom-12 -right-8 opacity-30" />
            <div className="relative">
              <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.5)' }}
                className="uppercase">
                ПАРТНЕРСЬКА ПРОГРАМА
              </span>
              <h2 className="section-title-white mt-3 mb-3 max-w-lg mx-auto">Станьте партнером Termojet</h2>
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
