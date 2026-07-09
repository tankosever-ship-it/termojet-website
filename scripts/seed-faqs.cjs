#!/usr/bin/env node
/**
 * Наповнення таблиці faqs реальними Q&A (UA + EN у i18n).
 *
 *   node scripts/seed-faqs.cjs [шлях-до-БД]            # dry-run
 *   node scripts/seed-faqs.cjs [шлях-до-БД] --apply    # застосувати (upsert за UA-питанням)
 *
 * Ідемпотентний: upsert за текстом UA-питання (question). Ручні FAQ з адмінки з ІНШИМИ
 * питаннями не чіпає. ⚠️ Прод-БД у volume (не seed) → ганяти на сервері у контейнері:
 *   docker compose cp scripts/seed-faqs.cjs app:/tmp/seed-faqs.cjs
 *   docker compose exec app node /tmp/seed-faqs.cjs /app/backend/data/termojet.db --apply
 */
const path = require('path')
function loadSqlite() {
  for (const c of ['better-sqlite3', path.join(__dirname, '..', 'backend', 'node_modules', 'better-sqlite3'), '/app/backend/node_modules/better-sqlite3']) {
    try { return require(c) } catch { /* далі */ }
  }
  throw new Error('better-sqlite3 не знайдено')
}
const Database = loadSqlite()
const DB_PATH = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : path.join(__dirname, '..', 'backend', 'data', 'termojet.db')
const APPLY = process.argv.includes('--apply')

