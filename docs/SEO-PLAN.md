# SEO-план дій — termojet.com.ua

> Живий документ. Оновлюється в міру виконання (див. «Журнал виконання» внизу).
> Створено: 8 липня 2026. База: PDF-аудит (Screaming Frog) + squirrelscan (surface+full) + перевірка коду/БД/сирого HTML.

## Головна теза

Контент **уже готовий у БД**: 326 з 331 видимих товарів мають унікальний `seo_title` (усі ≤60 символів) і `meta_description` (~150 символів). Проблема — **не у відсутності контенту, а в тому, що його не віддають у HTML правильно.**

На сторінці конкурують **три джерела мета-тегів**, і краулер отримує дублі/generic:

| Джерело | Що ставить | Проблема |
|---|---|---|
| Статичний shell (`index.html`) | generic title / description / canonical→головна / H1 | краулер без JS і «перший тег» бачить це |
| Серверний ін'єкт (`backend/server.js:207`) | title = `{name} — Termojet` (задовгий), OG-теги | бере `name`, не `seo_title`; не чіпає canonical і `<meta name=description>`; лише товари |
| Клієнт Helmet (`src/components/SEO.jsx`) | title = `{seoTitle} \| Termojet` (подвоєння), self-canonical, унікальний desc | додає **другий** тег, не прибираючи shell → дублі |

## Доказова база (звірено 3 джерелами)

- **squirrelscan повний скан (361 стор.): 73/100 (Grade C).** Ціль — 90+.
- **Сирий HTML (curl, без JS)** — те, що бачать LLM-боти й перший прохід Google: canonical→головна, meta description generic, H1 generic, title задовгий.
- **Відрендерений шар** — canonical/H1 коректні (Helmet), але description усе одно дубль (два теги) і title задовгий.
- **БД:** 326/331 seo_title (≤60) + meta_description готові. 209/331 товарів на legacy wp-content-зображеннях (~300 КБ JPEG).

### Ключові цифри squirrelscan (повний скан)
| Правило | К-сть | Severity |
|---|---|---|
| content/duplicate-description | 361 (весь сайт) | warning |
| core/meta-title (задовгі >60) | 269 | error |
| social/og-url-match (og:url≠canonical) | 331 | warning |
| links/orphan-pages (<2 вхідних лінки) | 349 | warning |
| core/title-unique + content/duplicate-title (generic на категоріях/головній/статичних) | 30 | warning |
| perf/js-file-size (один бандл) | 803 КБ | error |
| a11y/landmark-one-main + skip-link | 361 | warning |
| url/length >100 / url/slug числові | 43 / 19 | info |
| legal/privacy-policy (нема) | — | warning |
| eeat/contact-page, eeat/author-byline | — | warning |
| security/csp (unsafe-inline) | — | warning |
| Images / Mobile / i18n | 100 | — (але див. нижче) |

> ⚠️ squirrelscan «Images 100» ввів в оману (не важить байти). Реальність: 209 товарів на wp-content JPEG ~300 КБ, без webp/avif і width/height. PDF мав рацію → Фаза 5.
> ⚠️ `/en/product/...` віддає **200 + generic shell** (не 301) → індексовані дублі з польськими слагами → Фаза 4.

### AI / GEO
- AI Overviews (Google): 4 відповіді / 3 сторінки. AI Mode: 3 / 3.
- ChatGPT / Gemini / Perplexity / Copilot: **0 / 0 / 0 / 0** — бо LLM-боти не виконують JS і бачать порожній shell. robots.txt їх **не** блокує (`Allow: /`). Головний важіль — Фаза 2 (prerender).

---

## ⚠️ Ключове архітектурне рішення (оновлено 8 лип після знахідки)

Знайдено попередній план команди: `_zvity/ПЛАН-Prerendering-SEO.md` (10 черв 2026). Він **збігається з Фазою 2** і **робить ручний серверний ін'єкт (початкову Фазу 1) значною мірою зайвим**: prerender (Chrome проти живого контейнера → `dist/<route>/index.html`) захоплює весь правильний вивід Helmet (canonical, title, unique description, H1, контент, JSON-LD, лінки) → одним механізмом закриває canonical/description/title/H1/orphan/thin-content **і** GEO/LLM.

**Обраний напрям:** prerender (узгоджено з червневим планом), а не паралельна ручна ін'єкція.
**Ризики/рішення (за власником, перед стартом):** (1) спайк сумісності React 19 `hydrateRoot` — пів дня, щоб не зламати рендер; (2) джерело даних: живий контейнер (реком.) vs статичний дамп БД.

**Безпечні зміни, потрібні в будь-якому разі:** фікс подвоєння «| Termojet» (`SEO.jsx`), прибрати generic-теги зі shell (`index.html`), `<main>`+skip-link.

## Фази

