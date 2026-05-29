import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { ArrowRight, ArrowUpRight, Check, Smartphone, Play, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import { CATEGORIES } from '../data/categories'
import SEO from '../components/SEO'

const MP4_URL = 'https://termojet.com.ua/wp-content/uploads/2024/04/0-02-05-973ce8523dda389f497460d406b3d1195952436349faf993e798fb4d3b5d0980_7323ef3df1f7be93.mp4'
const YT_ID   = 'UzEOVxcS4mw'

const PROD_PHOTOS = [
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/04/photo_2024-04-05_18-34-09.jpg', label: '● Лазерне різання' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/04/photo_2024-04-05_18-34-12.jpg', label: '● Листогибне виробництво' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/04/photo_2024-04-05_18-34-22.jpg', label: '● Зварювання' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/04/photo_2024-04-05_18-34-32.jpg', label: '● Складання вузлів' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/04/photo_2024-04-05_18-35-41.jpg', label: '● Контроль якості' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/04/photo_2024-04-05_18-35-44.jpg', label: '● Готова продукція' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/04/photo_2024-04-05_18-33-55.jpg', label: '● Пакування' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/04/photo_2024-04-05_18-35-47.jpg', label: '● Склад відвантаження' },
]


const CONFIG_STEPS = [
  { n: '01', title: 'Вибір потужності',  desc: 'Від 30 кВт до 2 МВт — система сама запропонує серію.' },
  { n: '02', title: 'Контури системи',   desc: 'Радіатори, тепла підлога, бойлер ГВС, басейн.' },
  { n: '03', title: 'Авто-підбір груп',  desc: '100+ моделей колекторів і насосних груп автоматично.' },
  { n: '04', title: 'PDF та замовлення', desc: 'Експорт схеми, перелік обладнання, відправка менеджеру.' },
]

const STATS = [
  { ord: '01', num: '23', suffix: ' роки',  label: 'На ринку котельного обладнання' },
  { ord: '02', num: '16', suffix: ' країн', label: 'Експорт у Європу — філія в Польщі' },
  { ord: '03', num: '50', thousands: true,  label: 'Проектів укомплектовано' },
  { ord: '04', num: '70', thousands: true,  label: 'Виробів на рік на заводі' },
]

const fadeUp  = { hidden: { opacity:0, y:20 }, show: { opacity:1, y:0, transition:{ duration:0.45 } } }
const stagger = { show: { transition: { staggerChildren: 0.08 } } }

