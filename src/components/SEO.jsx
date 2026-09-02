import { useEffect } from 'react'
import { useT } from '../i18n/useT'

// ⚠️ ВАЖЛИВО — цей компонент НЕ інжектить жодних <meta>/<link>/<script>.
//
// Усі SEO-теги (title, description, canonical, OG, Twitter та JSON-LD Product /
// BreadcrumbList / Organization / Article / FAQ) інжектить СЕРВЕР у сирий HTML:
// backend/server.js → injectMeta() + handleProduct/handleCategory/handleBlog +
// catch-all зі STATIC_META. Дані з БД, локалізовано, по ОДНІЙ копії кожного тега.
//
// Раніше тут стояв react-helmet, який ДУБЛював серверні теги на клієнті (Googlebot
// виконує JS → у DOM по 2 копії). Навіть після прибирання meta/OG/JSON-LD helmet
// СТВОРЮВАВ ДРУГИЙ <title>-елемент (замість заміни серверного) → title=2.
//
// Тому title оновлюємо через `document.title` — це змінює текст ІСНУЮЧОГО
// (серверного) <title>, НЕ створюючи другий елемент. Потрібно лише щоб вкладка
// браузера оновлювалась при SPA-навігації. Бренд «| Termojet» додаємо лише якщо
// його ще немає (seo_title у БД уже брендовані — щоб не подвоювати «Termojet»).
//
// ⚠️ НЕ ЧІПАЄМО title на ПЕРШОМУ (прямому) завантаженні сторінки — саме його
// бачить краулер після виконання JS. Сервер уже поставив локалізований per-page
// title; клієнтський був гіршим і перетирав його:
//   • товар    — базовий (УКРАЇНСЬКИЙ) seoTitle на /pl /fr /de /ro → однаковий
//                title на всіх мовних URL товару = дублі в очах Google;
//   • категорія — «Сепаратори | Termojet» замість серверного
//                «Сепаратори — обладнання для котелень | Termojet».
// Тому пишемо document.title лише коли користувач ПІШОВ із серверного шляху
// (SPA-навігація) — там вкладка справді має оновлюватись, а краулера вже нема.
const SERVER_PATH = typeof window !== 'undefined' ? window.location.pathname : ''
let clientTookOver = false

export default function SEO({ title }) {
  const t = useT()
  useEffect(() => {
    if (!clientTookOver) {
      // Ще на тій сторінці, яку віддав сервер → лишаємо серверний <title> як є.
      if (window.location.pathname === SERVER_PATH) return
      clientTookOver = true
    }
    const base = (title || '').trim()
    const full = base
      ? (/termojet/i.test(base) ? base : `${base} | Termojet`)
      : t('seo.defaultTitle')
    if (full) document.title = full
  }, [title, t])

  return null
}
