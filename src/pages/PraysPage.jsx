import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Download, FileSpreadsheet, Phone, Send, ArrowRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import SEO from '../components/SEO'

// Сторінка існує заради посилання, яке шлють партнерам: месенджери будують картку
// з og-тегів HTML, а прямий лінк на .xlsx ніякого HTML не має, тож показував би
// голий URL. Звідси кнопка веде на /prays/faylom — маршрут у backend/server.js,
// що віддає найсвіжіший файл прайсу.
//
// Дата редакції дублюється в трьох місцях: тут, на титульній сторінці самого
// прайсу і в public/og-prays.png. Оновлюючи прайс, пройди всі три.
const EDITION = '8 вересня 2026'
const POSITIONS = '417'
const SECTIONS = '21'

const FACTS = [
  { k: POSITIONS, v: 'позицій у прайсі' },
  { k: SECTIONS, v: 'розділів обладнання' },
  { k: 'XLSX', v: 'Excel, з фото' },
]

const WHATS_INSIDE = [
  'Насосні групи 1" і 1¼", прямі та зі змішувачем',
  'Розподільчі колектори Mini, 72, 105 і 175 кВт',
  'Колектори з вбудованою гідрострілкою',
  'Серія Mega та модулі TERMOJET BOX',
  'Гідрострілки, сепаратори, шламоуловлювачі',
  'Клапани, приводи, автоматика й насоси',
]

export default function PraysPage() {
  const { siteSettings } = useApp()
  const phone = siteSettings?.phone || '+380 (50) 450 64 24'
  const tel = phone.replace(/[^\d+]/g, '')

  return (
    <>
      <SEO
        title="Прайс-лист Termojet — завантажити актуальні ціни"
        description={`Актуальний прайс-лист Termojet у форматі Excel. Ціни діють з ${EDITION}: ${POSITIONS} позицій обладнання для котелень.`}
      />

      {/* Шапка */}
      <div className="bg-[var(--bg-dark)] text-white pb-14"
        style={{ marginTop: '-60px', paddingTop: 'calc(4rem + 60px)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}>
            <div className="label-accent mb-3" style={{ color: 'var(--accent)' }}>Нова редакція</div>
            <h1 className="text-4xl md:text-6xl font-black font-['Archivo',sans-serif] mb-4">
              Прайс-лист Termojet
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mb-9">
              Ціни діють з {EDITION}. Рекомендовані роздрібні, з ПДВ.
            </p>

            <div className="flex flex-wrap gap-3">
              <a href="/prays/faylom"
                className="inline-flex items-center gap-2.5 px-7 py-4 text-white font-bold text-[15px] transition-transform hover:-translate-y-0.5"
                style={{ background: 'var(--accent)' }}>
                <Download size={19} /> Завантажити прайс
              </a>
              <Link to="/catalog"
                className="inline-flex items-center gap-2.5 px-7 py-4 font-bold text-[15px] border border-white/25 text-white hover:bg-white/10 transition-colors">
                Перейти до каталогу <ArrowRight size={17} />
              </Link>
            </div>

            <div className="flex items-center gap-2 mt-5 text-white/45 text-sm">
              <FileSpreadsheet size={15} /> Excel · відкривається в Excel, Numbers і Google Таблицях
            </div>
          </motion.div>
        </div>
      </div>

      {/* Цифри */}
      <section className="bg-[var(--bg-warm)] border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-3 gap-6">
          {FACTS.map(f => (
            <div key={f.v}>
              <div className="text-3xl md:text-4xl font-black font-['Archivo',sans-serif]"
                style={{ color: 'var(--accent)' }}>{f.k}</div>
              <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{f.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Що всередині + замовлення */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 md:gap-16">
          <div>
            <h2 className="text-2xl font-black font-['Archivo',sans-serif] mb-6">Що в прайсі</h2>
            <ul className="space-y-3">
              {WHATS_INSIDE.map(item => (
                <li key={item} className="flex gap-3 text-[15px]" style={{ color: 'var(--text-secondary)' }}>
                  <span className="mt-2 shrink-0 w-1.5 h-1.5" style={{ background: 'var(--accent)' }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-black font-['Archivo',sans-serif] mb-6">Як замовити</h2>
            <p className="text-[15px] mb-7" style={{ color: 'var(--text-secondary)' }}>
              Складіть замовлення в каталозі або напишіть менеджеру — підкажемо з підбором,
              порахуємо комплект і скажемо про наявність.
            </p>
            <div className="flex flex-col gap-3">
              <a href={`tel:${tel}`}
                className="inline-flex items-center gap-3 px-5 py-4 border font-semibold text-[15px] hover:bg-[var(--bg-subtle)] transition-colors"
                style={{ borderColor: 'var(--border)' }}>
                <Phone size={18} style={{ color: 'var(--accent)' }} /> {phone}
              </a>
              <a href={siteSettings?.telegram || 'https://t.me/termojet_ua_bot?start=termojet'}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-5 py-4 border font-semibold text-[15px] hover:bg-[var(--bg-subtle)] transition-colors"
                style={{ borderColor: 'var(--border)' }}>
                <Send size={18} style={{ color: 'var(--accent)' }} /> Написати в Telegram
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
