// Презентація Termojet у Молдові разом із Cazan.md (27.07.2026) — дані для apply-blog-posts.js.
// Першоджерело — стаття на tjheatpump.com.ua/blog/prezentatsiya-termojet-moldova-cazan-md/.
// Текст навмисно переписано під профіль termojet.com.ua (спершу система розподілу тепла
// й обладнання для котелень, теплові насоси — посиланнями на tjheatpump), щоб два наші
// сайти не мали дубля тексту.

const HP = 'https://tjheatpump.com.ua'
const HP_HOW = `${HP}/blog/yak-pratsyuye-teplovyy-nasos/`
const CAZAN = 'https://cazan.md/'
const IMG_ZALA = '/images/blog/prezentatsiya-moldova-zala.jpg =1280x1192'
const IMG_STENDY = '/images/blog/prezentatsiya-moldova-stendy.jpg =1200x900'
const KOT = '/blog/kotelnya-pid-klyuch-modulna-obvyazka'
const GS = '/blog/gidrostrilka-rozdilnyk-rozpodilnyk-koly-shcho-stavyty'
const NG = '/blog/nasosni-grupy-typy-ta-zastosuvannya'
const SEP = '/blog/separatory-shlamu-ta-povitrya'
const W = '/blog/drotove-zonalne-keruvannya-opalennyam'
const R = '/blog/bezdrotove-zonalne-keruvannya-opalennyam'

