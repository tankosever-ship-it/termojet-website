# Termojet Website Redesign — Журнал змін

## Сесія 2026-07-17 — Email обов'язковий у формі замовлення

> Деплой Hetzner: `git pull && docker compose up -d --build`. Задеплоєно на прод і перевірено (білд / curl 200 / контейнер Up).

### ✨ feat: email обов'язковий у формі замовлення (коміт `397e9e4`)
- **Проблема:** замовлення №10 прийшло без пошти → лист-підтвердження (Resend) не відправився, і контакт клієнта не зберігся. Раніше у формі кошика `required` стояв лише на телефоні, email — необовʼязковий; `notifyCustomerOrder` тихо пропускає відправку, якщо email порожній/невалідний (`if (!EMAIL_RE.test(to)) return`).
- `src/pages/CartPage.jsx` — поле email тепер `register('email', { required: true, pattern: /.../ })` з перевіркою формату та виводом помилки (як для імені/телефону).
- Повідомлення про помилку `cartPage.error.email` додано у **5 мов** (uk/en/pl/fr/de).
- **Результат:** жодне замовлення без пошти → лист-підтвердження йде **завжди**, контакт зберігається (в т.ч. у `subscribers`). Перевірка відправки: Resend → Emails → Sending (є в списку зі статусом Delivered/Bounced).

## Сесія 2026-07-16 — Binotel: роутинг дзвінків у Telegram по сайту-джерелу

> Деплой Hetzner: `git pull && docker compose up -d --build`. Задеплоєно на прод і перевірено (curl 200 / контейнер Up). Кожен деплой підтверджувався окремо.

### 🩹 fix: картки дзвінків Binotel падали в General замість топіка (коміт `848f2a9`)
- **Проблема:** картка «🔴 Termojet — ПРОПУЩЕНИЙ дзвінок» (сторінка `termojet.com.ua`) потрапила в General («Усі») замість топіка 🔵 Termojet. Причина: роутинг через окрему env `TELEGRAM_CALLS_THREAD_ID` (реліквія, коли колтрекінг стояв на tjheatpump) — її хибне/порожнє значення давало `NaN` у `message_thread_id` → Telegram кидав повідомлення в General.
- Прибрано залежність від `TELEGRAM_CALLS_THREAD_ID`; дзвінки пішли дефолтним `notifyLead`/`TELEGRAM_THREAD_ID` (=169). **Env `TELEGRAM_CALLS_THREAD_ID` тепер deprecated** (кодом не читається).

### ✨ fix: підпис і топік дзвінка за доменом — termojet vs tjheatpump (коміт `a8e145a`)
- **Ключове:** ОДИН Binotel-вебхук `backend/routes/binotel.js` обслуговує **обидва** сайти (один PUSH URL). Заголовок був захардкоджений «Termojet» → дзвінки з `tjheatpump.com.ua` мали чужий підпис. А фікс вище (`848f2a9`) слав **усі** дзвінки в топік Termojet (169) → tjheatpump-дзвінки йшли б не в свій топік.
- Додано хелпер `siteFrom(callTrackingData.fullUrl)` → підпис + топік за доменом:
  - `tjheatpump.com.ua` → «🟢/🔴 **Tjheatpump** — вхідний дзвінок» + топік 🟠 TJ Heat Pumps (`TELEGRAM_TJ_THREAD_ID`, дефолт-константа `168`)
  - `termojet.com.ua` / невідомо → «Termojet» + дефолтний топік 🔵 (`TELEGRAM_THREAD_ID`=169)
- Застосовано до 3 місць: миттєвий пінг (`receivedTheCall`), багата картка (`apiCallCompleted`), `source` CRM-ліда.
- ⚠️ Пінг «дзвонить зараз» знає сайт лише якщо Binotel передає `fullUrl` у цій ранній події; інакше дефолт «Termojet» (багата картка за 1-2с приходить із правильним підписом). Точну прив'язку пінгу можна зробити за віртуальним номером кожного сайту (окреме завдання).
- Замовлення/консультації tjheatpump **не** через цей вебхук — їх обробляє окремий PHP tjheatpump (уже мітка 🟠 TJ Heat Pumps).

## Сесія 2026-07-10 … 07-16 — Відгуки: окрема сторінка + моб-скрол «Схожі товари» + стиснення фото

> Деплой Hetzner: `git pull && docker compose up -d --build`. Усе задеплоєно на прод і перевірено (curl 200 / білд / ESLint). Кожен деплой підтверджувався окремо.

### ✨ feat: окрема сторінка відгуків `/reviews` (коміт `86b088a`)
- **Проблема:** на головній секція відгуків має ліміт 6 → після схвалення нових старі «зникали». Тепер є окрема сторінка `/reviews`, що показує **всі** схвалені відгуки з API + базові з `src/data/reviews.js`.
- **Навігація:** пункт «Відгуки» у дропдауні «Про Termojet» (десктоп+мобайл), у футері («Інформація»), і кнопка **«Дивитися більше →»** біля «Залишити відгук» на головній.
- **Рефактор без дублювання:** винесено `ReviewCard.jsx`, `ReviewFormModal.jsx` та масив базових відгуків `data/reviews.js` у спільні модулі (головна + `/reviews` беруть з одного джерела).
- i18n 5 мов (меню/кнопка/заголовки), `/reviews` у `sitemap.xml`, окремий маршрут `/en/reviews` + `LLink` (мовно-залежна навігація).

### 🩹 fix: «Схожі товари» не скролились вбік на мобільному (коміт `27e8fa6`)
- Інлайн `gridTemplateColumns: repeat(4,1fr)` на секції перебивав адаптивні класи → на мобільному 4 затиснуті колонки без скролу. Замінено на flex-стрічку зі снапом (патерн `cat-strip`, картки ~68% + peek, edge-to-edge через `-mx-4 px-4`); на `md+` — сітка 4 колонки як було.

### ✨ feat: клієнтське стиснення фото відгуку (коміт `ced41c3`)
- **Причина:** клієнт не зміг лишити відгук — «Помилка зʼєднання». Діагностика по `termojet.access.log`: запит із важким фото **не долітав до сервера** (обрив мобільної мережі). nginx (50M) / multer (8M) не винні; серверна відправка робоча (у логах 201 на іншій спробі).
- `src/utils/compressImage.js` — стиснення в браузері (canvas, макс 1600px, JPEG q0.82) при виборі фото у `ReviewFormModal.pickPhoto`. Типове фото 3-8МБ → ~1МБ → надійний аплоад навіть на слабкій мережі. Безпечний фолбек на оригінал при помилці декодування. Логіка сервера не змінена.

### 📞 Binotel ↔ GA4 — консультація (без змін у коді)
- Уточнено: колтрекінг-токен + GA4 ID (`G-5X2YSXPBLT`) вводяться в **кабінеті Binotel** (Інтеграції → Google Analytics 4), а не в коді сайту. Щоб дзвінки привʼязувались до сесій/джерел, на сайт треба скрипт підміни номерів Binotel Call Tracking (окреме завдання, ще не робили).

### ⚠️ ГОЧА (записано в памʼять)
- **API вимкнено в локальному dev:** `AppContext` — `API = (VITE_BASE_URL !== '/') ? null : '/api'`. Dev працює з базою `/termojet-website/` → `API=null`, будь-яка форма показує «Відправка недоступна». **Не баг** — відправку тестувати лише на проді.
- **Лог nginx termojet — окремий файл:** `/var/log/nginx/termojet.access.log` та `termojet.error.log` (НЕ дефолтний `access.log`).

## Сесія 2026-07-13 — Binotel: підміна номерів у динамічному моб-меню

> Деплой Hetzner: `git pull && docker compose up -d --build`. Перевірено наживо на iOS.

### 🩹 fix: Binotel не підміняв номер у моб. боковому меню (коміти `44d49f3`, `864fc5d`)
- **Проблема (лист Binotel):** віджет колтрекінгу вантажиться через GTM і сканує верстку ОДИН раз при завантаженні. Номери в шапці/футері підміняються ок (рендеряться раз), але моб. бокове меню з шапки створюється **динамічно** при відкритті → первинний скан його не бачить, номер не підмінявся.
- **Рішення (як просив Binotel):** `src/utils/binotel.js` — `binotelRescan()` гукає `window.BinotelCallTracking[516700].replacePhoneNumbersOnDynamicContent()` (з ретраями, бо віджет вантажиться асинхронно через GTM). У `Navbar.jsx` виклик **при відкритті моб-меню** (`useEffect([menuOpen])`).
- **🩹 hotfix (`864fc5d`):** первинно додав ще й rescan на зміні маршруту — але виклик Binotel-функції **поза жестом користувача** тригерив iOS Safari попап «Автоматичні виклики заблоковано». Прибрав; лишився rescan лише при відкритті меню (в контексті тапу по бургеру — Safari не блокує). Номери на решті сторінок підміняє первинний скан Binotel.

## Сесія 2026-07-10 (веч.) — функціонал: замовлення, e-mail клієнту, каталог, portfolio, моб-UX

> Деплой Hetzner: `git pull && docker compose up -d --build`. Усе задеплоєно й перевірено наживо (curl/API/бандл). БД-міграції запускаються на старті контейнера (ідемпотентні).

### 🩹 fix: некоректна сума/кількість замовлення в Telegram (коміт `1ed54af`)
- Кошик фронта кладе кількість у `items[].quantity`, а бекенд `orders.js` читав лише `item.qty` → serverTotal рахувався по 1 шт (410 замість 820) і `× N` не виводилось у ТГ/CRM. Тепер `itemQty()` читає `qty ?? quantity`; рядки товарів завжди показують `× N`.

