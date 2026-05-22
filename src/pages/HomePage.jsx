import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { ArrowRight, ArrowUpRight, Play, X, Check, Smartphone } from 'lucide-react'
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

function CategoryCard({ cat, lang }) {
  const [hovered, setHovered] = useState(false)
  const imgSrc = cat.image
  return (
    <Link to={`/catalog/${cat.slug}`}
      className="cat-card block h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>

      {/* Фото */}
      <div className="relative overflow-hidden" style={{ height: 160, background: '#141414' }}>
        {imgSrc ? (
          <img src={imgSrc} alt={cat.name[lang] || cat.name.uk}
            className="w-full h-full object-contain transition-transform duration-500"
            style={{ transform: hovered ? 'scale(1.05)' : 'scale(1)', padding: '12px' }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">{cat.icon}</div>
        )}
        <div className="absolute inset-0 transition-colors duration-300"
          style={{ background: hovered ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.25)' }} />

        <div className="absolute top-2.5 left-2.5">
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', background: 'rgba(0,0,0,0.5)', padding: '3px 7px' }}>
            {cat.count} SKU
          </span>
        </div>
        <div className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center transition-colors duration-200"
          style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.4)' }}>
          <ArrowRight size={12} style={{ color: hovered ? 'var(--accent)' : 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }} />
        </div>
      </div>

      {/* Текст */}
      <div className="p-4">
        <h3 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '14px', color: hovered ? '#fff' : 'rgba(255,255,255,0.85)', lineHeight: 1.25, marginBottom: 10, transition: 'color 0.2s' }}>
          {cat.name[lang] || cat.name.uk}
        </h3>

        {/* Підкатегорії */}
        <div style={{ overflow: 'hidden', maxHeight: hovered ? 120 : 0, transition: 'max-height 0.3s ease', marginBottom: hovered ? 8 : 0 }}>
          <div className="flex flex-col gap-1.5 pb-1">
            {(cat.subcategories || []).map((sub, i) => (
              <span key={i} className="flex items-center gap-1.5"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em' }}>
                <span style={{ color: 'var(--accent)', fontSize: '8px' }}>▸</span>
                {sub}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', opacity: hovered ? 1 : 0, transition: 'opacity 0.2s' }}>
            Переглянути →
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>
            {cat.count} товарів
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
    <section className="py-20 md:py-28 bg-[#0C0B0A] overflow-hidden">
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
              className="font-black font-['Archivo',sans-serif] text-white leading-tight"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
              Що кажуть наші клієнти
            </motion.h2>
          </div>
          <motion.div variants={fadeUp}
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>
            {REVIEWS.length} відгуків · всі перевірені
          </motion.div>
        </motion.div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REVIEWS.map(review => (
            <motion.div key={review.id} variants={fadeUp}
              className="flex flex-col gap-4 p-6"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
              {/* Stars + date */}
              <div className="flex items-center justify-between">
                <StarRating rating={review.rating} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>
                  {review.date}
                </span>
              </div>

              {/* Review text */}
              <p className="text-sm leading-relaxed flex-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                "{review.text}"
              </p>

              {/* Author */}
              <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="font-bold text-white text-sm">{review.name}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: 3, letterSpacing: '0.04em' }}>
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
          HERO — відео фон + центрований текст
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden text-white" style={{ minHeight: '90vh' }}>

        {/* Відео фон з blur */}
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'blur(3px) brightness(0.35)', transform: 'scale(1.05)' }}>
          <source src={MP4_URL} type="video/mp4" />
        </video>

        {/* Dark overlay для читабельності */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.55)' }} />

        {/* Orange glow знизу по центру */}
        <div className="absolute pointer-events-none"
          style={{ width: 800, height: 400, borderRadius: '50%', bottom: '-100px', left: '50%', transform: 'translateX(-50%)',
            background: 'radial-gradient(ellipse, rgba(255,85,0,0.20) 0%, transparent 70%)',
            filter: 'blur(40px)' }} />

        {/* Оранжева лінія зверху */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--accent)] pointer-events-none" />

        {/* Контент — зліва */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 flex items-center" style={{ minHeight: '90vh' }}>
          <div className="max-w-xl py-24">
            <motion.div initial="hidden" animate="show" variants={stagger}>

              <motion.div variants={fadeUp} className="eyebrow-white mb-6" style={{ fontSize: '13px', letterSpacing: '0.1em' }}>
                ● Системи швидкого монтажу · Виробництво з 2002
              </motion.div>

              <motion.h1 variants={fadeUp}
                className="font-black leading-[0.92] font-['Archivo',sans-serif] mb-6"
                style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)' }}>
                Виробник систем<br />
                швидкого монтажу{' '}
                <span className="text-gradient-orange">#1</span><br />
                <span className="text-outline-white">в Україні.</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-white/65 text-lg leading-relaxed mb-8">
                {hero.subtitle}
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                <Link to="/catalog" className="btn-primary px-7 py-3.5 text-base">
                  {hero.ctaCatalog} <ArrowRight size={16} />
                </Link>
                <Link to="/contacts" className="btn-outline-white px-7 py-3.5 text-base">
                  {hero.ctaContact}
                </Link>
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
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{ background: 'linear-gradient(to top, var(--bg), transparent)' }} />
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
      <section className="advantages-bg grain relative overflow-hidden py-20 md:py-28 text-white">
        <div className="absolute inset-0 bg-dots pointer-events-none" />
        <div className="orb orb-orange w-[500px] h-[500px] -right-32 top-1/2 -translate-y-1/2 opacity-50" />
        <div className="orb orb-warm   w-[400px] h-[400px] -left-20  top-0          opacity-40" />

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
      <section className="section-dark grain relative overflow-hidden py-20 md:py-28">
        <div className="orb orb-orange w-[400px] h-[400px] -right-20 top-1/2 -translate-y-1/2 opacity-30" />
        <div className="orb orb-warm   w-[350px] h-[350px] -left-16  -top-16              opacity-20" />
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
                      <circle cx={x} cy="150" r="8" fill="rgba(255,85,0,0.15)" stroke="rgba(255,85,0,0.5)" strokeWidth="1.5" />
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
