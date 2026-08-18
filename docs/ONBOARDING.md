# ONBOARDING — локальне налаштування проєкту Termojet

> Цей файл — інструкція для Claude Code (або іншого розробника), щоб з нуля
> підняти сайт **termojet.com.ua** на локальному комп'ютері та зрозуміти, як
> викладати зміни на сервер.
>
> **Завдання для Claude Code:** прочитай весь файл, потім виконай кроки з
> розділів 2–4. Якщо чогось не вистачає (Node.js, Docker) — встанови або
> підкажи користувачу, як встановити.

---

## 1. Архітектура (прочитай перед стартом)

Проєкт складається з двох частин, які в продакшені працюють **разом на одному порту**:

- **Фронтенд** — React + Vite (папка `src/`, збірка йде в `dist/`).
- **Бекенд** — Node.js + Express + SQLite (папка `backend/`), віддає `/api/*`
  і роздає зібраний фронтенд із `dist/`.

**Критична деталь про API.** У `src/context/AppContext.jsx`:

```js
const IS_GITHUB_PAGES = import.meta.env.VITE_BASE_URL !== '/'
const API = IS_GITHUB_PAGES ? null : '/api'
```

Тобто фронтенд звертається до бекенду (`/api`) **лише коли `VITE_BASE_URL=/`**.
Без цієї змінної `base` за замовчуванням `/termojet-website/` (режим GitHub Pages),
`API` стає `null` і сайт працює в демо-режимі **без бекенду**.
👉 Для повноцінної локальної розробки з бекендом завжди став `VITE_BASE_URL=/`.

**Дані (база і фото) НЕ в git.** `data/`, `backend/data/`, `uploads/` — у `.gitignore`.
Локальна база SQLite створюється автоматично при першому запуску бекенду
і сидиться 284 товарами з `backend/seed-products.json`. Копія робочої бази не потрібна.

---

## 2. Передумови

Встанови, якщо немає:

- **Node.js 20+** (включає npm) — https://nodejs.org
- **Git**
- (опційно) **Docker Desktop** — якщо хочеш запускати точно як на сервері

Перевірка:

```bash
node -v
npm -v
git --version
```

---

## 3. Отримати код і встановити залежності

```bash
# 1. Клонувати репозиторій (тебе вже додали співавтором)
git clone https://github.com/tankosever-ship-it/termojet-website.git
cd termojet-website

# 2. Залежності фронтенду
npm install

# 3. Залежності бекенду
cd backend && npm install && cd ..
```

---

## 4. Запустити локально

Є три способи. **Спосіб A** — рекомендований для активного редагування коду
(гаряче перезавантаження). Спосіб B — найпростіший «як на сервері». Спосіб C — Docker.

### Спосіб A — розробка з hot reload (рекомендовано)

Потрібні **два термінали**.

**Термінал 1 — бекенд** (порт 3000, авто-перезапуск):
```bash
cd backend
npm run dev
```

**Термінал 2 — фронтенд** (порт 5173, з увімкненим API):
```bash
VITE_BASE_URL=/ npm run dev
```

⚠️ Щоб запити `/api` із Vite (5173) доходили до бекенду (3000), у `vite.config.js`
має бути proxy. Якщо його немає — додай у блок `server`:

```js
server: {
  host: '::',
  port: 5173,
  strictPort: true,
  allowedHosts: true,
  proxy: {
    '/api': 'http://localhost:3000',
    '/uploads': 'http://localhost:3000',
  },
},
```

Відкрий: **http://localhost:5173**
Адмін-панель: **http://localhost:5173/admin** (стандартний пароль `termojet2024`).

> ⚠️ proxy в `vite.config.js` впливає лише на dev, на продакшн-збірку — ні.
> Але це зміна у відстежуваному файлі: **не комітити випадково**, якщо не плануєш.

### Спосіб B — як на сервері (без hot reload)

Один порт, точна копія поведінки продакшену. Після кожної зміни фронтенду —
перезбірка.

```bash
VITE_BASE_URL=/ npm run build      # зібрати фронтенд із увімкненим API
cd backend && npm run dev          # бекенд віддає dist/ + /api на :3000
```

Відкрий: **http://localhost:3000**

### Спосіб C — Docker (ідентично серверу)

```bash
docker compose up -d --build
```

Відкрий: **http://localhost:8080** (у `docker-compose.yml` маппінг `8080:3000`).

---

## 5. Збірки (build) — який скрипт коли

З `package.json`:

| Команда | Призначення | `base` | API |
|---|---|---|---|
| `npm run build:prod` | продакшн на свій домен (Hetzner) | `/` | ✅ увімкнено |
| `npm run build:ghpages` | GitHub Pages | `/termojet-website/` | ❌ вимкнено |
| `npm run build` | дефолт | `/termojet-website/` | ❌ |

Для живого сайту termojet.com.ua використовується **`build:prod`** (його запускає
Docker під час деплою).

---

## 6. Деплой на живий сайт (Hetzner)

Сервер — на акаунті Hetzner (власник: чоловік). Сайт крутиться в Docker.
Процес оновлення:

```bash
# 1. Закомітити й запушити зміни в GitHub
git add -A
git commit -m "опис змін"
git push origin main

# 2. Зайти на сервер
ssh hetzner            # або ssh root@<IP>

# 3. Оновити і перезібрати контейнер
cd termojet-website    # ⚠️ уточни реальний шлях: /root/... або /home/tankoseva/...
git pull && docker compose up -d --build
```

База даних і завантажені фото змонтовані як Docker volumes (`data/`, `uploads/`)
і **не зачіпаються** при оновленні коду.

> Шлях до репозиторію на сервері уточни командою на самому сервері
> (`DEPLOY.md` згадує `/root/termojet-website`, в інших нотатках — `/home/tankoseva/...`).

---

## 7. Корисні файли в репозиторії

- `DEPLOY.md` — деталі першого деплою та nginx/HTTPS
- `PROJECT.md`, `PLAN.md` — опис проєкту та план
- `CHANGELOG.md` — історія змін
- `backend/seed-products.json` — початкові 284 товари для бази
- `backend/routes/` — усі API-ендпоінти

---

## 8. Швидкий чекліст для старту

- [ ] Встановлено Node.js 20+ і Git
- [ ] `git clone` репозиторію
- [ ] `npm install` у корені + у `backend/`
- [ ] Доданий proxy у `vite.config.js` (для Способу A)
- [ ] Запущено бекенд (`cd backend && npm run dev`)
- [ ] Запущено фронтенд (`VITE_BASE_URL=/ npm run dev`)
- [ ] Сайт відкривається на http://localhost:5173
