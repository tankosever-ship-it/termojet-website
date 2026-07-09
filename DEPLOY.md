# Деплой на Hetzner VPS

## Перший деплой

```bash
# 1. Підключись до сервера
ssh hetzner            # аліас у ~/.ssh/config → root@49.13.154.30 (ключ .hetzner_key)

# 2. Клонуй репозиторій (live-каталог — /home/tankoseva)
cd /home/tankoseva
git clone https://github.com/tankosever-ship-it/termojet-website.git
cd termojet-website

# 3. Створи директорії для даних (будуть монтуватись як volume)
mkdir -p data uploads

# 4. Запусти
docker compose up -d --build
```

Сайт буде доступний на `http://<IP>:3000`

---

## Домен і HTTPS (продакшн — налаштовано 2026-06-10)

Сайт працює на **https://termojet.com.ua** (переїхав зі старого WordPress).

### Хто за що відповідає
| Рівень | Де | Деталі |
|---|---|---|
| **Домен + DNS** | **ukrnames.com** (домен #352670) | NS: `ns1/ns2/ns3.ukrnames.com` |
| **Хостинг сайту** | **Hetzner VPS** `49.13.154.30` | Docker + nginx |
| **Старий сайт (WordPress)** | Hvosting `91.225.138.216` | ❌ не використовується; тримати **до повного дзеркалення фото**, далі можна вимкнути |

### DNS-записи в ukrnames
| Запис | Значення |
|---|---|
| `A` @ (termojet.com.ua) | `49.13.154.30` |
| `A` www | `49.13.154.30` |
| `TXT` | верифікації Google + Facebook (не чіпати) |
| `MX` | **немає** — корпоративної пошти на домені нема (можна додати пізніше) |

> Відкат: повернути обидва A-записи на `91.225.138.216` → за хвилини знову старий сайт.

### Nginx (на сервері)
Конфіг: `/etc/nginx/sites-available/termojet` (симлінк у `sites-enabled/`). Проксує на
Docker-контейнер, що слухає `127.0.0.1:8080`:
- `termojet.com.ua` (443) → `proxy_pass http://127.0.0.1:8080` (Express роздає DIST + /api + /uploads)
- `www.termojet.com.ua` (443) → 301 на без-www (канонічний домен без www)
- порт 80 → 301 на https

> Express усередині контейнера сам ставить CSP/безпекові заголовки, gzip-роздачу 3D і
> 280 WP→React 301-редиректів — тому nginx тут **чистий проксі** (без свого gzip/заголовків).

### ⚠️ Старі WordPress-зображення (`/wp-content/`) — КРИТИЧНО
У даних товарів/категорій **626 посилань (365 унікальних фото)** на абсолютні URL
`https://termojet.com.ua/wp-content/uploads/...`. Поки домен був на старому WP — вони
вантажились звідти. Після переїзду домен → Hetzner, де `wp-content` немає → **усі ці фото
ламались (404)**.

**Рішення (на рівні nginx, без зміни коду):**
1. **Локальне дзеркало:** усі 365 фото завантажено в `/var/www/termojet-wp/wp-content/uploads/...`
   (93 МБ). Скачано зі старого хостингу через `curl --resolve termojet.com.ua:443:91.225.138.216`.
2. **nginx** у блоці `termojet.com.ua`:
   ```nginx
   location /wp-content/ {
       root /var/www/termojet-wp;
       try_files $uri @wp_old;   # спершу локальний файл, інакше — запасний проксі
       expires 30d;
   }
   location @wp_old {
       proxy_pass https://91.225.138.216;        # старий хостинг як fallback
       proxy_set_header Host termojet.com.ua;
       proxy_ssl_server_name on;
   }
   ```
   Тобто абсолютні `wp-content`-URL у даних **не переписували** — nginx віддає їх локально.
3. **Fallback** `@wp_old` страхує будь-який непокритий URL. Прибрати його можна лише
   **після** того, як старий хостинг вимкнемо і переконаємось, що всі фото в дзеркалі.

> Якщо додаються НОВІ товари зі старими wp-content фото — дозеркалити їх у `/var/www/termojet-wp/`.

### wp-content webp-оптимізація (налаштовано 2026-07-09)
Для швидкості віддаємо `.webp` браузерам, що підтримують (Accept: image/webp), інакше — оригінальний JPEG. Реальна економія ~48% (308КБ→161КБ), фолбек безпечний.
- **Згенеровані webp:** `.webp` лежить поряд із кожним фото в `/var/www/termojet-wp/wp-content/uploads` (адитивно, оригінали не чіпаються). Інструмент — `cwebp` (пакет `webp`).
- **nginx:** `map $http_accept $webp_suffix { default ""; "~*image/webp" ".webp"; }` у `/etc/nginx/conf.d/webp.conf`; у `location /wp-content/`: `try_files $uri$webp_suffix $uri @wp_old;` + `add_header Vary Accept;`. Бекап конфігу: `sites-available/termojet.bak.webp`.
- **Регенерація** (після додавання нових wp-content фото):
  ```bash
  find /var/www/termojet-wp/wp-content/uploads -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) ! -name '*.webp' \
    | while read f; do [ -f "$f.webp" ] || cwebp -quiet -q 82 "$f" -o "$f.webp"; done
  ```
  > Варто винести в cron / пост-деплой хук.

### SSL — Let's Encrypt
- Сертифікат: `/etc/letsencrypt/live/termojet.com.ua/` — покриває `termojet.com.ua` + `www`.
- **Автопродовження — автоматичне** (`authenticator = nginx`, HTTP-01). Перевірено
  `certbot renew --dry-run` ✅. TXT більше не потрібен.
- Первинна видача робилась через DNS-01 (бо домен ще був на старому хостингу): тимчасовий хук
  `/root/acme-dns-hook.sh` + TXT `_acme-challenge` в ukrnames. Лишається лише як довідка.

### Якщо колись знадобиться пошта
Пошта і сайт незалежні. Додаєш `MX`-записи в ukrnames + сервіс (Zoho/Google Workspace/
Microsoft 365/ukr.net) — сайт на Hetzner це не зачіпає.

---

## Інтеграція з CRM (ліди) — налаштовано 2026-06-11

Заявки з форм сайту (**Замовлення**, **Консультація**, **Дилер**) окрім запису в БД
і сповіщення в Telegram автоматично пересилаються в **Termojet CRM**
(`heat-pump-registration`) — сервер-до-сервера, fire-and-forget.

- **Код:** `backend/crm.js` (функція `notifyCRM`), викликається в
  `backend/routes/orders.js`, `consultations.js`, `dealers.js`.
- **Куди шле:** `POST https://crm.tjheatpump.com.ua/api/leads` (публічний, без авторизації).
- **Джерело ліда** видно в CRM у полі `source`: `termojet.com.ua · <Форма> · <utm_source>`;
  у `message` — деталі (склад кошика, місто/компанія, повний UTM).
- **Надійно:** якщо CRM недоступна — заявка все одно зберігається в БД сайту і йде в Telegram
  (помилка ковтається, таймаут 8 с). Користувача ніщо не блокує.

### ENV (необов'язкові — є робочі дефолти)
| Змінна | Призначення | Дефолт |
|---|---|---|
| `CRM_LEADS_URL` | ендпоінт прийому лідів CRM | `https://crm.tjheatpump.com.ua/api/leads` |
| `CRM_LEAD_SECRET` | спільний секрет → заголовок `X-Lead-Secret` (якщо CRM його вимагатиме) | порожньо |

> ⚠️ **Рейт-ліміт CRM:** `/api/leads` = **5 запитів/хв на IP**. Усі ліди сайту йдуть з одного
> IP сервера, тож сплеск (рекламна кампанія, 6+ заявок/хв) може впертись у `429`. Наразі лишено
> як є. Якщо стане проблемою — додати IP сайту у виняток ліміту на боці CRM (`server/src/index.ts`).

---

## Інтеграція з Binotel (вхідні дзвінки) — налаштовано 2026-07-01

Вхідні дзвінки з віртуальної АТС **Binotel** (зі сквозною аналітикою CallTracking)
створюють лід у **Termojet CRM** і сповіщення в Telegram — так само, як заявки з форм.

- **Код:** `backend/routes/binotel.js`, зареєстровано в `server.js`
  (`app.use('/api/webhooks/binotel', binotelLimiter, …)`, окремий rate-limit 120/хв).
  Реюзить `notifyLead` (`backend/telegram.js`) + `notifyCRM` (`backend/crm.js`).
- **Webhook-URL (метод API PUSH):** `https://termojet.com.ua/api/webhooks/binotel`.
  Налаштовує **підтримка Binotel** на своєму боці (лист на support@binotel.ua з пошти
  адміністратора АТС). CallTracking підключено на домені `tjheatpump.com.ua`.
- **Події Binotel** (поле `requestType`, усі на один URL):
  `receivedTheCall` → `answeredTheCall` → `hangupTheCall` (мінімальний, без `companyID`)
  → **`apiCallCompleted`** (фінал з `callDetails` + `callTrackingData`).
  Обробка: `receivedTheCall` → миттєвий Telegram «дзвонить зараз»; `answeredTheCall` і
  flat `hangupTheCall` → ігноруються; **`apiCallCompleted`** → лід + багата картка
  (`billsec>0` прийнятий, інакше ПРОПУЩЕНИЙ; `callType=1` вихідні — ігноруються).
- **Куди шле лід:** той самий `POST https://crm.tjheatpump.com.ua/api/leads` (`type:'call'`).
  Пропущений у CRM автоматично стає HIGH-задачею «Дзвінок клієнту».
- **Що в картці/ліді:** клієнт (`customerData.name`), сторінка дзвінка, час на сайті до
  дзвінка, перший візит, UTM, гео, IP, GA client/tracking ID, `binotel_id`, посилання на
  запис розмови, хто відповів.
- **Безпека** (Binotel запити НЕ підписує): приймаємо лише з IP серверів Binotel
  (`BINOTEL_ALLOWED_IPS`) + звірка `BINOTEL_COMPANY_ID`. ⚠️ Працює завдяки
  `trust proxy` = `['loopback','uniquelocal']` у `server.js` — інакше за nginx+Docker
  `req.ip` був би docker-gateway і allowlist відхиляв би ВСІ дзвінки.

### ENV (сервер `/home/tankoseva/termojet-website/.env`, gitignored — значення НЕ в репо)
| Змінна | Призначення |
|---|---|
| `BINOTEL_COMPANY_ID` | ID компанії Binotel (звірка вхідних; порожньо → без перевірки) |
| `BINOTEL_ALLOWED_IPS` | CSV IP серверів Binotel (allowlist; порожньо → без перевірки) |
| `BINOTEL_API_KEY` / `BINOTEL_API_SECRET` | доступ до REST Binotel (запис розмови тощо), на майбутнє |

> Реальні значення (Company ID, IP-адреси, key/secret) — у серверному `.env` та в листі-відповіді
> підтримки Binotel. Прокидаються в контейнер через `environment:` у `docker-compose.yml`.
> Плейсхолдери — у `.env.example`.

### Telegram-топіки (оновлено 2026-07-08)
Спільна група «Termojet Sales» `-1003809508040` — форум із топіками для обох сайтів:
- **Заявки форм** termojet → топік **169 🔵 Termojet** (`TELEGRAM_THREAD_ID`).
- **Дзвінки Binotel** → топік **168 TJ Heat Pumps** (`TELEGRAM_CALLS_THREAD_ID`) — колтрекінг стоїть на tjheatpump.com.ua. Порожньо → фолбек у топік форм.
- Топіки створює PHP на tjheatpump: `/tg-create-lead-topics.php?secret=<WEBHOOK_SECRET>`.

### Діагностика
- Роут логує кожну подію: `docker logs -f termojet-website-app-1 | grep binotel`
  (рядок `[binotel] <requestType> from <ip> ext=… disp=… bill=…`).
- Тест гейтів без фейкових лідів: `curl` на `http://127.0.0.1:8080/api/webhooks/binotel`
  з/без заголовка `X-Forwarded-For: <IP Binotel>` — чужий IP → `403 forbidden`,
  IP Binotel + чужа компанія → `403 wrong company`, вихідний (`callType:1`) → `200` без ліда.

## SEO: серверні метадані + мультимова (EN) — налаштовано 2026-07-09

Сайт — CSR React SPA, тож краулер без JS бачив би оболонку `index.html`. Тому `backend/server.js`
**серверно ін'єктить** правильні метадані в сирий HTML per-URL із БД (A+ підхід, не prerender/SSR).

- **Метадані:** `<title>` (seo_title), self-`canonical`, `<meta description>` (meta_description), og,
  H1+опис у `<noscript>` — для товарів (`/catalog/:cat/:slug`), категорій (`/catalog/:cat`, мапа
  `CATEGORY_META`), блогу (`/blog/:slug`), статичних (`STATIC_META`). Дані — з полів БД
  `seo_title`/`meta_description`/`i18n` (редагуються в адмінці; правки живуть у volume-БД, НЕ в seed).
- **Мультимова EN:** URL-префікс `/en/*` (фронтенд — дзеркало роутів під `PublicLayout`, `LangSync`,
  `LLink`/`localizedPath`). Бекенд ін'єктить EN-метадані з `i18n.en` (`pickLang`) + **hreflang**
  uk↔en+x-default. `express.static index:false` — щоб catch-all додав hreflang головній. Middleware
  legacy-редіректу 301-ить лише коли стрипнутий шлях є в `redirects.json` (чинні /en проходять).
  Додати мову (pl/de/fr) — той самий механізм (дані `i18n` готові).
- **Sitemap:** `public/sitemap.xml` генерує `scripts/gen-sitemap.cjs` з БД (UA+EN пари з `xhtml:hreflang`
  + `lastmod`, 768 URL). Скрипт стійкий до відсутності БД у Docker-builder (лишає закомічений sitemap).
  **Оновлення sitemap:** локально `node scripts/gen-sitemap.cjs` + коміт `public/sitemap.xml`.

> ⚠️ **Білд Hetzner мусить бути `VITE_BASE_URL=/`** (є в `Dockerfile` `build:prod`). Дефолт у
> `vite.config.js` = `/termojet-website/` (для GitHub Pages). Локально збирати теж `VITE_BASE_URL=/ npm run build`,
> інакше асети підуть на `/termojet-website/…` і React не стартує.

> Google Search Console: після змін сабмітнути `sitemap.xml` і запросити індексацію /en — див.
> `docs/GSC-instrukciya.md`. Повний журнал SEO-робіт — `docs/SEO-PLAN.md`.

## Оновлення сайту

Live-каталог на сервері — **`/home/tankoseva/termojet-website`** (git-checkout, tracking `origin/main`).
Флоу: локально `commit` → `git push origin main` → на сервері `git pull` + rebuild. Реальні
значення секретів — у `.env` поряд з compose (gitignored, у репо їх нема).

```bash
ssh hetzner            # аліас у ~/.ssh/config (49.13.154.30, ключ .hetzner_key)
cd /home/tankoseva/termojet-website
git pull
docker compose up -d --build
```

> ⚠️ `.github/workflows/deploy.yml` — це **GitHub Pages** (статичний фронт-мірор), а НЕ Hetzner.
> Push у `main` лише збирає статику на GH Pages; прод termojet.com.ua оновлюється тільки
> ручним `git pull` на сервері (кроки вище).

---

## Важливо

- `data/termojet.db` — SQLite база з усіма продуктами, замовленнями тощо
- `uploads/` — завантажені фото
- Обидва директорії монтуються як volumes — **не видаляються при оновленні**
- При першому запуску автоматично seed-уються 284 продукти