### ✨ feat: лист-підтвердження замовлення клієнту через Resend (коміти `963c214`, `eab9523`)
- `backend/email.js` — транзакційний лист (Resend REST, fire-and-forget, брендований оранжевий HTML: №, товари × N, сума, доставка, оплата, контакти магазину з `settings`, `reply_to` на пошту магазину). Без `RESEND_API_KEY` тихо вимкнено.
- **Домен termojet.com.ua верифіковано в Resend** (DKIM+SPF+MX у UkrNames DNS); ключ у Hetzner `.env`. Безкоштовний тариф (100/день).
- 🩹 Бонус: `backend/currency.js` — серверна конвертація EUR→грн за курсом НБУ (+2.2%, кеш 1 год). Раніше `serverTotal` для EUR-товарів був числом у євро (латентний баг ТГ/CRM).

### 🧹 fix: залишок дублювання «(Копировать)» на товарі (коміти `8c07952`, `ac1333c`)
- Насос APE 25/60/180 (`wp_20495`) мав `(Копировать)/(Copy)/(Kopia)/(Kopie)/(Copie)` у назві 5 мов + слаг `-kopyrovat` (потрапляло в URL). Скрипт `apply-fix-kopyrovat.js` почистив назву+слаг у БД + оновив перехресні лінки в описах 12 товарів. Синхронізовано `seed-products.json`, `sitemap.xml`, `seo-*-data.json`. Старі URL (`/product/…` і `/catalog/…-kopyrovat`) → **301** на чистий.

### ✨ feat: обкладинка головної сторінки каталогу (коміт `de35bb3`)
- `public/banner-catalog.webp` (68КБ, шоурум Termojet) як фон hero-хедера на `/catalog` без обраної категорії — той самий прийом, що й категорійні банери.

### 🩹 fix + ✨ feat: /portfolio — зникнення проектів + керування в адмінці (коміти `8672482`, `7e1ff29`)
- **Баг:** таблиця `portfolio` у БД спорожніла, а фолбеку не було → сторінка порожня. Фікс: `AppContext` вантажить статичні `data/portfolio.js` (15 проектів) коли API віддає `[]`.
- **БД-керування:** `backend/seed-portfolio.json` (15 проектів) + `seedPortfolio()` сіє лише в порожню таблицю (**самовідновлення**, як `seedBlog`). Додано колонки `type`/`links` (схема+міграція+роут), поле «Тип об'єкту» в адмінці. links/i18n через COALESCE — не затираються при редагуванні.

### 🩹 fix: подвійний тап на мобільному (коміт `c03198f`)
- Категорії/сторінки відкривались з 2 тапів: hover-ефекти (`onMouseEnter`) вмикались на 1-й тап (тач-браузер трактує як наведення). `HomePage` CategoryCard розкривав підкатегорії; Navbar моб-меню міняло колір. Фікс: `utils/canHover.js` (`matchMedia('(hover: hover)')`) — hover-стан лише на десктопі; у моб-меню хендлери прибрано. CSS `:hover` і Tailwind v4 УЖЕ gated — винні були лише JS-хендлери.
- 🩹 Бонус: `MobileBottomNav` лічильник кошика читав `i.qty` (кошик має `quantity`) → NaN; фікс. **Правило: кошик = `quantity`, не `qty`.**

## Сесія 2026-07-10 — фікси схеми/canonical + ре-аудит (81/B)

> Ре-аудит squirrelscan після відгуків клієнтів: **score 80→81, grade B, помилок 5→0**. Прогрес від старту: 73→81. Core SEO **99**, Content **93**, Structured Data/Local SEO/i18n/Images/Mobile/Social **100**, E-E-A-T 61→**68** (відгуки+FAQ). Деталі — `docs/SEO-PLAN.md`.

### 🩹 fix: стрей-текст `/>` угорі сайту (коміт `8de5f09`)
- Баг ін'єкту canonical (з часів EN-пілоту, на **всіх** сторінках): regex матчив тег лише до закривної лапки → лишався стрей ` />`, який парсер виносив у видиме тіло (**`/>` угорі сторінки**), а перший hreflang `uk` «проковтувався» в незакритий canonical. Тепер `replace` бере весь тег `<link canonical … />` і чисто відтворює canonical+hreflang. Перевірено скріншотом.

### 🩹 fix: Product-schema без offers (коміт `2bf6125`)
- Валідатор вимагає `Product.offers` — 3 товари без ціни (avtomatyka-модулі, ng-81 mega, `price=0`) віддавали невалідний Product (5 сторінок, `failed=5` в аудиті). Тепер товар без ціни → лише `BreadcrumbList`+`Organization` (без offers rich-result однаково неможливий). Structured Data знову 100, `failed=0`.

### ⭐ Відгуки клієнтів (сторінка `/reviews` — робота колеги)
- 5 реальних відгуків (усі 5★) на проді; підняли **E-E-A-T 61→68**. ⚠️ Це відгуки про **компанію/сервіс**, не про товари → Google **НЕ показує зірки** в видачі (політика self-serving-reviews). Для ⭐ біля товарів потрібні відгуки на конкретні товари. Фейкові product-рейтинги НЕ додаємо.

### ⚠️ ГОЧА: ре-імпорт товарів стирає дедуп `seo_title`
- Колега пере-імпортував товари (1С/WP) → базовий UA `seo_title` колекторів **перезаписався**, дедуп (200)/(240) зник (аудит показав 5 дублів знову). Відновлено повторним прогоном `scripts/seo-fix-titles.cjs`. **FAQ і EN-скорочення (i18n) вижили — а UA-`seo_title` ні.** → Скрипт треба ганяти **після кожного ре-імпорту товарів** (див. DEPLOY.md).

## Сесія 2026-07-09 — SEO-доробки: structured data, FAQ, дедуп title, видимі описи категорій

> Деплой Hetzner: `git pull && docker compose up -d --build`. Усе задеплоєно й перевірено наживо (curl JSON-LD + бандл). Глибокий ре-аудит: score **73→77**, усі Критичні+Високі пункти підрядника закрито. Повний звіт — `docs/SEO-звіт-2026-07-09.pdf`, деталі — `docs/SEO-PLAN.md`.

### 🧩 Структуровані дані в сирий HTML (коміт `d090f79`)
- `backend/server.js`: `ORG_SCHEMA` (Organization на всіх сторінках); `buildProductJsonLd` — **Product** (offers/price/sku/images з БД) + **BreadcrumbList** на товарах; **BreadcrumbList** на категоріях; **Article** на блозі. Escape `<`→`<`, schema опційна (`try/catch`). До цього schema була лише клієнтська (helmet) — невидима не-JS/LLM-краулерам.
- ⚠️ `src/components/SEO.jsx` теж емітить ці schema клієнтом → після JS-рендеру дубль (безпечно, Google дедуплікує).

### 🏷️ Категорійні описи + дедуп/скорочення title (коміт `d090f79`)
- **`CATEGORY_META`** (server.js): meta-описи 15 категорій подовжено до 120–155 симв. (UA+EN).
- **`scripts/seo-fix-titles.cjs`** (ідемпотентний, ганяється на прод-БД у контейнері): дедуп **11 пар** title (колектори к32/к42/к52 (200)/(240) + НГ-52.150 Л, UA+EN) + скорочення **52** EN seo_title >60. Результат: EN>60 61→0, UA-дубль 5→0, EN-дубль 6→0.

### ❓ FAQ + FAQPage schema (коміт `ef6aca5`)
- **21 реальний Q&A** (8 компанійних + 13 технічних: підбір насосних груп/колекторів, гідрострілка/КГС, сепаратори — шлам на зворотці/повітря на подачі/магнітні домішки, балансир, BOX/Mega, сумісність, насоси APE/APM/APM-F, титановий анод) у таблиці `faqs` через **`scripts/seed-faqs.cjs`** (UA+EN, upsert за питанням, ідемпотентний).
- `buildFaqSchema` → **FAQPage JSON-LD** на `/faq` + `/en/faq`. `FaqPage.jsx` рендерить з таблиці (був фолбек 8 хардкод). Розблоковує FAQ-сніпети в Google.
- Відгуки (`reviews`) лишились порожні — НЕ фабрикувати, заводити реальні через адмінку (Product-schema готова видати зірки ⭐).

### 📁 Видимі описи категорій (коміт `457c89f`)
- `src/data/categories.js`: `desc.uk/en` збагачено до rich-тексту (pl/fr/de збережено), синхронно з `CATEGORY_META`.
- `src/pages/CatalogPage.jsx`: прибрано бляклий підзаголовок у шапці, додано **читабельний блок-абзац під шапкою** → UX + реальний on-page body-текст (лікує «thin content»).

### 🟢 Фаза 6 завершена (a11y/комплаєнс/безпека)
- `<main>`+skip-link (`App.jsx:75,79`), PrivacyPage+футер-лінк, security-заголовки (`server.js:42-45`, CSP присутній). CSP `unsafe-inline` свідомо лишено (GTM+framer-motion, non-SEO).

### ⚠️ На замітку
- **DB-скрипти** (`seo-fix-titles.cjs`, `seed-faqs.cjs`) міняють прод-БД у volume (не в seed) → після кожної переінсталяції з seed ганяти на сервері: `docker compose cp scripts/<x>.cjs app:/tmp/<x>.cjs && docker compose exec app node /tmp/<x>.cjs /app/backend/data/termojet.db --apply`. Бекапи: `data/termojet.db.bak-20260709-seo`, `-faq`.
- Артефакти сирий-vs-рендер (no-main/thin-content/orphan/no-privacy у squirrel) — НЕ реальні: тіло рендерить React; лікуються лише повним prerender (відкладено, лише якщо LLM стане ціллю №1).

## Сесія 2026-07-08/09 — SEO-оверхол: серверні метадані, EN-мультимова, продуктивність

