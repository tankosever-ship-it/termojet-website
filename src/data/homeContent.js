// Дефолтний текстовий контент головної сторінки.
// Адмінка (AdminContent) зберігає override як JSON у settings.homeContent;
// HomePage читає mergeHomeContent(override, lang) і рендерить.
// Тут — єдине джерело істини для текстів, які клієнт може редагувати.

const HOME_CONTENT = {
  // ─────────────────────────────────────────────────────────────────────
  // УКРАЇНСЬКА
  // ─────────────────────────────────────────────────────────────────────
  uk: {
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
  },

  // ─────────────────────────────────────────────────────────────────────
  // ENGLISH
  // ─────────────────────────────────────────────────────────────────────
  en: {
    // ── HERO ──
    heroBadge: 'MANUFACTURING SINCE 2002 · KYIV, UKRAINE',
    heroTitle: 'The #1 manufacturer of quick-assembly boiler room systems in Ukraine.',
    heroBtnPrimary: 'Browse catalogue',
    heroBtnSecondary: 'Request consultation',

    // ── STATS ──
    stats: [
      { num: '23', suffix: ' years',     label: 'In the boiler equipment market' },
      { num: '16', suffix: ' countries', label: 'Export to Europe — branch in Poland' },
      { num: '50', suffix: '',           label: 'Projects fully equipped' },
      { num: '70', suffix: '',           label: 'Units produced per year' },
    ],

    // ── CATEGORIES ──
    catsTitle: 'Everything for the boiler room —\nin one place.',

    // ── ADVANTAGES ──
    advantagesEyebrow: 'Our advantages',
    advantagesTitle: 'Why choose Termojet',
    advantages: [
      { title: 'In-house manufacturing', desc: 'Factory of 3,000 m² in Kyiv and Zhytomyr. Full cycle from raw metal to finished unit.' },
      { title: 'Quality guarantee',      desc: 'Every unit passes outgoing inspection. ISO 9001:2015, CE.' },
      { title: 'Stock availability',     desc: 'Warehouse of 2,500 m². Most items ship the next business day.' },
      { title: 'International expertise', desc: 'Deliveries to 15 EU countries. Office in Poland since 2018.' },
      { title: 'Technical support',      desc: 'Engineering support at every stage. Selection tailored to your project.' },
      { title: 'Turnkey solutions',      desc: 'TERMOJET BOX, Mini, Mega — from 30 kW to 2 MW.' },
    ],

    // ── PRODUCTION ──
    productionTitle: 'From a sheet of steel —\nto finished equipment\nready for quick installation.',
    productionText: 'Laser cutters, press brakes, semi-automatic welding, and our own powder-coating line. 5,500 m² of production space.',

    // ── FINAL CTA ──
    ctaText: 'Download the app or open the catalogue. Our managers will help you select the right equipment within 1 business day.',
    ctaBtnPrimary: 'Open catalogue',
    ctaBtnSecondary: 'Request a call',

    // ── DEALERS CTA ──
    dealersTitle: 'Become a Termojet partner',
    dealersText: 'We are looking for dealers across all regions of Ukraine and abroad. Competitive terms and full technical support.',
  },

  // ─────────────────────────────────────────────────────────────────────
  // POLSKI
  // ─────────────────────────────────────────────────────────────────────
  pl: {
    // ── HERO ──
    heroBadge: 'PRODUKCJA OD 2002 · KIJÓW, UKRAINA',
    heroTitle: 'Producent systemów szybkiego montażu dla kotłowni #1 na Ukrainie.',
    heroBtnPrimary: 'Przeglądaj katalog',
    heroBtnSecondary: 'Zapytaj o ofertę',

    // ── STATS ──
    stats: [
      { num: '23', suffix: ' lata',   label: 'Na rynku urządzeń kotłowych' },
      { num: '16', suffix: ' krajów', label: 'Eksport do Europy — oddział w Polsce' },
      { num: '50', suffix: '',        label: 'Skompletowanych projektów' },
      { num: '70', suffix: '',        label: 'Wyrobów rocznie w fabryce' },
    ],

    // ── CATEGORIES ──
    catsTitle: 'Wszystko do kotłowni —\nw jednym miejscu.',

    // ── ADVANTAGES ──
    advantagesEyebrow: 'Nasze zalety',
    advantagesTitle: 'Dlaczego wybierają Termojet',
    advantages: [
      { title: 'Własna produkcja',       desc: 'Zakład 3 000 m² w Kijowie i Żytomierzu. Pełny cykl — od blachy do gotowego węzła.' },
      { title: 'Gwarancja jakości',      desc: 'Każda jednostka przechodzi kontrolę wyjściową. ISO 9001:2015, CE.' },
      { title: 'Dostępność magazynowa',  desc: 'Magazyn 2 500 m². Większość pozycji wysyłamy następnego dnia roboczego.' },
      { title: 'Doświadczenie międzynarodowe', desc: 'Dostawy do 15 krajów UE. Biuro w Polsce od 2018 roku.' },
      { title: 'Wsparcie techniczne',    desc: 'Pomoc inżynierska na każdym etapie. Dobór rozwiązań pod Twój projekt.' },
      { title: 'Rozwiązania kompleksowe', desc: 'TERMOJET BOX, Mini, Mega — od 30 kW do 2 MW.' },
    ],

    // ── PRODUCTION ──
    productionTitle: 'Od arkusza stali —\ndo gotowego urządzenia\ndo szybkiego montażu.',
    productionText: 'Wycinarki laserowe, giętarki, spawanie półautomatyczne i własna linia malowania proszkowego. 5 500 m² powierzchni produkcyjnej.',

    // ── FINAL CTA ──
    ctaText: 'Pobierz aplikację lub otwórz katalog. Nasi doradcy pomogą dobrać odpowiednie urządzenia w ciągu 1 dnia roboczego.',
    ctaBtnPrimary: 'Otwórz katalog',
    ctaBtnSecondary: 'Zamów rozmowę',

    // ── DEALERS CTA ──
    dealersTitle: 'Zostań partnerem Termojet',
    dealersText: 'Poszukujemy dealerów we wszystkich regionach Ukrainy i za granicą. Atrakcyjne warunki współpracy i pełne wsparcie techniczne.',
  },

  // ─────────────────────────────────────────────────────────────────────
  // FRANÇAIS
  // ─────────────────────────────────────────────────────────────────────
  fr: {
    // ── HERO ──
    heroBadge: 'FABRICATION DEPUIS 2002 · KYIV, UKRAINE',
    heroTitle: 'Le fabricant #1 de systèmes de montage rapide pour chaufferies en Ukraine.',
    heroBtnPrimary: 'Consulter le catalogue',
    heroBtnSecondary: 'Demander un conseil',

    // ── STATS ──
    stats: [
      { num: '23', suffix: ' ans',   label: 'Sur le marché des équipements de chaudières' },
      { num: '16', suffix: ' pays',  label: 'Export vers l’Europe — filiale en Pologne' },
      { num: '50', suffix: '',       label: 'Projets entièrement équipés' },
      { num: '70', suffix: '',       label: 'Unités fabriquées par an' },
    ],

    // ── CATEGORIES ──
    catsTitle: 'Tout pour la chaufferie —\nau même endroit.',

    // ── ADVANTAGES ──
    advantagesEyebrow: 'Nos atouts',
    advantagesTitle: 'Pourquoi choisir Termojet',
    advantages: [
      { title: 'Production en propre',      desc: 'Usine de 3 000 m² à Kyiv et Jytomyr. Cycle complet du métal brut à l’unité finie.' },
      { title: 'Garantie qualité',          desc: 'Chaque unité passe un contrôle de sortie. ISO 9001:2015, CE.' },
      { title: 'Disponibilité en stock',    desc: 'Entrepôt de 2 500 m². La majorité des références expédiées dès le lendemain.' },
      { title: 'Expérience internationale', desc: 'Livraisons dans 15 pays de l’UE. Bureau en Pologne depuis 2018.' },
      { title: 'Support technique',         desc: 'Assistance d’ingénierie à chaque étape. Sélection adaptée à votre projet.' },
      { title: 'Solutions clé en main',     desc: 'TERMOJET BOX, Mini, Mega — de 30 kW à 2 MW.' },
    ],

    // ── PRODUCTION ──
    productionTitle: 'D’une tôle d’acier —\nà un équipement complet\nprêt pour un montage rapide.',
    productionText: 'Découpe laser, presses plieuses, soudage semi-automatique et ligne de peinture en poudre intégrée. 5 500 m² de surface de production.',

    // ── FINAL CTA ──
    ctaText: 'Téléchargez l’application ou consultez le catalogue. Nos experts vous aideront à sélectionner le bon équipement en 1 jour ouvré.',
    ctaBtnPrimary: 'Ouvrir le catalogue',
    ctaBtnSecondary: 'Demander un rappel',

    // ── DEALERS CTA ──
    dealersTitle: 'Devenez partenaire Termojet',
    dealersText: 'Nous recherchons des revendeurs dans toutes les régions d’Ukraine et à l’étranger. Conditions avantageuses et support technique complet.',
  },

  // ─────────────────────────────────────────────────────────────────────
  // DEUTSCH
  // ─────────────────────────────────────────────────────────────────────
  de: {
    // ── HERO ──
    heroBadge: 'PRODUKTION SEIT 2002 · KIEW, UKRAINE',
    heroTitle: 'Der #1 Hersteller von Schnellmontagesystemen für Heizräume in der Ukraine.',
    heroBtnPrimary: 'Katalog ansehen',
    heroBtnSecondary: 'Beratung anfordern',

    // ── STATS ──
    stats: [
      { num: '23', suffix: ' Jahre',  label: 'Am Markt für Kesselanlagen' },
      { num: '16', suffix: ' Länder', label: 'Export nach Europa — Niederlassung in Polen' },
      { num: '50', suffix: '',        label: 'Vollständig ausgestattete Projekte' },
      { num: '70', suffix: '',        label: 'Einheiten pro Jahr im Werk' },
    ],

    // ── CATEGORIES ──
    catsTitle: 'Alles für den Heizraum —\nan einem Ort.',

    // ── ADVANTAGES ──
    advantagesEyebrow: 'Unsere Stärken',
    advantagesTitle: 'Warum Termojet wählen',
    advantages: [
      { title: 'Eigene Fertigung',           desc: 'Werk mit 3.000 m² in Kiew und Schytomyr. Vollständiger Zyklus vom Rohmaterial bis zur fertigen Baugruppe.' },
      { title: 'Qualitätsgarantie',          desc: 'Jede Einheit durchläuft eine Ausgangskontrolle. ISO 9001:2015, CE.' },
      { title: 'Lagerverfügbarkeit',         desc: 'Lager mit 2.500 m². Die meisten Positionen werden am nächsten Werktag versandt.' },
      { title: 'Internationale Erfahrung',   desc: 'Lieferungen in 15 EU-Länder. Büro in Polen seit 2018.' },
      { title: 'Technischer Support',        desc: 'Ingenieursunterstützung in jeder Phase. Auswahl passend zu Ihrem Projekt.' },
      { title: 'Komplettlösungen',           desc: 'TERMOJET BOX, Mini, Mega — von 30 kW bis 2 MW.' },
    ],

    // ── PRODUCTION ──
    productionTitle: 'Vom Stahlblech —\nzur fertigen Anlage\nfür die Schnellmontage.',
    productionText: 'Laserschneidanlagen, Abkantpressen, Halbautomatik-Schweißen und eine eigene Pulverbeschichtungslinie. 5.500 m² Produktionsfläche.',

    // ── FINAL CTA ──
    ctaText: 'Laden Sie die App herunter oder öffnen Sie den Katalog. Unsere Berater helfen Ihnen bei der Auswahl der richtigen Ausrüstung innerhalb von 1 Werktag.',
    ctaBtnPrimary: 'Katalog öffnen',
    ctaBtnSecondary: 'Rückruf anfordern',

    // ── DEALERS CTA ──
    dealersTitle: 'Werden Sie Termojet-Partner',
    dealersText: 'Wir suchen Händler in allen Regionen der Ukraine und im Ausland. Attraktive Konditionen und vollständiger technischer Support.',
  },

  // ─────────────────────────────────────────────────────────────────────
  // ROMÂNĂ
  // ─────────────────────────────────────────────────────────────────────
  ro: {
    // ── HERO ──
    heroBadge: 'PRODUCȚIE DIN 2002 · KYIV, UCRAINA',
    heroTitle: 'Producătorul #1 de sisteme de montaj rapid pentru centrale termice din Ucraina.',
    heroBtnPrimary: 'Răsfoiți catalogul',
    heroBtnSecondary: 'Solicitați o consultație',

    // ── STATS ──
    stats: [
      { num: '23', suffix: ' ani',  label: 'Pe piața echipamentelor pentru centrale termice' },
      { num: '16', suffix: ' țări', label: 'Export în Europa — filială în Polonia' },
      { num: '50', suffix: '',      label: 'Proiecte complet echipate' },
      { num: '70', suffix: '',      label: 'Unități produse pe an' },
    ],

    // ── CATEGORIES ──
    catsTitle: 'Totul pentru centrala termică —\nîntr-un singur loc.',

    // ── ADVANTAGES ──
    advantagesEyebrow: 'Avantajele noastre',
    advantagesTitle: 'De ce să alegeți Termojet',
    advantages: [
      { title: 'Producție proprie',           desc: 'Fabrică de 3.000 m² la Kyiv și Jîtomîr. Ciclu complet, de la metal brut la ansamblul finit.' },
      { title: 'Garanția calității',          desc: 'Fiecare unitate trece printr-un control de ieșire. ISO 9001:2015, CE.' },
      { title: 'Disponibilitate în stoc',     desc: 'Depozit de 2.500 m². Majoritatea produselor sunt expediate a doua zi lucrătoare.' },
      { title: 'Experiență internațională',   desc: 'Livrări în 15 țări UE. Birou în Polonia din 2018.' },
      { title: 'Suport tehnic',               desc: 'Asistență inginerească în fiecare etapă. Selecție adaptată proiectului dumneavoastră.' },
      { title: 'Soluții complete la cheie',   desc: 'TERMOJET BOX, Mini, Mega — de la 30 kW la 2 MW.' },
    ],

    // ── PRODUCTION ──
    productionTitle: 'De la o foaie de oțel —\nla un echipament finit\ngata pentru montaj rapid.',
    productionText: 'Mașini de tăiat cu laser, prese de îndoit, sudură semiautomată și propria linie de vopsire în câmp electrostatic. 5.500 m² de spațiu de producție.',

    // ── FINAL CTA ──
    ctaText: 'Descărcați aplicația sau deschideți catalogul. Managerii noștri vă vor ajuta să alegeți echipamentul potrivit în decurs de 1 zi lucrătoare.',
    ctaBtnPrimary: 'Deschideți catalogul',
    ctaBtnSecondary: 'Solicitați un apel',

    // ── DEALERS CTA ──
    dealersTitle: 'Deveniți partener Termojet',
    dealersText: 'Căutăm dealeri în toate regiunile Ucrainei și în străinătate. Condiții avantajoase și suport tehnic complet.',
  },
}

// Backwards-compat alias — any import of HOME_DEFAULTS still works
export const HOME_DEFAULTS = HOME_CONTENT.uk

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

// Глибоке злиття override-полів поверх дефолтів (lang-aware).
// Для lang === 'uk' зливаємо admin-override поверх базових даних (як раніше).
// Для інших мов override ігнорується — повертається deep-clone base.
export function mergeHomeContent(override, lang = 'uk') {
  const base = HOME_CONTENT[lang] || HOME_CONTENT.uk

  if (lang !== 'uk') {
    // Admin override is Ukrainian-only; for other langs return a deep clone of the base.
    return {
      ...base,
      stats: base.stats.map(s => ({ ...s })),
      advantages: base.advantages.map(a => ({ ...a })),
    }
  }

  // uk path: merge override exactly like the original logic
  if (!override || typeof override !== 'object') return { ...base, stats: base.stats.map(s => ({ ...s })), advantages: base.advantages.map(a => ({ ...a })) }
  const out = { ...base, ...override }
  out.stats = base.stats.map((s, i) => ({ ...s, ...(override.stats?.[i] || {}) }))
  out.advantages = base.advantages.map((a, i) => ({ ...a, ...(override.advantages?.[i] || {}) }))
  return out
}
