import { motion } from 'framer-motion'
import { Factory, Users, Globe, Award, ChevronRight } from 'lucide-react'
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
  { icon: '📦', value: '2 500 м²', label: 'Складських площ' },
  { icon: '⚙️', value: '70 000+', label: 'Одиниць / рік' },
  { icon: '👷', value: '~100', label: 'Спеціалістів' },
  { icon: '🔥', value: '50 000+', label: 'Оснащених котелень' },
  { icon: '🌍', value: '15', label: 'Країн ЄС' },
]

const CERTS = [
  'ISO 9001:2015 — Система менеджменту якості',
  'CE маркування — відповідність стандартам ЄС',
  'Технічні умови України (ТУ)',
  'Дозволи Держпраці України',
]

export default function AboutPage() {
  const t = useT()
  const about = t('about')

  return (
    <>
      <SEO title={about.title} description="Termojet — провідний український виробник обладнання для котелень з 2002 року. Власне виробництво 3000 м², ~100 фахівців, 50 000+ оснащених об'єктів." />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--primary)] to-[#1e4a7a] text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
              🇺🇦 MADE IN UKRAINE • з 2002 року
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-['Montserrat',sans-serif] mb-4">{about.title}</h1>
            <p className="text-white/75 text-lg leading-relaxed">{about.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-2xl font-black text-[var(--primary)] font-['Montserrat',sans-serif]">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="label-accent mb-2">Про нас</div>
              <h2 className="section-title mb-5">Виробник, якому довіряють</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-900">Termojet</strong> — провідний український виробник обладнання для монтажу та обслуговування котельних систем. Компанію засновано в Києві у 2002 році, і з того часу ми ні на день не зупиняли виробництво.
                </p>
                <p>
                  На наших <strong className="text-gray-900">3 000 м² виробничих площах</strong> щороку виготовляється понад 70 000 одиниць продукції — насосні групи, гідравлічні роздільники, розподільчі колектори, клапани з приводами, сепаратори та комплексні системи для котелень будь-якої потужності.
                </p>
                <p>
                  Кожна одиниця продукції проходить <strong className="text-gray-900">вихідний контроль якості</strong> перед відвантаженням. Завдяки власному складу площею 2 500 м² більшість позицій завжди є в наявності і може бути відвантажена наступного дня.
                </p>
                <p>
                  З 2018 року ми присутні на ринку Польщі (офіс у Забже) та постачаємо продукцію в <strong className="text-gray-900">15 країн Євросоюзу</strong>. Понад 50 000 котелень по всій Україні та за кордоном оснащено нашим обладнанням.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Factory, title: 'Власне виробництво', desc: 'Повний цикл від металу до готового виробу' },
                  { icon: Award, title: 'Якість та надійність', desc: 'Гарантія на всю продукцію, вихідний контроль' },
                  { icon: Globe, title: 'Міжнародна присутність', desc: '15 країн ЄС, філія в Польщі' },
                  { icon: Users, title: 'Команда фахівців', desc: '~100 інженерів і виробничників' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="card p-4 flex gap-3">
                    <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-[var(--primary)]" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="card p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Factory size={20} className="text-[var(--accent)]" />
                  Виробництво
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  {[
                    ['Адреса', 'Київ, Україна'],
                    ['Виробничі площі', '3 000 м²'],
                    ['Склад', '2 500 м², постійна наявність'],
                    ['Потужність', '70 000+ одиниць на рік'],
                    ['Команда', '~100 спеціалістів'],
                    ['Польська філія', 'Забже, з 2018 року'],
                  ].map(([k, v]) => (
                    <li key={k} className="flex items-start gap-3">
                      <span className="text-[var(--accent)] font-bold mt-0.5">→</span>
                      <span><strong className="text-gray-900">{k}:</strong> {v}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Award size={20} className="text-[var(--accent)]" />
                  Сертифікати та дозволи
                </h3>
                <ul className="space-y-2">
                  {CERTS.map(c => (
                    <li key={c} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/15 rounded-2xl p-5">
                <div className="font-bold text-gray-900 mb-1">Хочете дізнатись більше?</div>
                <p className="text-sm text-gray-500 mb-3">Зв'яжіться з нами — розкажемо про виробництво, підберемо обладнання для вашого проекту.</p>
                <Link to="/contacts" className="btn-primary text-sm py-2.5">
                  Зв'язатись з нами <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-20 bg-[var(--bg-subtle)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="label-primary mb-2">З 2002 до сьогодні</div>
            <h2 className="section-title">{about.history}</h2>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block" />
            <div className="space-y-6">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className={`relative flex ${i % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}
                >
                  <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[var(--accent)] border-2 border-white shadow top-5 hidden md:block" />
                  <div className={`card p-5 w-full md:w-[calc(50%-2rem)] ${i % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-black text-[var(--accent)] font-['Montserrat',sans-serif]">{item.year}</span>
                      <span className="font-semibold text-gray-900">{item.title}</span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">Станьте партнером Termojet</h2>
          <p className="text-gray-500 mb-6 max-w-xl mx-auto">Ми шукаємо дилерів у всіх регіонах України та за кордоном. Вигідні умови, технічна підтримка, маркетингові матеріали.</p>
          <Link to="/dealers" className="btn-primary">
            Дізнатись про партнерство <ChevronRight size={16} />
          </Link>
        </div>
      </section>
    </>
  )
}