> Деплой Hetzner: `ssh hetzner` → `/home/tankoseva/termojet-website` → `git pull && docker compose up -d --build`. Усе нижче задеплоєно й перевірено наживо (curl + рендер через headless Chrome). Детальний план і журнал по фазах — `docs/SEO-PLAN.md`.

**Контекст:** сайт — CSR React SPA; краулер без JS бачив оболонку `index.html` з метаданими на головну (canonical→головна, generic/дубль title+description). Аудит (PDF Screaming Frog + squirrelscan) показав це як головну проблему. Обрано **серверний ін'єкт (A+)**, а не prerender/SSR (спайк довів, що DOM-snapshot prerender конфліктує з гідрацією React 19 / react-helmet).

### 📞 Binotel: дзвінки в окремий ТГ-топік (коміт `b093f9a`)
- Картки дзвінків тепер ідуть у forum-топік **168 «TJ Heat Pumps»** (колтрекінг стоїть на tjheatpump.com.ua), окремо від заявок форм termojet (топік 169 🔵 Termojet). Через наявний `notifyLead(text, threadId)`; `backend/telegram.js` не чіпали, `binotel.js` передає `CALLS_THREAD_ID`. Env: `TELEGRAM_CALLS_THREAD_ID=168` (серверний `.env`). Порожній `CALLS_THREAD_ID` → фолбек у топік форм.

### 🔎 A+ серверний ін'єкт метаданих (коміти `2317a85`, `e13e675`, `100a216`)
- `backend/server.js` per-URL підставляє в сирий HTML із БД: `<title>` (seo_title, ≤60), self-`canonical`, `<meta name=description>` (meta_description), og; у `<noscript>` — сторінковий H1 + опис. Для **товарів** (`/catalog/:cat/:slug`), **категорій** (`/catalog/:cat`, мапа `CATEGORY_META`), **блогу** (`/blog/:slug`), **статичних** (`STATIC_META`). Дані готові в БД (326/331 товарів мають seo_title+meta_description).
- Закрито: title>60 (269→0), дубль-опис (361→~0), og:url≠canonical (331→0), title-too-short на категоріях (адаптивний падінг ≥30 симв.). Core SEO 90→99, Social 77→100.
- Дедуп 9 seo_title товарів-варіантів (колектори (200)/(240), НГ-52.150 Л) — **прямо в продовій БД** (не в seed).
- Фікс подвоєння суфікса «| Termojet» у `src/components/SEO.jsx`.

### 🌍 EN-пілот мультимовного SEO (коміти `f35e69a`, `93f824d`)
- **Контент каталогу вже перекладений** у БД (`products.i18n` JSON: en/pl/fr/de з name/description/seo_title/meta_description — 331/331; блог 23 en), але був невидимий пошуку (один URL, бот бачив UA). Рішення: **URL-мова `/en`**.
- Фронтенд: роутинг `/en/*` (дзеркало публічних роутів під `PublicLayout`), мова з URL (`LangSync`/`useLangFromUrl`), lang-aware посилання (`LLink` + `localizedPath` з guard зовнішніх URL), `localizeHtml` (переписує href у HTML-контенті описів/блогу), перемикач мови міняє URL. UK без префікса — без змін.
- Бекенд: `pickLang(row,lang)` з `i18n` → EN-ін'єкт для /en товарів/категорій/блогу/статичних (`STATIC_META_EN`); **hreflang** uk↔en+x-default на всіх; middleware редіректу 301-ить лише legacy (чинні /en проходять); `express.static index:false`.
- Sitemap переписано (`scripts/gen-sitemap.cjs`): 768 URL (UA+EN) з `xhtml:link hreflang` + `lastmod`; стійкий до відсутності БД у Docker-builder.

### ⚡ Продуктивність — Фаза 5 (коміт `169b7a3` + серверний webp)
- **JS −62%:** `src/context/AppContext.jsx` більше не імпортує статично 2МБ `data/products.js` (+blog/portfolio/files) — на сервері дані з `/api`, у GitHub-Pages-режимі динамічний `import()`. `vite.config.js` `manualChunks`: vendor-react/icons/motion/3d. Чанк AppContext 2208→43КБ; початковий JS ~3.6→1.4МБ. Рендер каталогу/товару/блогу/EN перевірено.
- **Зображення webp −48%** (серверно, не в репо): на Hetzner встановлено `cwebp`, згенеровано 364 `.webp` у `/var/www/termojet-wp/wp-content/uploads` (адитивно); nginx `/etc/nginx/conf.d/webp.conf` (`map $http_accept→$webp_suffix`) + `/wp-content/` `try_files $uri$webp_suffix $uri @wp_old` + `Vary: Accept`. Живо: 308КБ jpeg→161КБ webp, фолбек jpeg.

### 📄 Документація
- `docs/SEO-PLAN.md` — план по фазах + журнал виконання + before/after.
- `docs/GSC-instrukciya.md` (+ PDF) — інструкція для відповідальної особи: сабмітнути sitemap у Google Search Console, запросити індексацію /en, моніторинг.

### ⚠️ На замітку
- **Білд Hetzner МУСИТЬ бути `VITE_BASE_URL=/`** (є в Dockerfile `build:prod`); дефолт у `vite.config.js` = `/termojet-website/` (GitHub Pages). Локальний `npm run build` без `VITE_BASE_URL=/` дає зламані асети.
- Sitemap оновлюється локальним `node scripts/gen-sitemap.cjs` + коміт (у Docker-builder БД нема).
- Не зроблено (опційно): числові слаги ~20 rozprodazh-товарів (301+колізії), Фаза 3 контент (описи категорій, авторство блогу), pl/de/fr (механізм готовий).

## Сесія 2026-07-01 — Binotel call-tracking → лід у CRM + Telegram

> Деплой Hetzner: `ssh hetzner` → `/home/tankoseva/termojet-website` → `git pull && docker compose up -d --build`. Задеплоєно й перевірено наживо (реальні дзвінки).

### 📞 Вебхук вхідних дзвінків Binotel (коміти `1debfa2`, `0386ab9`)
- Новий роут **`POST /api/webhooks/binotel`** (`backend/routes/binotel.js`), зареєстрований у `server.js` з окремим rate-limit (120/хв, в обхід `writeLimiter`). Реюзить `notifyLead` (Telegram) + `notifyCRM` (CRM) — той самий бот/група/CRM, що й ліди з форм.
- **Binotel API PUSH** шле 4 події на дзвінок (поле `requestType`): `receivedTheCall` → `answeredTheCall` → `hangupTheCall` (мінімальний leg-hangup, БЕЗ `companyID`) → **`apiCallCompleted`** (фінал з `callDetails` + `callTrackingData`). Маршрутизація за `requestType`:
  - `receivedTheCall` → 1 миттєвий Telegram-пінг «дзвонить зараз» (швидка реакція);
  - `answeredTheCall` + flat `hangupTheCall` → ігноруються (без дублів);
  - `apiCallCompleted` → **лід у CRM + багата картка**. `billsec>0` = прийнятий; інакше — ПРОПУЩЕНИЙ (+гучний Telegram, у CRM автоматично стає HIGH-задачею «Дзвінок клієнту»); `callType=1` (вихідні) — ігноруються.
- **Багата картка** (Telegram + `message` CRM-ліда) з `callDetails.callTrackingData`: клієнт (`customerData.name`, якщо розпізнаний), сторінка дзвінка (`fullUrl`), час на сайті до дзвінка, перший візит, `utm_*`, гео (місто/область/країна), IP, GA client/tracking ID, `binotel_id`, посилання на запис розмови, хто відповів (для прийнятих). Номери `0XX…` → `+380XX…`.
- **Безпека** (Binotel запити не підписує): IP-allowlist серверів Binotel + звірка `companyID`. Env — `BINOTEL_*` (див. `DEPLOY.md` / `.env.example`), значення лише в серверному `.env`.
- Покрито тестом на реальних payload'ах (прийнятий + пропущений, вся послідовність подій).

### 🔧 Fix: `trust proxy` — реальний IP клієнта за nginx у Docker (коміт `d50a459`)
- `server.js`: `trust proxy` `'loopback'` → **`['loopback','uniquelocal']`**. Контейнер за nginx у Docker бачить peer як docker-gateway (`172.x`), не loopback, тож із `'loopback'` Express ігнорував `X-Forwarded-For` і брав IP шлюзу. Наслідок: усі rate-limiter'и рахувались на один IP (`172.21.0.1`), а IP-allowlist вебхука Binotel відхиляв би ВСІ реальні дзвінки (403). Тепер `req.ip` = реальний IP клієнта (підробити ззовні не можна — публічний peer недовірений).

## Сесія 2026-06-24 — Маркетинг-аналітика: GTM, GA4 Ecommerce, UTM, Google Shopping

> Деплой Hetzner: `ssh hetzner` → `/home/tankoseva/termojet-website` → `git pull && docker compose up -d --build`. Усе нижче задеплоєно й перевірено наживо.

### 📊 Google Tag Manager + GA4 Ecommerce (коміт `12a7f3b`)
- **GTM** — контейнер `GTM-P9DW9P6D` у `index.html` (head-сніпет + body `<noscript>`), замінено старий плейсхолдер `gtag` (`G-XXXXXXXXXX`). Перевірено наживо: `curl … | grep GTM` повертає `GTM-P9DW9P6D`. ⚠️ Самі GA4-теги налаштовуються в інтерфейсі GTM (dataLayer-події вже йдуть, GTM має форвардити їх у GA4).
- **GA4 ecommerce-події → `dataLayer`** (`src/utils/analytics.js`, формат за ТЗ: `dataLayer.push({ecommerce:null})` → `push({event, ecommerce:{items:[…]}})`):
  - `view_item` — `ProductDetailPage` (mount);
  - `add_to_cart` / `remove_from_cart` — централізовано в `AppContext.addToCart` / `removeFromCart`;
  - `begin_checkout` — `CartPage` (mount, якщо є товари);
  - `purchase` — `CartPage` після `placeOrder` (`transaction_id=order.id`, `affiliation='cart'`, `value`/`tax`/`shipping`/`currency=UAH`).
  - Поля item: `item_name`, `item_id` (sku||id), `price`, `item_brand` `Termojet`, `item_category` (назва з `categories.js`), `item_category2` (subcategory), `quantity`.

