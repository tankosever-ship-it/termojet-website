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
export default function SEO({ title }) {
  const t = useT()
  useEffect(() => {
    const base = (title || '').trim()
    const full = base
      ? (/termojet/i.test(base) ? base : `${base} | Termojet`)
      : t('seo.defaultTitle')
    if (full) document.title = full
  }, [title, t])

  return null
}
