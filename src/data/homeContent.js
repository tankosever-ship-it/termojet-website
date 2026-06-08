// Дефолтний текстовий контент головної сторінки.
// Адмінка (AdminContent) зберігає override як JSON у settings.homeContent;
// HomePage читає mergeHomeContent(defaults, override) і рендерить.
// Тут — єдине джерело істини для текстів, які клієнт може редагувати.

export const HOME_DEFAULTS = {
  // ── HERO ──
  heroBadge: 'ВИРОБНИЦТВО З 2002 · КИЇВ, УКРАЇНА',
  // токен #1 у заголовку підсвічується акцентним кольором
  heroTitle: 'Виробник систем швидкого монтажу для котелень #1 в Україні.',
  heroBtnPrimary: 'Переглянути каталог',
  heroBtnSecondary: 'Отримати консультацію',

  // ── STATS (нижня панель hero) ──
  stats: [
    { num: '23', suffix: ' роки',  label: 'На ринку котельного обладнання' },
    { num: '16', suffix: ' країн', label: 'Експорт у Європу — філія в Польщі' },
    { num: '50', suffix: '',       label: 'Проектів укомплектовано' },
    { num: '70', suffix: '',       label: 'Виробів на рік на заводі' },
  ],

  // ── CATEGORIES ──
  catsTitle: 'Все для котельні —\nв одному місці.',

  // ── ADVANTAGES ──
  advantagesEyebrow: 'Наші переваги',
  advantagesTitle: 'Чому обирають Termojet',
  advantages: [
    { title: 'Власне виробництво',  desc: 'Завод 3 000 м² у Києві та Житомирі. Повний цикл від металу до готового вузла.' },
    { title: 'Гарантія якості',     desc: 'Кожна одиниця проходить вихідний контроль. ISO 9001:2015, CE.' },
    { title: 'Наявність на складі', desc: 'Склад 2 500 м². Більшість позицій відвантажуємо наступного дня.' },
    { title: 'Міжнародний досвід',  desc: 'Поставки в 15 країн ЄС. Офіс у Польщі з 2018 року.' },
    { title: 'Технічна підтримка',  desc: 'Інженерна підтримка на всіх етапах. Підбір під ваш проект.' },
    { title: 'Комплексні рішення',  desc: 'TERMOJET BOX, Mini, Mega — від 30 кВт до 2 МВт.' },
  ],

  // ── PRODUCTION ──
  productionTitle: 'Від листа сталі —\nдо готового обладнання\nдля швидкого монтажу.',
  productionText: 'Лазерні верстати, листогини, напівавтоматичне зварювання та власна лінія порошкового фарбування. 5 500 м² площ.',

  // ── FINAL CTA (чорна секція) ──
  ctaText: 'Завантажте додаток або відкрийте каталог. Наші менеджери допоможуть з підбором обладнання за 1 робочий день.',
  ctaBtnPrimary: 'Відкрити каталог',
  ctaBtnSecondary: 'Замовити дзвінок',

  // ── DEALERS CTA ──
  dealersTitle: 'Станьте партнером Termojet',
  dealersText: 'Шукаємо дилерів у всіх регіонах України та за кордоном. Вигідні умови, технічна підтримка.',
}

// Глибоке злиття override-полів поверх дефолтів.
// Масиви (stats/advantages) зливаємо поелементно, щоб часткові override не губили решту полів.
export function mergeHomeContent(override) {
  if (!override || typeof override !== 'object') return HOME_DEFAULTS
  const out = { ...HOME_DEFAULTS, ...override }
  out.stats = (HOME_DEFAULTS.stats).map((s, i) => ({ ...s, ...(override.stats?.[i] || {}) }))
  out.advantages = (HOME_DEFAULTS.advantages).map((a, i) => ({ ...a, ...(override.advantages?.[i] || {}) }))
  return out
}

// Розбити рядок із токеном #1 на частини для рендеру з акцентом
export function splitAccentToken(text, token = '#1') {
  const idx = (text || '').indexOf(token)
  if (idx === -1) return [{ t: text || '', accent: false }]
  return [
    { t: text.slice(0, idx), accent: false },
    { t: token, accent: true },
    { t: text.slice(idx + token.length), accent: false },
  ]
}