### 🏷️ UTM — таблиця лідів в адмінці
- Прийом/передача UTM формами вже працювали (`utm.js` → sessionStorage → `utm` JSON у orders/consultations/dealers + у CRM/Telegram). Додано **адмін-сторінку `/admin/utm`** (`src/pages/admin/AdminUTM.jsx`) — таблиця всіх лідів за UTM (source/medium/campaign/term/content) з orders+consultations+dealers, пошук, фільтр «тільки з UTM», **експорт CSV**. Пункт меню «UTM-джерела» в `src/data/adminMenu.js` (⚠️ під `.gitignore data/` → коміт через `git add -f`). Агрегати UTM вже були в `/admin/analytics`.

### 🛒 Google Shopping / Merchant Center фіди (коміти `af4f7b2`, `d350b58`, `9f7a86e`, `ca52b1c`)
- Динамічний `backend/routes/merchant.js` (фабрика `feed(lang)`), 5 мовних роутів у `server.js` **ДО** SPA-статики:
  - `/google-merchant.xml` (uk), `-en.xml`, `-pl.xml`, `-de.xml`, `-fr.xml`.
- ~326 видимих товарів з БД; **ціни в UAH** (товари в EUR → за курсом НБУ +2.2%, кеш 1 год — як `src/utils/currency.js`).
- Назви/описи/`product_type` беруться з колонки `i18n` за мовою; опис чиститься від префікса `Опис/Description/Opis/Beschreibung`.
- **`google_product_category`** — числові ID Google-таксономії по `category_slug` (133 Plumbing, 2466 Valves, 500096 Pumps, 1519 HVAC Controls, 1897 Thermostats, 632 Hardware), однакові для всіх мов.
- Маркетолог підключає потрібний мовний фід у Merchant Center (scheduled fetch, щоденно).

### 🖼️ Лого по мовах
- UA — `logo-orange.png` / `logo-white.png` («обладнання для котелень»); усі інші мови (EN/PL/DE/FR) — `logo-en-orange.png` (навбар) / `logo-en-white.png` (футер, білий силует згенеровано з помаранчевого). Свап за `lang` у `Navbar` + `Footer`.

### Дрібні фікси
- **Навбар** (коміт `e53cf99`): відступ кошика — бейдж кількості більше не наїжджає на «Стати партнером».
- **Seed** (коміт `ae6376a`): синхронізовано UA-назви товарів з новим форматом (тип → Termojet → деталі → код) у seed-файлі.

### 📄 Документ для маркетолога
- `MARKETING-TRACKING-TZ.md` (+ `.docx`, копія в `~/Downloads/Termojet-Marketing-TZ.docx`) — що зроблено (GTM, GA4-події, UTM, Shopping-фіди з усіма 5 URL + GPC) і що зробити (GA4-ресурс, теги в GTM, конверсії, аудиторії, Merchant Center, єдиний UTM-стандарт) + чеклист + Додаток А з прикладами `dataLayer`.

## Сесія 2026-06-17 / 19 — Повний i18n-ретрофіт (5 мов) + доробки

### 🌐 Переклад контенту й даних на EN/PL/FR/DE
- **UI-ретрофіт** (`9dc7ca2`): EN/PL/FR/DE проведено крізь `t()` по всьому chrome й сторінках.
- **Дата-шар** (`278609c`): перекладено контент home/about/categories для всіх 5 мов.
- **Backend i18n-шар** (`11e456f`): переклади DB-контенту зберігаються в колонці `i18n` (JSON `{en,pl,de,fr}`), `backend/routes/_i18n.js` `withI18n()` флетенить у `name_en` тощо; фронт читає за мовою.
- **Картки/PDP** (`0a42f6c`, `de5eef3`): перекладені specs + описи карток; локалізовані бейджі характеристик + валюта за локаллю.
- **Сайдбар-фільтри каталогу** (`bd7c6df`): перекладено лейбли опцій фільтрів.
- **Контакти** (`f5e3409`): локалізована адреса + графік роботи (`Footer`, `ContactPage`).
- **Портфоліо** (`d1a5dc5`, `77e3ad3`): кейси проектів перекладено EN/PL/FR/DE; словник `PORTFOLIO_I18N` (force-add — `src/data` під gitignore).

### Інше
- **About** (`b7dc2e7`): секція юридичних реквізитів (5 мов); фікс лайтбокса (`95cf98f`) — `mediaSrc`, щоб вантажились зовнішні WP-фото.
- **SEO** (`121826e`): per-product OG image/title для прев'ю посилань (Telegram/Viber/FB).
- **Товари** (`ff33c34`): APM-F 40/8, 50/8, 50/15, 50/18 — додано потужність, струм, масу й габарити з каталогу виробника.
- **Банери** (`f477886`, `51fa167`): банери-шапки на Блог/Проєкти/Контакти; перецентровано кроп банера блогу + висота шапки 400px.
- **Фікси**: прибрано дубльовану таблицю характеристик з опису (`030eb76`); товари іноді невидимі при переході в категорію (`abb1092`); оновлено фото поворотних сепараторів TJV7 (`e5f5551`).
- **Кеш** (`765fb7e`): long-cache статичних медіа — фото товарів перестали блимати.

## Сесія 2026-06-15 / 16 — Нова Пошта (Етап 1), прибрано готівку, навчання, звірка з 1С

### 📦 Нова Пошта — Етап 1 (коміт `82e5d3c`)
- Вибір **міста/відділення** в кошику. Проксі `backend/routes/novaposhta.js` (cities/warehouses), ключ **лише з env** `NOVA_POSHTA_API_KEY`, кеш відділень 6 год, rate-limit 60/хв (`npLimiter` у `server.js`). Якщо ключа немає — `503` + **graceful fallback** на поле адреси (checkout не ламається).
- НП-дані (`np_*` колонки) йдуть у замовлення → Telegram (`notifyLead`) + CRM (`notifyCRM`) + адмінку. Сума замовлення перераховується на сервері. **Етап 2 (друк ТТН) — не робили.**

### 💳 Прибрано «Готівка при отриманні» (коміт `65c5e44`)
- Видалено готівковий спосіб оплати — з кошика й з блоку оплати на сторінці товару. Дефолт — «Безготівковий розрахунок (рахунок)».

### 🎓 Навчання / семінари (обидва сайти) (коміти `1e57e51`, `9fa66a1`, `90bd8c7`, `ee6febf`)
- Сторінка **`/navchannya`** + **попап семінарів** (раз на користувача) + **стаття в блозі**. CTA-кнопка «Зареєструватися на семінар» (форму прибрано) → зовнішня реєстрація.
- Інфо: семінари **безкоштовні**, в **офісі Termojet у Києві**; слухачі отримують каталоги й маркетингові матеріали, можуть задати будь-які питання.
- Прямий лінк **`?seminar`** відкриває попап одразу (натурально обходить fastcgi-кеш на tjheatpump).
- Фон попапа — зображення suntide + напівпрозорий оверлей для читабельності.

### 🔧 Звірка товарів з 1С + 3D
- Артикули/назви за звіркою з 1С: 25 товарів (`8eeebd5`); GrandLift станції GL2075/6075/120220/150370 (`ddb39f7`); WiFi/One/MEGA/КРН, аноди, сепаратори (`14a42b2`); підставка тепл. насоса 150→260 кг + ціна 7890 грн (`a8188bb`).
- `specs.Артикул` приведено до значення SKU — **SKU джерело істини** (`ad5df4e`).
- **3D-модель** колекторів з нерж. сталі з витратомірами TJ-W-02..15 (`ffa3cf9`).

## Сесія 2026-06-11 / 14 — Редизайн картки товару + SEO-описи всього каталогу

### 🎨 Редизайн сторінки товару + мобільні фікси
- **Редизайн PDP** (Variant A) + карусель категорій з індикатором прокрутки (`94a70f0`, `d22d455`).
- 3D-блок (STEP) на десктопі — у ліву колонку під «Категорію» (`68683cc`); галерея не перемикається при обертанні 3D (`3f5670c`, `372cb18`).
- Мобільні: прибрано горизонтальний overflow/overscroll на iOS Safari (`c07ded6`, `75ac53c`); прибрано «тап двічі» — `:hover` під `@media (hover: hover)` (`54fe22b`); фото в картці не обрізається, довгі характеристики переносяться (`ea16ccc`).
- 3D-в'ювер на проді — фікс CSP (`wasm-unsafe-eval`) + прибрано дубль ключа specs (`cf9fe86`).

