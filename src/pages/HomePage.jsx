import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { ArrowRight, ArrowUpRight, Play, X, Check, Star, Smartphone } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import { CATEGORIES } from '../data/categories'
import SEO from '../components/SEO'
import PumpViewer3D from '../components/PumpViewer3D'

const MP4_URL = 'https://termojet.com.ua/wp-content/uploads/2024/04/0-02-05-973ce8523dda389f497460d406b3d1195952436349faf993e798fb4d3b5d0980_7323ef3df1f7be93.mp4'
const YT_ID   = 'UzEOVxcS4mw'

const PROD_PHOTOS = [
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/04/photo_2024-04-05_18-34-09.jpg', label: '● Лазерне різання' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/04/photo_2024-04-05_18-34-12.jpg', label: '● Листогибне виробництво' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/04/photo_2024-04-05_18-34-22.jpg', label: '● Зварювання' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/04/photo_2024-04-05_18-34-32.jpg', label: '● Складання вузлів' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/04/photo_2024-04-05_18-35-38.jpg', label: '● Контроль якості' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/04/photo_2024-04-05_18-35-34.jpg', label: '● Готова продукція' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/04/photo_2024-04-05_18-33-55.jpg', label: '● Пакування' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/04/photo_2024-04-05_18-35-47.jpg', label: '● Склад відвантаження' },
]

const MARQUEE_ITEMS = ['ЕФЕКТИВНО', 'З ТЕПЛОІЗОЛЯЦІЄЮ', 'ВЛАСНЕ ВИРОБНИЦТВО', 'ШВИДКО', 'НАДІЙНО', 'MADE IN UKRAINE', 'З 2002 РОКУ', 'КИЇВ']

const CONFIG_STEPS = [
  { n: '01', title: 'Вибір потужності',  desc: 'Від 30 кВт до 2 МВт — система сама запропонує серію.' },
  { n: '02', title: 'Контури системи',   desc: 'Радіатори, тепла підлога, бойлер ГВС, басейн.' },
  { n: '03', title: 'Авто-підбір груп',  desc: '100+ моделей колекторів і насосних груп автоматично.' },
  { n: '04', title: 'PDF та замовлення', desc: 'Експорт схеми, перелік обладнання, відправка менеджеру.' },
]

const STATS = [
  { ord: '01', num: '20', suffix: ' років', label: 'На ринку котельного обладнання' },
  { ord: '02', num: '15', suffix: ' країн', label: 'Експорт у Європу — філія в Польщі' },
  { ord: '03', num: '50 000', suffix: '', label: 'Укомплектованих котелень за 22 роки' },
  { ord: '04', num: '70 000', suffix: '', label: 'Виробів на рік на власному заводі' },
]

const fadeUp  = { hidden: { opacity:0, y:20 }, show: { opacity:1, y:0, transition:{ duration:0.45 } } }
const stagger = { show: { transition: { staggerChildren: 0.08 } } }

