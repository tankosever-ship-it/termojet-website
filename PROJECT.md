# Termojet Website Redesign — Документація проекту

> Сучасний сайт українського виробника обладнання для котелень  
> Створено: травень 2026

---

## Посилання

| | |
|---|---|
| 🌐 Сайт | https://tankosever-ship-it.github.io/termojet-website/ |
| 📁 Репозиторій | https://github.com/tankosever-ship-it/termojet-website |
| 🔧 Адмін-панель | `/admin` → пароль `termojet2024` |
| 🏗️ Старий сайт | https://termojet.com.ua |

---

## Технологічний стек

| Шар | Технологія |
|---|---|
| UI фреймворк | React 19 + Vite 8 |
| Стилі | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Анімації | Framer Motion |
| Іконки | Lucide React |
| Роутинг | React Router v7 (HashRouter для GitHub Pages) |
| Форми | React Hook Form |
| SEO | react-helmet-async |
| Деплой | GitHub Pages (GitHub Actions) |
| Бекенд (майбутнє) | PHP на shared hosting |

---

## Структура проекту

```
termojet-website-redesign/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Автодеплой на GitHub Pages
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx                 # Роутинг, layout
│   ├── main.jsx
│   ├── index.css               # Tailwind + кастомні змінні і класи
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx      # Sticky шапка з mega-menu і пошуком
│   │   │   └── Footer.jsx      # Підвал з CTA блоком
│   │   ├── ConsentCheckbox.jsx # GDPR чекбокс для форм
│   │   ├── FloatingActions.jsx # Плаваюча кнопка телефону
│   │   └── SEO.jsx             # react-helmet мета-теги
│   ├── pages/
│   │   ├── HomePage.jsx        # Головна
│   │   ├── CatalogPage.jsx     # Каталог + категорія
│   │   ├── ProductDetailPage.jsx # Картка товару
│   │   ├── CartPage.jsx        # Кошик + оформлення
│   │   ├── AboutPage.jsx       # Про компанію + таймлайн
│   │   ├── ContactPage.jsx     # Контакти + форма
│   │   ├── DealersPage.jsx     # Для дилерів + форма заявки
│   │   ├── BlogPage.jsx        # Список статей
│   │   ├── BlogPostPage.jsx    # Стаття
│   │   ├── PortfolioPage.jsx   # Реалізовані проекти + lightbox
│   │   ├── FilesPage.jsx       # Документи для завантаження
│   │   ├── FaqPage.jsx         # Питання та відповіді
│   │   ├── ServicePage.jsx
│   │   ├── DeliveryPage.jsx
│   │   ├── PrivacyPage.jsx
│   │   ├── TermsPage.jsx
│   │   └── admin/
│   │       ├── AdminLoginPage.jsx    # Вхід в адмінку
│   │       ├── AdminDashboard.jsx    # Дашборд зі статистикою
│   │       ├── AdminProducts.jsx     # CRUD товарів
│   │       ├── AdminOrders.jsx       # Замовлення
│   │       ├── AdminConsultations.jsx
│   │       ├── AdminDealers.jsx      # Заявки дилерів
│   │       ├── AdminBlog.jsx         # CRUD статей
│   │       ├── AdminPortfolio.jsx    # CRUD проектів
│   │       ├── AdminFiles.jsx        # Документи
│   │       ├── AdminReviews.jsx      # Відгуки з рейтингом
│   │       └── AdminSettings.jsx     # Контакти, пароль
│   ├── context/
│   │   └── AppContext.jsx       # Глобальний стан
│   ├── data/
│   │   ├── categories.js        # 13 категорій каталогу
│   │   └── products.js          # Заглушка (товари — з API)
│   ├── i18n/
│   │   ├── translations.js      # Всі рядки UA/EN/PL/FR/DE
│   │   └── useT.js              # Хук перекладу
│   └── utils/
│       ├── assetPath.js         # Правильні шляхи до assets
│       ├── slug.js              # Генерація URL-слагів
│       └── utm.js               # Захоплення UTM-параметрів
├── vite.config.js
├── package.json
├── PLAN.md                      # Початковий план проекту
└── PROJECT.md                   # Цей файл
```

---

## Мови інтерфейсу

Сайт підтримує **5 мов** — перемикач у Navbar:

| Код | Мова | Прапор |
|---|---|---|
| `uk` | Українська | 🇺🇦 |
| `en` | English | 🇬🇧 |
| `pl` | Polski | 🇵🇱 |
| `fr` | Français | 🇫🇷 |
| `de` | Deutsch | 🇩🇪 |

Всі рядки — у `src/i18n/translations.js`. Правило: **ніколи не хардкодити текст у JSX** — тільки через `t('ключ')`.

---

## Кольорова схема бренду

```css
--primary:       #1B3F6B   /* Глибокий синій — основний */
--primary-light: #2457a0   /* Синій світліший — hover */
--accent:        #E85D04   /* Помаранчевий — акцент, CTA */
--bg:            #f5f6fa   /* Фон сторінки */
--bg-card:       #ffffff   /* Фон карток */
--text-primary:  #0d1b2a   /* Основний текст */
--text-secondary:#4a5568   /* Вторинний текст */
```

Шрифти: **Inter** (основний) + **Montserrat** (заголовки, жирний).

---

## Каталог — 13 категорій