function CategoryCard({ cat, lang }) {
  const [hovered, setHovered] = useState(false)
  const imgSrc = cat.image
  return (
    <Link to={`/catalog/${cat.slug}`}
      className="cat-card block h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>

      {/* Фото */}
      <div className="relative overflow-hidden" style={{ height: 160, background: '#f0f0ef' }}>
        {imgSrc ? (
          <img src={imgSrc} alt={cat.name[lang] || cat.name.uk}
            className="w-full h-full object-contain transition-transform duration-500"
            style={{ transform: hovered ? 'scale(1.05)' : 'scale(1)', padding: '12px', mixBlendMode: 'multiply' }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">{cat.icon}</div>
        )}

        <div className="absolute top-2.5 left-2.5">
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#666', background: 'rgba(255,255,255,0.8)', padding: '3px 7px' }}>
            {cat.count} SKU
          </span>
        </div>
        <div className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center transition-colors duration-200"
          style={{ border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.7)' }}>
          <ArrowRight size={12} style={{ color: hovered ? 'var(--accent)' : '#999', transition: 'color 0.2s' }} />
        </div>
      </div>

      {/* Текст */}
      <div className="p-4" style={{ background: '#f7f7f6' }}>
        <h3 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', color: hovered ? 'var(--accent)' : '#1a1a1a', lineHeight: 1.25, marginBottom: 10, transition: 'color 0.2s' }}>
          {cat.name[lang] || cat.name.uk}
        </h3>

        {/* Підкатегорії */}
        <div style={{ overflow: 'hidden', maxHeight: hovered ? 120 : 0, transition: 'max-height 0.3s ease', marginBottom: hovered ? 8 : 0 }}>
          <div className="flex flex-col gap-1.5 pb-1">
            {(cat.subcategories || []).map((sub, i) => (
              <span key={i} className="flex items-center gap-1.5"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#777', letterSpacing: '0.04em' }}>
                <span style={{ color: 'var(--accent)', fontSize: '8px' }}>▸</span>
                {sub}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #e0e0e0' }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: hovered ? 'white' : 'var(--accent)',
            background: hovered ? 'var(--accent)' : 'transparent',
            border: '1px solid var(--accent)',
            padding: '3px 8px',
            transition: 'all 0.2s'
          }}>
            Переглянути →
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#aaa', letterSpacing: '0.06em' }}>
            {cat.count} SKU
          </span>
        </div>
      </div>
    </Link>
  )
}

const PROJECT_PHOTOS = [
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/08/436260112_1028062199320076_3448976492944701510_n-1.jpg', label: 'Котельня промислова' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/08/436346403_1028062205986742_1945016056577705001_n-1.jpg', label: 'Вузол підмішування' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/08/441415989_1029207962538833_8255095048528061398_n-1.jpg', label: 'Насосна станція' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/08/441923833_1036832648443031_6061180382749463508_n-1.jpg', label: 'Колекторний вузол' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/08/443716920_1034298352029794_8241212954317908008_n-1.jpg', label: 'Котельня на підприємстві' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/08/443717382_1035094698616826_2882206306103516977_n-1.jpg', label: 'Монтаж системи' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/08/445077258_1032797785513184_3472109855078885848_n-1.jpg', label: 'Розподільний вузол' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/08/445741031_1033532898773006_7539877099138788841_n-1.jpg', label: 'Готовий об\'єкт' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/08/448770252_1054379716688324_6993680917338285497_n-1.jpg', label: 'Теплова станція' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/08/448963173_1057194799740149_5056344012506323464_n-1.jpg', label: 'Насосна група в роботі' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/08/448862036_1054379710021658_8530154308900725780_n-1.jpg', label: 'Підключення колекторів' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/08/449446624_1063156462477316_8539246227030569584_n-1.jpg', label: 'Промисловий об\'єкт' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/08/450069451_1064322915694004_2995371254833168558_n-1.jpg', label: 'Готова котельня' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/08/450567120_1070326941760268_5112914741981000641_n-1.jpg', label: 'Монтаж вузла' },
  { src: 'https://termojet.com.ua/wp-content/uploads/2024/08/452863875_1078280964298199_2202968223287568557_n-1.jpg', label: 'Котельня ЖК' },
]

function ProjectsCarousel() {
  const trackRef = useRef(null)
  const isPausedRef = useRef(false)
  const posRef = useRef(0)
  const rafRef = useRef(null)
  const [lightbox, setLightbox] = useState(null)
  const SPEED = 0.5

  const items = [...PROJECT_PHOTOS, ...PROJECT_PHOTOS]

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const totalW = track.scrollWidth / 2

    function tick() {
      if (!isPausedRef.current) {
        posRef.current += SPEED
        if (posRef.current >= totalW) posRef.current = 0
        track.style.transform = `translateX(-${posRef.current}px)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => {
    if (!lightbox) return
    const fn = (e) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [lightbox])

  return (
    <>
      {lightbox && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          <div className="relative z-10 max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <img src={lightbox.src} alt={lightbox.label}
              className="w-full max-h-[80vh] object-contain"
              style={{ borderRadius: 0 }} />
            <div className="mt-3 text-center"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {lightbox.label}
            </div>
            <button onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.08em' }}>
              ESC · ЗАКРИТИ
            </button>
          </div>
        </div>
      )}

      <section className="py-16 md:py-24 bg-[#0C0B0A] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-10">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="flex items-end justify-between">
            <div>
              <motion.div variants={fadeUp} className="eyebrow mb-3" style={{ color: 'var(--accent)' }}>● Реалізовані проекти</motion.div>
              <motion.h2 variants={fadeUp}
                className="font-black font-['Archivo',sans-serif] text-white leading-tight"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
                50 000+ котелень оснащено<br />обладнанням Termojet
              </motion.h2>
            </div>
            <motion.a variants={fadeUp} href="/portfolio"
              className="hidden md:flex items-center gap-2 text-white/40 hover:text-white transition-colors"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Всі проекти <ArrowRight size={13} />
            </motion.a>
          </motion.div>
        </div>

        <div className="relative"
          onMouseEnter={() => { isPausedRef.current = true }}
          onMouseLeave={() => { isPausedRef.current = false }}>
          <div ref={trackRef} className="flex gap-4" style={{ willChange: 'transform', width: 'max-content' }}>
            {items.map((photo, i) => (
              <div key={i}
                className="flex-shrink-0 relative overflow-hidden cursor-pointer group"
                style={{ width: 280, height: 210 }}
                onClick={() => setLightbox(photo)}>
                <img
                  src={photo.src}
                  alt={photo.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = '#1a1a1a' }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 border border-white/60 flex items-center justify-center">
                    <ArrowUpRight size={18} className="text-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {photo.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #0C0B0A, transparent)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-20 pointer-events-none"
            style={{ background: 'linear-gradient(to left, #0C0B0A, transparent)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-6 text-right">
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>
            Наведіть мишку — зупинити · Клік — збільшити
          </span>
        </div>
      </section>
    </>
  )
}

const REVIEWS = [
  { id: 1, name: 'Олег Марченко', role: 'Директор монтажної компанії', rating: 5, text: 'Встановили насосні групи TERMOJET на 12 об\'єктах за сезон. Жодної рекламації. Якість стабільна, документація завжди в комплекті.', date: 'Лютий 2025' },
  { id: 2, name: 'Сергій Ковальчук', role: 'Головний інженер', rating: 5, text: 'Розподільчі колектори серії 175 кВт — відмінне рішення для великих об\'єктів. Терміни виготовлення витримали, менеджери завжди на зв\'язку.', date: 'Березень 2025' },
  { id: 3, name: 'Андрій Федоренко', role: 'Проектувальник ОВК', rating: 5, text: 'Проектую системи опалення вже 15 років. TERMOJET BOX — найзручніший вузол обв\'язки котла на ринку. Монтується за 2 години замість цілого дня.', date: 'Квітень 2025' },
  { id: 4, name: 'Василь Гончаренко', role: 'Власник сервісного центру', rating: 5, text: 'Гарантійні випадки — одиниці за 3 роки роботи. Сервісний відділ Termojet відповідає швидко. Рекомендую як надійного партнера.', date: 'Травень 2025' },
  { id: 5, name: 'Ірина Павленко', role: 'Керівник проектів', rating: 4, text: 'Замовляємо обладнання для котелень промислових підприємств. Ціна/якість оптимальні. Хотілось би більше складських позицій у наявності.', date: 'Квітень 2025' },
  { id: 6, name: 'Микола Бондаренко', role: 'Дилер TERMOJET, Харків', rating: 5, text: 'Партнеруємо 4 роки. Стабільні знижки, чітка логістика, якісні маркетингові матеріали. Продажі зростають щороку.', date: 'Березень 2025' },
]

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= rating ? 'var(--accent)' : 'rgba(255,255,255,0.15)', fontSize: 14 }}>★</span>
      ))}
    </div>
  )
}

function ReviewsSection() {
  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <motion.div variants={fadeUp}
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent)' }}
              className="mb-3">
              ● ВІДГУКИ
            </motion.div>
            <motion.h2 variants={fadeUp}
              className="font-black font-['Archivo',sans-serif] text-[#1a1a1a] leading-tight"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
              Що кажуть наші клієнти
            </motion.h2>
          </div>
          <motion.div variants={fadeUp}
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#aaa', letterSpacing: '0.06em' }}>
            {REVIEWS.length} відгуків · всі перевірені
          </motion.div>
        </motion.div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REVIEWS.map(review => (
            <motion.div key={review.id} variants={fadeUp}
              className="flex flex-col gap-4 p-6"
              style={{
                background: '#f7f7f6',
                border: '1px solid #e8e8e8',
              }}>
              {/* Stars + date */}
              <div className="flex items-center justify-between">
                <StarRating rating={review.rating} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#bbb', letterSpacing: '0.06em' }}>
                  {review.date}
                </span>
              </div>

              {/* Review text */}
              <p className="text-sm leading-relaxed flex-1" style={{ color: '#444' }}>
                "{review.text}"
              </p>

              {/* Author */}
              <div className="pt-4" style={{ borderTop: '1px solid #e0e0e0' }}>
                <div className="font-bold text-[#1a1a1a] text-sm">{review.name}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#888', marginTop: 3, letterSpacing: '0.04em' }}>
                  {review.role}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

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

function CountUpThousands({ end, duration = 1600 }) {
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
  return <>{val} <span className="text-[var(--accent)]">000</span></>
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

  useEffect(() => {
    if (!videoOpen) return
    const fn = (e) => { if (e.key === 'Escape') setVideoOpen(false) }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [videoOpen])

  // stats visible on load after short delay
  useEffect(() => {
    const t = setTimeout(() => setStatsVisible(true), 800)
    return () => clearTimeout(t)
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
          HERO — YouTube відеофон · іммерсивний
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden text-white" style={{ minHeight: '100vh', marginTop: '-60px' }}>

        {/* YouTube iframe — повний фон без звуку */}
        <div className="absolute inset-0 pointer-events-none" style={{ overflow: 'hidden' }}>
          <iframe
            src={`https://www.youtube.com/embed/${YT_ID}?autoplay=1&mute=1&loop=1&playlist=${YT_ID}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&iv_load_policy=3&start=0`}
            title="Termojet background"
            allow="autoplay; encrypted-media"
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100vw',
              height: '56.25vw',
              minHeight: '100vh',
              minWidth: '177.78vh',
              border: 'none',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Overlay: градієнт зліва для читабельності + загальне затемнення */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.25) 100%)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />

        {/* Оранжева лінія зверху */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--accent)] pointer-events-none" />

        {/* Контент — зліва вгорі */}
        <div className="relative z-10 w-full px-6 flex items-start" style={{ minHeight: '100vh' }}>
          <div className="max-w-xl pt-28 pb-12 ml-8">
            <motion.div initial="hidden" animate="show" variants={stagger}>

              <motion.div variants={fadeUp}
                className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-white/20 text-white/70"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.12em', backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.05)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                ВИРОБНИЦТВО З 2002 · КИЇВ, УКРАЇНА
              </motion.div>

              <motion.h1 variants={fadeUp}
                className="font-black font-['Archivo',sans-serif] mb-8"
                style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
                Виробник систем<br />
                швидкого монтажу<br />
                для котелень <span className="text-[var(--accent)]">#1</span><br />
                в Україні.
              </motion.h1>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                <Link to="/catalog"
                  className="inline-flex items-center gap-2 font-semibold rounded-lg transition-all duration-200 hover:opacity-90"
                  style={{ background: 'var(--accent)', color: 'white', padding: '16px 32px', fontSize: '15px', fontFamily: "'IBM Plex Sans', sans-serif" }}>
                  Переглянути каталог <ArrowRight size={18} />
                </Link>
                <Link to="/contacts"
                  className="inline-flex items-center gap-2 font-semibold rounded-lg transition-all duration-200 hover:bg-white/10"
                  style={{ border: '2px solid rgba(255,255,255,0.6)', color: 'white', padding: '16px 32px', fontSize: '15px', fontFamily: "'IBM Plex Sans', sans-serif" }}>
                  Отримати консультацію
                </Link>
              </motion.div>

            </motion.div>
          </div>
        </div>

        {/* Stats bar — overlay bottom of video */}
        <div className="absolute bottom-0 left-0 right-0 z-20"
          style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
              {STATS.map((s) => (
                <div key={s.ord} className="px-6 py-5">
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>{s.ord}</div>
                  <div className="font-black leading-none font-['Archivo',sans-serif] text-white whitespace-nowrap mb-1"
                    style={{ fontSize: 'clamp(1.4rem, 2.8vw, 2.2rem)' }}>
                    {s.thousands ? (
                      statsVisible
                        ? <CountUpThousands end={parseInt(s.num)} />
                        : <>{s.num} <span className="text-[var(--accent)]">000</span></>
                    ) : (
                      statsVisible
                        ? <CountUp end={parseInt(s.num.replace(/\s/g,''))} suffix={s.suffix} />
                        : <>{s.num}<span className="text-[var(--accent)]">{s.suffix}</span></>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.35 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CATEGORIES — Каталог · SKU
      ═══════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-[#2C2C2C]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <motion.div variants={fadeUp} className="eyebrow-white mb-3">
                Каталог
              </motion.div>
              <motion.h2 variants={fadeUp}
                className="font-black font-['Archivo',sans-serif] leading-tight text-white"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}>
                Все для котельні —<br />в одному місці.
              </motion.h2>
            </div>
            <motion.div variants={fadeUp}>
              <Link to="/catalog" className="btn-primary">
                {cats.viewAll} <ArrowRight size={15} />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }}
            className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {featuredCats.map(cat => (
              <motion.div key={cat.id} variants={fadeUp}>
                <CategoryCard cat={cat} lang={lang} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ADVANTAGES — Наші переваги
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20 md:py-28 text-white">
        <img
          src="https://termojet.com.ua/wp-content/uploads/2025/09/img_4674.jpg"
          alt="Виробництво Termojet"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.3)' }}
        />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(10,20,40,0.7) 0%, rgba(0,0,0,0.5) 100%)' }} />

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
                      ? 'linear-gradient(135deg, rgba(255,85,0,0.12), rgba(255,120,0,0.06))'
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
              Від листа сталі —<br />до готового обладнання<br />для швидкого монтажу.
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
          PROJECTS CAROUSEL
      ═══════════════════════════════════════════ */}
      <ProjectsCarousel />

      {/* ═══════════════════════════════════════════
          REVIEWS — Відгуки клієнтів
      ═══════════════════════════════════════════ */}
      <ReviewsSection />

      {/* ═══════════════════════════════════════════
          CONFIGURATOR — dark section
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20 md:py-32" style={{ background: '#080808' }}>

        {/* Engineering grid bg */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }} />

        {/* Orange glow behind phones */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,85,0,0.12) 0%, transparent 65%)' }} />

        <div className="relative max-w-5xl mx-auto px-4">

          {/* Section header */}
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="text-center mb-12">
            <div className="eyebrow mb-3" style={{ color:'var(--accent)' }}>● Termojet App · Безкоштовно</div>
            <h2 className="font-black font-['Archivo',sans-serif] leading-tight"
              style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', background: 'linear-gradient(to bottom, #ffffff, rgba(255,255,255,0.65))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Конструктор котельної системи — в одному додатку
            </h2>
          </motion.div>

          {/* Main: phones (left) + benefits (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center mb-14">

            {/* ── Phones: floating + glow + shimmer ── */}
            <div className="relative flex justify-center items-center">
              {/* Pulsing glow */}
              <motion.div
                animate={{ opacity: [0.25, 0.55, 0.25], scale: [1, 1.08, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 65%, rgba(255,85,0,0.22), transparent 70%)' }}
              />

              {/* Floating phones */}
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 w-full max-w-md overflow-hidden">

                {/* Shimmer sweep */}
                <motion.div
                  animate={{ x: ['-120%', '220%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
                  className="absolute inset-y-0 w-1/3 pointer-events-none z-20"
                  style={{ background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.07) 50%, transparent 80%)' }}
                />

                <img src="/termojet-website/app-promo-nobg.png" alt="Termojet App"
                  className="w-full block drop-shadow-2xl" style={{ filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.6))' }} />
              </motion.div>
            </div>

            {/* ── Benefits cards ── */}
            <div className="flex flex-col gap-2.5">
              {[
                { icon: '📋', title: 'Повний каталог',       desc: 'Вся продукція Termojet завжди під рукою.' },
                { icon: '⚙️', title: '100+ моделей',          desc: 'Конструктор з колекторів та насосних груп.' },
                { icon: '🛡️', title: 'Без помилок',           desc: 'Автоматичний підбір — несумісне поєднати неможливо.' },
                { icon: '⚡', title: 'Швидкий підбір',        desc: 'Підберіть систему саме для вашої котельні.' },
                { icon: '📄', title: 'Експорт PDF',           desc: 'Схема + список обладнання — одразу клієнту.' },
              ].map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity:0, x:30 }}
                  whileInView={{ opacity:1, x:0 }}
                  viewport={{ once:true }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  whileHover={{ y: -2 }}
                  className="flex items-start gap-4 p-4 cursor-default group"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 0,
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,85,0,0.35)'; e.currentTarget.style.background = 'rgba(255,85,0,0.04)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}>
                  <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <div className="text-white font-semibold text-base mb-1" style={{ fontFamily: "'Archivo', sans-serif" }}>
                      {item.title}
                    </div>
                    <div className="text-white/60 text-sm leading-relaxed" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                      {item.desc}
                    </div>
                  </div>
                  <motion.div
                    animate={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="ml-auto self-center flex-shrink-0">
                    <ArrowUpRight size={14} style={{ color: 'var(--accent)' }} />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Bottom CTAs ── */}
          <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="flex flex-wrap items-center justify-center gap-4 pt-8"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <a href="https://app.termojet.com.ua/" target="_blank" rel="noopener noreferrer"
              className="btn-primary flex items-center gap-2 text-sm px-6 py-3">
              Запустити у браузері <ArrowUpRight size={16} />
            </a>
            <a href="https://apps.apple.com/ua/app/termojet/id6471802953" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-5 py-3 text-white text-sm transition-all hover:bg-white/8"
              style={{ border: '1px solid rgba(255,255,255,0.18)', fontFamily: "'IBM Plex Sans', sans-serif" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              App Store
            </a>
            <a href="https://play.google.com/store/apps/details?id=ua.com.termojet.app" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-5 py-3 text-white text-sm transition-all hover:bg-white/8"
              style={{ border: '1px solid rgba(255,255,255,0.18)', fontFamily: "'IBM Plex Sans', sans-serif" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.65.19.98.07l13.12-7.37-2.83-2.83-11.27 10.13zm-1.76-20.1A1.99 1.99 0 001 5.14v13.72c0 .72.39 1.35.96 1.69l.09.05 7.68-7.68v-.18L1.42 3.66zm17.8 8.22L16.67 9.6l-3.04 3.04 3.04 3.04 2.57-1.44c.73-.41.73-1.36-.02-1.76zM4.14.26L17.26 7.6l-2.83 2.83L4.16.91c.33-.19.72-.2.98-.65z"/></svg>
              Google Play
            </a>
          </motion.div>

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
              <Link to="/partners" className="btn-primary px-8 py-4 text-base">
                {t('dealers').ctaBecome} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
