# Архітектура сайту Termojet — інструкція для нового проекту

> Цей документ описує як побудований сайт tjheatpump.com.ua, щоб можна було відтворити такий самий підхід для нового проекту.

---

## Технологічний стек

| Шар | Технологія |
|---|---|
| UI фреймворк | React 19 + Vite 8 |
| Стилі | Tailwind CSS v4 (через `@tailwindcss/vite`) |
| Анімації | Framer Motion |
| Іконки | Lucide React |
| Роутинг | React Router v7 |
| Форми | React Hook Form |
| Слайдери | Swiper |
| SEO | react-helmet-async |
| Бекенд | PHP (shared hosting, DirectAdmin) |
| Деплой | SFTP на shared hosting |

---

## Структура проекту

```
project/
├── src/
│   ├── App.jsx                 # роутинг, layout обгортки
│   ├── main.jsx                # точка входу React
│   ├── index.css               # глобальні стилі + Tailwind
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx      # шапка з навігацією
│   │   │   └── Footer.jsx      # підвал
│   │   ├── home/               # секції головної сторінки
│   │   ├── PartnershipSection.jsx
│   │   ├── ReviewsSection.jsx
│   │   ├── FloatingActions.jsx # плаваючі кнопки (Telegram, телефон)
│   │   ├── MobileBottomNav.jsx # нижня навігація на мобільному
│   │   ├── ConsentCheckbox.jsx # чекбокс згоди (GDPR)
│   │   ├── PriceDisplay.jsx    # відображення ціни з курсом валют
│   │   ├── SEO.jsx             # мета-теги через react-helmet
│   │   └── SchemaOrg.jsx       # JSON-LD розмітка
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── ProductsPage.jsx
│   │   ├── ProductDetailPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── ShopPage.jsx        # sidebar кошик
│   │   ├── BlogPage.jsx
│   │   ├── BlogPostPage.jsx
│   │   ├── ContactPage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── PartnersPage.jsx
│   │   ├── PortfolioPage.jsx
│   │   ├── ServicePage.jsx
│   │   ├── FilesPage.jsx       # завантаження документів
│   │   ├── FaqPage.jsx
│   │   ├── DeliveryPage.jsx
│   │   ├── ReturnsPage.jsx
│   │   ├── TermsPage.jsx
│   │   ├── PrivacyPage.jsx
│   │   └── admin/              # адмін-панель (захищений розділ)
│   │       ├── AdminLayout.jsx
│   │       ├── AdminLoginPage.jsx
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminProducts.jsx
│   │       ├── AdminOrders.jsx
│   │       ├── AdminConsultations.jsx
│   │       ├── AdminPartners.jsx
│   │       ├── AdminBlog.jsx
│   │       ├── AdminReviews.jsx
│   │       ├── AdminSettings.jsx
│   │       ├── AdminAnalytics.jsx
│   │       ├── AdminBanners.jsx
│   │       ├── AdminPromos.jsx
│   │       ├── AdminClients.jsx
│   │       ├── AdminPortfolio.jsx
│   │       ├── AdminFiles.jsx
│   │       └── AdminCatalog.jsx
│   ├── context/
│   │   └── AppContext.jsx      # глобальний стан (продукти, кошик, замовлення тощо)
│   ├── data/
│   │   └── products.js         # каталог продуктів (статичні дані)
│   ├── i18n/
│   │   ├── translations.js     # всі рядки інтерфейсу UK + EN
│   │   └── useT.js             # хук для перекладу
│   └── utils/
│       ├── analytics.js        # GA4 eCommerce події
│       ├── crm.js              # відправка лідів у зовнішній CRM
│       ├── utm.js              # захоплення і зберігання UTM-параметрів
│       ├── slug.js             # генерація URL-слагів для категорій
│       ├── assetPath.js        # правильні шляхи до assets (залежно від base URL)
│       ├── imageUpload.js      # завантаження зображень на сервер
│       └── productTranslation.js # переклад назв/описів продуктів
├── public/                     # статичні файли (копіюються в dist)
│   ├── index.php               # для PHP хостингу: читає index.html
│   ├── logo.png
│   ├── logo-en-v4.png
│   └── favicon.svg
├── public_html/                # PHP бекенд (деплоїться на хостинг окремо)
│   ├── api-config.php          # токени, CORS, BOT_TOKEN
│   ├── api-session.php         # CORS заголовки
│   ├── api-orders.php          # прийом замовлень
│   ├── api-consultations.php   # прийом заявок на консультацію
│   ├── api-partners.php        # прийом заявок на партнерство
│   ├── api-products.php        # CRUD продуктів
│   ├── api-upload.php          # завантаження зображень
│   └── tg-webhook.php          # Telegram бот (webhook)
├── vite.config.js
└── package.json
```

---

## Глобальний стан — AppContext

Весь глобальний стан зберігається в `src/context/AppContext.jsx`. Він охоплює:

