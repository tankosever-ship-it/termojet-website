# Canonical + hreflang (5 мов) + блоки головної/about

**Дата:** 19.08.2026
**Джерело:** фідбек SEO-команди (canonical, hreflang, блоки контенту на скрінах).
**Статус:** реалізовано, задеплоєно на прод, протестовано (412/412).
**Коміти:** `06fc6b6` (canonical+hreflang), `9c3f1df` (блоки home/about).

---

## Що просили

1. **Canonical** — на всіх сторінках був `https://termojet.com.ua/`. Треба self-referencing: canonical = власний URL сторінки (і для інших мов).
2. **Hreflang** — було лише uk + en. Додати pl, fr, de.
3. **Блоки** (зі скрінів) — додати контентні блоки головної та `/about` у видимий для краулерів HTML.

---

## Що зроблено

### 1. Self-canonical (усі мови)
Раніше серверна SEO-логіка обробляла лише **uk + en**; сторінки `/pl /fr /de` не проходили через ін'єкт і отримували статичний canonical головної з `index.html`. Тепер сервер визначає мову за префіксом URL і ставить **canonical = власний URL** кожною мовою.

| Сторінка | canonical |
|---|---|
| `/catalog/termojet-box/modul-…km3-ups` | той самий URL |
| `/pl/catalog/…km3-ups` | `…/pl/catalog/…km3-ups` |
| `/de/catalog/…km3-ups` | `…/de/catalog/…km3-ups` |

### 2. Hreflang — 5 мов + x-default
На **кожній** сторінці:
```html
<link rel="alternate" hreflang="uk" href="https://termojet.com.ua/…" />
<link rel="alternate" hreflang="en" href="https://termojet.com.ua/en/…" />
<link rel="alternate" hreflang="pl" href="https://termojet.com.ua/pl/…" />
<link rel="alternate" hreflang="fr" href="https://termojet.com.ua/fr/…" />
<link rel="alternate" hreflang="de" href="https://termojet.com.ua/de/…" />
<link rel="alternate" hreflang="x-default" href="https://termojet.com.ua/…" />
```
`x-default` → українська (основний ринок). Усі 331 товари мають повний переклад en/pl/fr/de в БД, тому pl/fr/de-сторінки — реальний локалізований контент.

**Бонус-фікс:** `<title>` на іншомовних товарах був українським (у i18n товарів немає `seo_title` → фолбек на укр). Тепер title/H1 тією ж мовою, що й сторінка.

### 3. Блоки головної та /about
У видимому для краулерів HTML (`#seo-content`) додано:
- **Головна:** «Termojet у цифрах» (показники) + «Чому обирають Termojet» (6 переваг).
- **/about:** «Юридичні реквізити» (ТОВ «Софіївка Монтаж», адреса, email) + таймлайн «22 роки розвитку» (2002–2024).

---

## Тестування (прод, 412 перевірок, 0 помилок)

| Pass | Перевірка | Результат |
|---|---|---|
| **A** | canonical(self) + hreflang×6 + title×1 + seo-content + 1×H1 — 9 типів сторінок × 5 мов | 315/315 ✅ |
| **B** | Product JSON-LD `priceCurrency:UAH` (без EUR) + x-default→uk + блоки home/about + 404 | 29/29 ✅ |
| **C** | Rendered-DOM: React монтується, `#seo-content` прибирається, 1×H1, без білого екрана / помилок | 13/13 ✅ |
| **D** | Дедуп meta (description / og:title / og:url / twitter:title = 1) + Organization на всіх | 55/55 ✅ |

**Типи сторінок у пасі A:** головна, каталог, категорія, товар, блог, FAQ, про нас, сервіс, контакти — кожен × uk/en/pl/fr/de.

**Примітка:** у пасі C сторінка товару (uk) спершу дала h1=0 — це таймінг завантаження 3D-вьювера; при повному завантаженні (networkidle) h1=1 стабільно (3/3). Не дефект.

---

## Як перевірити (для SEO-команди)
- **Canonical/hreflang:** GSC → Перевірка URL → «Переглянути проскановану сторінку» (HTML), або `curl` будь-якої мовної версії — тег canonical = власний URL, 6 hreflang.
- **Блоки:** відкрити головну/`/about` з вимкненим JS — видно цифри, переваги, реквізити, таймлайн.

---

## Залишок (окрема задача, за потреби)
- Назви **категорій** і **статичні сторінки** для pl/fr/de показуються **англійською** (у БД немає pl/fr/de-перекладів міток категорій — `CATEGORY_META`/`STATIC_META` мають лише uk+en). Товари ж повністю локалізовані 5 мовами.
- **Блог** не перекладений (0 i18n у статтях) → pl/fr/de блог показує український текст.
Обидва — контентні задачі (переклад), не технічні. Технічні SEO-сигнали (canonical/hreflang/розмітка) коректні на всіх мовах уже зараз.
