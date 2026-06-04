import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CheckCircle, ChevronRight, Globe, TrendingUp, Headphones, FileText } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import ConsentCheckbox from '../components/ConsentCheckbox'
import SEO from '../components/SEO'

const BENEFITS = [
  { icon: TrendingUp, title: 'Дилерські знижки', desc: 'Спеціальні ціни залежно від обсягу закупівель. Щомісячні та квартальні бонуси.' },
  { icon: FileText, title: 'Маркетингові матеріали', desc: 'Каталоги, брошури, зразки продукції, банери — все для ефективних продажів.' },
  { icon: Headphones, title: 'Технічна підтримка', desc: 'Навчання менеджерів і монтажників. Консультації по підбору обладнання 24/7.' },
  { icon: Globe, title: 'Ексклюзивна територія', desc: 'Можливість отримати ексклюзивне право продажів у вашому регіоні.' },
]

const CONDITIONS = [
  'Мінімальне замовлення — від 50 000 грн / місяць',
  'Знижка від 10% до 30% залежно від обсягу',
  'Безкоштовна доставка при замовленні від 100 000 грн',
  'Відстрочка платежу для постійних партнерів',
  'Пріоритетне резервування дефіцитних позицій',
  'Участь у спільних маркетингових акціях',
]

export default function DealersPage() {
  const { sendDealerRequest } = useApp()
  const t = useT()
  const dealersT = t('dealers')
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  async function onSubmit(data) {
    await sendDealerRequest(data)
    setSuccess(true)
    reset()
  }

  return (
    <>
      <SEO title="Дилерам" description="Програма для дилерів Termojet — знижки до 30%, технічна підтримка, маркетингові матеріали. Ставайте офіційним партнером українського виробника." />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--primary)] to-[#1e4a7a] text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-5">
              🤝 Партнерська програма
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-['Archivo',sans-serif] mb-4">{dealersT.title}</h1>
            <p className="text-white/75 text-lg leading-relaxed">{dealersT.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="label-accent mb-2">Переваги співпраці</div>
            <h2 className="section-title">Що ви отримуєте як партнер</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 text-center">
                <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={26} className="text-[var(--primary)]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conditions + Form */}
      <section className="py-14 bg-[var(--bg-subtle)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* Conditions */}
            <div>
              <div className="label-primary mb-2">Умови партнерства</div>
              <h2 className="section-title mb-6">Прозорі умови співпраці</h2>
              <ul className="space-y-3 mb-8">
                {CONDITIONS.map(c => (
                  <li key={c} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{c}</span>
                  </li>
                ))}
              </ul>

              <div className="card p-5 bg-[var(--primary)]/5 border-[var(--primary)]/15">
                <p className="font-semibold text-gray-900 mb-1">Вже є питання?</p>
                <p className="text-sm text-gray-500 mb-3">Зателефонуйте нам — розкажемо про умови детально і відповімо на всі питання.</p>
                <a href="tel:+380507189165" className="btn-primary text-sm py-2.5">
                  Зателефонувати <ChevronRight size={14} />
                </a>
              </div>
            </div>

            {/* Form */}
            <div className="card p-6">
              <h3 className="font-bold text-xl mb-1">Подати заявку на партнерство</h3>
              <p className="text-sm text-gray-500 mb-5">Заповніть форму — менеджер зв'яжеться протягом 1 робочого дня</p>

              {success ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-3">🤝</div>
                  <p className="font-semibold text-gray-900 text-lg">Заявку отримано!</p>
                  <p className="text-gray-500 text-sm mt-1">Наш менеджер зв'яжеться з вами найближчим часом</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input {...register('name', { required: true })} placeholder="Ваше ім'я *"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
                      {errors.name && <p className="text-xs text-red-500 mt-1">Обов'язкове поле</p>}
                    </div>
                    <div>
                      <input {...register('phone', { required: true })} placeholder="Телефон *" type="tel"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
                      {errors.phone && <p className="text-xs text-red-500 mt-1">Обов'язкове поле</p>}
                    </div>
                  </div>
                  <input {...register('email', { required: true })} placeholder="Email *" type="email"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
                  <input {...register('company')} placeholder="Назва компанії"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
                  <input {...register('region')} placeholder="Регіон / місто роботи"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm" />
                  <textarea {...register('comment')} placeholder="Розкажіть про ваш бізнес — чим займаєтесь, скільки років на ринку, які обсяги планує"
                    rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm resize-none" />
                  <ConsentCheckbox buttonLabel="Подати заявку на партнерство" />
                  <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3">
                    {dealersT.ctaBecome}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