- **lang** — поточна мова (`'uk'` / `'en'`), зберігається в `localStorage`
- **products** — каталог товарів (завантажується з `api-products.php` або з `data/products.js` як fallback)
- **cart** — кошик (`localStorage`)
- **orders, consultations, partners** — заявки (стан + API)
- **isAdminAuth** — авторизація адміна (sessionStorage)
- **exchangeRates** — курс USD/EUR/UAH
- **siteSettings** — налаштування сайту з адмін-панелі (телефон, адреса, Telegram chat ID тощо)
- **reviews, banners, promos, blog, portfolio, faq, clients, files** — весь контент, що редагується через адмін-панель

### Патерн роботи з даними

```js
// 1. Локальний стан + синхронізація з сервером
const [products, setProducts] = useState([])

useEffect(() => {
  fetch('/api-products.php')
    .then(r => r.json())
    .then(data => setProducts(data))
    .catch(() => setProducts(STATIC_FALLBACK))
}, [])

// 2. Мутація — оптимістичне оновлення + API call
const addProduct = async (product) => {
  setProducts(prev => [...prev, product]) // одразу в UI
  await fetch('/api-products.php', { method: 'POST', body: JSON.stringify(product) })
}
```

---

## Система i18n (двомовність UK/EN)

### Як влаштована

Всі рядки інтерфейсу знаходяться в `src/i18n/translations.js`:

```js
export const T = {
  uk: {
    nav: { home: 'Головна', products: 'Продукти', ... },
    partners: {
      title: 'Станьте партнером',
      form: { nameLabel: "Ім'я", submitBtn: 'Відправити', ... }
    }
  },
  en: {
    nav: { home: 'Home', products: 'Products', ... },
    partners: {
      title: 'Become a Partner',
      form: { nameLabel: 'Name', submitBtn: 'Submit', ... }
    }
  }
}
```

### Як використовувати в компонентах

```jsx
import { useT } from '../i18n/useT'

function MyComponent() {
  const t = useT()
  const nav = t('nav')          // повертає весь об'єкт
  const title = t('partners.title')  // або конкретний рядок

  return <h1>{title}</h1>
}
```

### Правило: НІКОЛИ не хардкодити текст в JSX

Будь-який текст → спочатку в `translations.js` (uk + en), потім через `t()`.

---

## PHP бекенд

Хостинг — shared PHP (DirectAdmin). Node.js недоступний — тільки PHP.

### api-config.php — головний конфіг

```php
define('BOT_TOKEN', 'xxxxxxxxxx');
define('MANAGER_CHAT_ID', '');  // fallback, реальний — в state.json

function cors_headers() {
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, Authorization');
}
```

### Структура типового API endpoint

```php
<?php
require_once __DIR__ . '/api-config.php';

header('Content-Type: application/json');
cors_headers();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { http_response_code(405); exit; }

$body = json_decode(file_get_contents('php://input'), true) ?? [];
// валідація...
// зберігання в private/state.json...
// Telegram сповіщення...
echo json_encode(['ok' => true, 'id' => $item['id']]);
```

### Зберігання даних

Всі дані зберігаються в одному файлі `private/state.json` (поза `public_html/`):

```json
{
  "tj_products": [...],
  "tj_orders": [...],
  "tj_consultations": [...],
  "tj_partners": [...],
  "tj_reviews": [...],
  "tj_blog": [...],
  "tj_siteSettings": {
    "phone": "+380503210649",
    "telegramManagerChatId": "423207179",
    "telegramBotToken": "xxx"
  }
}
```

### Rate limiting (захист від спаму)

```php
function check_rate($file, $ip, $max = 5, $window = 60) {
    $data = file_exists($file) ? json_decode(file_get_contents($file), true) ?? [] : [];
    $now  = time();
    $data[$ip] = array_filter($data[$ip] ?? [], fn($t) => ($now - $t) < $window);
    if (count($data[$ip]) >= $max) { file_put_contents($file, json_encode($data), LOCK_EX); return false; }
    $data[$ip][] = $now;
    file_put_contents($file, json_encode($data), LOCK_EX);
    return true;
}
```

---

## Telegram бот

Файл: `public_html/tg-webhook.php`

### Функціонал

- `/start` — вітальне повідомлення з inline-кнопками
- Кнопка **Консультація** — показує телефон з посиланням `tel:`
- Кнопка **Написати менеджеру** — бот чекає повідомлення, пересилає менеджеру
- Менеджер відповідає двома способами:
  1. **Reply** на переслане повідомлення клієнта
  2. Команда `/reply USER_ID текст відповіді`
- `/getmyid` — отримати свій chat ID

### Сесії

PHP не має in-memory стану між запитами, тому сесії — у файлах:
- `private/tg_sessions.json` — `{ "user_id": chat_id }` — для відповіді менеджера
- `private/tg_states.json` — `{ "user_id": { "state": "awaiting_message" } }` — для Flow

### Реєстрація webhook

