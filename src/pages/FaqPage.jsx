import { useState } from 'react'
import { ChevronDown, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import SEO from '../components/SEO'

const DEFAULT_FAQ = [
  {
    id: '1',
    question: 'Чи є у вас власне виробництво?',
    answer: 'Так, Termojet — власне виробництво в Києві з 2002 року. Виробничі площі — 3 000 м², потужність — 70 000+ одиниць на рік. Це дозволяє нам контролювати якість на кожному етапі і пропонувати конкурентні ціни.',
  },
  {
    id: '2',
    question: 'Чи є продукція в наявності на складі?',
    answer: 'Більшість позицій каталогу постійно є на складі площею 2 500 м². Ми можемо відвантажити більшість замовлень наступного робочого дня після оплати.',
  },
  {
    id: '3',
    question: 'Як стати дилером Termojet?',
    answer: 'Заповніть форму на сторінці "Дилерам" або зателефонуйте нам. Умови партнерства: знижки від 10% до 30% залежно від обсягу, відстрочка платежу, технічна підтримка, маркетингові матеріали.',
  },
  {
    id: '4',
    question: 'Чи надаєте ви технічну підтримку при підборі обладнання?',
    answer: 'Так, наші технічні спеціалісти допоможуть підібрати оптимальне обладнання для вашого проекту — від невеликої котельні до промислового об\'єкту потужністю до 2 МВт.',
  },
  {
    id: '5',
    question: 'Яка гарантія на обладнання Termojet?',
    answer: 'На все виробниче обладнання надається гарантія виробника. Терміни гарантії залежать від типу продукції і вказані в документації до кожного виробу.',
  },
  {
    id: '6',
    question: 'Чи здійснюєте ви доставку по всій Україні?',
    answer: 'Так, доставка здійснюється по всій Україні за допомогою транспортних компаній (Нова Пошта, Деливері, власний транспорт для великих замовлень). Також можливе самовивезення з нашого складу в Києві.',
  },
  {
    id: '7',
    question: 'Чи є у вас обладнання для промислових котелень?',
    answer: 'Так, серія TERMOJET Mega — це системи для котелень потужністю до 2 МВт. Для малих об\'єктів — серія TERMOJET Mini до 30 кВт. Виробляємо весь спектр: насосні групи, колектори, клапани, сепаратори, гідравлічні роздільники.',
  },
  {
    id: '8',
    question: 'Чи постачаєте ви продукцію за кордон?',
    answer: 'Так, ми експортуємо продукцію в 15 країн ЄС. З 2018 року є офіційне представництво в Польщі (м. Забже). Для міжнародних замовлень — зверніться до нашого відділу експорту.',
  },
]

function FAQItem({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-gray-50/50 transition-colors"
      >
        <span className="font-semibold text-gray-900 pr-2">{item.question}</span>
        <ChevronDown size={18} className={`text-[var(--primary)] flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-50">
          <p className="text-gray-600 leading-relaxed pt-4">{item.answer}</p>
        </div>
      )}
    </div>
  )
}

export default function FaqPage() {
  const { faq } = useApp()
  const t = useT()
  const faqT = t('faq')

  const items = faq.length > 0 ? faq : DEFAULT_FAQ

  return (
    <>
      <SEO title={faqT.title} description="Відповіді на найпоширеніші питання про обладнання Termojet, умови замовлення, доставку та партнерство." />

      <div className="bg-gradient-to-br from-[var(--primary)] to-[#1e4a7a] text-white pb-12" style={{ marginTop: '-60px', paddingTop: 'calc(3rem + 60px)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="label-accent mb-2" style={{ color: '#fb923c' }}>Допомога</div>
          <h1 className="text-4xl font-black font-['Archivo',sans-serif] mb-2">{faqT.title}</h1>
          <p className="text-white/70">Відповіді на найпоширеніші питання про Termojet</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="space-y-3 mb-12">
          {items.map(item => <FAQItem key={item.id} item={item} />)}
        </div>

        <div className="card p-6 text-center bg-[var(--primary)]/5 border-[var(--primary)]/15">
          <h3 className="font-bold text-lg mb-2">Не знайшли відповідь?</h3>
          <p className="text-gray-500 text-sm mb-4">Зателефонуйте нам або надішліть запит — відповімо швидко</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+380507189165" className="btn-primary justify-center">
              <Phone size={15} /> Зателефонувати
            </a>
            <Link to="/contacts" className="btn-secondary justify-center">
              Написати нам
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
