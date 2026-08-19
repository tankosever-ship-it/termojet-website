// Portfolio / реалізовані об'єкти для PortfolioPage.
// Реальні фото об'єктів — public/images/portfolio/proj-N.jpg (оптимізовані, у git).
// links[] — SEO-перелінковка: { label, url, ext? } (ext=true → зовнішнє посилання, напр. tjheatpump.com.ua).
import { PORTFOLIO_I18N } from './portfolioI18n'

const HEATPUMP = 'https://tjheatpump.com.ua/'

const RAW = [
  {
    id: 1,
    title: 'Колектор Termojet MEGA та насосні групи — виробниче приміщення',
    location: 'Київська область',
    type: 'Виробництво',
    year: 2025,
    desc: 'Оснащення виробничого приміщення колекторною системою Termojet MEGA з насосними групами та енергозберігаючими насосами Termojet APM-F. Рішення забезпечує рівномірний розподіл тепла по контурах і мінімальне споживання електроенергії на циркуляцію.',
    image: '/images/portfolio/proj-1.jpg',
    images: ['/images/portfolio/proj-1.jpg'],
    links: [
      { label: 'Система Termojet MEGA', url: '/catalog/termojet-mega' },
      { label: 'Насоси Termojet APM-F', url: '/catalog/nasosy/nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-40-15f-250-mm' },
      { label: 'Насосні групи', url: '/catalog/nasosni-hrupy' },
    ],
  },
  {
    id: 2,
    title: 'Котельня з тепловим насосом Termojet Hi Master 13 кВт',
    location: 'Київська область',
    type: 'Приватний будинок',
    power: '13 кВт',
    year: 2025,
    desc: 'Котельня приватного будинку на тепловому насосі Termojet Hi Master 13 кВт із буферною ємністю та бойлером непрямого нагріву Termojet. Обв\'язка виконана на системі швидкого монтажу Termojet — компактно, акуратно та з мінімальними тепловтратами.',
    image: '/images/portfolio/proj-2.jpg',
    images: ['/images/portfolio/proj-2.jpg'],
    links: [
      { label: 'Тепловий насос Termojet Hi Master', url: HEATPUMP, ext: true },
      { label: 'Насосні групи', url: '/catalog/nasosni-hrupy' },
      { label: 'Гідравлічні розділювачі', url: '/catalog/hidravlichni-rozdilnyky' },
    ],
  },
  {
    id: 3,
    title: 'Адмінбудівля: каскад із трьох теплових насосів Suntide 20 кВт',
    location: 'Містечко Хансена, Київська область',
    type: 'Адмінбудівля',
    power: '60 кВт',
    year: 2025,
    desc: 'Адміністративна будівля на каскаді з трьох теплових насосів Suntide по 20 кВт із буферними ємностями. Розподіл тепла — через систему швидкого монтажу Termojet з енергозберігаючими насосами та автоматикою керування контурами.',
    image: '/images/portfolio/proj-3.jpg',
    images: ['/images/portfolio/proj-3.jpg'],
    links: [
      { label: 'Теплові насоси Suntide', url: HEATPUMP, ext: true },
      { label: 'Енергозберігаючі насоси', url: '/catalog/nasosy' },
      { label: 'Автоматика', url: '/catalog/avtomatyka' },
    ],
  },
  {
    id: 4,
    title: 'Система швидкого монтажу Termojet — приватний будинок',
    location: 'Забже, Польща',
    type: 'Приватний будинок',
    year: 2024,
    desc: 'Котельня приватного будинку в польському Забже, зібрана на системі швидкого монтажу Termojet із циркуляційними насосами Termojet. Готові насосні групи скорочують час монтажу обв\'язки в рази та виключають помилки складання.',
    image: '/images/portfolio/proj-4.jpg',
    images: ['/images/portfolio/proj-4.jpg'],
    links: [
      { label: 'Насосні групи', url: '/catalog/nasosni-hrupy' },
      { label: 'Циркуляційні насоси', url: '/catalog/nasosy' },
    ],
  },
  {
    id: 5,
    title: 'Повний комплект: тепловий насос Suntide 13 кВт з бойлером і буфером',
    location: 'Бровари, Київська область',
    type: 'Приватний будинок',
    power: '13 кВт',
    year: 2025,
    desc: 'Повний комплект опалення приватного будинку: тепловий насос Suntide 13 кВт, бойлер та буферна ємність Termojet. Збалансована система готова до роботи «під ключ» — від джерела тепла до розподілу по контурах опалення.',
    image: '/images/portfolio/proj-5.jpg',
    images: ['/images/portfolio/proj-5.jpg'],
    links: [
      { label: 'Тепловий насос Suntide', url: HEATPUMP, ext: true },
      { label: 'Бойлери та буферні ємності', url: HEATPUMP, ext: true },
      { label: 'Насосні групи', url: '/catalog/nasosni-hrupy' },
    ],
  },
  {
    id: 6,
    title: 'Котельня з тепловим насосом Termojet Hi Master та автоматикою',
    location: 'Ірпінь, Київська область',
    type: 'Приватний будинок',
    power: '13 кВт',
    year: 2025,
    desc: 'Котельня приватного будинку на тепловому насосі Termojet Hi Master 13 кВт із системою швидкого монтажу та автоматикою керування. Погодозалежне регулювання підтримує комфортну температуру й знижує витрати на опалення.',
    image: '/images/portfolio/proj-6.jpg',
    images: ['/images/portfolio/proj-6.jpg'],
    links: [
      { label: 'Тепловий насос Termojet Hi Master', url: HEATPUMP, ext: true },
      { label: 'Автоматика', url: '/catalog/avtomatyka' },
      { label: 'Насосні групи', url: '/catalog/nasosni-hrupy' },
    ],
  },
  {
    id: 7,
    title: 'Колектор до 175 кВт і насосні групи НГ-52 — комерційний об\'єкт',
    location: 'Львів',
    type: 'Комерційний об\'єкт',
    power: '175 кВт',
    year: 2025,
    desc: 'Комерційне приміщення з розподільчим колектором потужністю до 175 кВт і насосними групами Termojet НГ-52 з енергозберігаючими насосами APM. Система обслуговує кілька незалежних контурів опалення з точним балансуванням.',
    image: '/images/portfolio/proj-7.jpg',
    images: ['/images/portfolio/proj-7.jpg'],
    links: [
      { label: 'Насосна група НГ-52', url: '/catalog/nasosni-hrupy/ng-52p-zi-zmishuvachem-1-1-4' },
      { label: 'Розподільчі колектори', url: '/catalog/rozpodilchi-kolektory' },
      { label: 'Насоси Termojet APM', url: '/catalog/nasosy/nasos-termojet-auto-apm-32-12-180mm' },
    ],
  },
  {
    id: 8,
    title: 'Колектор за спецзамовленням і насосні групи — офісна будівля',
    location: 'Харків',
    type: 'Офісна будівля',
    year: 2024,
    desc: 'Офісна будівля у Харкові з розподільчим колектором Termojet, виготовленим за індивідуальним замовленням, насосними групами, автоматикою та циркуляційними насосами Termojet. Інженерне рішення під конкретну конфігурацію об\'єкта.',
    image: '/images/portfolio/proj-8.jpg',
    images: ['/images/portfolio/proj-8.jpg'],
    links: [
      { label: 'Розподільчі колектори', url: '/catalog/rozpodilchi-kolektory' },
      { label: 'Насосні групи', url: '/catalog/nasosni-hrupy' },
      { label: 'Автоматика', url: '/catalog/avtomatyka' },
    ],
  },
  {
    id: 9,
    title: 'Колекторний вузол до 175 кВт Termojet',
    location: 'Дніпро',
    type: 'Колекторний вузол',
    power: '175 кВт',
    year: 2024,
    desc: 'Колекторний вузол потужністю до 175 кВт виробництва Termojet (Україна). Компактна збірка розподільчого колектора з насосними групами для швидкого підключення контурів опалення великого об\'єкта.',
    image: '/images/portfolio/proj-9.jpg',
    images: ['/images/portfolio/proj-9.jpg'],
    links: [
      { label: 'Розподільчі колектори', url: '/catalog/rozpodilchi-kolektory' },
      { label: 'Насосні групи', url: '/catalog/nasosni-hrupy' },
    ],
  },
  {
    id: 10,
    title: 'Котельня приватного будинку: колектор і насосні групи Termojet',
    location: 'Вінниця',
    type: 'Приватний будинок',
    year: 2025,
    desc: 'Котельня приватного будинку з розподільчим колектором, насосними групами та циркуляційними насосами Termojet. Акуратна обв\'язка забезпечує стабільну роботу всіх контурів опалення та теплої підлоги.',
    image: '/images/portfolio/proj-10.jpg',
    images: ['/images/portfolio/proj-10.jpg'],
    links: [
      { label: 'Розподільчі колектори', url: '/catalog/rozpodilchi-kolektory' },
      { label: 'Насосні групи', url: '/catalog/nasosni-hrupy' },
      { label: 'Циркуляційні насоси', url: '/catalog/nasosy' },
    ],
  },
  {
    id: 11,
    title: 'Освітній заклад: колектор до 200 кВт із приводами A-413',
    location: 'Одеса',
    type: 'Освітній заклад',
    power: '200 кВт',
    year: 2026,
    desc: 'Навчальне приміщення з потужним розподільчим колектором до 200 кВт, насосними групами та насосами Termojet. Контури керуються електроприводами з вбудованими контролерами A-413 — автоматичне підтримання заданої температури без зовнішньої автоматики.',
    image: '/images/portfolio/proj-11.jpg',
    images: ['/images/portfolio/proj-11.jpg'],
    links: [
      { label: 'Привід-контролер A-413', url: '/catalog/klapany/elektropryvid-keruvannya-postijnoyu-temperaturoyu-pro400' },
      { label: 'Розподільчі колектори', url: '/catalog/rozpodilchi-kolektory' },
      { label: 'Насосні групи', url: '/catalog/nasosni-hrupy' },
    ],
  },
  {
    id: 12,
    title: 'Котельня з насосними групами в EPP-ізоляції Termojet',
    location: 'Полтава',
    type: 'Приватний будинок',
    year: 2025,
    desc: 'Котельня приватного будинку з насосними групами Termojet в EPP-теплоізоляції, розподільчим колектором та енергозберігаючими насосами. EPP-кожух мінімізує тепловтрати й конденсат, зберігаючи акуратний вигляд котельні.',
    image: '/images/portfolio/proj-12.jpg',
    images: ['/images/portfolio/proj-12.jpg'],
    links: [
      { label: 'Насосні групи', url: '/catalog/nasosni-hrupy' },
      { label: 'Розподільчі колектори', url: '/catalog/rozpodilchi-kolektory' },
      { label: 'Енергозберігаючі насоси', url: '/catalog/nasosy' },
    ],
  },
  {
    id: 13,
    title: 'Пелетна котельня 150 кВт із гідрострілкою та колектором',
    location: 'Тернопіль',
    type: 'Пелетна котельня',
    power: '150 кВт',
    year: 2026,
    desc: 'Пелетна котельня потужністю 150 кВт із розподільчим колектором та гідравлічним розділювачем (гідрострілкою) до 200 кВт. Контури обслуговують насосні групи з насосами Termojet APM і MEGA — надійний розподіл тепла між котлом і споживачами.',
    image: '/images/portfolio/proj-13.jpg',
    images: ['/images/portfolio/proj-13.jpg'],
    links: [
      { label: 'Гідравлічні розділювачі', url: '/catalog/hidravlichni-rozdilnyky' },
      { label: 'Насоси Termojet MEGA', url: '/catalog/termojet-mega' },
      { label: 'Насоси Termojet APM', url: '/catalog/nasosy/nasos-termojet-auto-apm-32-12-180mm' },
    ],
  },
  {
    id: 14,
    title: 'Промисловий колектор до 1000 кВт із частотними насосами APM',
    location: 'Запоріжжя',
    type: 'Промисловий об\'єкт',
    power: '1000 кВт',
    year: 2025,
    desc: 'Промисловий розподільчий колектор потужністю до 1000 кВт, виготовлений за індивідуальним замовленням, із насосними групами та частотними енергозберігаючими насосами Termojet APM. Рішення для великих систем опалення з гнучким керуванням витратою.',
    image: '/images/portfolio/proj-14.jpg',
    images: ['/images/portfolio/proj-14.jpg'],
    links: [
      { label: 'Розподільчі колектори', url: '/catalog/rozpodilchi-kolektory' },
      { label: 'Насоси Termojet APM', url: '/catalog/nasosy/nasos-termojet-auto-apm-32-12-180mm' },
      { label: 'Насосні групи', url: '/catalog/nasosni-hrupy' },
    ],
  },
  {
    id: 15,
    title: 'Модуль Termojet BOX2 і колектори з нержавіючої сталі — тепла підлога',
    location: 'Житомир',
    type: 'Приватний будинок',
    year: 2026,
    desc: 'Приватний будинок із модулем Termojet BOX2, циркуляційними насосами та колекторами з нержавіючої сталі для теплої підлоги. Компактний модуль BOX2 поєднує гідророзділювач і колектор на 2 контури в одному корпусі.',
    image: '/images/portfolio/proj-15.jpg',
    images: ['/images/portfolio/proj-15.jpg'],
    links: [
      { label: 'Модуль Termojet BOX2', url: '/catalog/termojet-box/modul-termojet-box2-v-teploizolyatsiyi-km2-ups' },
      { label: 'Колектори для теплої підлоги', url: '/catalog/kolektory-pidloha' },
      { label: 'Циркуляційні насоси', url: '/catalog/nasosy' },
    ],
  },
]

// Резолвер: додає пласкі поля <field>_<lang> із словника PORTFOLIO_I18N (ключ = UA-рядок),
// які читає фронтенд: title_<lang>, desc_<lang>, type_<lang>, location_<lang>, links[].label_<lang>.
const I18N_LANGS = ['en', 'pl', 'fr', 'de', 'ro']
function flat(item) {
  const out = { ...item }
  for (const f of ['title', 'desc', 'type', 'location']) {
    const tr = item[f] && PORTFOLIO_I18N[item[f]]
    if (tr) for (const l of I18N_LANGS) if (tr[l]) out[`${f}_${l}`] = tr[l]
  }
  if (Array.isArray(item.links)) {
    out.links = item.links.map((lk) => {
      const lo = { ...lk }
      const tr = lk.label && PORTFOLIO_I18N[lk.label]
      if (tr) for (const l of I18N_LANGS) if (tr[l]) lo[`label_${l}`] = tr[l]
      return lo
    })
  }
  return out
}

export const PORTFOLIO = RAW.map(flat)