### 📝 SEO-описи — масова кампанія по всьому каталогу (331 товар)
- HTML-описи з перелінковками; дата-файл описів у `backend/scripts` (доступний у Docker-контейнері) (`b771a49`, `77ab138`).
- По категоріях: перші 4 категорії 89 товарів (`06db3d4`); termojet-mega (41) + termojet-box (6) (`ab4c0f5`); насоси (44) + `seo_title`/`meta` для всіх 180 (`7670e91`); клапани (24) — 204 товари (`e855b2a`); сепаратори (27) (`5804465`); тепла підлога (49) — 280 (`a5f41a5`); додаткове обладнання (11) — 291 (`722da03`); зональне керування (15) — 306 (`fd2ba3e`); автоматика (4) — 310 (`dd33e5d`); розпродаж (18) + балансувальні клапани (3) — **разом 331 товар** (`c4c9bd9`).
- Фактологічні фікси за каталогом: НГ-46 насос APE 25-60 (`8b24756`); сумісні групи насосів (`1bc0e6f`); MU-10B/40А — клапан TMV (`5c83ef7`); WT-102/TJ-03-RF (`425549b`); лінк на привід-контролер A-413 у групах НГ-48А/52А/38А (`10c0129`).
- PDP/каталог: стрипати HTML-теги з описів (`1d0c9cb`, `0dfd38e`); SEO-опис на всю ширину секції (`7dc55b9`).

## Сесія 2026-06-11 — Ліди з сайту → Termojet CRM

### 🔗 Пересилання заявок у CRM з трекінгом джерела
- Форми **Замовлення**, **Консультація**, **Дилер** тепер, окрім запису в БД і Telegram,
  автоматично пересилають лід у **CRM** (`heat-pump-registration`) —
  `POST https://crm.tjheatpump.com.ua/api/leads`, **сервер-до-сервера, fire-and-forget**.
- **Новий файл** `backend/crm.js` — транспорт `notifyCRM` (ENV `CRM_LEADS_URL` / `CRM_LEAD_SECRET`,
  таймаут 8 с, ніколи не кидає виняток). Викликається в `routes/orders.js|consultations.js|dealers.js`
  поруч із наявним `notifyLead`.
- **Видно, звідки лід** — поле `source` у CRM:
  - `termojet.com.ua · Магазин · <utm_source>` (замовлення, `type=order`)
  - `termojet.com.ua · Консультація · <utm_source>` (`type=consultation`)
  - `termojet.com.ua · Дилер · <utm_source>` (`type=partnership`)
  - у `message` — деталі: склад кошика / місто / компанія / повний UTM.
  - UTM сайт уже захоплював (`src/utils/utm.js` → sessionStorage → тіло POST).
- **Чому сервер-до-сервера:** CORS CRM не містить termojet.com.ua (браузерний POST блокувався б);
  спрацьовує навіть якщо клієнт закрив вкладку; не світить URL CRM у фронті.
- **Нічого не ламається:** якщо CRM недоступна — заявка зберігається в БД сайту і йде в Telegram.
- **На кожен лід** CRM авто-створює HIGH-задачу-дзвінок адміну (стандартна поведінка CRM).
- Підписку на email у CRM **не** шлемо (це не лід).
- ⚠️ Рейт-ліміт CRM `/api/leads` = 5/хв на IP — усі ліди сайту з одного IP; лишено як є (деталі в `DEPLOY.md`).
- Перевірено живим тестом сайт→CRM (source відобразився коректно). Коміт `7285961`.

## Сесія 2026-06-10 — Переїзд на домен termojet.com.ua

### Запуск на постійний домен (HTTPS)
- Сайт переведено зі старого WordPress на новий React-сайт на Hetzner: **https://termojet.com.ua**.
- **DNS:** в ukrnames (#352670) A-записи `@` і `www` → `49.13.154.30` (було Hvosting `91.225.138.216`).
- **SSL:** Let's Encrypt на `termojet.com.ua` + `www`. Видача через DNS-01 (домен ще був на старому
  хостингу) тимчасовим хуком `/root/acme-dns-hook.sh` + TXT `_acme-challenge` в ukrnames. Після
  переїзду автопродовження переключено на **автоматичне** (nginx/HTTP-01), перевірено `--dry-run` ✅.
- **nginx** `/etc/nginx/sites-available/termojet`: проксі на `127.0.0.1:8080`, `www→без-www`, `http→https`.
- Деталі — у `DEPLOY.md` (секція «Домен і HTTPS»).

### 🖼️ Фікс: зникли фото товарів/категорій після переїзду
- **Причина:** у даних **626 посилань (365 унікальних)** на абсолютні `https://termojet.com.ua/wp-content/uploads/...`.
  Поки домен був на WP — вантажились; після переїзду на Hetzner (де `wp-content` немає) → 404.
- **Рішення (без зміни коду/редеплою):**
  - **Локальне дзеркало:** 364 фото (93 МБ) завантажено в `/var/www/termojet-wp/wp-content/uploads/`
    зі старого хостингу (`curl --resolve termojet.com.ua:443:91.225.138.216`).
  - **nginx:** `location /wp-content/ { root /var/www/termojet-wp; try_files $uri @wp_old; }` +
    fallback-проксі `@wp_old` на старий хостинг для будь-яких непокритих URL.
  - Перевірено: усі 130 wp-content URL з живої БД покриті дзеркалем. Старий хостинг тепер потрібен
    лише як страхувальний fallback.

## Сесія 2026-06-09 / 10 — Telegram-бот, безпека, доробки сайту, підготовка до домену

> Деплой Hetzner: `ssh hetzner` → `/home/tankoseva/termojet-website` → `git pull && docker compose up -d --build`. Прод: http://49.13.154.30:8080 (→ termojet.com.ua).
> **Стан гілок:** `main` (= робоча гілка `site-updates`, усе нижче задеплоєно) і **`lane-a-checkout`** — НП+LiqPay checkout, НЕ задеплоєний, чекає API-ключів + rebase на main.

### Telegram-бот — спільний бот на 2 сайти (tjheatpump + termojet)
- Один бот **@termojet_ua_bot**; deep-link `?start=termojet` → менеджер бачить мітку **🔵 Termojet** у спільній групі **Termojet Sales** (`-1003809508040`). Логіка бота — у `tjheatpump/server-php/tg-webhook.php` (масив `$SITES`), termojet власного webhook НЕ має.
- **Кнопка-чат:** `AppContext` дефолт `telegram = https://t.me/termojet_ua_bot?start=termojet`; `FloatingActions.jsx` падає на `DEFAULT_TG`, якщо `settings.telegram` порожній (у БД було `''` → кнопка ховалась); поле «Telegram» додано в `AdminSettings.jsx`.
- **Сповіщення про ліди:** `backend/telegram.js` (`notifyLead`, токен+chat_id **лише з env**, бо `GET /api/settings` публічний); підключено в `orders`/`consultations`/`dealers` POST. Env на сервері: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID=-1003809508040`. `docker-compose.yml` + `.env.example`.

### Доробки UI/контенту
- **Моб. плаваючі кнопки** (`FloatingActions.jsx`): підняті над нижнім меню (`bottom-[calc(64px+env(safe-area-inset-bottom)+16px)]`) — більше не перекриваються bottom-nav.
- **Навбар** (`Navbar.jsx`): меню вибору мови звужено `w-24→w-16`; додано оранжеву кнопку **«Перейти»** біля «Категорії · N» (→ `/catalog`); пункт меню «Повернення» → **«Повернення та обмін»**.
- **Доставка** (`DeliveryPage.jsx` + `translations.js` uk/en/pl): додано 4-й спосіб **«Кур'єрська доставка по Україні»** (3 дні, від 200 грн); `DELIVERY_ICONS` +Home, сітка `md:grid-cols-2 lg:grid-cols-4`.
- **/returns** (`ReturnPage.jsx`): повне переоформлення контенту (умови повернення/обміну, гарантія, кроки, строки, правова основа). Блок контактів — **приглушений темний** (`--bg-dark-2`) замість яскравого `--primary` оранж; контакти: **+380 (50) 450-64-24**, **termojet@sofievka.kiev.ua**, «Написати нам».
- **Privacy/Terms:** додано номер **+380 (50) 450-64-24**.
- **Усі форми** (Cart/Dealers/Partners/Contact/Service): телефон — **лише цифри** (`onInput` `\D`-фільтр) + `maxLength 12` + `inputMode numeric`.

### Безпека — аудит + фікс-пас (задеплоєно, коміт `a6166fd`)
Проведено повний security-аудит (security-reviewer). Знайдено 2 крит/5 вис/6 сер/4 низ. Виправлено й задеплоєно на `main`:
- **JWT_SECRET** (`auth.js`): прибрано слабкий fallback, **fail-fast** якщо <32 симв; `docker-compose` робить його обов'язковим (`${JWT_SECRET:?}`); TTL `7d→24h`. ⚠️ **На сервері згенеровано 64-hex у `.env`** — без нього контейнер НЕ стартує (важливо при перерозгортанні).
- **Адмін-пароль:** `bcryptjs`-хеш + **одноразова автоміграція** з plaintext при першому вході; `settings` PUT хешує. (Дефолт `termojet2024` ще в seed — змінити!)
- **Сума замовлення** (`orders.js`): рахується на сервері з цін товарів у БД (anti-tampering), клієнтський `total` ігнорується.
- **Rate-limiting** (`express-rate-limit`): login 10/15хв, публічні POST 20/хв, NP 60/хв.
- **CORS** allowlist (env `CORS_ORIGINS`) замість `origin:true`.
- **CSP**: прибрано `unsafe-eval`, додано `frame-ancestors 'self'`; глобальний **error-handler** (без стек-трейсів); **upload** без `svg` + ліміт 100→25 МБ; **blog markdown** href-фільтр (блок `javascript:`).
- Залежності: `npm audit` чистий; секрети в git не потрапляли (перевірено).

### Безпека checkout (гілка `lane-a-checkout`, НЕ задеплоєно, коміт `dfeb6e3`)
- **LiqPay amount-tampering фікс** (`payments.js`): сума береться **виключно з БД** (`order.total`), перевірка існування замовлення + `payment_status != 'paid'` (replay). Повна гарантія — після rebase на hardened main (де `orders.total` серверний).

### Лишилось на момент переходу на termojet.com.ua (server-ops, відкладено)
1. DNS A-запис `termojet.com.ua` → `49.13.154.30`.
2. **TLS reverse-proxy** (Caddy/Nginx + Let's Encrypt), 80→443, **HSTS**.
3. `app.set('trust proxy', 1)` (для коректного req.ip і LiqPay https-callback) + `SITE_URL=https://termojet.com.ua`.
4. Фаєрвол: закрити публічний **8080**, лишити 80/443.
5. **Бекапи** `backend/data/*.db` + `uploads/` (єдине джерело замовлень/лідів).
6. Змінити дефолтний адмін-пароль; LiqPay `LIQPAY_SANDBOX=1→0` після тесту.
7. **Влити `lane-a-checkout`** (rebase на main + ключі `NOVAPOSHTA_API_KEY`/`LIQPAY_*`) щоб активувати НП+онлайн-оплату.