module.exports = [
  {
    slug: 'prezentatsiya-termojet-moldova-cazan-md',
    image: '/images/blog/prezentatsiya-moldova-cazan-md.jpg',
    published_at: '2026-07-27T09:00:00Z',
    category: 'Новини',
    title: 'Termojet у Молдові: презентація системи розподілу тепла разом із Cazan.md',
    seo_title: 'Презентація Termojet у Молдові з Cazan.md | Termojet',
    meta_description: 'Презентація Termojet у Молдові з Cazan.md: понад 100 монтажників і проєктувальників з Молдови та Румунії побачили гідрострілки, колектори й насосні групи.',
    excerpt: '27 липня разом із партнерами Cazan.md ми показали систему розподілу тепла Termojet понад ста фахівцям з Молдови та Румунії — від гідрострілок і колекторів до насосних груп і зонального керування.',
    content: `27 липня Termojet провів презентацію в Республіці Молдова разом із нашим партнером — компанією [Cazan.md](${CAZAN}). Подія зібрала понад сто монтажників, проєктувальників і дистриб'юторів з Молдови та Румунії. Ми привезли обладнання, яке виробляємо в Україні, щоб кожен міг роздивитися його наживо, покрутити в руках і поставити запитання інженерам.

![Зала презентації Termojet у Молдові: понад 100 фахівців з Молдови та Румунії](${IMG_ZALA})

**Termojet flow distribution system**

Головною темою була система розподілу тепла Termojet — усе, що стоїть між джерелом тепла й споживачами і відповідає за те, щоб кожен контур отримав потрібну кількість тепла потрібної температури. Котел, тепловий насос чи кілька джерел одразу — обв'язка будується з однакових заводських модулів, які стикуються без зварювання. Чому такий підхід швидший і надійніший за класичну котельню «з труб і фітингів», ми розповідали в статті [«Котельня "під ключ" за день»](${KOT}).

**Гідрострілки та колектори**

На демо-столі учасники розглядали [гідравлічні розділювачі](/catalog/hidravlichni-rozdilnyky) та [розподільчі колектори](/catalog/rozpodilchi-kolektory) у фірмовій теплоізоляції. Колектори випускаються на 25, 72, 105 і 175 кВт, а [колектори з вбудованою гідрострілкою](/catalog/kolektory-z-hidrostrilkoyu) збирають розподіл котельні в один компактний вузол. Для котелень промислових об'єктів і багатоквартирних будинків є [серія Termojet Mega](/catalog/termojet-mega) потужністю до 2200 кВт. Коли потрібна гідрострілка, а коли достатньо колектора, — пояснюємо в окремій [статті](${GS}).

**Насосні групи та циркуляційні насоси**

[Насосні групи](/catalog/nasosni-hrupy) — це готові вузли для контурів радіаторів і теплої підлоги: прямі, зі змішувачем або з термостатичним краном. Монтажник отримує зібраний і перевірений вузол замість десятка окремих деталей. Про типи насосних груп і їх застосування — у [статті-огляді](${NG}). Поруч стояли [циркуляційні насоси](/catalog/nasosy) Termojet для систем опалення, теплої підлоги та котельних вузлів.

**Клапани та сепаратори**

[Триходові та чотирьохходові змішувальні клапани](/catalog/klapany) з електроприводами точно тримають температуру в контурах, а латунні [сепаратори повітря та шламу](/catalog/separatory) очищують теплоносій і бережуть теплообмінники котла. Навіщо сепаратор у кожній системі, читайте в статті [«Сепаратори шламу та повітря»](${SEP}).

**Тепла підлога та зональне керування**

Окремий демо-стенд зібрав [систему підлогового опалення](/catalog/kolektory-pidloha) — колектор зі змішувальним вузлом — разом із термостатами та центрами комутації для [зонального керування](/catalog/zonalne-keruvannya), коли кожне приміщення отримує власну температуру. Як це влаштовано, розповідаємо в статтях про [дротову](${W}) та [бездротову](${R}) системи.

![Стенди Termojet на презентації в Молдові: клапани, насоси, сепаратори та тепла підлога](${IMG_STENDY})

**Обв'язка для теплових насосів**

Те саме обладнання — основа правильної обв'язки теплового насоса: гідрострілка розв'язує його контур і контури споживачів, а сепаратори бережуть теплообмінник. Самі [теплові насоси Termojet](${HP}/) представлені на окремому сайті, а як вони працюють — у статті [«Як працює тепловий насос»](${HP_HOW}).

**Дякуємо партнерам**

Велика подяка команді Cazan.md за організацію — для нас це була чудова нагода поспілкуватися з професіоналами з двох країн і почути, які рішення їм потрібні на об'єктах. Для партнерів з Молдови та Румунії наш сайт і каталог доступні [румунською мовою](/ro/).

**Далі — більше**

Ми продовжуємо проводити презентації та [навчання для монтажників і проєктувальників](/navchannya). Хочете працювати з Termojet у своєму регіоні? [Станьте нашим партнером](/partners).`,
    i18n: {
      en: {
        category: 'News',
        title: 'Termojet in Moldova: Presenting Our Heat Distribution System with Cazan.md',
        seo_title: 'Termojet Presentation in Moldova with Cazan.md | Termojet',
        meta_description: 'Termojet presentation in Moldova with Cazan.md: 100+ installers and designers from Moldova and Romania saw our hydraulic separators, manifolds and pump groups.',
        excerpt: 'On 27 July, together with our partners Cazan.md, we showed more than a hundred professionals from Moldova and Romania the Termojet heat distribution system — from hydraulic separators and manifolds to pump groups and zone control.',
        content: `On 27 July Termojet held a presentation in the Republic of Moldova together with our partner [Cazan.md](${CAZAN}). The event brought together more than a hundred installers, designers and distributors from Moldova and Romania. We brought the equipment we manufacture in Ukraine so everyone could see it first-hand, handle it and put their questions to our engineers.

![The Termojet presentation hall in Moldova: more than 100 professionals from Moldova and Romania](${IMG_ZALA})

**Termojet flow distribution system**

The main topic was the Termojet heat distribution system — everything between the heat source and the consumers that makes sure every circuit gets the right amount of heat at the right temperature. Whether it is a boiler, a heat pump or several sources at once, the piping is built from identical factory-made modules that connect without welding. Why this approach is faster and more reliable than a classic boiler room "made of pipes and fittings" is explained in our article ["A Turnkey Boiler Room in a Day"](${KOT}).

**Hydraulic separators and manifolds**

On the demo table, attendees examined [hydraulic separators](/catalog/hidravlichni-rozdilnyky) and [distribution manifolds](/catalog/rozpodilchi-kolektory) in our branded insulation. Manifolds come in 25, 72, 105 and 175 kW versions, while [manifolds with an integrated hydraulic separator](/catalog/kolektory-z-hidrostrilkoyu) bring boiler-room distribution into one compact unit. For industrial sites and apartment buildings there is the [Termojet Mega series](/catalog/termojet-mega) of up to 2200 kW. When you need a hydraulic separator and when a manifold is enough is covered in a separate [article](${GS}).

**Pump groups and circulation pumps**

[Pump groups](/catalog/nasosni-hrupy) are ready-made units for radiator and underfloor heating circuits: direct, with a mixing valve or with a thermostatic valve. The installer gets an assembled, tested unit instead of a dozen separate parts. Pump group types and their uses are described in our [overview article](${NG}). Next to them stood Termojet [circulation pumps](/catalog/nasosy) for heating systems, underfloor heating and boiler-room units.

**Valves and separators**

[Three- and four-way mixing valves](/catalog/klapany) with electric actuators hold circuit temperatures precisely, while brass [air and dirt separators](/catalog/separatory) clean the heating water and protect the boiler's heat exchangers. Why every system needs a separator is explained in ["Dirt and Air Separators"](${SEP}).

**Underfloor heating and zone control**

A dedicated demo board brought together an [underfloor heating system](/catalog/kolektory-pidloha) — a manifold with a mixing unit — and the thermostats and wiring centres for [zone control](/catalog/zonalne-keruvannya), so every room gets its own temperature. How it works is covered in our articles on [wired](${W}) and [wireless](${R}) systems.

![Termojet stands at the presentation in Moldova: valves, pumps, separators and underfloor heating](${IMG_STENDY})

**Piping for heat pumps**

The same equipment is the basis of proper heat pump piping: a hydraulic separator decouples the heat pump circuit from the consumer circuits, and separators protect its heat exchanger. [Termojet heat pumps](${HP}/en/) themselves are presented on a separate website, and how they work is explained in ["How a Heat Pump Works"](${HP}/en/blog/yak-pratsyuye-teplovyy-nasos/).

**Thank you, partners**

A big thank-you to the Cazan.md team for organising the event — it was a great chance to talk with professionals from two countries and hear which solutions they need on their projects. For partners in Moldova and Romania our website and catalogue are available [in Romanian](/ro/).

**More to come**

We keep running presentations and [training for installers and designers](/navchannya). Want to work with Termojet in your region? [Become our partner](/partners).`,
      },
      pl: {
        category: 'Aktualności',
        title: 'Termojet w Mołdawii: prezentacja systemu rozdziału ciepła z Cazan.md',
        seo_title: 'Prezentacja Termojet w Mołdawii z Cazan.md | Termojet',
        meta_description: 'Prezentacja Termojet w Mołdawii z Cazan.md: ponad 100 instalatorów i projektantów poznało sprzęgła hydrauliczne, rozdzielacze i grupy pompowe.',
        excerpt: '27 lipca razem z partnerami z Cazan.md pokazaliśmy ponad stu specjalistom z Mołdawii i Rumunii system rozdziału ciepła Termojet — od sprzęgieł hydraulicznych i rozdzielaczy po grupy pompowe i sterowanie strefowe.',
        content: `27 lipca Termojet przeprowadził prezentację w Republice Mołdawii razem z naszym partnerem — firmą [Cazan.md](${CAZAN}). Wydarzenie zgromadziło ponad stu instalatorów, projektantów i dystrybutorów z Mołdawii i Rumunii. Przywieźliśmy urządzenia, które produkujemy w Ukrainie, aby każdy mógł obejrzeć je na żywo, wziąć do ręki i zadać pytania naszym inżynierom.

![Sala prezentacji Termojet w Mołdawii: ponad 100 specjalistów z Mołdawii i Rumunii](${IMG_ZALA})

**Termojet flow distribution system**

Głównym tematem był system rozdziału ciepła Termojet — wszystko, co znajduje się między źródłem ciepła a odbiornikami i odpowiada za to, by każdy obieg otrzymał właściwą ilość ciepła o właściwej temperaturze. Kocioł, pompa ciepła czy kilka źródeł naraz — instalacja powstaje z jednakowych fabrycznych modułów łączonych bez spawania. Dlaczego to szybsze i pewniejsze niż klasyczna kotłownia „z rur i kształtek", wyjaśniamy w artykule [„Kotłownia pod klucz w jeden dzień"](${KOT}).

**Sprzęgła hydrauliczne i rozdzielacze**

Na stole demonstracyjnym uczestnicy oglądali [sprzęgła hydrauliczne](/catalog/hidravlichni-rozdilnyky) i [rozdzielacze](/catalog/rozpodilchi-kolektory) w firmowej izolacji termicznej. Rozdzielacze produkujemy w wersjach 25, 72, 105 i 175 kW, a [rozdzielacze ze zintegrowanym sprzęgłem](/catalog/kolektory-z-hidrostrilkoyu) łączą rozdział kotłowni w jeden kompaktowy zespół. Dla obiektów przemysłowych i budynków wielorodzinnych jest [seria Termojet Mega](/catalog/termojet-mega) o mocy do 2200 kW. Kiedy potrzebne jest sprzęgło, a kiedy wystarczy rozdzielacz — wyjaśniamy w osobnym [artykule](${GS}).

**Grupy pompowe i pompy obiegowe**

[Grupy pompowe](/catalog/nasosni-hrupy) to gotowe zespoły dla obiegów grzejnikowych i ogrzewania podłogowego: bezpośrednie, z zaworem mieszającym lub z zaworem termostatycznym. Instalator dostaje zmontowany i sprawdzony zespół zamiast kilkunastu osobnych części. O rodzajach grup pompowych piszemy w [artykule przeglądowym](${NG}). Obok stały [pompy obiegowe](/catalog/nasosy) Termojet do instalacji grzewczych, ogrzewania podłogowego i zespołów kotłowni.

**Zawory i separatory**

[Trój- i czterodrogowe zawory mieszające](/catalog/klapany) z siłownikami elektrycznymi precyzyjnie utrzymują temperaturę w obiegach, a mosiężne [separatory powietrza i zanieczyszczeń](/catalog/separatory) oczyszczają czynnik grzewczy i chronią wymienniki kotła. Dlaczego separator jest potrzebny w każdej instalacji — w artykule [„Separatory zanieczyszczeń i powietrza"](${SEP}).

**Ogrzewanie podłogowe i sterowanie strefowe**

Osobna tablica demonstracyjna pokazywała [system ogrzewania podłogowego](/catalog/kolektory-pidloha) — rozdzielacz z układem mieszającym — wraz z termostatami i listwami sterującymi do [sterowania strefowego](/catalog/zonalne-keruvannya), dzięki któremu każde pomieszczenie ma własną temperaturę. Jak to działa, opisujemy w artykułach o systemie [przewodowym](${W}) i [bezprzewodowym](${R}).

![Stoiska Termojet na prezentacji w Mołdawii: zawory, pompy, separatory i ogrzewanie podłogowe](${IMG_STENDY})

**Instalacja pomp ciepła**

Te same urządzenia są podstawą prawidłowego podłączenia pompy ciepła: sprzęgło hydrauliczne oddziela obieg pompy od obiegów odbiorników, a separatory chronią jej wymiennik. Same [pompy ciepła Termojet](${HP}/en/) prezentujemy na osobnej stronie, a jak działają — wyjaśnia artykuł [„Jak działa pompa ciepła"](${HP}/en/blog/yak-pratsyuye-teplovyy-nasos/).

**Dziękujemy partnerom**

Serdecznie dziękujemy zespołowi Cazan.md za organizację — to była świetna okazja, by porozmawiać z profesjonalistami z dwóch krajów i usłyszeć, jakich rozwiązań potrzebują na swoich obiektach. Dla partnerów z Mołdawii i Rumunii nasza strona i katalog są dostępne [w języku rumuńskim](/ro/).

**To nie koniec**

Nadal prowadzimy prezentacje i [szkolenia dla instalatorów i projektantów](/navchannya). Chcesz współpracować z Termojet w swoim regionie? [Zostań naszym partnerem](/partners).`,
      },
      fr: {
        category: 'Actualités',
        title: 'Termojet en Moldavie : présentation de notre système de distribution de chaleur avec Cazan.md',
        seo_title: 'Présentation Termojet en Moldavie avec Cazan.md | Termojet',
        meta_description: 'Termojet en Moldavie avec Cazan.md : plus de 100 installateurs de Moldavie et de Roumanie ont découvert nos bouteilles de découplage et collecteurs.',
        excerpt: 'Le 27 juillet, avec nos partenaires de Cazan.md, nous avons présenté à plus d’une centaine de professionnels de Moldavie et de Roumanie le système de distribution de chaleur Termojet — des bouteilles de découplage et collecteurs aux groupes de pompage et à la régulation par zones.',
        content: `Le 27 juillet, Termojet a organisé une présentation en République de Moldavie avec notre partenaire, la société [Cazan.md](${CAZAN}). L’événement a réuni plus d’une centaine d’installateurs, de bureaux d’études et de distributeurs de Moldavie et de Roumanie. Nous avons apporté les équipements que nous fabriquons en Ukraine pour que chacun puisse les voir de près, les manipuler et poser ses questions à nos ingénieurs.

![La salle de la présentation Termojet en Moldavie : plus de 100 professionnels de Moldavie et de Roumanie](${IMG_ZALA})

**Termojet flow distribution system**

Le thème principal était le système de distribution de chaleur Termojet — tout ce qui se trouve entre la source de chaleur et les émetteurs et qui permet à chaque circuit de recevoir la bonne quantité de chaleur à la bonne température. Chaudière, pompe à chaleur ou plusieurs sources à la fois : l’installation se compose de modules d’usine identiques qui se raccordent sans soudure. Pourquoi cette approche est plus rapide et plus fiable qu’une chaufferie classique « en tubes et raccords », nous l’expliquons dans l’article [« Une chaufferie clé en main en une journée »](${KOT}).

**Bouteilles de découplage et collecteurs**

Sur la table de démonstration, les participants ont examiné les [bouteilles de découplage hydraulique](/catalog/hidravlichni-rozdilnyky) et les [collecteurs de distribution](/catalog/rozpodilchi-kolektory) dans notre isolation thermique. Les collecteurs existent en 25, 72, 105 et 175 kW, et les [collecteurs avec bouteille intégrée](/catalog/kolektory-z-hidrostrilkoyu) regroupent la distribution de la chaufferie en un seul module compact. Pour les sites industriels et les immeubles collectifs, il existe la [série Termojet Mega](/catalog/termojet-mega) jusqu’à 2200 kW. Quand faut-il une bouteille de découplage et quand un collecteur suffit-il ? Réponse dans un [article dédié](${GS}).

**Groupes de pompage et circulateurs**

Les [groupes de pompage](/catalog/nasosni-hrupy) sont des modules prêts à poser pour les circuits de radiateurs et de plancher chauffant : directs, avec vanne mélangeuse ou avec vanne thermostatique. L’installateur reçoit un module assemblé et testé au lieu d’une dizaine de pièces séparées. Les types de groupes de pompage sont présentés dans notre [article de synthèse](${NG}). À côté se trouvaient les [circulateurs](/catalog/nasosy) Termojet pour le chauffage, le plancher chauffant et les modules de chaufferie.

**Vannes et séparateurs**

Les [vannes mélangeuses trois et quatre voies](/catalog/klapany) avec servomoteurs électriques maintiennent précisément la température des circuits, tandis que les [séparateurs d’air et de boues](/catalog/separatory) en laiton nettoient le fluide caloporteur et protègent les échangeurs de la chaudière. Pourquoi chaque installation a besoin d’un séparateur : voir l’article [« Séparateurs de boues et d’air »](${SEP}).

**Plancher chauffant et régulation par zones**

Un panneau de démonstration réunissait un [système de plancher chauffant](/catalog/kolektory-pidloha) — collecteur avec module de mélange — ainsi que les thermostats et les centrales de connexion pour la [régulation par zones](/catalog/zonalne-keruvannya), afin que chaque pièce ait sa propre température. Le fonctionnement est expliqué dans nos articles sur les systèmes [filaires](${W}) et [sans fil](${R}).

![Les stands Termojet lors de la présentation en Moldavie : vannes, circulateurs, séparateurs et plancher chauffant](${IMG_STENDY})

**Raccordement des pompes à chaleur**

Ces mêmes équipements sont la base d’un bon raccordement de pompe à chaleur : la bouteille de découplage sépare le circuit de la pompe des circuits des émetteurs, et les séparateurs protègent son échangeur. Les [pompes à chaleur Termojet](${HP}/en/) sont présentées sur un site dédié, et leur fonctionnement est expliqué dans l’article [« Comment fonctionne une pompe à chaleur »](${HP}/en/blog/yak-pratsyuye-teplovyy-nasos/).

**Merci à nos partenaires**

Un grand merci à l’équipe de Cazan.md pour l’organisation — ce fut une excellente occasion d’échanger avec des professionnels de deux pays et d’entendre quelles solutions ils attendent sur leurs chantiers. Pour nos partenaires de Moldavie et de Roumanie, notre site et notre catalogue sont disponibles [en roumain](/ro/).

**Et ce n’est qu’un début**

Nous continuons à organiser des présentations et des [formations pour installateurs et bureaux d’études](/navchannya). Vous souhaitez travailler avec Termojet dans votre région ? [Devenez notre partenaire](/partners).`,
      },
      de: {
        category: 'Neuigkeiten',
        title: 'Termojet in Moldau: Präsentation unseres Wärmeverteilsystems mit Cazan.md',
        seo_title: 'Termojet-Präsentation in Moldau mit Cazan.md | Termojet',
        meta_description: 'Termojet-Präsentation in Moldau mit Cazan.md: über 100 Installateure und Planer aus Moldau und Rumänien sahen Hydraulische Weichen, Verteiler und Pumpengruppen.',
        excerpt: 'Am 27. Juli haben wir gemeinsam mit unserem Partner Cazan.md über hundert Fachleuten aus Moldau und Rumänien das Wärmeverteilsystem von Termojet vorgestellt — von Hydraulischen Weichen und Verteilern bis zu Pumpengruppen und Einzelraumregelung.',
        content: `Am 27. Juli hat Termojet gemeinsam mit unserem Partner, dem Unternehmen [Cazan.md](${CAZAN}), eine Präsentation in der Republik Moldau durchgeführt. Die Veranstaltung brachte über hundert Installateure, Planer und Händler aus Moldau und Rumänien zusammen. Wir haben die Produkte mitgebracht, die wir in der Ukraine herstellen, damit jeder sie aus der Nähe ansehen, in die Hand nehmen und unseren Ingenieuren Fragen stellen konnte.

![Der Saal der Termojet-Präsentation in Moldau: über 100 Fachleute aus Moldau und Rumänien](${IMG_ZALA})

**Termojet flow distribution system**

Hauptthema war das Wärmeverteilsystem von Termojet — alles zwischen Wärmeerzeuger und Verbrauchern, was dafür sorgt, dass jeder Heizkreis die richtige Wärmemenge mit der richtigen Temperatur erhält. Ob Heizkessel, Wärmepumpe oder mehrere Erzeuger zugleich: Die Anlage wird aus gleichen Fertigmodulen aufgebaut, die ohne Schweißen verbunden werden. Warum das schneller und zuverlässiger ist als ein klassischer Heizraum „aus Rohren und Fittings", erklären wir im Artikel [„Heizraum schlüsselfertig an einem Tag"](${KOT}).

**Hydraulische Weichen und Verteiler**

Am Demotisch sahen sich die Teilnehmer [Hydraulische Weichen](/catalog/hidravlichni-rozdilnyky) und [Heizkreisverteiler](/catalog/rozpodilchi-kolektory) in unserer Markendämmung an. Die Verteiler gibt es für 25, 72, 105 und 175 kW, und [Verteiler mit integrierter Weiche](/catalog/kolektory-z-hidrostrilkoyu) fassen die Verteilung des Heizraums in einer kompakten Einheit zusammen. Für Industrieobjekte und Mehrfamilienhäuser gibt es die [Serie Termojet Mega](/catalog/termojet-mega) mit bis zu 2200 kW. Wann eine Hydraulische Weiche nötig ist und wann ein Verteiler genügt, erklärt ein eigener [Artikel](${GS}).

**Pumpengruppen und Umwälzpumpen**

[Pumpengruppen](/catalog/nasosni-hrupy) sind fertige Einheiten für Heizkörper- und Fußbodenheizkreise: ungemischt, mit Mischer oder mit Thermostatventil. Der Installateur erhält eine montierte und geprüfte Einheit statt eines Dutzends Einzelteile. Die Arten von Pumpengruppen stellen wir in einem [Übersichtsartikel](${NG}) vor. Daneben standen [Umwälzpumpen](/catalog/nasosy) von Termojet für Heizungsanlagen, Fußbodenheizung und Heizraummodule.

**Ventile und Abscheider**

[Drei- und Vierwege-Mischventile](/catalog/klapany) mit elektrischen Stellantrieben halten die Temperatur in den Kreisen präzise, und [Luft- und Schlammabscheider](/catalog/separatory) aus Messing reinigen das Heizwasser und schützen die Wärmetauscher des Kessels. Warum jede Anlage einen Abscheider braucht, lesen Sie im Artikel [„Schlamm- und Luftabscheider"](${SEP}).

**Fußbodenheizung und Einzelraumregelung**

Eine eigene Demotafel zeigte ein [Fußbodenheizungssystem](/catalog/kolektory-pidloha) — Verteiler mit Mischeinheit — zusammen mit Thermostaten und Klemmleisten für die [Einzelraumregelung](/catalog/zonalne-keruvannya), damit jeder Raum seine eigene Temperatur bekommt. Wie das funktioniert, beschreiben unsere Artikel über [kabelgebundene](${W}) und [kabellose](${R}) Systeme.

![Termojet-Stände bei der Präsentation in Moldau: Ventile, Pumpen, Abscheider und Fußbodenheizung](${IMG_STENDY})

**Anbindung von Wärmepumpen**

Dieselben Komponenten sind die Grundlage einer richtigen Wärmepumpen-Anbindung: Die Hydraulische Weiche trennt den Wärmepumpenkreis von den Verbraucherkreisen, und Abscheider schützen ihren Wärmetauscher. Die [Wärmepumpen von Termojet](${HP}/en/) präsentieren wir auf einer eigenen Website, wie sie funktionieren, erklärt der Artikel [„Wie funktioniert eine Wärmepumpe"](${HP}/en/blog/yak-pratsyuye-teplovyy-nasos/).

**Danke an unsere Partner**

Ein großes Dankeschön an das Team von Cazan.md für die Organisation — es war eine großartige Gelegenheit, mit Fachleuten aus zwei Ländern zu sprechen und zu hören, welche Lösungen sie auf ihren Baustellen brauchen. Für Partner aus Moldau und Rumänien sind unsere Website und unser Katalog [auf Rumänisch](/ro/) verfügbar.

**Es geht weiter**

Wir veranstalten weiterhin Präsentationen und [Schulungen für Installateure und Planer](/navchannya). Sie möchten Termojet in Ihrer Region vertreten? [Werden Sie unser Partner](/partners).`,
      },
      ro: {
        category: 'Știri',
        title: 'Termojet în Moldova: prezentarea sistemului de distribuție a căldurii împreună cu Cazan.md',
        seo_title: 'Prezentarea Termojet în Moldova cu Cazan.md | Termojet',
        meta_description: 'Prezentarea Termojet în Moldova cu Cazan.md: peste 100 de instalatori și proiectanți au văzut butelii de egalizare, distribuitoare și grupuri de pompare.',
        excerpt: 'Pe 27 iulie, împreună cu partenerii noștri de la Cazan.md, am prezentat peste o sută de specialiști din Moldova și România sistemul Termojet de distribuție a căldurii — de la butelii de egalizare și distribuitoare la grupuri de pompare și control zonal.',
        content: `Pe 27 iulie, Termojet a organizat o prezentare în Republica Moldova împreună cu partenerul nostru, compania [Cazan.md](${CAZAN}). Evenimentul a reunit peste o sută de instalatori, proiectanți și distribuitori din Moldova și România. Am adus echipamentele pe care le producem în Ucraina, pentru ca fiecare să le poată vedea de aproape, să le țină în mână și să le adreseze întrebări inginerilor noștri.

![Sala prezentării Termojet în Moldova: peste 100 de specialiști din Moldova și România](${IMG_ZALA})

**Termojet flow distribution system**

Tema principală a fost sistemul Termojet de distribuție a căldurii — tot ce se află între sursa de căldură și consumatori și asigură ca fiecare circuit să primească cantitatea potrivită de căldură, la temperatura potrivită. Fie că este vorba de un cazan, de o pompă de căldură sau de mai multe surse simultan, instalația se construiește din module identice, fabricate în uzină, care se îmbină fără sudură. De ce această abordare este mai rapidă și mai fiabilă decât o centrală termică clasică „din țevi și fitinguri" explicăm în articolul [„Centrală termică la cheie într-o zi"](${KOT}).

**Butelii de egalizare și distribuitoare**

Pe masa demonstrativă, participanții au examinat [buteliile de egalizare hidraulică](/catalog/hidravlichni-rozdilnyky) și [distribuitoarele](/catalog/rozpodilchi-kolektory) cu izolația termică proprie. Distribuitoarele se produc în variante de 25, 72, 105 și 175 kW, iar [distribuitoarele cu butelie integrată](/catalog/kolektory-z-hidrostrilkoyu) reunesc distribuția centralei termice într-un singur modul compact. Pentru obiective industriale și blocuri de locuințe există [seria Termojet Mega](/catalog/termojet-mega), cu puteri de până la 2200 kW. Când este nevoie de o butelie de egalizare și când este suficient un distribuitor explicăm într-un [articol separat](${GS}).

**Grupuri de pompare și pompe de circulație**

[Grupurile de pompare](/catalog/nasosni-hrupy) sunt module gata făcute pentru circuitele de calorifere și de încălzire în pardoseală: directe, cu vană de amestec sau cu ventil termostatic. Instalatorul primește un modul asamblat și testat în locul a zeci de piese separate. Tipurile de grupuri de pompare sunt prezentate în [articolul nostru de sinteză](${NG}). Alături au stat [pompele de circulație](/catalog/nasosy) Termojet pentru încălzire, încălzire în pardoseală și modulele centralei termice.

**Robinete și separatoare**

[Robinetele de amestec cu trei și patru căi](/catalog/klapany) cu servomotoare electrice mențin precis temperatura în circuite, iar [separatoarele de aer și nămol](/catalog/separatory) din alamă curăță agentul termic și protejează schimbătoarele de căldură ale cazanului. De ce fiecare instalație are nevoie de un separator aflați din articolul [„Separatoare de nămol și aer"](${SEP}).

**Încălzire în pardoseală și control zonal**

Un panou demonstrativ separat a reunit un [sistem de încălzire în pardoseală](/catalog/kolektory-pidloha) — distribuitor cu modul de amestec — împreună cu termostatele și centrele de comutație pentru [controlul zonal](/catalog/zonalne-keruvannya), astfel încât fiecare încăpere să aibă propria temperatură. Cum funcționează descriem în articolele despre sistemul [cu fir](${W}) și cel [fără fir](${R}).

![Standurile Termojet la prezentarea din Moldova: robinete, pompe, separatoare și încălzire în pardoseală](${IMG_STENDY})

**Racordarea pompelor de căldură**

Aceleași echipamente stau la baza racordării corecte a unei pompe de căldură: butelia de egalizare separă circuitul pompei de circuitele consumatorilor, iar separatoarele îi protejează schimbătorul de căldură. [Pompele de căldură Termojet](${HP}/en/) sunt prezentate pe un site separat, iar cum funcționează explică articolul [„Cum funcționează o pompă de căldură"](${HP}/en/blog/yak-pratsyuye-teplovyy-nasos/).

**Mulțumim partenerilor**

Mulțumim din suflet echipei Cazan.md pentru organizare — a fost o ocazie excelentă de a discuta cu profesioniști din două țări și de a afla de ce soluții au nevoie pe șantierele lor. Întregul catalog Termojet este disponibil în limba română chiar pe acest site — [vedeți catalogul](/catalog).

**Continuăm**

Organizăm în continuare prezentări și [instruiri pentru instalatori și proiectanți](/navchannya). Doriți să lucrați cu Termojet în regiunea dumneavoastră? [Deveniți partenerul nostru](/partners).`,
      },
    },
  },
]