// Animated counter
function CountUp({ end, suffix, duration = 1600 }) {
  const [val, setVal] = useState(0)
  const startRef = useRef(null)
  const rafRef = useRef(null)
  useEffect(() => {
    rafRef.current = requestAnimationFrame(function tick(t) {
      if (!startRef.current) startRef.current = t
      const p = Math.min(1, (t - startRef.current) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(end * eased))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(rafRef.current)
  }, [end, duration])
  return <>{val.toLocaleString('uk-UA')}{suffix && <span className="text-[var(--accent)]">{suffix}</span>}</>
}

export default function HomePage() {
  const { lang, blog, portfolio, products } = useApp()
  const t    = useT()
  const hero = t('hero')
  const cats = t('categories')
  const seo  = t('seo')

  const [videoOpen, setVideoOpen] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const [hoveredAdvantage, setHoveredAdvantage] = useState(null)
  const statsRef = useRef(null)

  useEffect(() => {
    if (!videoOpen) return
    const fn = (e) => { if (e.key === 'Escape') setVideoOpen(false) }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [videoOpen])

  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStatsVisible(true); obs.disconnect() }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const featuredCats  = CATEGORIES.slice(0, 6)
  const recentPosts   = blog.filter(p => p.published).slice(0, 3)
  const recentPortfolio = portfolio.slice(0, 3)

  return (
    <>
      <SEO title={null} description={seo.homeDesc} />

      {/* ─── VIDEO MODAL ─── */}
      {videoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setVideoOpen(false)}>
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          <div className="relative w-full max-w-4xl aspect-video z-10" onClick={e => e.stopPropagation()}>
            <iframe className="w-full h-full rounded-2xl shadow-2xl"
              src={`https://www.youtube.com/embed/${YT_ID}?autoplay=1&rel=0&modestbranding=1`}
              title="Termojet виробництво"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen />
            <button onClick={() => setVideoOpen(false)}
              className="absolute -top-5 -right-5 w-10 h-10 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          HERO — 2 колонки: текст | відео
      ═══════════════════════════════════════════ */}
      <section className="hero-gradient grain relative overflow-hidden text-white">
        <div className="orb orb-blue   w-[500px] h-[500px] -top-32 -right-20 opacity-50" />
        <div className="orb orb-orange w-[400px] h-[400px]  bottom-0  left-1/4 opacity-40" />
        <div className="absolute inset-0 bg-dots pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,85,0,0.7)] to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — text */}
            <motion.div initial="hidden" animate="show" variants={stagger}>
              <motion.div variants={fadeUp} className="eyebrow-white mb-6" style={{ fontSize: '13px', letterSpacing: '0.1em' }}>
                ● Системи швидкого монтажу · Виробництво з 2002
              </motion.div>

              <motion.h1 variants={fadeUp}
                className="font-black leading-[0.92] font-['Archivo',sans-serif] mb-6"
                style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)' }}>
                Котельня,<br />
                зібрана за{' '}
                <span className="text-gradient-orange">години</span>,<br />
                <span className="text-outline-white">а не за тижні.</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-white/65 text-lg leading-relaxed mb-8 max-w-lg">
                {hero.subtitle}
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                <Link to="/catalog" className="btn-primary px-7 py-3.5 text-base">
                  {hero.ctaCatalog} <ArrowRight size={16} />
                </Link>
                <Link to="/contacts" className="btn-outline-white px-7 py-3.5 text-base">
                  {hero.ctaContact}
                </Link>
                <button onClick={() => setVideoOpen(true)}
                  className="flex items-center gap-2.5 px-5 py-3.5 rounded-[0.875rem] text-sm font-semibold text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-all">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center animate-pulse-glow flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#FF5500,#FF9500)' }}>
                    <Play size={13} fill="white" className="ml-0.5" />
                  </span>
                  Повне відео
                </button>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-x-5 gap-y-2 mt-8 text-white/40"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.04em' }}>
                {['Гарантія якості', 'Доставка по Україні', '50 000+ котелень', 'ISO 9001:2015'].map(item => (
                  <span key={item} className="flex items-center gap-1.5">
                    <Check size={12} className="text-[#FF8533]" /> {item}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — 3D pump model */}
            <motion.div
              initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.7, delay:0.2 }}
              className="relative"
            >
              <div className="aspect-video w-full">
                <PumpViewer3D />
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl px-4 py-2.5 shadow-xl flex items-center gap-2.5 border border-[var(--ink-200)]">
                <span className="text-2xl">🇺🇦</span>
                <div>
                  <div className="text-xs font-black text-gray-900 font-['Archivo',sans-serif]">MADE IN UKRAINE</div>
                  <div className="text-[10px] text-gray-400">Власний завод у Києві</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--bg)] to-transparent pointer-events-none" />
      </section>

      {/* ═══════════════════════════════════════════
          STATS ROW — editorial style
      ═══════════════════════════════════════════ */}
      <section ref={statsRef} className="bg-[var(--bg)] border-b border-[var(--ink-200)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--ink-200)]">
            {STATS.map((s) => (
              <div key={s.ord} className="stat-editorial">
                <div className="eyebrow mb-3" style={{ color: 'var(--ink-200)' }}>{s.ord}</div>
                <div className="font-black leading-none font-['Archivo',sans-serif] mb-2 text-[var(--text-primary)]"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                  {statsVisible
                    ? <CountUp end={parseInt(s.num.replace(/\s/g,''))} suffix={s.suffix} />
                    : <>{s.num}<span className="text-[var(--accent)]">{s.suffix}</span></>
                  }
                </div>
                <div className="text-sm text-[var(--text-secondary)] leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          DARK MARQUEE BAND
      ═══════════════════════════════════════════ */}
      <section className="bg-[#0C0B0A] py-3.5 overflow-hidden">
        <div className="flex whitespace-nowrap">
          <div className="flex gap-0 animate-marquee-slow flex-shrink-0">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-3 px-4 text-sm font-bold tracking-widest uppercase text-white">
                {item}
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CATEGORIES — Каталог · SKU
      ═══════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <motion.div variants={fadeUp} className="eyebrow mb-3">
                Каталог · {CATEGORIES.length} категорій · 242 SKU
              </motion.div>
              <motion.h2 variants={fadeUp}
                className="font-black font-['Archivo',sans-serif] leading-tight text-[var(--text-primary)]"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}>
                Все для котельні —<br />в одному місці.
              </motion.h2>
            </div>
            <motion.div variants={fadeUp}>
              <Link to="/catalog" className="btn-ghost">
                {cats.viewAll} <ArrowRight size={15} />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {featuredCats.map(cat => {
              const catProduct = products.find(p => (p.categorySlug === cat.slug || p.categorySlug === cat.id) && p.image)
              return (
                <motion.div key={cat.id} variants={fadeUp}>
                  <Link to={`/catalog/${cat.slug}`} className="cat-card block h-full bg-white overflow-hidden group">
                    {/* Product photo */}
                    <div className="h-40 bg-[var(--bg)] overflow-hidden relative">
                      {catProduct?.image ? (
                        <img src={catProduct.image} alt={cat.name[lang] || cat.name.uk}
                          className="w-full h-full object-contain p-4 group-hover:scale-[1.05] transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">{cat.icon}</div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className="w-7 h-7 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm border border-[var(--ink-200)] group-hover:bg-[var(--accent)] group-hover:border-transparent transition-all">
                          <ArrowRight size={12} className="text-[var(--accent)] group-hover:text-white transition-colors" />
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 leading-tight mb-1 group-hover:text-[var(--primary)] transition-colors">
                        {cat.name[lang] || cat.name.uk}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed mb-3">{cat.desc[lang] || cat.desc.uk}</p>
                      <div className="text-xs font-semibold" style={{ color:'#FF5500' }}>{cat.count} товарів</div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ADVANTAGES — Наші переваги
      ═══════════════════════════════════════════ */}
      <section className="advantages-bg grain relative overflow-hidden py-20 md:py-28 text-white">
        <div className="absolute inset-0 bg-dots pointer-events-none" />
        <div className="orb orb-orange w-[500px] h-[500px] -right-32 top-1/2 -translate-y-1/2 opacity-50" />
        <div className="orb orb-blue   w-[400px] h-[400px] -left-20  top-0          opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }} className="text-center mb-14">
            <motion.div variants={fadeUp} className="eyebrow-white mb-3">Наші переваги</motion.div>
            <motion.h2 variants={fadeUp}
              className="font-black font-['Archivo',sans-serif] max-w-2xl mx-auto"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}>
              Чому обирають{' '}
              <span className="text-gradient-orange">Termojet</span>
            </motion.h2>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { num: '01', title: 'Власне виробництво', desc: 'Завод 3 000 м² у Києві. Повний цикл від металу до готового вузла.' },
              { num: '02', title: 'Гарантія якості',    desc: 'Кожна одиниця проходить вихідний контроль. ISO 9001:2015, CE.' },
              { num: '03', title: 'Наявність на складі', desc: 'Склад 2 500 м². Більшість позицій відвантажуємо наступного дня.' },
              { num: '04', title: 'Міжнародний досвід', desc: 'Поставки в 15 країн ЄС. Офіс у Польщі з 2018 року.' },
              { num: '05', title: 'Технічна підтримка', desc: 'Інженерна підтримка на всіх етапах. Підбір під ваш проект.' },
              { num: '06', title: 'Комплексні рішення', desc: 'TERMOJET BOX, Mini, Mega — від 30 кВт до 2 МВт.' },
            ].map((item, i) => {
              const isHovered = hoveredAdvantage === i
              return (
                <motion.div key={i} variants={fadeUp}
                  onMouseEnter={() => setHoveredAdvantage(i)}
                  onMouseLeave={() => setHoveredAdvantage(null)}
                  animate={{ scale: isHovered ? 1.02 : 1 }}
                  transition={{ duration: 0.2 }}
                  className="relative p-6 flex flex-col gap-4 rounded-2xl cursor-default overflow-hidden"
                  style={{
                    background: isHovered
                      ? 'linear-gradient(135deg, rgba(255,85,0,0.12), rgba(36,87,160,0.12))'
                      : 'rgba(255,255,255,0.05)',
                    border: isHovered
                      ? '1px solid rgba(255,85,0,0.35)'
                      : '1px solid rgba(255,255,255,0.08)',
                    transition: 'background 0.25s ease, border-color 0.25s ease',
                  }}>
                  {/* Animated glow on hover */}
                  {isHovered && (
                    <div className="absolute inset-0 pointer-events-none rounded-2xl"
                      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,85,0,0.08), transparent 70%)' }} />
                  )}
                  <div className="relative flex items-start justify-between">
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.1em', color: isHovered ? 'var(--accent)' : 'rgba(255,255,255,0.25)', transition: 'color 0.25s' }}>
                      {item.num}
                    </span>
                    <motion.div animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 4 }} transition={{ duration: 0.2 }}>
                      <ArrowUpRight size={16} className="text-[var(--accent)]" />
                    </motion.div>
                  </div>
                  <div className="relative">
                    <h3 className="font-bold text-white mb-2 transition-colors" style={{ color: isHovered ? 'white' : 'rgba(255,255,255,0.85)' }}>
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: isHovered ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.45)', transition: 'color 0.25s' }}>
                      {item.desc}
                    </p>
                  </div>
                  <div className="relative mt-auto pt-4 border-t" style={{ borderColor: isHovered ? 'rgba(255,85,0,0.2)' : 'rgba(255,255,255,0.06)', transition: 'border-color 0.25s' }}>
                    <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: isHovered ? '#FF8533' : 'rgba(255,255,255,0.25)', fontFamily: "'JetBrains Mono', monospace", transition: 'color 0.25s' }}>
                      <Check size={12} /> Підтверджено досвідом
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PRODUCTION PHOTOS — "Від листа сталі"
      ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <motion.h2 variants={fadeUp}
              className="font-black font-['Archivo',sans-serif] leading-tight text-[var(--text-primary)]"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}>
              Від листа сталі —<br />до готової котельні.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[var(--text-secondary)] max-w-xs text-sm leading-relaxed md:text-right">
              Лазерні верстати, листогини, напівавтоматичне зварювання та власна лінія порошкового фарбування. 5 500 м² площ.
            </motion.p>
          </motion.div>

          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PROD_PHOTOS.map((photo, i) => (
              <div key={i} className="prod-photo aspect-square cursor-pointer" onClick={() => setVideoOpen(true)}>
                <img
                  src={photo.src}
                  alt={`Виробництво Termojet ${i+1}`}
                  onError={e => {
                    e.target.style.display = 'none'
                    e.target.parentElement.style.background = `hsl(${210 + i*15}, 30%, ${15 + i*5}%)`
                  }}
                />
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-white/70 bg-black/40 backdrop-blur-sm rounded-lg px-2.5 py-1 block truncate"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px' }}>
                    {photo.label}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:0.3 }}
            className="flex gap-3 mt-8">
            <Link to="/about" className="btn-secondary">
              Про виробництво <ArrowRight size={15} />
            </Link>
            <button onClick={() => setVideoOpen(true)} className="btn-primary">
              <Play size={14} fill="white" /> Відео заводу
            </button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CONFIGURATOR — dark section
      ═══════════════════════════════════════════ */}
      <section className="section-navy grain relative overflow-hidden py-20 md:py-28">
        <div className="orb orb-orange w-[400px] h-[400px] -right-20 top-1/2 -translate-y-1/2 opacity-30" />
        <div className="orb orb-blue   w-[350px] h-[350px] -left-16  -top-16              opacity-25" />
        <div className="absolute inset-0 bg-dots pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            {/* Left — diagram */}
            <motion.div initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6 }}>
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm p-8"
                style={{ minHeight: 300 }}>
                <svg viewBox="0 0 320 200" className="w-full" fill="none">
                  <line x1="40" y1="100" x2="280" y2="100" stroke="rgba(255,85,0,0.6)" strokeWidth="2" strokeDasharray="6,3" />
                  {[80, 140, 200, 260].map((x, i) => (
                    <g key={x}>
                      <line x1={x} y1="100" x2={x} y2="50" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                      <line x1={x} y1="100" x2={x} y2="150" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                      <circle cx={x} cy="50" r="8" fill="rgba(255,85,0,0.3)" stroke="rgba(255,85,0,0.8)" strokeWidth="1.5" />
                      <circle cx={x} cy="150" r="8" fill="rgba(36,87,160,0.3)" stroke="rgba(36,87,160,0.8)" strokeWidth="1.5" />
                      <text x={x} y="30" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="monospace">НГ{i+1}</text>
                    </g>
                  ))}
                  <rect x="110" y="82" width="100" height="36" rx="6" fill="rgba(255,85,0,0.15)" stroke="rgba(255,85,0,0.6)" strokeWidth="1.5" />
                  <text x="160" y="97" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="monospace">KOLEKTOR</text>
                  <text x="160" y="111" textAnchor="middle" fill="rgba(255,85,0,0.9)" fontSize="10" fontWeight="bold" fontFamily="monospace">KGS22</text>
                  <text x="10" y="104" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace">КОТЕЛ</text>
                  <text x="258" y="170" fill="rgba(255,255,255,0.35)" fontSize="7" fontFamily="monospace">● CONFIG</text>
                </svg>
                <div className="eyebrow-white mt-2 text-center">Автоматичний підбір системи</div>
              </div>
            </motion.div>

            {/* Right — text + steps */}
            <motion.div initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6, delay:0.1 }}>
              <div className="eyebrow mb-4" style={{ color:'var(--accent)' }}>● Termojet App · Безкоштовно</div>
              <h2 className="text-white font-black font-['Archivo',sans-serif] leading-tight mb-4"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
                Конфігуратор котельної системи — в одному додатку.
              </h2>
              <p className="text-white/55 text-sm leading-relaxed mb-8">
                Підберіть колектор, гідрострілку та насосні групи без помилок сумісності. Експорт схеми в PDF, відправка менеджеру в один клік.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {CONFIG_STEPS.map(step => (
                  <div key={step.n} className="config-step">
                    <div className="eyebrow mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>КРОК {step.n}</div>
                    <h4 className="text-white font-bold text-sm mb-1">{step.title}</h4>
                    <p className="text-white/45 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="btn-app-store">
                  <Smartphone size={16} /> App Store
                </button>
                <button className="btn-app-store">
                  <Smartphone size={16} /> Google Play
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PORTFOLIO (якщо є дані)
      ═══════════════════════════════════════════ */}
      {recentPortfolio.length > 0 && (
        <section className="py-16 md:py-20 bg-[var(--bg)]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="eyebrow mb-2">{t('portfolio').title}</div>
                <h2 className="section-title">{t('portfolio').subtitle}</h2>
              </div>
              <Link to="/portfolio" className="btn-ghost hidden md:flex">
                {t('portfolio').viewAll} <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recentPortfolio.map(item => (
                <div key={item.id} className="card card-hover overflow-hidden bg-white">
                  {item.image && <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />}
                  <div className="p-4">
                    <div className="text-xs text-gray-400 mb-1">{item.location || ''}</div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    {item.desc && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          BLOG (якщо є дані)
      ═══════════════════════════════════════════ */}
      {recentPosts.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="eyebrow mb-2">{t('blog').title}</div>
                <h2 className="section-title">{t('blog').subtitle}</h2>
              </div>
              <Link to="/blog" className="btn-ghost hidden md:flex">
                {t('blog').viewAll} <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recentPosts.map(post => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="card card-hover overflow-hidden block group bg-white">
                  {post.image && <img src={post.image} alt={post.title} className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform duration-300" />}
                  <div className="p-5">
                    {post.category && <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">{post.category}</span>}
                    <h3 className="font-semibold text-gray-900 mt-1 mb-2 line-clamp-2">
                      {lang !== 'uk' && post[`title_${lang}`] ? post[`title_${lang}`] : post.title}
                    </h3>
                    <div className="mt-3 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all text-[var(--accent)]">
                      {t('blog').readMore} <ArrowRight size={13} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          EDITORIAL CTA — чорна секція
      ═══════════════════════════════════════════ */}
      <section className="bg-[#0C0B0A] py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots pointer-events-none opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">

            {/* Left — big text */}
            <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.6 }}>
              <h2 className="font-black font-['Archivo',sans-serif] text-white leading-[0.9]"
                style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}>
                Готові<br />
                <span className="text-outline-white">проєктувати</span><br />
                котельню?
              </h2>
            </motion.div>

            {/* Right — description + buttons */}
            <motion.div initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6, delay:0.15 }}
              className="max-w-sm flex-shrink-0">
              <p className="text-white/55 text-base leading-relaxed mb-8">
                Завантажте додаток або відкрийте каталог. Наші менеджери допоможуть з підбором обладнання за 1 робочий день.
              </p>
              <div className="flex flex-col gap-3">
                <Link to="/catalog" className="btn-primary text-base py-4 px-8 justify-center">
                  Відкрити каталог <ArrowRight size={16} />
                </Link>
                <Link to="/contacts" className="btn-outline-white text-base py-4 px-8 justify-center">
                  Замовити дзвінок
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          DEALERS CTA
      ═══════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="cta-gradient grain rounded-2xl p-8 md:p-14 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-dots pointer-events-none" />
            <div className="orb orb-orange w-64 h-64 -bottom-16 -right-8 opacity-35" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
                🤝 Програма для партнерів
              </div>
              <h2 className="section-title-white mb-4 max-w-xl mx-auto">{t('dealers').title}</h2>
              <p className="text-white/55 text-base mb-8 max-w-xl mx-auto">{t('dealers').subtitle}</p>
              <Link to="/dealers" className="btn-primary px-8 py-4 text-base">
                {t('dealers').ctaBecome} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
