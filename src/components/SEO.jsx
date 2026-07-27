import { Helmet } from 'react-helmet-async'
import { useT } from '../i18n/useT'

// ⚠️ ВАЖЛИВО — не додавати сюди meta/link/script.
//
// Усі SEO-теги (description, canonical, OG, Twitter та JSON-LD Product /
// BreadcrumbList / Organization / Article / FAQ) інжектить СЕРВЕР у сирий HTML:
// backend/server.js → injectMeta() + handleProduct/handleCategory/handleBlog +
// catch-all зі STATIC_META. Дані беруться з БД, локалізовано, по ОДНІЙ копії
// кожного тега — саме це бачать краулери (у т.ч. без JS).
//
// Раніше цей компонент через react-helmet ДУБЛював усі ті самі теги на клієнті:
// коли Googlebot виконував JS, у DOM опинялось по 2 копії description/canonical/
// OG/Twitter і подвоєні Organization/Product/Breadcrumb (SEO-аудит це й зафіксував).
//
// Тому тут лишається ЛИШЕ <title> — це один елемент, Helmet його оновлює на місці
// (не дублюється), і він потрібен, щоб заголовок вкладки змінювався при SPA-переходах.
// Пропси description/image/canonical/type/product/article/breadcrumbs приймаємо для
// зворотної сумісності з викликами по сторінках, але свідомо ІГНОРУЄМО.
export default function SEO({ title }) {
  const t = useT()
  // seo_title у БД часто вже містить суфікс «… | Termojet» — прибираємо будь-який
  // хвостовий «<роздільник> Termojet», щоб не подвоювати суфікс.
  const cleanTitle = title ? title.replace(/\s*[|–—-]\s*Termojet\s*$/i, '').trim() : ''
  const fullTitle = cleanTitle ? `${cleanTitle} | Termojet` : t('seo.defaultTitle')

  return (
    <Helmet>
      <title>{fullTitle}</title>
    </Helmet>
  )
}