### 🔴 Фаза 1 — Передумови + безпечні фікси *(швидко, без ризику для рендеру)*
- [x] **Фікс подвоєння «| Termojet»** — `src/components/SEO.jsx` тепер стрипає хвостовий «<роздільник> Termojet» перед додаванням суфікса. *(зроблено 8 лип; справжня проблема відрендереного шару)*
- [ ] Прибрати generic title/description/canonical зі shell (`index.html:12-14`) — **робити РАЗОМ із prerender** (окремо тимчасово погіршить не-JS краулінг).
- [x] ~~`<main>` + skip-link~~ — **вже є** в `src/App.jsx` `PublicLayout` (рядки 67-73). Дії не треба; prerender винесе їх у сирий HTML.

> 🔑 **Уточнення після перевірки коду:** майже всі знахідки squirrelscan (no-main, orphan-pages, thin-content, дубль-title/desc, canonical→головна, H1) — **один корінь: краулер бачить оболонку до монтування React.** Виправлення в React уже здебільшого є (main, skip-link, унікальні title/desc через Helmet, лінки). **Єдиний потрібний розв'язок — prerender (Фаза 2)**, який виносить готовий React-HTML у файли для краулерів. Ручні точкові фікси переважно зайві.

### 🔴 Фаза 2 — Prerender *(головний важіль; за планом `_zvity/ПЛАН-Prerendering-SEO.md`)*
- [x] Фаза 0: спайк `hydrateRoot` React 19 — **виявив hydration mismatch (#418)** через `react-helmet-async` (мутує head → подвоєні теги в snapshot). React 19 відкочується до CSR (користувачі ок), але canonical лишається generic → «як є» не годиться. *(8 лип)*
- [ ] **Прекондиція (нова):** перевести `SEO.jsx` з `react-helmet-async` на **нативні метадані React 19** (без мутацій head) + прибрати generic-теги зі shell → чистий head, чиста гідрація, правильний canonical.
- [ ] Повторити спайк → підтвердити чисту гідрацію.
- [ ] `src/main.jsx`: `createRoot` → умовний `hydrateRoot`.
- [ ] `scripts/prerender.mjs`: Puppeteer проти живого контейнера, 361 URL зі sitemap → `dist/<route>/index.html`.
- [ ] Express: віддавати prerendered-файл першим, інакше SPA-фолбек. Прапорець-вимикач (відкат).
- [ ] Крок у Dockerfile/CI: build → run → prerender → образ.
- [ ] JSON-LD + FAQPage (`faqs` уже в БД) — захопляться prerender-ом.

### 🗑️ (Скасовано) Ручний серверний ін'єкт метаданих
Початкова ідея розширювати `server.js:207` на canonical/meta/категорії/блог — **замінена prerender-ом** (він робить це повніше й для LLM). Лишаємо лише опційний self-canonical як міст.

### 🟡 Стара Фаза 1 — Плюмбінг метаданих *(ЗАМІНЕНО Фазою 2 prerender)*
Джерела: PDF #1,2,3,4,5 · squirrel: meta-title(269), duplicate-description(361), title-unique(30), og-url-match(331)
- [ ] Серверний ін'єкт `<title>` ← `seo_title` (не `name`). `backend/server.js:212`
- [ ] Серверний ін'єкт `<meta name=description>` ← `meta_description`. `backend/server.js:216`
- [ ] Серверний **self-canonical** per-URL. `backend/server.js`
- [ ] Прибрати generic title/description/canonical/H1 зі shell; узгодити з Helmet. `index.html:12-14`
- [ ] Фікс подвоєння «| Termojet». `src/components/SEO.jsx:59`
- [ ] Розширити ін'єкт на категорії / блог / статичні. `backend/server.js`

### 🟠 Фаза 2 — Prerender + структуровані дані *(GEO/LLM + H1, кілька днів, інфра-ризик)*
Джерела: PDF #2(H1),#7 · власне: 0 у ChatGPT/Perplexity, JSON-LD лише клієнтський
- [ ] Prerender значущих сторінок (Puppeteer пост-білд або on-demand кеш в Express + chromium у Docker).
- [ ] JSON-LD (Organization/Product/Breadcrumb/Article) — серверно.
- [ ] FAQPage schema (таблиця `faqs` уже є) на /faq і Q&A-товари.
- [ ] KPI: AI Overviews / AI Mode / ChatGPT / Perplexity.

### 🟡 Фаза 3 — Контент *(майже готово)*
- [ ] Дозаповнити 5 товарів без seo_title/meta.
- [ ] Описи категорій (thin content 61 слово).
- [ ] Авторство в блозі (E-E-A-T byline). H2-дублі.

### 🟡 Фаза 4 — Перелінковка та crawl
- [ ] 349 orphan-сторінок → схожі товари, breadcrumb-лінки, футер-каталог.
- [ ] /en: 301 legacy → UA, або noindex, або справжня локалізація.
- [ ] sitemap `lastmod` + автогенерація; 19 числових слагів → описові (+301).

### 🔵 Фаза 5 — Продуктивність
- [ ] JS 803 КБ → code-split + minify.
- [ ] 209 wp-content JPEG → webp/avif, стиснення, width/height, 19 alt.
- [ ] Google Fonts у critical chain → self-host / preload.

### 🔵 Фаза 6 — A11y / комплаєнс / безпека
- [ ] `<main>` + skip-link (a11y + розпізнавання контенту).
- [ ] Privacy Policy сторінка + лінк у футері; помітний Contact.
- [ ] CSP без unsafe-inline; security-заголовки на статиці.

---

## Гарантії безпеки

- **Фаза 1 не змінює контент** — переюзує наявні `seo_title`/`meta_description` з БД. Для користувачів сайт виглядає й працює як раніше (Helmet далі відпрацьовує); покращується лише HTML для краулерів. Зміни зворотні через git.
- **Фаза 2 (prerender)** — більший обсяг з інфра-змінами (chromium у Docker); робиться й тестується **окремим кроком після** верифікації Фази 1 у проді.
- Деплой: локальні зміни → діф на рев'ю → rsync/git pull на Hetzner → `docker compose up -d --build` → ре-аудит squirrelscan (діф score).

## Журнал виконання

| Дата | Фаза | Що зроблено | Score до/після |
|---|---|---|---|
| 2026-07-08 | — | Аудит, звірка 3 джерел, план створено | 73 (baseline) |
| 2026-07-08 | 1 | Фікс подвоєння «\| Termojet» (`SEO.jsx`), коміт `309ee7f`, збірка ок | — |
| 2026-07-08 | 2/0 | Спайк hydrateRoot → FAIL (#418, Helmet мутує head). Шлях: міграція на нативні метадані React 19. Спайк-зміни некомічені (WIP) | — |
| 2026-07-08 | 2/0b | Міграція helmet→React19-метадані OK (structural mismatch зник). АЛЕ DOM-snapshot prerender не дає метадані не-JS краулерам (React19 metadata = runtime-only) + pre-existing Navbar hydration issues. Висновок: **DOM-snapshot prerender не годиться**. Розвилка: A=серверний ін'єкт метаданих / B=справжній SSR | — |
| 2026-07-08 | — | **Обрано A+** (серверний ін'єкт метаданих+контенту з БД). Prerender-WIP відкочено до `309ee7f`. | — |
| 2026-07-08 | A+ | Реалізовано ін'єкт для **товарів** (title←seo_title, canonical=self, description←meta_description, og, H1+опис у noscript) і **блогу** (title/excerpt). Локально перевірено curl-ом. `backend/server.js` | — |
| 2026-07-08 | A+ | **Задеплоєно** (`2317a85`) на Hetzner + перевірено на живому сайті: товар/блог — сторінкові title/canonical(self)/description/H1, 1 canonical; головна не зламана | **73→78** |

### Результат ре-аудиту після A+ (товари+блог)
- Score **73 → 78**; Core SEO 90→**95**; Social Media 77→**100**.
- `meta-title >60`: **269 → 0** · `duplicate-description`: **361 → 30** · `og-url-match`: **331 → 0**.
- Залишок 30 дубль-title/description = категорії+головна+статичні (наступний інкремент).
- Новий дрібний пункт: **6 дубль-seo_title на ~10 товарах-варіантах** (НГ-52/НГ-52П тощо) → дедуплікація в БД (Фаза 3).

| 2026-07-08 | A+ | **#1 категорії+статичні** задеплоєно (`e13e675`), перевірено живцем: унікальні title+canonical на 15 категоріях і 15 статичних. Головна generic. | — |
| 2026-07-08 | A+ | **#2 дедуп seo_title**: 9 рядків у **продовій БД** (колектори (200)/(240), НГ-52.150 Л). 0 груп дублів, 0 title>60. ⚠️ Зміна прямо в БД (volume), **не в git/seed** — при повній переінсталяції з seed відновиться дубль. | — |

### Наступні інкременти A+ (TODO)
- [x] Категорії `/catalog/:cat` — мапа 15 назв (CATEGORY_META) → title/description/H1. *(8 лип)*
- [x] Статичні сторінки (catalog/about/contacts/blog/service/faq/delivery/files/oem/partners/portfolio/returns/terms/privacy/navchannya) — STATIC_META. *(8 лип)*
- [ ] (нюанс) з JS у Google-рендері canonical/description присутні двічі (сервер + React helmet, значення однакові) — нешкідливо; за бажанням прибрати клієнтський canonical на початковому рендері.
- [ ] Решта фаз плану: 3 (контент категорій), 4 (перелінковка/orphan, /en, sitemap lastmod), 5 (JS split, зображення webp), 6 (privacy, CSP).