| Категорія | Slug | Товарів |
|---|---|---|
| Клапани і приводи | `klapany` | 28 |
| TERMOJET BOX | `termojet-box` | 5 |
| Автоматика котлів | `avtomatyka` | 4 |
| Колектори підлогового опалення | `kolektory-pidloha` | 8 |
| Насоси | `nasosy` | 37 |
| Насосні групи | `nasosni-hrupy` | 18 |
| Гідравлічні роздільники | `hidravlichni-rozdilnyky` | 5 |
| Розподільчі колектори | `rozpodilchi-kolektory` | 48 |
| Сепаратори | `separatory` | 16 |
| TERMOJET Mega | `termojet-mega` | 24 |
| TERMOJET Mini | `termojet-mini` | 12 |
| Балансувальні клапани | `balansuval-klapany` | 3 |
| Додаткове обладнання | `dodatkove` | 7 |

**Разом: ~215 товарів** — потребують перенесення зі старого сайту через адмінку.

---

## Глобальний стан (AppContext)

`src/context/AppContext.jsx` зберігає:

```js
lang             // поточна мова, localStorage 'tj2_lang'
products         // каталог товарів
cart             // кошик, localStorage 'tj2_cart'
orders           // замовлення
consultations    // запити на консультацію
dealers          // заявки дилерів
reviews          // відгуки
blog             // статті блогу
portfolio        // реалізовані проекти
faq              // питання та відповіді
files            // документи
banners          // банери
siteSettings     // телефон, email, адреса, пароль адміна
isAdminAuth      // авторизація адміна, sessionStorage 'tj2_admin'
```

### Методи кошика
```js
addToCart(product, quantity)
removeFromCart(id)
updateCartQuantity(id, quantity)
clearCart()
cartTotal   // сума в грн
cartCount   // кількість позицій
```

### Методи форм
```js
placeOrder(data)          // замовлення → orders + очищення кошика
sendConsultation(data)    // запит → consultations
sendDealerRequest(data)   // заявка дилера → dealers
```

---

## Адмін-панель

**URL:** `/admin`  
**Пароль:** `termojet2024`

### Розділи

| Розділ | Функціонал |
|---|---|
| Dashboard | Статистика (товари, замовлення, консультації, дилери) |
| Товари | CRUD: назва, артикул, ціна, категорія, фото, опис, характеристики (key-value), наявність |
| Замовлення | Перегляд, зміна статусу (новий / в обробці / виконано / скасовано) |
| Консультації | Перегляд запитів |
| Дилери | Перегляд заявок на партнерство |
| Блог | CRUD статей, перемикач "опублікована / чернетка" |
| Портфоліо | CRUD проектів (назва, локація, рік, потужність, фото) |
| Документи | Додавання / видалення PDF файлів |
| Відгуки | CRUD відгуків з рейтингом 1–5 зірок |
| Налаштування | Контакти сайту, зміна пароля адміна |

---

## Деплой — GitHub Pages

### Автоматичний (рекомендований)
Кожен `git push` в гілку `main` автоматично запускає збірку і деплой.

```bash
git add -A
git commit -m "Опис змін"
git push
```

GitHub Actions збирає проект командою:
```bash
VITE_BASE_URL=/termojet-website/ npm run build
```

### Ручний (локально)
```bash
npm run build:ghpages   # збірка для GitHub Pages
# або
npm run build:prod      # збірка для власного хостингу (VITE_BASE_URL=/)
```

### Dev сервер
```bash
npm run dev
# Доступно: https://5173--main--projects--user.coder.brobots.org.ua/termojet-website/
```

---

## PHP бекенд (для майбутнього деплою на хостинг)

Коли сайт буде переїздити на `termojet.com.ua`, потрібно:

1. Зібрати продакшн білд: `VITE_BASE_URL=/ npm run build:prod`
2. Задеплоїти `dist/` на хостинг через SFTP
3. Задеплоїти PHP файли з `public_html/` (API endpoints)
4. Налаштувати `private/state.json` з початковими даними

### API endpoints (створити за шаблоном tjheatpump)
```
api-products.php      # CRUD товарів
api-orders.php        # прийом замовлень
api-consultations.php # запити на консультацію
api-dealers.php       # заявки дилерів
api-state.php         # весь контент (blog, reviews, portfolio, тощо)
api-upload.php        # завантаження зображень
```

---

## Наступні кроки

### Пріоритет 1 — Контент (зробити зараз)
- [ ] Перенести ~215 товарів зі старого сайту через адмінку `/admin/products`
- [ ] Додати фото виробництва на сторінку "Про компанію"
- [ ] Завантажити PDF каталоги через `/admin/files`
- [ ] Додати реалізовані проекти через `/admin/portfolio`
- [ ] Написати 3–5 статей для блогу

### Пріоритет 2 — Доопрацювання
- [ ] Сторінка Сервіс (`/service`) — повноцінний контент
- [ ] Сторінка Доставка і оплата (`/delivery`)
- [ ] Відгуки на головній (секція з ReviewsSection)
- [ ] Картка товару: zoom фото, slider кількох фото
- [ ] Мобільна нижня навігація

### Пріоритет 3 — Переїзд на хостинг
- [ ] Отримати SFTP доступ до termojet.com.ua
- [ ] Написати PHP бекенд (api-*.php)
- [ ] Деплой на основний домен
- [ ] Налаштувати Telegram-сповіщення для замовлень

---

*Документ оновлено: 2026-05-07*
