# Деплой на Hetzner VPS

## Перший деплой

```bash
# 1. Підключись до сервера
ssh root@<IP>

# 2. Клонуй репозиторій
cd /root
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

## Оновлення сайту

```bash
cd /root/termojet-website
git pull
docker compose up -d --build
```

---

## Важливо

- `data/termojet.db` — SQLite база з усіма продуктами, замовленнями тощо
- `uploads/` — завантажені фото
- Обидва директорії монтуються як volumes — **не видаляються при оновленні**
- При першому запуску автоматично seed-уються 284 продукти