> Окремий незавершений напрям: **i18n-ретрофіт** — `translations.js` повний (uk/en/pl), але ~200+ рядків і 14 сторінок захардкоджені UA повз `t()` (план — окремо, на паузі).

## Сесія 2026-06-08 / 09

### 3D-моделі: мультинасосні групи + gzip-роздача
- Додано **6 моделей** (категорія `termojet-box`): модулі **BOX2, BOX3** і насосні групи **НГ-36/37/38/38А**. Джерело — STEP постачальника (BOX по 113/163 МБ). Прив'язка — `src/data/models3d.js`.
- Конвертер `backend/scripts/step2glb.py` (cascadio). ⚠️ За замовчуванням **зберігає заводські кольори** STEP; сірими робимо лише прозорі моделі (прапорець `--grey`). BOX спершу помилково знебарвили — повернули (+`?v=2` cache-bust).
- **gzip-роздача** (`backend/server.js`): middleware віддає прекомпресований `<file>.gz` з `Content-Encoding: gzip` (нуль CPU/запит). Важкі STEP на сервері **лише `.gz`** (−~4× диск/деплой); GLB по мережі менші у 2.5–2.8×. На сервері: `<slug>.glb` + `.glb.gz` + `.step.gz`.

### Розділ «Наші проекти» — 15 реальних об'єктів
- Замінено 12 стокових на **15 реальних** фото клієнта (`public/images/portfolio/proj-1..15.jpg`, ≤1600px).
- SEO-описи (ключі + локація), нове поле `links[]` → чіпи «Обладнання об'єкта» в модалці (товари/категорії + tjheatpump.com.ua). Файли: `portfolio.js`, `PortfolioPage.jsx`.

### Блог — продуктоцентрична переробка + перелінковка
- Переписано всі статті на **реальні товари** (НГ/ГС/К/КГС, насоси APM/APE/APM-F, сепаратори TJV/TJT, BOX, Mega, A-413) замість вигаданих серій (НГТБ/СЕПА-50/«Grundfos-Wilo»). **21 пост** = 4 реальні виставки + 17 статей.
- **Виставки** (реальні фото стендів `public/images/blog/exh-*`): ISH Франкфурт (перша/featured), Instalacje Познань, **Nowy Targ** (17.05.2026), Targi Budowlane. Старі вигадані — видалено.
- Перелінковка: інлайн `[текст](url)` + чіпи `links[]`; кілька лінків на tjheatpump.com.ua. Автор — «Інженерний відділ Termojet».
- Зображення: виставки `object-cover`; статті — фото з категорій/товарів `object-contain` (без обрізки); 4 статті — проектні фото (proj-2/3/6/7).
- `BlogPostPage.jsx`: парсер markdown-лінків + чіпи. ⚠️ **БД синхронізація:** `blog_posts` перекриває статику через `/api/blog` → регенерувати `backend/seed-blog.json` з blog.js + `backend/scripts/apply-blog.js` у контейнері. Колонки `links` у БД немає → `AppContext.mergeBlogLinks()` підтягує за slug.