// question/answer — UA; en — { q, a } англійською.
const FAQ = [
  // ── Компанія ────────────────────────────────────────────────────────────────
  { question: 'Чи є у вас власне виробництво?',
    answer: 'Так, Termojet — власне виробництво в Києві з 2002 року. Виробничі площі — 3 000 м², потужність — 70 000+ одиниць на рік. Це дозволяє контролювати якість на кожному етапі і пропонувати конкурентні ціни.',
    en: { q: 'Do you have your own production?', a: 'Yes, Termojet is our own manufacturing in Kyiv since 2002. Production area is 3,000 m² with a capacity of 70,000+ units per year. This lets us control quality at every stage and offer competitive prices.' } },
  { question: 'Чи є продукція в наявності на складі?',
    answer: 'Більшість позицій каталогу постійно є на складі площею 2 500 м². Ми можемо відвантажити більшість замовлень наступного робочого дня після оплати.',
    en: { q: 'Is the product in stock?', a: 'Most catalog items are permanently in stock in our 2,500 m² warehouse. We can ship most orders the next business day after payment.' } },
  { question: 'Як стати дилером Termojet?',
    answer: 'Заповніть форму на сторінці «Дилерам» або зателефонуйте нам. Умови партнерства: знижки від 10% до 30% залежно від обсягу, відстрочка платежу, технічна підтримка, маркетингові матеріали.',
    en: { q: 'How to become a Termojet dealer?', a: 'Fill out the form on the “Dealers” page or call us. Partnership terms: discounts from 10% to 30% depending on volume, deferred payment, technical support and marketing materials.' } },
  { question: 'Чи надаєте ви технічну підтримку при підборі обладнання?',
    answer: 'Так, наші технічні спеціалісти допоможуть підібрати оптимальне обладнання для вашого проєкту — від невеликої котельні до промислового об’єкту потужністю до 2 МВт.',
    en: { q: 'Do you provide technical support with equipment selection?', a: 'Yes, our technical specialists will help you select the optimal equipment for your project — from a small boiler room to an industrial facility up to 2 MW.' } },
  { question: 'Яка гарантія на обладнання Termojet?',
    answer: 'На все виробниче обладнання надається гарантія виробника. Терміни гарантії залежать від типу продукції і вказані в документації до кожного виробу.',
    en: { q: 'What warranty does Termojet equipment have?', a: 'All manufactured equipment carries a manufacturer’s warranty. Warranty periods depend on the product type and are specified in the documentation for each item.' } },
  { question: 'Чи здійснюєте ви доставку по всій Україні?',
    answer: 'Так, доставка здійснюється по всій Україні транспортними компаніями (Нова Пошта, Delivery, власний транспорт для великих замовлень). Також можливе самовивезення з нашого складу в Києві.',
    en: { q: 'Do you deliver across Ukraine?', a: 'Yes, we deliver across Ukraine via carriers (Nova Poshta, Delivery, our own transport for large orders). Pickup from our warehouse in Kyiv is also available.' } },
  { question: 'Чи є у вас обладнання для промислових котелень?',
    answer: 'Так, серія TERMOJET Mega — це системи для котелень потужністю до 2,2 МВт. Виробляємо весь спектр: насосні групи, колектори, клапани, сепаратори, гідравлічні роздільники.',
    en: { q: 'Do you have equipment for industrial boiler rooms?', a: 'Yes, the TERMOJET Mega series covers boiler rooms up to 2.2 MW. We produce the full range: pump groups, manifolds, valves, separators and hydraulic separators.' } },
  { question: 'Чи постачаєте ви продукцію за кордон?',
    answer: 'Так, ми експортуємо продукцію в 15 країн ЄС. З 2018 року є офіційне представництво в Польщі (м. Забже). Для міжнародних замовлень зверніться до нашого відділу експорту.',
    en: { q: 'Do you export your products?', a: 'Yes, we export to 15 EU countries. Since 2018 we have an official representative office in Poland (Zabrze). For international orders, contact our export department.' } },

  // ── Підбір і технічні ────────────────────────────────────────────────────────
  { question: 'Як підібрати насосну групу?',
    answer: 'Насосну групу підбирають за потужністю контуру (кВт) і діаметром приєднання (1″, 1¼″ тощо). Для контурів з регульованою температурою — наприклад, теплої підлоги — беруть групу зі змішувачем; для прямих високотемпературних контурів (радіатори) — без змішувача. Є варіанти з вбудованим насосом і «під власний насос».',
    en: { q: 'How do I select a pump group?', a: 'A pump group is chosen by circuit power (kW) and connection size (1″, 1¼″, etc.). For circuits with regulated temperature — such as underfloor heating — use a group with a mixing valve; for direct high-temperature circuits (radiators), without a mixer. Versions are available with a built-in pump or “for your own pump”.' } },
  { question: 'Насосну групу брати з насосом чи під власний насос?',
    answer: 'Якщо у вас уже є придатний циркуляційний насос потрібної продуктивності — беріть групу «під насос» і встановіть свій. Якщо насоса немає або хочете готове рішення — беріть групу з уже вбудованим насосом Termojet, підібраним під вузол. Другий варіант простіший у монтажі й гарантує сумісність.',
    en: { q: 'Pump group with a pump or for my own pump?', a: 'If you already have a suitable circulation pump of the right capacity — take the “for your own pump” version and fit yours. If you have no pump or want a ready solution — take the group with a built-in Termojet pump matched to the unit. The latter is simpler to install and guarantees compatibility.' } },
  { question: 'Чим відрізняється колектор від колектора з гідрострілкою (КГС)?',
    answer: 'Звичайний розподільчий колектор лише розводить теплоносій по кількох контурах. Колектор з гідрострілкою (КГС) додатково має вбудовану гідрострілку, яка гідравлічно розділяє контур котла і контури споживачів. КГС — це два пристрої в одному корпусі: економить місце й монтаж, коли потрібне і розділення, і гідравлічна розв’язка.',
    en: { q: 'What is the difference between a manifold and a manifold with a hydraulic separator (КГС)?', a: 'A regular distribution manifold only splits the coolant among several circuits. A manifold with a hydraulic separator (КГС) also has a built-in hydraulic separator that hydraulically decouples the boiler circuit from the consumer circuits. КГС is two devices in one body — it saves space and installation time when you need both distribution and hydraulic decoupling.' } },
  { question: 'Навіщо потрібна гідрострілка (гідравлічний роздільник)?',
    answer: 'Гідрострілка гідравлічно розв’язує насос котла й насоси контурів опалення: вирівнює потік і тиск, не дає насосам впливати одне на одного і забезпечує стабільний розхід через котел. Вона потрібна, коли контурів кілька або коли сумарна продуктивність насосів споживачів більша за продуктивність насоса котла.',
    en: { q: 'Why do I need a hydraulic separator?', a: 'A hydraulic separator decouples the boiler pump from the heating-circuit pumps: it equalizes flow and pressure, prevents pumps from affecting each other and ensures a stable flow through the boiler. It is needed when there are several circuits or when the total capacity of the consumer pumps exceeds that of the boiler pump.' } },
  { question: 'Як обрати колектор за кількістю контурів і потужністю?',
    answer: 'Кількість контурів обирають за числом споживачів — радіатори, тепла підлога, бойлер ГВП тощо; серії йдуть від 2+1 до 5+1 (контури + підключення котла), стандарт 125 мм. Типорозмір за потужністю — 60, 105 або 175 кВт. Якщо сумніваєтесь — наші інженери підберуть колектор під конкретний проєкт.',
    en: { q: 'How do I choose a manifold by number of circuits and power?', a: 'The number of circuits is chosen by the number of consumers — radiators, underfloor heating, a DHW tank, etc.; series range from 2+1 to 5+1 (circuits + boiler connection), 125 mm standard. The size by power is 60, 105 or 175 kW. If in doubt, our engineers will select a manifold for your specific project.' } },
  { question: 'Колектори теплої підлоги: з ротаметрами чи з кульовими кранами?',
    answer: 'З ротаметрами (витратомірами) можна точно балансувати витрату по кожній петлі теплої підлоги, що важливо для рівномірного прогріву. З кульовими кранами — базове відкриття/закриття контурів без точного балансування, дешевше. Корпус обох — нержавіюча сталь AISI 304.',
    en: { q: 'Underfloor heating manifolds: with flow meters or ball valves?', a: 'With flow meters you can precisely balance the flow of each underfloor loop, which matters for even heating. With ball valves it is basic opening/closing of circuits without precise balancing, and cheaper. Both are made of AISI 304 stainless steel.' } },
  { question: 'Куди правильно ставити сепаратор шламу і повітряний сепаратор?',
    answer: 'Шламовий сепаратор ставлять на зворотній лінії перед котлом — там він вловлює шлам і магнітні домішки з води, поки вони не потрапили в котел і насоси. Повітряний сепаратор ставлять на подавальній лінії, де теплоносій найгарячіший і повітря найлегше виділяється. Це продовжує ресурс обладнання й прибирає шум від завоздушення.',
    en: { q: 'Where should the sludge and air separators be installed?', a: 'Install the sludge separator on the return line before the boiler — there it captures sludge and magnetic particles from the water before they reach the boiler and pumps. Install the air separator on the supply line, where the coolant is hottest and air is released most easily. This extends equipment life and removes noise from trapped air.' } },
  { question: 'Навіщо потрібен балансувальний клапан?',
    answer: 'Балансувальний клапан вирівнює гідравлічний опір гілок системи, щоб теплоносій розподілявся рівномірно, а не йшов лише найкоротшим шляхом. Без балансування далекі радіатори чи петлі гріють гірше. Статичний балансувальний клапан налаштовують один раз при пусконалагодженні.',
    en: { q: 'Why do I need a balancing valve?', a: 'A balancing valve equalizes the hydraulic resistance of the system branches so the coolant is distributed evenly instead of taking only the shortest path. Without balancing, distant radiators or loops heat up worse. A static balancing valve is set once during commissioning.' } },
  { question: 'Що таке TERMOJET BOX і кому він потрібен?',
    answer: 'TERMOJET BOX — це компактний модульний вузол обв’язки котла в готовому корпусі. Він об’єднує потрібні елементи (насосну групу, розподіл, ізоляцію) в одному блоці, що спрощує і пришвидшує монтаж котельні. Підходить, коли потрібне акуратне готове рішення без збирання вузла з окремих частин.',
    en: { q: 'What is TERMOJET BOX and who needs it?', a: 'TERMOJET BOX is a compact modular boiler-connection unit in a ready-made housing. It combines the needed elements (pump group, distribution, insulation) in one block, which simplifies and speeds up boiler-room installation. It suits those who want a neat ready solution instead of assembling a unit from separate parts.' } },
  { question: 'Як працює серія TERMOJET Mega для великих котелень?',
    answer: 'TERMOJET Mega — серія для великих і промислових котелень потужністю до 2200 кВт (2,2 МВт). Це масштабовані колектори, гідравлічні роздільники та вузли під високі витрати теплоносія. Для таких об’єктів вузли підбираються індивідуально — звертайтесь до технічного відділу.',
    en: { q: 'How does the TERMOJET Mega series work for large boiler rooms?', a: 'TERMOJET Mega is a series for large and industrial boiler rooms up to 2200 kW (2.2 MW). These are scalable manifolds, hydraulic separators and units for high coolant flow rates. For such facilities the units are selected individually — contact our technical department.' } },
  { question: 'Чи сумісне обладнання Termojet з будь-яким котлом?',
    answer: 'Так. Обладнання Termojet — насосні групи, колектори, гідрострілки, клапани — сумісне з газовими, твердопаливними, електричними та іншими котлами будь-яких брендів. Підбір іде за потужністю, діаметрами приєднання і типом контурів, а не за маркою котла.',
    en: { q: 'Is Termojet equipment compatible with any boiler?', a: 'Yes. Termojet equipment — pump groups, manifolds, hydraulic separators, valves — is compatible with gas, solid-fuel, electric and other boilers of any brand. Selection is based on power, connection sizes and circuit type, not on the boiler brand.' } },
  { question: 'Чим відрізняються циркуляційні насоси Termojet APE, APM та APM-F?',
    answer: 'Усі три — енергоефективні насоси Termojet AUTO з автоматичним електронним регулюванням і керуванням через слаботочний ШІМ-сигнал. APE та APM — різьбові насоси для побутових і невеликих комерційних контурів. APM-F — фланцеві, для потужніших систем з більшими діаметрами (40–50): коефіцієнт енергоефективності EEI < 0,21, електрофоретичне антикорозійне покриття корпусу, ущільнення EPDM, що не потребують обслуговування.',
    en: { q: 'What is the difference between Termojet APE, APM and APM-F circulation pumps?', a: 'All three are energy-efficient Termojet AUTO pumps with automatic electronic control via a low-current PWM signal. APE and APM are threaded pumps for domestic and small commercial circuits. APM-F are flanged, for more powerful systems with larger diameters (40–50): energy-efficiency index EEI < 0.21, electrophoretic anti-corrosion body coating and maintenance-free EPDM seals.' } },
  { question: 'Що дає титановий активний анод і навіщо він бойлеру?',
    answer: 'Активний титановий MMO-анод Termojet (TI 400) захищає бак бойлера від корозії за допомогою блоку живлення, який подає слабкий струм. На відміну від звичайного магнієвого (жертовного) анода, він не зношується і служить 10+ років без заміни, а також усуває запах сірководню («тухлих яєць») у гарячій воді. Підходить для емальованих і нержавіючих бойлерів, приєднання G3/4″.',
    en: { q: 'What does a titanium active anode do and why does a water heater need it?', a: 'The Termojet active titanium MMO anode (TI 400) protects the tank from corrosion using a power unit that supplies a weak current. Unlike a regular magnesium (sacrificial) anode, it does not wear out and lasts 10+ years without replacement, and it also removes the hydrogen-sulfide (“rotten egg”) smell in hot water. Suitable for enameled and stainless-steel water heaters, G3/4″ connection.' } },
]

const db = new Database(DB_PATH)
const findByQ = db.prepare('SELECT id FROM faqs WHERE question = ?')
const ins = db.prepare('INSERT INTO faqs (question, answer, sort, i18n) VALUES (?, ?, ?, ?)')
const updt = db.prepare('UPDATE faqs SET answer = ?, sort = ?, i18n = ? WHERE id = ?')

let inserted = 0, updated = 0
const tx = db.transaction(() => {
  FAQ.forEach((f, i) => {
    const sort = i + 1
    const i18n = JSON.stringify({ en: { question: f.en.q, answer: f.en.a } })
    const existing = findByQ.get(f.question)
    if (existing) { if (APPLY) updt.run(f.answer, sort, i18n, existing.id); updated++ }
    else { if (APPLY) ins.run(f.question, f.answer, sort, i18n); inserted++ }
  })
})
tx()

console.log(`FAQ у наборі: ${FAQ.length} · нових: ${inserted} · оновлено: ${updated}`)
console.log(APPLY ? '✅ ЗАСТОСОВАНО' : 'ℹ️  DRY-RUN (додай --apply)')
db.close()
