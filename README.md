# Termojet Website

Корпоративний сайт-магазин **termojet.com.ua** — обладнання для котелень (насосні групи, колектори, теплові насоси, автоматика).

- **Фронт:** React + Vite (SPA, 5 мов: UA/EN/PL/FR/DE)
- **Бекенд:** Node.js + Express + SQLite (`better-sqlite3`)
- **Хостинг:** Hetzner, Docker Compose, nginx + Let's Encrypt
- **Інтеграції:** Telegram (заявки/замовлення), CRM, Нова Пошта, GA4/GTM, Resend (лист клієнту), Binotel

---

## 🚀 Деплой

```bash
ssh hetzner
cd /home/tankoseva/termojet-website
git pull && docker compose up -d --build
```

БД-міграції та сідинг запускаються автоматично на старті контейнера (ідемпотентні). Детально — [`DEPLOY.md`](DEPLOY.md).

> ⚠️ **Після ре-імпорту товарів (1С/WP)** ганяти `scripts/seo-fix-titles.cjs` — імпорт стирає дедуп `seo_title`.

---

## 🕒 Останні зміни (липень 2026)

> Повний журнал з деталями й хешами комітів — [**CHANGELOG.md**](CHANGELOG.md).

**Сесія 2026-07-10 (веч.) — функціонал і моб-UX:**
- 🩹 **Замовлення в Telegram** — виправлено суму/кількість (`quantity`, не `qty`); EUR-товари конвертуються в грн за курсом НБУ.
- ✨ **Лист-підтвердження клієнту** — через Resend (домен верифіковано), брендований оранжевий шаблон, `reply_to` на пошту магазину.
- 🧹 **Чистка «(Копировать)»** — прибрано з назви (5 мов)/слага насоса APE 25/60/180 + перехресні лінки; старі URL → 301.
- ✨ **Обкладинка каталогу** — банер-шоурум на `/catalog`.
- 🩹✨ **/portfolio** — відновлено зниклі проекти (фолбек + БД-сідинг, self-heal), керування в адмінці (тип об'єкту).
- 🩹 **Моб: подвійний тап** — категорії/сторінки тепер відкриваються з 1 тапу (`canHover()` gating); фікс лічильника кошика.

**Раніше (SEO-сесії 07–10.07):** структуровані дані (Product/Breadcrumb/FAQ/Article), дедуп title, сторінка `/reviews`, ре-аудит SquirrelScan **73→81 (grade B)**. Деталі — [`docs/SEO-PLAN.md`](docs/SEO-PLAN.md).

---

## 📚 Документація

| Файл | Про що |
|---|---|
| [`CHANGELOG.md`](CHANGELOG.md) | Журнал усіх змін по сесіях (логи + правки) |
| [`DEPLOY.md`](DEPLOY.md) | Деплой, БД-скрипти, ре-імпорт |
| [`docs/SEO-PLAN.md`](docs/SEO-PLAN.md) | SEO-план і статус пунктів |
| [`docs/I18N_BACKEND_PLAN.md`](docs/I18N_BACKEND_PLAN.md) | i18n-шар бекенду |
| [`docs/GSC-instrukciya.md`](docs/GSC-instrukciya.md) | Google Search Console |
