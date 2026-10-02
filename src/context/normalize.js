// Перетворення відповідей API у форму, яку тримає AppContext.
// Спільні для браузера (AppContext) і серверного рендеру (entry-server.jsx):
// для гідрації дані на сервері й у браузері мусять бути байт-у-байт однакові,
// тож логіка перетворень живе в одному місці.

// Портфоліо: UI використовує desc/image, БД/API — description/images[].
export const mapPortfolio = data =>
  data.map(p => ({ ...p, desc: p.description ?? p.desc ?? '', image: (p.images && p.images[0]) || p.image || '' }))

// Перелінковка статей блогу (поле links) живе лише в статичному data/blog.js.
export const blogLinksFrom = posts =>
  Object.fromEntries(posts.filter(p => p.links?.length).map(p => [p.slug, p.links]))
export const mergeBlogLinks = (data, blogLinks) =>
  data.map(p => blogLinks[p.slug] ? { ...p, links: blogLinks[p.slug] } : p)

// Документи: завантажені через адмінку — зверху, далі статичний каталог.
export const mergeFiles = (data, staticFiles) =>
  (Array.isArray(data) && data.length ? [...data, ...staticFiles] : staticFiles)