### Зонні клапани ABF (виправлення за каталогом)
- Звірено з Каталогом Termojet 2026, секція «ЗОННИЙ КЛАПАН» (стор. 83-84). Ключ: середні цифри SKU = DN.
- **47032230** → DN32 (1¼", ABF01-3-114M, Kvs 13); **47025230** → DN25 (1", ABF01-3-100M, Kvs 8), перенесено `zonalne-keruvannya` → `klapany`.
- Характеристики оновлено (PN10, 120 °C, CW617N, PPS, EPDM, 5 Нм, 8 с/60°, IP44). **Брошура-інструкція** вирізана зі стор. 83-84 → `public/files/zonnyj-klapan-abf-instrukciya.pdf` (files.js #144).
- `docsMapping`: правило ABF тепер **exclusive** → лише власна брошура (прибрано хибні 18/31/119). Оновлено `products.js` + `seed-products.json` + жива БД (`backend/scripts/apply-klapany.js`).

### SEO-підготовка до переносу на termojet.com.ua
- Аудит squirrel: сайт — SPA без SSR (краулер бачив порожню оболонку). Код-правки (переносяться на домен):
- `index.html`: статичні **meta description, OG, Twitter cards, canonical** (termojet.com.ua) + **noscript** (H1/контент/навігація).
- **Code-split** (`App.jsx` React.lazy + Suspense): бандл **2.1 МБ → чанки <660 КБ**.
- **CSP** (`server.js`, поблажлива, не ламає шрифти/GTM/мапи/3D) + 404 на службові `.xml/.txt/.json`.
- **Sitemap** (`scripts/gen-sitemap.mjs`): 339 реальних URL замість 716 старих WP. Skip-link + `id=main`.
- Результат: Core SEO 60→**92**, Performance 82→**89**, Content 88→**90**, Social →**100**; помилок 6→3 (решта — артефакти прев'ю: HTTPS/sitemap-domain, зникнуть на реальному домені).
- **301-редіректи WP→React** (`backend/redirects.json` + middleware у `server.js`, генератор `scripts/gen-redirects.mjs` з `backend/scripts/wp-urls.txt`): **280 правил** — 143 точні редіректи товарів `/product/{slug}` → `/catalog/{cat}/{slug}`, 118 на категорії (зняті з продажу/WP-категорії, без 404), решта — сторінки/блог. Мовні префікси /pl /en /de /fr стрипаються. Не чіпає /api, /uploads, валідні маршрути. Перевірено на проді (301 + Location).
- **Лишилось на момент переносу:** HTTPS, абсолютні URL, sitemap/robots на домені, GA4 (заглушка `G-XXXXXXXXXX`), GSC change of address. ⚠️ На переносі переконатись, що React/Express обробляє ВСІ маршрути (старий WP/nginx не перехоплює `/product/*` раніше).
- Встановлено інструмент: скіл **audit-website** + CLI **squirrel**.

### Сторінка «Про нас» — реальні фото, відео, CMS
- **Медіа:** 5 фото верстатів (HEIC→JPG, стиснуто до 1600px) у `public/factory/`; власне відео цеху `IMG_8533.MOV`→`public/about-factory.mp4` (720p, 12.6 МБ, через `avconvert`).
- **Галерея «Про нас»:** усі **18 знімків з підписами** (5 нових верстатів + 13 старих повернуто). Підписи невідомих визначено переглядом фото. `PhotoGallery` показує підпис на плитці й у лайтбоксі.
- **3 відео** в секції: архівне (повернуте) + власне (нове) як плеєри з розгортанням + оглядове **YouTube** (`PKEpr4Zg4ks`).
- **Головна «Від листа сталі»** бере фото з прапорцем `home` (5 нових + 3 старих: фарбування ×2, лазерний верстат) — 8 підписаних фото.
- **CMS:** `src/data/aboutContent.js` (`ABOUT_DEFAULTS`, `mergeAboutContent`, `mediaSrc`, `youtubeId`) + `settings.aboutContent`. Сторінка **AdminAbout** (`/admin/about`): тексти, 2 власні відео (URL/upload), YouTube, фотогалерея (upload+підпис+чекбокс «на головній», додати/видалити). `upload.js` дозволено відео (mp4/webm/mov), ліміт 100 МБ.
- **Колізії маршрутів:** фото в `public/factory/` (не `public/about/` — конфлікт зі SPA-маршрутом `/about`).

### Navbar — прозорий над героєм, світлий при скролі
- Усі сторінки з темним героєм зроблено **імерсивними** (заходять під навбар через `marginTop:-60px`): About, Catalog, Partners, Blog, Files, Service, OEM, Contacts, Delivery, Returns, FAQ.
- Світлі сторінки (кошик, картка товару, Політика, Умови) — навбар одразу світлий (`forceSolid` за маршрутом), щоб текст не зливався.

### Бейджі нових заявок в адмінці
- Червона цифра кількості **нових** (`status='new'`) біля Замовлень / Консультацій / Дилерів — у сайдбарі, на дашборді, сумарний на мобільній кнопці.
- `newCounts` + `markViewed` у контексті. Замовлення спадають при зміні статусу; консультації/дилери позначаються переглянутими при відкритті розділу (мітка «Новий»). Роути consultations/dealers вже мали PUT статусу.

### Акційна ціна + категорія «Акція»; деталі замовлення
- **Товари:** колонка `sale_price` (БД/API) + поле «Акційна ціна» в адмін-формі. Товар з акційною ціною автоматично в категорії «Акція» (перейменовано з «Розпродаж», slug `rozprodazh`). `ProductPrice` показує акційну (помаранч) + закреслену стару; бейдж «Акція» в каталозі й деталях; `addToCart` кладе ефективну ціну.
- **Замовлення:** AdminOrders показує товар/адресу/коментар/оплату **одразу** (без розгортання). Спосіб оплати — `select` у кошику → `payment` у БД. Ціни позицій у гривнях за курсом **самого замовлення** (`(total−UAH)/EUR`), щоб збігалися з сумою.
- **Email замовлення** авто-зберігається в підписниках (дедуп).

### Розділ «Підписники» + прибрано «Клієнти»
- **AdminSubscribers** (`/admin/subscribers`): email із форми у футері — список, пошук, видалення, копіювати всі, експорт CSV. Email замовлень теж сюди.
- Прибрано невикористовуваний розділ «Клієнти» (дані ніде не виводились).

### Фікси
- **Замовлення не відкривались:** `order.id` (число) ламав `.slice` → `String(order.id)`; дата з `created_at`; статус персиститься.
- **Порожній блог:** засіяно 21 статтю в БД (`seedBlog`); admin-fetch блогу більше не затирає статичні пости порожнім `[]`.

### Завантаження файлів з компʼютера в адмінці
- **Бекенд:** `upload.js` — розширено типи (pdf/doc/docx/xls/xlsx/ppt/pptx/dwg/zip + зображення), ліміт 25 МБ. `files.js` — GET мапить `filename↔url` (id з префіксом `f`), POST приймає `url`, DELETE розуміє префіксований id. Файли зберігаються у volume `./uploads` (переживають rebuild).
- **Контекст:** `uploadFile(file)` (FormData → `/api/upload`, повертає `{url}`); `saveFile`/`removeFile` (персистенція документів через `/api/files`); список документів = завантажені (БД) + статичний каталог.
- **Компонент** `ImageUpload` — прев'ю + кнопка «Завантажити з компʼютера» + ручний URL; стан завантаження й помилки.
- **Підключено:** Товари (фото товару), Портфоліо (фото проекту) — через `ImageUpload`; Документи — завантаження файлу з авто-заповненням назви/розміру, категорія списком, персистенція в БД.

### Управління товарами в адмінці — приховування/показ
- **Бекенд:** `products` GET у адмін-режимі (`?admin=1` + валідний токен) повертає **всі** товари, включно з прихованими (`is_visible=0`); публічний лістинг, як і раніше, лише видимі. Хелпер `checkAdmin` у `auth.js` (м'яка перевірка токена без блокування).
- **AppContext:** після входу в адмінку дозавантажує повний каталог (`?admin=1&limit=1000`), щоб приховані товари були видні й їх можна було повернути.
- **AdminProducts:** кнопка-перемикач Eye/EyeOff (швидке приховування з таблиці без форми), чекбокс «Показувати на сайті» у формі товару, приглушення прихованих рядків, лічильник прихованих у шапці. Редагування / додавання / видалення вже були.
- Перевірено на проді: адмін-лістинг повертає 328 товарів з токеном (read-only). Мутаційний тест приховування навмисно не виконував на живих даних.

### H6 — Аналітика в адмінці (`/admin/analytics`)
- **Бекенд:** новий роут `backend/routes/analytics.js` (GET `/api/analytics`, `requireAdmin`) — агрегує підсумки (ліди, замовлення, консультації, дилери, підписники, сума замовлень), тренд лідів за 30 днів (замовлення+консультації+дилери по днях), UTM-розбивку (топ source / medium / campaign по всіх лідах) та замовлення за статусом. Зареєстровано в `server.js`.
- **Фронт:** нова сторінка `src/pages/admin/AdminAnalytics.jsx` — стат-картки, вертикальний bar-графік тренду (з тултіпами по днях), горизонтальні bar-списки UTM, замовлення за статусом. Графіки на чистому CSS — **без нових залежностей**.
- Додано в меню дашборду (першим пунктом) + роут у `App.jsx`.

### H7 — Редагований текст головної (`/admin/content`)
- **Спільні дефолти:** `src/data/homeContent.js` (`HOME_DEFAULTS`) — єдине джерело текстів hero / статистики / каталогу / переваг / виробництва / CTA / партнерського блоку. Хелпери `mergeHomeContent` (override поверх дефолтів, масиви — поелементно) та `splitAccentToken` (підсвічування `#1`).
- **Зберігання:** контент пишеться як JSON у `settings.homeContent` (додано ключ у whitelist `routes/settings.js`). `AppContext`: derived `homeContent` (парсинг override→merge) + `saveSettings()` (PUT `/settings`, серіалізує homeContent).
- **HomePage:** усі ці тексти тепер беруться з `homeContent` (fallback на дефолти) замість хардкоду — hero бейдж/заголовок/кнопки, 4 показники статистики, заголовок каталогу, переваги (eyebrow+заголовок+6 карток), виробництво (заголовок+опис), фінальна CTA (текст+2 кнопки), партнерський блок.
- **Фронт:** `src/pages/admin/AdminContent.jsx` — секційна форма редагування всіх полів + «Скинути до стандартних». Меню дашборду + роут у `App.jsx`.

### Бонус — фікс персистенції налаштувань
- `AdminSettings` раніше зберігав контакти/пароль **лише локально** (не слав на бекенд). Тепер через `saveSettings()` → PUT `/api/settings`. Порожній пароль не перезаписує наявний.

### Перевірка
- Фронт-білд `build:prod` ✓ (2203 модулі, без помилок). Синтаксис бекенд-роутів ✓ (`node --check`). SQL аналітики покритий наявними міграціями (`utm` на orders/consultations/dealers, таблиця `subscribers`).

---

## Сесія 2026-06-01 / 02

### Банери категорій каталогу (повне покриття)
Додано фонові банери ще для **11 категорій** через мапу `CATEGORY_BANNERS` (`CatalogPage.jsx`, slug → `public/banner-*.png`). Тепер банери мають усі категорії.
- Перша партія (архів `банери.zip`): `kolektory-pidloha` (теплої підлоги), `nasosy` (насоси), `balansuval-klapany` (балансувальні клапани), `separatory` (сепаратори), `hidravlichni-rozdilnyky` (роздільники гідравлічні), `avtomatyka`, `dodatkove` (додаткове обладнання) + оновлено `termojet-mega`.
- Друга партія: `rozpodilchi-kolektory` (розподільчі колектори), `termojet-box`, `kolektory-z-hidrostrilkoyu` (колектори з гідрострілкою), `zonalne-keruvannya` (термостати та зональне керування) + **замінено** банер `avtomatyka` на «автоматика керування котельною».
- Правило додавання нового банера незмінне: кинути файл у `public/banner-<slug>.png` + рядок у мапу `CATEGORY_BANNERS`.
- ⚠️ Банери — великі PNG (~1 МБ кожен). На майбутнє варто стиснути / перевести у WebP.

### Видалено категорію «Стійки/каскади»
- Прибрано категорію `stijky-kaskady` (Стійки та колектори для каскадів котлів) з `src/data/categories.js` і `src/data/docsMapping.js`. Жоден товар на неї не посилався. Зникла з каталогу і мега-меню.

### Hero-секція (головна) — типографіка і вирівнювання
- Заголовок зменшено на **10%**: `clamp(2rem, 4.5vw, 3.5rem)` → `clamp(1.8rem, 4.05vw, 3.15rem)`.
- Прибрано відступ `ml-8` з усього hero-блоку — плашка «ВИРОБНИЦТВО З 2002», заголовок і CTA-кнопки тепер врівень по лівому краю (раніше блок був зсунутий до центру). Відступ від краю лишився лише `px-6`.

### Інфраструктура / git
- `src/data/` потрапляє під патерн `data/` у `.gitignore`, але файли вже відстежені — зміни в них додавати через `git add -f src/data/...`.
- Деплой без змін: `git push origin main` → `ssh hetzner 'cd /home/tankoseva/termojet-website && git pull && docker compose up -d --build'`.
- Коміти сесії: `7738f3c` (банери +видалення каскадів), `9a22354` (друга партія банерів), `abb5eff` (hero −10% + кнопки лівіше), `cc13441` (hero блок лівіше).

---

## Сесія 2026-05-30 / 31

### Скруглення (уніфікація під hero-кнопки = 8px)
- **Navbar** — усі квадратні елементи `borderRadius: 0 → 0.5rem`: CTA «Стати партнером» / «Консультація» (десктоп + мобільні), тайли мега-меню + їх фото, темний dropdown, перемикач мови (кнопка + меню + мобільні), поле пошуку, CTA «Запустити», бейдж кошика.
- **Кнопки/CTA сторінок** `rounded-xl → rounded-lg`: фільтри блогу (`BlogPage`), сабміт форми (`PartnersPage`), CTA «зателефонувати/email» (`ReturnPage`).
- **Картки** `border-radius: 0 → 0.75rem` (12px): `.cat-card` і `.product-card-new` (`index.css`).
- **Картки категорій** (HomePage `CategoryCard`): бейдж «Переглянути →», SKU-бейдж і стрілка ↗ скруглені.
- **Картки товарів** (`CatalogPage`): кнопки «Купити в 1 клік», «Детальніше», «В кошик» → `rounded-lg`; «Детальніше» отримала повну рамку замість `border-l`.
- Форми та адмінка лишені на `rounded-xl` (за рішенням замовника).

### Hero-секція (головна)
- YouTube-iframe фон замінено на **локальне відео** `public/hero.mp4` (`autoplay muted loop playsInline`, `object-cover`) — без звуку, по колу. Джерело: `IMG_8377.MP4`.
- Модалка «Відео заводу» лишилась на YouTube (`YT_ID`) — окремий промо-ролик.

### Фікс шляхів до зображень (баг на Hetzner)
- Фото конструктора (`app-promo-nobg.png`) у Navbar mega-menu та блоці App на головній мали **хардкод** `/termojet-website/...` → 404 на Hetzner (база `/`). Виправлено на `assetPath('/...')`. **Правило: ассети з `public/` підключати лише через `assetPath()`**, ніколи не хардкодити базовий префікс.

### Сторінка About
- У банер шапки додано фонове фото `public/about-hero.png` (`object-cover`, `objectPosition: center right`) + градієнтне затемнення зліва під текст. Після відгуку освітлено (оверлей зліва `0.94→0.70`, справа `0.55→0.18`).

### Банери категорій каталогу
- У шапку сторінки категорії додано **фонові фото** через мапу `CATEGORY_BANNERS` (slug → `public/banner-*.png`) зі світлим затемненням (як на About): `klapany`, `termojet-mega`, `nasosni-hrupy`. Інші категорії — без змін (градієнт). Додавати нові: кинути файл у `public/` + рядок у мапу.

### Прозорий навбар на каталозі
- Темна шапка каталогу отримала `marginTop: -60px` + компенсуючий `paddingTop`, щоб заходити **під фіксований навбар** (як hero на головній). Навбар прозорий зверху (білий текст на темному фоні), світліє при скролі. Логіка навбара глобальна (`scrolled` при `scrollY>20`) — змін у Navbar не було.

### Інфраструктура / деплой (для наступних сесій)
- **Hetzner**: сервер `49.13.154.30` (hostname `Termojet-CRM`), сайт на `http://49.13.154.30:8080` (контейнер `termojet-website-app-1`, `8080:3000`).
- Проєкт на сервері: **`/home/tankoseva/termojet-website`** (НЕ `/root/...`, як у DEPLOY.md). Власник `tankoseva`.
- SSH-аліас `hetzner` (ключ `~/.ssh/id_ed25519` або `~/.ssh/hetzner_key`).
- **Деплой**: `ssh hetzner 'cd /home/tankoseva/termojet-website && sudo -u tankoseva git pull --ff-only && docker compose up -d --build'`.
- Docker білдить з `VITE_BASE_URL=/ npm run build:prod` (база `/`), тоді як GitHub Pages — з `/termojet-website/`. Тому `assetPath()` обов'язковий.
- Коміти сесії: `6a4d9f2`, `726be6d`, `ef022d3`, `5784ace`, `9cb1678`, `a6a85c5`, `3d4f4ac`, `6064f0b`.

---

## Сесія 2026-05-18 / 19

---

### Навбар

- **Top bar** — додано 3 пункти в JetBrains Mono: `● 20 років на ринку | ● Експорт у 15 країн | ● Власне виробництво в Києві і Житомирі`
- **Перемикач мов** — замінено горизонтальні кнопки на компактний dropdown `UA ▾` з 5 мовами: 🇺🇦 UA / 🇬🇧 EN / 🇵🇱 PL / 🇫🇷 FR / 🇩🇪 DE
- **Структура меню** — повністю перебудовано:
  - `Каталог` (мега-меню)
  - `Про Termojet ▾` (Про нас, Реалізовані проекти, Блог, Контакти)
  - `Для клієнта ▾` (Сервіс, Доставка і оплата, Повернення та обмін, OEM виробництво, Гарантія, Технічна підтримка)
  - `Файли`
  - `Теплові насоси ↗` (зовнішнє посилання на tjheatpump.com.ua)
  - Телефон `+380 50 718 91 65` в JetBrains Mono
  - Кнопки `Стати партнером` (orange gradient) і `Консультація` (orange outline)
- **Один рядок** — всі пункти меню стоять в одну лінію (whitespace-nowrap, px-2.5, flex-shrink-0), CTA кнопки приховані на lg / видимі на xl
- **Видалено** пункт `Дилерам` з меню

---

### Мега-каталог (full-width overlay)

- `position: fixed; top: 64px; left: 0; right: 0` — розкривається на всю ширину вікна під навбаром
- Темний backdrop (`rgba(10,22,42,0.45)` + `backdrop-filter: blur(2px)`), клік — закриває
- **Ліва колонка**: всі 13 категорій з іконками та кількістю — **клікабельні посилання** `/catalog/[slug]`, без обрізання назв
- **Центр**: 4-колонна сітка товарів з квадратними фото (`aspect-square`), hover-zoom, посилання на продукт
- **Права колонка**: Конфігуратор CTA (темний блок section-navy)

---

### Сторінка каталогу (`/catalog`)

- **Ліва бокова панель** (desktop):
  - Список усіх категорій — клікабельні, активна підсвічується
  - **4 групи фільтрів** (на основі аналізу реального каталогу):
    - Потужність: до 30 / 30–60 / 60–105 / 105–175 / понад 175 кВт
    - Призначення: Тепла підлога / Радіаторне / ГВС-бойлер / Промислові
    - Теплоізоляція: Стандартна / EPP BLACK
    - Серія: Mini / BOX / Mega / Стандарт
- **Картки товарів**:
  - Висота фото збільшена до 200px
  - Фото zoom +6% при hover
  - **Кольорові бейджі характеристик**: сині (DN, підключення), оранжеві (потужність, напір), сірі (інші) — парсяться зі specs або з назви товару
  - Ціна виводиться на картці
- **Мобільні фільтри**: кнопка `Фільтри` розкриває панель

---

### Збагачення даних товарів

- **Агент** зібрав дані з `termojet.com.ua/catalog/` — структура 13 категорій з підкатегоріями
- Файл `src/data/products-enriched.js` — **19 продуктів** з повними даними:
  - 4 гідрострілки ГС-25/26/28/30 (25–370 кВт)
  - 5 насосних груп НГ-46/47/48/51/67
  - 2 сепаратори TJ-CA-DN25, TJ-CD-DN25
  - 2 насоси APM 25/8/180, XPS 25-6-130
  - 2 міні-колектори К21В, К41В
  - 2 модулі BOX2/BOX3
  - 2 автоматики LIGHT, PROFI PLUS
  - 1 змішувальний вузол TJ-MU-10B
- Файл `src/data/mergeEnriched.js` — merge-утиліта, шарує збагачені дані поверх PRODUCTS по SKU
- `AppContext` використовує `mergeWithEnriched(PRODUCTS)` при ініціалізації

---

### Нові сторінки

| URL | Файл | Опис |
|-----|------|------|
| `/oem` | `OEMPage.jsx` | OEM-виробництво (за зразком termojet.com.ua/partnerzy/) |
| `/warranty` | `WarrantyPage.jsx` | Гарантія: 2/3 роки, умови, що скасовує гарантію |
| `/support` | `TechSupportPage.jsx` | Технічна підтримка, 6 сервісних карток |
| `/returns` | `ReturnPage.jsx` | Повернення та обмін, 3-крокова схема |
| `/partners` | `PartnersPage.jsx` | Стати партнером (за зразком tjheatpump.com.ua/partners) |

---

### Сторінка "Стати партнером" (`/partners`)

Повністю перероблена за зразком `tjheatpump.com.ua/partners`:
- 6 переваг (сітка 3×2)
- **2 формати співпраці** (Агентський договір прибрано): Системний партнер / Договір поставки
- Вимоги з табами **Дилер / Інсталятор**
- Контактний блок (оранжевий) з телефоном
- Форма: вибір типу співпраці, ПІБ, компанія, email, телефон, місто, повідомлення, ConsentCheckbox
- `POST /api-partners.php`

---

### Перенаправлення

- `/dealers` → `<Navigate to="/partners" replace />` (автоматичний редірект)
- Кнопка "Стати партнером" на головній сторінці → `/partners` (раніше `/dealers`)

---

### Hero секція (головна)

- **3D модель** (`scene.glb`, 19 MB) — повністю на фоні (`position: absolute; opacity: 0.85`)
- `HeroBg3D.jsx` — Canvas з `<group ref={spinRef}>` (world Y-axis spin) + `<Center>` (авто-центрування pivot)
- Обертання: `rotation={[Math.PI/2, 0, Math.PI/2]}`, швидкість `delta * 0.06`
- CSS-глоу: оранжевий `radial-gradient` справа-знизу, синій зліва-зверху
- Лівий градієнт-маска для читабельності тексту (`rgba(6,13,26,0.82) → transparent`)
- Прибрано: кнопка "Повне відео", бейдж "Made in Ukraine"

---

### Дрібні виправлення

- `bg-dots` — скрізь вимкнено (`background-image: none`)
- Порядок секцій на головній: Категорії → Переваги → Фото виробництва → Конфігуратор
- Footer: прибрано CTA-блок "Готові до співпраці?"
- Переваги на головній: числа 01–06 замість іконок, hover glow + scale (framer-motion)
- Категорії на головній: реальні фото товарів замість emoji
- Чеклист hero: JetBrains Mono
- `ConsentCheckbox.jsx`: працює з і без `react-hook-form` (`register` опціональний)
- `.gitignore`: додано `*.glb`, `.claude/worktrees/`

---

### Файли змінені / створені

```
src/
  components/
    layout/
      Navbar.jsx          ← повна переробка
      Footer.jsx          ← прибрано CTA блок
    HeroBg3D.jsx          ← новий (3D фон)
    ConsentCheckbox.jsx   ← register опціональний
  context/
    AppContext.jsx         ← mergeWithEnriched
  data/
    products-enriched.js  ← новий (19 продуктів)
    mergeEnriched.js      ← новий (утиліта)
  pages/
    HomePage.jsx          ← hero, секції, посилання
    CatalogPage.jsx       ← sidebar, фільтри, картки
    OEMPage.jsx           ← новий
    WarrantyPage.jsx      ← новий
    TechSupportPage.jsx   ← новий
    ReturnPage.jsx        ← новий
    PartnersPage.jsx      ← повна переробка
  App.jsx                 ← 5 нових маршрутів, /dealers → redirect
  index.css               ← mega-full, spec-badge, bg-dots fix
public/
  scene.glb               ← 3D модель котельної системи (19 MB, в .gitignore)
```
