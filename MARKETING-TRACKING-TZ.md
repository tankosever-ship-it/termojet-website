# ТЗ для маркетолога — аналітика та трекінг termojet.com.ua

**Сайт:** https://termojet.com.ua
**GTM-контейнер:** `GTM-TC9RFNLP`
**Дата підготовки:** 24.06.2026
**Підготував:** команда розробки

---

## 1. Коротко

Сайт **технічно підготовлено** до повноцінного маркетингового трекінгу:

- встановлено **Google Tag Manager** (контейнер `GTM-TC9RFNLP`);
- реалізовано всі **GA4 e-commerce події** в `dataLayer` (перегляд товару, додавання в кошик, оформлення, покупка тощо);
- налаштовано **прийом і збереження UTM-міток** з усіх форм + **таблиця лідів за UTM в адмінці** з експортом у CSV;
- створено **товарний фід для Google Shopping** (динамічний, з цінами в UAH).

**Що лишилось маркетологу:** створити/підключити ресурс **GA4**, налаштувати **теги в GTM**, позначити **конверсії** та зібрати **аудиторії для ремаркетингу**. Деталі — у розділах 4–5.

---

## 2. Потрібні доступи

| Сервіс | Навіщо | Статус |
|---|---|---|
| **Google Tag Manager** (контейнер `GTM-TC9RFNLP`) | Налаштування тегів GA4 | потрібен доступ Edit/Publish |
| **Google Analytics 4** (ресурс + Measurement ID `G-…`) | Збір і звіти | створити ресурс або надати доступ |
| **Адмінка** termojet.com.ua/admin → «UTM-джерела» | Таблиця лідів за UTM | вже працює, потрібен логін |
| **Google Ads** (опційно) | Ремаркетинг, імпорт конверсій | за потреби |
| **Google Merchant Center** | Товарний фід для Shopping (фід уже готовий) | створити акаунт + підключити фід |

> ⚠️ **Важливо не плутати:** теги налаштовуються в **Google Tag Manager**, а **не** в Google Merchant Center. Merchant Center — це лише товарний фід для Shopping-реклами.

---

## 3. Що ВЖЕ ЗРОБЛЕНО (на стороні сайту)

### 3.1. Встановлено Google Tag Manager
Контейнер `GTM-TC9RFNLP` вставлено на всі сторінки сайту (у `<head>` та одразу після `<body>`). Окремо налаштовувати на сайті більше нічого не треба.

### 3.2. GA4 e-commerce події в `dataLayer`
Сайт автоматично надсилає в `dataLayer` стандартні події GA4 Ecommerce. Формат: спершу скидається попередній стан (`ecommerce: null`), потім надсилається подія з даними товарів.

| Подія | Коли спрацьовує |
|---|---|
| `view_item` | Відкриття сторінки товару |
| `add_to_cart` | Додавання товару в кошик (з будь-якого місця сайту) |
| `remove_from_cart` | Видалення товару з кошика |
| `begin_checkout` | Відкриття кошика / початок оформлення |
| `purchase` | Успішне оформлення замовлення (з унікальним `transaction_id`) |

У кожній події передаються дані товару: `item_name`, `item_id` (артикул), `price`, `item_brand`, `item_category`, `item_category2`, `quantity`. Подія `purchase` додатково містить `transaction_id`, `value`, `currency` (UAH), `tax`, `shipping`, `affiliation`.

> Повні приклади структури кожної події — у Додатку А.