```
https://api.telegram.org/bot{TOKEN}/setWebhook?url=https://yourdomain.com/tg-webhook.php
```

### Manager Chat ID

Зберігається в `private/state.json` → `tj_siteSettings.telegramManagerChatId`.
Встановлюється через адмін-панель або напряму в JSON.
Щоб дізнатись свій ID — надіслати `/getmyid` боту.

---

## Адмін-панель

Доступна за `/admin`. Авторизація через пароль (в `AppContext`, зберігається в sessionStorage).

### Розділи адмін-панелі

| Розділ | Що редагується |
|---|---|
| Dashboard | статистика (заявки, замовлення, огляди) |
| Products | каталог товарів (CRUD) |
| Orders | замовлення |
| Consultations | заявки на консультацію |
| Partners | заявки на партнерство |
| Clients | список клієнтів |
| Blog | статті |
| Reviews | відгуки |
| Banners | банери на головній |
| Promos | акційні пропозиції |
| Portfolio | кейси/портфоліо |
| Files | документи для завантаження |
| Catalog | PDF каталоги |
| FAQ | питання та відповіді |
| Analytics | графіки трафіку/заявок |
| Settings | телефон, Telegram chat ID, пароль адміна |

---

## GA4 eCommerce

Файл: `src/utils/analytics.js`

### Реалізовані події

| Подія | Коли викликається |
|---|---|
| `view_item` | При відкритті сторінки товару |
| `add_to_cart` | При натисканні "Додати в кошик" |
| `remove_from_cart` | При видаленні товару з кошика |
| `begin_checkout` | При відкритті сторінки оформлення |
| `purchase` | Після успішного створення замовлення |

### Правило очищення

Перед кожним event обов'язково:
```js
window.dataLayer.push({ ecommerce: null })
```

### Параметри purchase

```js
{
  transaction_id, affiliation,   // 'cart' або 'fast_order'
  currency, value,
  shipping: 0, tax: 0,
  items: [...]
}
```

---

## UTM-трекінг

При першому заході з UTM-параметрами (`utm_source`, `utm_medium`, etc.) вони зберігаються в `sessionStorage` через `captureUTM()`. При відправці будь-якої форми — додаються до payload через `getUTM()`.

---

## Деплой

### Дві команди збірки

```bash
# Для хостингу (paths від кореня /)
VITE_BASE_URL=/ npm run build

# Для GitHub Pages (paths від /назва-репо/)
VITE_BASE_URL=/termojet/ npm run build
```

**Важливо:** на shared PHP хостингу потрібен файл `public/index.php`:
```php
<?php readfile(__DIR__ . "/index.html"); ?>
```

### SFTP деплой

```bash
# Деплой нового JS bundle + index.html
BASE="web/yourdomain.com/public_html"
sshpass -p 'PASSWORD' sftp -o StrictHostKeyChecking=no -P 22 user@host << EOF
put dist/assets/index-HASH.js ${BASE}/assets/index-HASH.js
put dist/assets/index-HASH.css ${BASE}/assets/index-HASH.css
put dist/index.html ${BASE}/index.html
bye
EOF
```

### Що деплоїти при змінах

| Що змінилось | Що завантажувати |
|---|---|
| React код / стилі | `dist/assets/index-*.js`, `dist/assets/index-*.css`, `dist/index.html` |
| PHP бекенд | тільки змінений `.php` файл |
| Зображення | `public_html/images/...` або напряму в `public_html/` |

---

## Роутинг

`App.jsx` використовує `BrowserRouter` коли `BASE_URL === '/'` (хостинг) або `HashRouter` (GitHub Pages). Це автоматично — не треба змінювати вручну.

```jsx
const RouterWrapper = import.meta.env.BASE_URL === '/' ? BrowserRouter : HashRouter
```

Адмін-панель захищена компонентом `ProtectedAdmin` — перевіряє `isAdminAuth` з context.

---

## Корисні паттерни

### ConsentCheckbox

Чекбокс згоди з обробкою персональних даних — використовується у всіх формах. Готовий компонент `src/components/ConsentCheckbox.jsx`.

### PriceDisplay

Компонент для відображення ціни з автоматичним перерахунком у UAH за поточним курсом:
```jsx
<PriceDisplay price={product.price} currency="EUR" />
```

### assetPath

Для зображень в публічній папці — використовуй:
```js
import { assetPath } from '../utils/assetPath'
<img src={assetPath('/logo.png')} />
```
Це автоматично додає правильний base URL (важливо для GitHub Pages).

---

## Хостинг — що важливо знати

- Shared hosting (DirectAdmin) — PHP 8.x, немає SSH, немає Node.js
- Доступ — тільки SFTP
- PHP файли бекенду — в `public_html/`
- Приватні дані (state.json, rate-limit файли) — в `private/` (поза public_html)
- SFTP credentials зберігаються в `private/state.json` на сервері захищено
- Webhook URL Telegram — `https://yourdomain.com/tg-webhook.php`