### 3.3. UTM-мітки
- **Прийом і збереження UTM працює:** коли користувач заходить за посиланням з мітками (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`), вони зберігаються і **прикріплюються до кожної заявки** — замовлення, консультації, заявки дилера.
- **Таблиця в адмінці:** розділ **Адмінка → «UTM-джерела»** (`/admin/utm`) — список усіх лідів з колонками: дата, тип, контакт, source / medium / campaign / term / content. Є пошук, фільтр «тільки з UTM» та **експорт у CSV** для ремаркетингу.
- UTM також летять у CRM і Telegram разом із заявкою.

### 3.4. Фід товарів для Google Shopping
Створено **динамічні XML-фіди** для Google Merchant Center (по ~326 товарів кожен, оновлюються **автоматично** з бази сайту — завжди актуальні ціни й наявність):

| Мова | Адреса фіду |
|---|---|
| Українська | `https://termojet.com.ua/google-merchant.xml` |
| English | `https://termojet.com.ua/google-merchant-en.xml` |
| Polski | `https://termojet.com.ua/google-merchant-pl.xml` |
| Deutsch | `https://termojet.com.ua/google-merchant-de.xml` |
| Français | `https://termojet.com.ua/google-merchant-fr.xml` |

- **Усі ціни в UAH:** товари в EUR конвертуються за курсом **НБУ + 2.2%** (як на сайті).
- Назви/описи/категорії — відповідною мовою фіду; артикули, ціни й посилання однакові.
- Кожен товар містить поля Google: `id`, `title`, `description`, `link`, `image_link`, `availability`, `price` (UAH), `condition` (new), `brand` (Termojet), `mpn` (артикул), **`google_product_category`** (числовий ID таксономії Google по категорії), `product_type` (категорія).

Окремо генерувати чи завантажувати файли не треба — Merchant Center сам забиратиме фід за розкладом. Для кампаній іншими мовами/країнами підключіть відповідний мовний фід.

### 3.5. Лого по мовах *(довідково)*
Для версій сайту EN/PL/DE/FR показується англомовне лого «boiler room equipment», для української — українське. На трекінг не впливає.

---

## 4. Що ПОТРІБНО ЗРОБИТИ маркетологу

### 4.1. Створити / підключити GA4
1. У Google Analytics створити **GA4-ресурс** для termojet.com.ua (якщо ще немає).
2. Створити **потік даних (Web)** → отримати **Measurement ID** формату `G-XXXXXXXXXX`.

### 4.2. Налаштувати теги в GTM (контейнер `GTM-TC9RFNLP`)
1. **Базовий тег:** створити **Google Tag (GA4 Configuration)** з вашим `G-…`, тригер **All Pages**.
2. **5 тегів GA4 Event** — по одному на кожну подію (`view_item`, `add_to_cart`, `remove_from_cart`, `begin_checkout`, `purchase`):
   - Event Name = назва події (точно як у списку 3.2);
   - увімкнути **More Settings → Ecommerce → Send Ecommerce data → Data source: Data Layer**.
3. **5 тригерів Custom Event** — по одному на кожну подію (Event name = назва події).
4. **Перевірити в Preview** (Tag Assistant): відкрити товар, додати в кошик, оформити замовлення — переконатися, що події спрацьовують і тягнуть дані товару.
5. **Опублікувати** контейнер (Submit / Publish).

> Розробник може надати **готовий експорт GTM-контейнера** (JSON з усіма тегами) для імпорту — потрібен лише ваш `G-…`.

### 4.3. Конверсії та аудиторії в GA4
1. Позначити **key events (конверсії):** `purchase`, `begin_checkout` (за потреби — `add_to_cart`, заявки на консультацію).
2. Зібрати **аудиторії для ремаркетингу:**
   - переглянули товар, але не додали в кошик;
   - додали в кошик, але не оформили;
   - почали оформлення (`begin_checkout`), але не купили;
   - покупці (для виключення / look-alike).

### 4.4. Google Merchant Center + Shopping
Фід уже готовий (п. 3.4). Маркетологу:
1. Створити акаунт **Google Merchant Center** для termojet.com.ua.
2. Підтвердити право власності на сайт (через GTM/GA4 або метатег/файл).
3. **Products → Feeds → додати фід** типу *Scheduled fetch* з URL: `https://termojet.com.ua/google-merchant.xml`. Виставити щоденне оновлення, країна — Україна, валюта — UAH, мова — українська.
4. Дочекатися перевірки товарів, виправити можливі попередження (напр. відсутні GTIN — для власного виробництва це нормально: бренд + MPN/артикул уже передаються).
5. Зв'язати Merchant Center ↔ **Google Ads** і запустити **Shopping / Performance Max** кампанії.

### 4.5. Google Ads / ремаркетинг (за потреби)
1. Зв'язати **GA4 ↔ Google Ads**.
2. Імпортувати конверсії з GA4 у Google Ads.
3. Підключити ремаркетинг-аудиторії з п. 4.3.

### 4.6. Єдиний стандарт UTM-розмітки кампаній
Щоб таблиця в адмінці й звіти GA4 були чистими — використовувати єдині назви міток у **всіх** кампаніях. Рекомендований формат:

```
?utm_source=facebook&utm_medium=cpc&utm_campaign=nasosni-grupy-zyma&utm_content=banner-1
```

| Параметр | Що писати | Приклади |
|---|---|---|
| `utm_source` | майданчик | `google`, `facebook`, `instagram`, `telegram`, `email` |
| `utm_medium` | тип трафіку | `cpc`, `social`, `email`, `banner`, `organic` |
| `utm_campaign` | назва кампанії | `nasosni-grupy-zyma`, `chorna-pyatnycia` |
| `utm_term` | ключове слово (для пошукових) | `насосна-група` |
| `utm_content` | варіант оголошення/банера | `banner-1`, `text-a` |

> Писати **малими латинськими літерами без пробілів** (пробіли → дефіси), щоб однакові джерела не дублювалися.

---

## 5. Контрольний чеклист

- [ ] Створено GA4-ресурс, є Measurement ID `G-…`
- [ ] Надано доступ до GTM-контейнера `GTM-TC9RFNLP`
- [ ] У GTM створено базовий Google Tag (GA4) на All Pages
- [ ] У GTM створено 5 тегів GA4 Event + 5 тригерів Custom Event (з Ecommerce: Data Layer)
- [ ] Перевірено в Preview, що всі 5 подій спрацьовують з даними товарів
- [ ] Контейнер GTM опубліковано
- [ ] У GA4 позначено конверсії (purchase, begin_checkout, …)
- [ ] Створено аудиторії для ремаркетингу
- [ ] Створено Merchant Center, підключено фід `https://termojet.com.ua/google-merchant.xml`, товари пройшли перевірку
- [ ] (Опц.) Зв'язано GA4 ↔ Google Ads, імпортовано конверсії, запущено Shopping
- [ ] Затверджено єдиний стандарт UTM-розмітки для кампаній

---

## Додаток А. Структура подій у `dataLayer` (довідка для налаштування GTM)

> Це **приклади** того, що сайт надсилає. У реальних подіях підставляються актуальні дані товару.

**Перегляд товару:**
```js
dataLayer.push({ ecommerce: null });
dataLayer.push({
  event: "view_item",
  ecommerce: { items: [{
    item_name: "Насосна група Termojet з термокраном 25-55 1\" ВР НГ-46",
    item_id: "84300460",
    price: 11797.18,
    item_brand: "Termojet",
    item_category: "Насосні групи",
    item_category2: "..."
  }]}
});
```

**Додавання в кошик** — `event: "add_to_cart"`, той самий `items` + `quantity`.
**Видалення з кошика** — `event: "remove_from_cart"`, той самий формат.
**Початок оформлення** — `event: "begin_checkout"`, `items` = всі товари кошика.

**Покупка:**
```js
dataLayer.push({ ecommerce: null });
dataLayer.push({
  event: "purchase",
  ecommerce: {
    transaction_id: "1234",   // номер замовлення
    affiliation: "cart",
    value: 326244,
    tax: "0",
    shipping: "0",
    currency: "UAH",
    items: [{ item_name: "...", item_id: "...", price: 326244, item_brand: "Termojet",
              item_category: "...", item_category2: "...", quantity: 1 }]
  }
});
```

---

## Контакти
Питання по технічній частині (сайт, dataLayer, доступи) — до команди розробки.
