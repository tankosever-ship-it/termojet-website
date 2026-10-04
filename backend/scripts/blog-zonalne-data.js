// Дві статті про зональне керування опаленням (дротове / бездротове) — дані для
// apply-blog-zonalne.js. Текст — із документів відділу (жовтень 2026) з мінімальною
// редактурою: «центр комунікації» → «центр комутації» (як у назві товару),
// «Smart Lite» → «Smart Life» (назва застосунку), дрібна граматика.
// Розмітка тексту — див. contentBlocks() у src/pages/BlogPostPage.jsx.

const W = 'drotove-zonalne-keruvannya-opalennyam'
const R = 'bezdrotove-zonalne-keruvannya-opalennyam'
const ZK = '/catalog/zonalne-keruvannya'
const IMG_W = '/images/zonalne/skhema-drotovogo-zonalnogo-keruvannya.jpg =1250x664'
const IMG_R = '/images/zonalne/skhema-bezdrotovogo-zonalnogo-keruvannya.jpg =1306x625'

module.exports = [
  {
    slug: W,
    image: '/images/zonalne/drotove-zonalne-keruvannya.jpg',
    published_at: '2026-10-04T09:00:00Z',
    category: 'Статті',
    title: 'Дротова система зонального керування опаленням будинку',
    seo_title: 'Дротове зональне керування опаленням: схема | Termojet',
    meta_description: 'Дротова система зонального керування опаленням: схема підключення, центр комутації TJ-03-C, термостати HT-120/HT-130, сервоприводи. Економія 15–35%.',
    excerpt: 'Зональне керування дає змогу тримати окрему температуру в кожній кімнаті й не гріти порожні приміщення. Розбираємо дротову систему: схему, обладнання та функції кожного елемента.',
    content: `Типова система опалення регулює температуру всього будинку в цілому. Це означає, що тепло може витрачатися в кімнатах, які в певний момент не використовуються. Зональна система опалення дає змогу контролювати температуру в окремих зонах або кімнатах будинку. Систему можна налаштувати так, як вам потрібно, з урахуванням вподобань кожного мешканця щодо тепла та умов використання різних приміщень. Отже, [зональне керування](${ZK}) допомагає опалювати оселю набагато ефективніше, подаючи тепло лише тоді й туди, де воно потрібне. А це, своєю чергою, знижує витрати на опалення чи охолодження на 15–35% завдяки відключенню зон, які в певний момент не використовуються.

Існує два типи систем зонального керування температурою будинку: дротова та [бездротова](/blog/${R}). У цій статті зупинимося на особливостях дротової системи.

**Як працює дротова система**

У дротовій системі елементи — контролери, термостати, сервоприводи та датчики — з'єднуються між собою проводами. Тому вона краще підходить для нового будівництва, де ще не зроблено ремонт і є можливість прокласти кабелі.

**Схема дротової системи зонального керування**

Типова схема дротової системи зонального керування виглядає так:

![Схема дротової системи зонального керування опаленням Termojet: центр комутації TJ-03-C, термостати HT-120 і HT-130, сервоприводи M30x1,5, насос і котел](${IMG_W})

**Основні елементи системи та їх функції**

- [TJ-03-C](${ZK}/tj03cwrd) — 8-зонний дротовий центр комутації. Забезпечує зональний контроль температури завдяки автоматичному керуванню сервоприводами, циркуляційним насосом і котлом. Підтримує керування до 8 зон і до 19 сервоприводів.
- [Сервоприводи M30x1,5](${ZK}/920018tj) — забезпечують плавне регулювання потоку теплоносія, керуючи відповідними клапанами [колектора теплої підлоги](/catalog/kolektory-pidloha).
- [HT-120](${ZK}/ht120blk) і [HT-130](${ZK}/ht130wht) — дротові кімнатні термостати. Точно керують температурою в приміщенні, підключаються до Wi-Fi і підтримують дистанційне керування через застосунок Smart Life.
- [Циркуляційний насос (водяна помпа)](/catalog/nasosy) — забезпечує циркуляцію теплоносія, керується електричним сигналом ~230 В, 50 Гц.
- Котел — джерело тепла, керується через безпотенційний контакт.
- Смартфон — дистанційно керує дротовою системою зонального керування через застосунок Smart Life по Wi-Fi.

**Ключові висновки**

- Зональна система керування опаленням забезпечує індивідуальний контроль температури в різних зонах, що підвищує комфорт для кожного мешканця.
- Витрати теплової енергії зменшуються на 15–35% завдяки опаленню лише тих зон, які використовуються в цей момент.
- Усі процеси керування відбуваються автоматично й дистанційно, що дуже зручно в щоденній експлуатації системи.

Ремонт уже зроблено і прокладати кабелі не хочеться? Зверніть увагу на [бездротову систему зонального керування](/blog/${R}) — вона працює без проводів, через Zigbee та Wi-Fi. А якщо ви тільки обираєте тип опалення, почитайте, [що краще: тепла підлога чи радіатори](/blog/tepla-pidloga-chy-radiatory-shcho-obraty).`,
    i18n: {
      en: {
        category: 'Articles',
        title: 'Wired Zone Control System for Home Heating',
        seo_title: 'Wired Zone Heating Control: Wiring Diagram | Termojet',
        meta_description: 'Wired zone heating control explained: wiring diagram, TJ-03-C wiring centre, HT-120/HT-130 thermostats and actuators. Cut heating costs by 15–35%.',
        excerpt: 'Zone control lets you keep a different temperature in every room and stop heating empty spaces. We break down the wired system: the diagram, the equipment and the role of each component.',
        content: `A typical heating system regulates the temperature of the whole house at once. This means heat can be wasted in rooms that are not in use at a given moment. A zoned heating system, by contrast, lets you control the temperature in individual zones or rooms of your home. You can set the system up exactly the way you need, taking into account each occupant's comfort preferences and how different rooms are used. In this way, [zone control](${ZK}) helps heat your home far more efficiently, delivering heat only when and where it is needed. This in turn reduces heating or cooling costs by 15–35% by switching off zones that are not in use at the moment.

There are two types of home zone temperature control systems: wired and [wireless](/blog/${R}). In this article we focus on the features of the wired system.

**How the wired system works**

In a wired system, the components — controllers, thermostats, actuators and sensors — are connected to each other with cables. That is why it is best suited to new builds, where the interior finishing has not been done yet and cables can still be laid.

**Wired zone control system diagram**

A typical wired zone control system looks like this:

![Termojet wired zone heating control diagram: TJ-03-C wiring centre, HT-120 and HT-130 thermostats, M30x1.5 actuators, pump and boiler](${IMG_W})

**Main components and their functions**

- [TJ-03-C](${ZK}/tj03cwrd) — 8-zone wired wiring centre. Provides zone temperature control by automatically operating the actuators, the circulation pump and the boiler. Supports up to 8 zones and up to 19 actuators.
- [M30x1.5 actuators](${ZK}/920018tj) — provide smooth regulation of the heating water flow by operating the corresponding valves of the [underfloor heating manifold](/catalog/kolektory-pidloha).
- [HT-120](${ZK}/ht120blk) and [HT-130](${ZK}/ht130wht) — wired room thermostats. They precisely control the room temperature, connect to Wi-Fi and support remote control via the Smart Life app.
- [Circulation pump](/catalog/nasosy) — circulates the heating water; controlled by a ~230 V, 50 Hz electrical signal.
- Boiler — the heat source; controlled via a volt-free contact.
- Smartphone — remotely controls the wired zone control system via the Smart Life app over Wi-Fi.

**Key takeaways**

- A zoned heating control system provides individual temperature control in different zones, improving comfort for every occupant.
- Heat energy consumption drops by 15–35% because only the zones in use at the moment are heated.
- All control processes run automatically and remotely, which makes day-to-day operation very convenient.

Interior finishing already done and no wish to lay cables? Take a look at the [wireless zone control system](/blog/${R}) — it works without wires, over Zigbee and Wi-Fi. And if you are still choosing a heating type, read [underfloor heating or radiators: which is better](/blog/tepla-pidloga-chy-radiatory-shcho-obraty).`,
      },
      pl: {
        category: 'Artykuły',
        title: 'Przewodowy system strefowego sterowania ogrzewaniem domu',
        seo_title: 'Przewodowe sterowanie strefowe: schemat | Termojet',
        meta_description: 'Przewodowy system strefowego sterowania ogrzewaniem: schemat podłączenia, listwa TJ-03-C, termostaty HT-120/HT-130, siłowniki. Oszczędność 15–35%.',
        excerpt: 'Sterowanie strefowe pozwala utrzymywać inną temperaturę w każdym pomieszczeniu i nie ogrzewać pustych pokoi. Omawiamy system przewodowy: schemat, urządzenia i funkcje każdego elementu.',
        content: `Typowa instalacja grzewcza reguluje temperaturę całego domu naraz. Oznacza to, że ciepło może być marnowane w pomieszczeniach, które w danej chwili nie są używane. System ogrzewania strefowego pozwala natomiast kontrolować temperaturę w poszczególnych strefach lub pomieszczeniach domu. System można skonfigurować dokładnie tak, jak potrzebujesz, uwzględniając preferencje cieplne każdego domownika i sposób korzystania z różnych pomieszczeń. Dzięki temu [sterowanie strefowe](${ZK}) pozwala ogrzewać dom znacznie efektywniej, dostarczając ciepło tylko wtedy i tam, gdzie jest potrzebne. To z kolei obniża koszty ogrzewania lub chłodzenia o 15–35% dzięki wyłączaniu stref, które w danej chwili nie są używane.

Istnieją dwa rodzaje systemów strefowej regulacji temperatury w domu: przewodowy i [bezprzewodowy](/blog/${R}). W tym artykule skupimy się na cechach systemu przewodowego.

**Jak działa system przewodowy**

W systemie przewodowym elementy — sterowniki, termostaty, siłowniki i czujniki — są połączone ze sobą przewodami. Dlatego najlepiej sprawdza się w nowym budownictwie, gdzie nie wykonano jeszcze wykończenia i można poprowadzić kable.

**Schemat przewodowego systemu sterowania strefowego**

Typowy schemat przewodowego systemu sterowania strefowego wygląda tak:

![Schemat przewodowego strefowego sterowania ogrzewaniem Termojet: listwa TJ-03-C, termostaty HT-120 i HT-130, siłowniki M30x1,5, pompa i kocioł](${IMG_W})

**Główne elementy systemu i ich funkcje**

- [TJ-03-C](${ZK}/tj03cwrd) — 8-strefowa przewodowa listwa sterująca. Zapewnia strefową kontrolę temperatury dzięki automatycznemu sterowaniu siłownikami, pompą obiegową i kotłem. Obsługuje do 8 stref i do 19 siłowników.
- [Siłowniki M30x1,5](${ZK}/920018tj) — zapewniają płynną regulację przepływu czynnika grzewczego, sterując odpowiednimi zaworami [rozdzielacza ogrzewania podłogowego](/catalog/kolektory-pidloha).
- [HT-120](${ZK}/ht120blk) i [HT-130](${ZK}/ht130wht) — przewodowe termostaty pokojowe. Precyzyjnie sterują temperaturą w pomieszczeniu, łączą się z Wi-Fi i obsługują zdalne sterowanie przez aplikację Smart Life.
- [Pompa obiegowa](/catalog/nasosy) — zapewnia cyrkulację czynnika grzewczego, sterowana sygnałem elektrycznym ~230 V, 50 Hz.
- Kocioł — źródło ciepła, sterowany przez styk bezpotencjałowy.
- Smartfon — zdalnie steruje przewodowym systemem strefowym przez aplikację Smart Life przez Wi-Fi.

**Najważniejsze wnioski**

- Strefowy system sterowania ogrzewaniem zapewnia indywidualną kontrolę temperatury w różnych strefach, co zwiększa komfort każdego domownika.
- Zużycie energii cieplnej spada o 15–35%, ponieważ ogrzewane są tylko strefy używane w danej chwili.
- Wszystkie procesy sterowania przebiegają automatycznie i zdalnie, co jest bardzo wygodne w codziennej eksploatacji.

Wykończenie już zrobione i nie chcesz prowadzić kabli? Zwróć uwagę na [bezprzewodowy system sterowania strefowego](/blog/${R}) — działa bez przewodów, przez Zigbee i Wi-Fi. A jeśli dopiero wybierasz rodzaj ogrzewania, przeczytaj, [co lepsze: ogrzewanie podłogowe czy grzejniki](/blog/tepla-pidloga-chy-radiatory-shcho-obraty).`,
      },
      fr: {
        category: 'Articles',
        title: 'Système filaire de régulation du chauffage par zones',
        seo_title: 'Chauffage par zones filaire : schéma | Termojet',
        meta_description: 'Régulation filaire du chauffage par zones : schéma de raccordement, centrale TJ-03-C, thermostats HT-120/HT-130, actionneurs. Jusqu’à 35 % d’économie.',
        excerpt: 'La régulation par zones permet de maintenir une température différente dans chaque pièce et de ne plus chauffer les pièces vides. Nous détaillons le système filaire : schéma, équipements et rôle de chaque élément.',
        content: `Un système de chauffage classique régule la température de toute la maison à la fois. Cela signifie que de la chaleur peut être gaspillée dans des pièces inoccupées à un moment donné. Un système de chauffage par zones permet au contraire de contrôler la température de zones ou de pièces précises de votre maison. Vous pouvez le régler exactement comme vous le souhaitez, en tenant compte des préférences de chaque occupant et de l'usage des différentes pièces. Ainsi, la [régulation par zones](${ZK}) permet de chauffer votre logement bien plus efficacement, en fournissant de la chaleur uniquement quand et là où elle est nécessaire. Cela réduit les coûts de chauffage ou de climatisation de 15 à 35 % grâce à la coupure des zones inoccupées.

Il existe deux types de systèmes de régulation de la température par zones : filaire et [sans fil](/blog/${R}). Dans cet article, nous nous concentrons sur les particularités du système filaire.

**Comment fonctionne le système filaire**

Dans un système filaire, les éléments — régulateurs, thermostats, actionneurs et sondes — sont reliés entre eux par des câbles. C'est pourquoi il convient surtout aux constructions neuves, où les finitions ne sont pas encore réalisées et où il est possible de poser des câbles.

**Schéma du système filaire de régulation par zones**

Voici le schéma type d'un système filaire de régulation par zones :

![Schéma de la régulation filaire du chauffage par zones Termojet : centrale TJ-03-C, thermostats HT-120 et HT-130, actionneurs M30x1,5, pompe et chaudière](${IMG_W})

**Principaux éléments du système et leurs fonctions**

- [TJ-03-C](${ZK}/tj03cwrd) — centrale de raccordement filaire 8 zones. Assure la régulation de la température par zones en pilotant automatiquement les actionneurs, le circulateur et la chaudière. Gère jusqu'à 8 zones et jusqu'à 19 actionneurs.
- [Actionneurs M30x1,5](${ZK}/920018tj) — assurent une régulation progressive du débit d'eau de chauffage en pilotant les vannes correspondantes du [collecteur de plancher chauffant](/catalog/kolektory-pidloha).
- [HT-120](${ZK}/ht120blk) et [HT-130](${ZK}/ht130wht) — thermostats d'ambiance filaires. Ils régulent précisément la température de la pièce, se connectent au Wi-Fi et permettent la commande à distance via l'application Smart Life.
- [Circulateur](/catalog/nasosy) — assure la circulation de l'eau de chauffage ; piloté par un signal électrique ~230 V, 50 Hz.
- Chaudière — source de chaleur, pilotée par un contact sec.
- Smartphone — commande à distance le système filaire de régulation par zones via l'application Smart Life en Wi-Fi.

**À retenir**

- Un système de régulation du chauffage par zones offre un contrôle individuel de la température dans chaque zone, ce qui améliore le confort de chaque occupant.
- La consommation d'énergie thermique baisse de 15 à 35 %, car seules les zones utilisées sont chauffées.
- Tous les processus de commande sont automatiques et pilotables à distance, ce qui est très pratique au quotidien.

Les finitions sont déjà faites et vous ne voulez pas tirer de câbles ? Découvrez le [système sans fil de régulation par zones](/blog/${R}), qui fonctionne sans fils, via Zigbee et Wi-Fi. Et si vous choisissez encore votre mode de chauffage, lisez [plancher chauffant ou radiateurs : que choisir](/blog/tepla-pidloga-chy-radiatory-shcho-obraty).`,
      },
      de: {
        category: 'Artikel',
        title: 'Kabelgebundene Einzelraumregelung der Hausheizung',
        seo_title: 'Kabelgebundene Einzelraumregelung: Schaltplan | Termojet',
        meta_description: 'Kabelgebundene Einzelraumregelung der Heizung: Schaltplan, Klemmleiste TJ-03-C, Thermostate HT-120/HT-130, Stellantriebe. 15–35 % weniger Heizkosten.',
        excerpt: 'Mit einer Einzelraumregelung halten Sie in jedem Raum eine eigene Temperatur und heizen leere Räume nicht mit. Wir erklären das kabelgebundene System: Schaltplan, Komponenten und die Aufgabe jedes Elements.',
        content: `Eine herkömmliche Heizungsanlage regelt die Temperatur des gesamten Hauses auf einmal. Dadurch kann Wärme in Räumen verloren gehen, die gerade nicht genutzt werden. Eine Zonenheizung ermöglicht dagegen, die Temperatur in einzelnen Zonen oder Räumen Ihres Hauses zu steuern. Sie können das System genau nach Ihren Bedürfnissen einstellen und dabei die Wärmevorlieben jedes Bewohners und die Nutzung der einzelnen Räume berücksichtigen. So hilft die [Einzelraumregelung](${ZK}), Ihr Zuhause deutlich effizienter zu heizen: Wärme kommt nur dann und dorthin, wo sie gebraucht wird. Das senkt die Heiz- bzw. Kühlkosten um 15–35 %, weil gerade nicht genutzte Zonen abgeschaltet werden.

Es gibt zwei Arten von Systemen zur Einzelraumregelung: kabelgebunden und [funkbasiert](/blog/${R}). In diesem Artikel konzentrieren wir uns auf die Besonderheiten des kabelgebundenen Systems.

**So funktioniert das kabelgebundene System**

Beim kabelgebundenen System sind die Komponenten — Regler, Thermostate, Stellantriebe und Fühler — über Kabel miteinander verbunden. Deshalb eignet es sich vor allem für Neubauten, in denen der Innenausbau noch nicht abgeschlossen ist und Kabel verlegt werden können.

**Schaltplan der kabelgebundenen Einzelraumregelung**

So sieht ein typisches kabelgebundenes System zur Einzelraumregelung aus:

![Schaltplan der kabelgebundenen Einzelraumregelung von Termojet: Klemmleiste TJ-03-C, Thermostate HT-120 und HT-130, Stellantriebe M30x1,5, Pumpe und Kessel](${IMG_W})

**Hauptkomponenten und ihre Funktionen**

- [TJ-03-C](${ZK}/tj03cwrd) — kabelgebundene 8-Zonen-Klemmleiste. Sorgt für die Temperaturregelung nach Zonen, indem sie Stellantriebe, Umwälzpumpe und Kessel automatisch ansteuert. Unterstützt bis zu 8 Zonen und bis zu 19 Stellantriebe.
- [Stellantriebe M30x1,5](${ZK}/920018tj) — regeln den Heizwasserdurchfluss stufenlos, indem sie die zugehörigen Ventile des [Fußbodenheizungsverteilers](/catalog/kolektory-pidloha) ansteuern.
- [HT-120](${ZK}/ht120blk) und [HT-130](${ZK}/ht130wht) — kabelgebundene Raumthermostate. Sie regeln die Raumtemperatur präzise, verbinden sich mit dem WLAN und ermöglichen die Fernbedienung über die App Smart Life.
- [Umwälzpumpe](/catalog/nasosy) — sorgt für die Zirkulation des Heizwassers; wird über ein elektrisches Signal ~230 V, 50 Hz gesteuert.
- Kessel — Wärmequelle; wird über einen potenzialfreien Kontakt gesteuert.
- Smartphone — steuert das kabelgebundene System per App Smart Life über WLAN aus der Ferne.

**Das Wichtigste in Kürze**

- Eine Einzelraumregelung ermöglicht eine individuelle Temperatursteuerung in verschiedenen Zonen und erhöht den Komfort für jeden Bewohner.
- Der Wärmeenergieverbrauch sinkt um 15–35 %, weil nur die gerade genutzten Zonen beheizt werden.
- Alle Steuerprozesse laufen automatisch und aus der Ferne ab — das ist im täglichen Betrieb sehr bequem.

Der Innenausbau ist bereits fertig und Sie möchten keine Kabel verlegen? Dann sehen Sie sich das [funkbasierte System zur Einzelraumregelung](/blog/${R}) an — es arbeitet ohne Kabel über Zigbee und WLAN. Und wenn Sie noch die Art der Heizung wählen, lesen Sie [Fußbodenheizung oder Heizkörper: was ist besser](/blog/tepla-pidloga-chy-radiatory-shcho-obraty).`,
      },
      ro: {
        category: 'Articole',
        title: 'Sistem cu fir de control zonal al încălzirii casei',
        seo_title: 'Control zonal cu fir al încălzirii: schemă | Termojet',
        meta_description: 'Sistem cu fir de control zonal al încălzirii: schemă de conectare, centrală TJ-03-C, termostate HT-120/HT-130, actuatoare. Economie de 15–35%.',
        excerpt: 'Controlul zonal vă permite să mențineți o temperatură diferită în fiecare cameră și să nu mai încălziți încăperile goale. Analizăm sistemul cu fir: schema, echipamentele și rolul fiecărui element.',
        content: `Un sistem de încălzire obișnuit reglează temperatura întregii case deodată. Asta înseamnă că se poate pierde căldură în camere care nu sunt folosite la un moment dat. Un sistem de încălzire zonal vă permite, în schimb, să controlați temperatura în anumite zone sau camere ale casei. Puteți configura sistemul exact cum aveți nevoie, ținând cont de preferințele fiecărui locatar și de modul de folosire a diferitelor încăperi. Astfel, [controlul zonal](${ZK}) ajută la încălzirea locuinței mult mai eficient, furnizând căldură doar atunci și acolo unde este nevoie. Acest lucru reduce costurile de încălzire sau răcire cu 15–35% datorită opririi zonelor nefolosite la un moment dat.

Există două tipuri de sisteme de control zonal al temperaturii în casă: cu fir și [wireless](/blog/${R}). În acest articol ne oprim asupra particularităților sistemului cu fir.

**Cum funcționează sistemul cu fir**

În sistemul cu fir, elementele — controlere, termostate, actuatoare și senzori — sunt conectate între ele prin cabluri. De aceea este potrivit mai ales pentru construcțiile noi, unde finisajele nu sunt încă făcute și se pot trage cabluri.

**Schema sistemului cu fir de control zonal**

Schema tipică a unui sistem cu fir de control zonal arată astfel:

![Schema controlului zonal cu fir al încălzirii Termojet: centrala TJ-03-C, termostatele HT-120 și HT-130, actuatoarele M30x1,5, pompa și centrala termică](${IMG_W})

**Elementele principale ale sistemului și funcțiile lor**

- [TJ-03-C](${ZK}/tj03cwrd) — centrală de conexiuni cu fir pentru 8 zone. Asigură controlul zonal al temperaturii prin comanda automată a actuatoarelor, a pompei de circulație și a centralei termice. Suportă până la 8 zone și până la 19 actuatoare.
- [Actuatoare M30x1,5](${ZK}/920018tj) — asigură reglarea lină a debitului agentului termic, comandând robinetele corespunzătoare ale [distribuitorului pentru încălzire în pardoseală](/catalog/kolektory-pidloha).
- [HT-120](${ZK}/ht120blk) și [HT-130](${ZK}/ht130wht) — termostate de cameră cu fir. Reglează precis temperatura din încăpere, se conectează la Wi-Fi și permit comanda de la distanță prin aplicația Smart Life.
- [Pompă de circulație](/catalog/nasosy) — asigură circulația agentului termic; comandată printr-un semnal electric ~230 V, 50 Hz.
- Centrală termică — sursa de căldură; comandată printr-un contact liber de potențial.
- Smartphone — comandă de la distanță sistemul zonal cu fir prin aplicația Smart Life, prin Wi-Fi.

**Concluzii principale**

- Sistemul de control zonal al încălzirii asigură controlul individual al temperaturii în diferite zone, ceea ce crește confortul fiecărui locatar.
- Consumul de energie termică scade cu 15–35%, deoarece se încălzesc doar zonele folosite în acel moment.
- Toate procesele de comandă au loc automat și de la distanță, ceea ce este foarte comod în exploatarea zilnică.

Finisajele sunt deja făcute și nu doriți să trageți cabluri? Aruncați o privire la [sistemul wireless de control zonal](/blog/${R}) — funcționează fără fire, prin Zigbee și Wi-Fi. Iar dacă abia alegeți tipul de încălzire, citiți [ce este mai bine: încălzire în pardoseală sau calorifere](/blog/tepla-pidloga-chy-radiatory-shcho-obraty).`,
      },
    },
  },
  {
    slug: R,
    image: '/images/zonalne/bezdrotove-zonalne-keruvannya.jpg',
    published_at: '2026-10-04T09:30:00Z',
    category: 'Статті',
    title: 'Бездротова система зонального керування опаленням будинку',
    seo_title: 'Бездротове зональне керування опаленням: схема | Termojet',
    meta_description: 'Бездротове зональне керування опаленням без кабелів: Zigbee і Wi-Fi, хаб EGW-100, центр комутації TJ-03-RF, регулятори WT-150. Схема та економія 15–35%.',
    excerpt: 'Бездротове зональне керування дає змогу тримати окрему температуру в кожній кімнаті без прокладання кабелів — рішення для будинків, де вже зроблено ремонт. Розбираємо схему та обладнання.',
    content: `На відміну від [дротової системи зонального керування опаленням](/blog/${W}), бездротова система дає змогу налаштовувати й підтримувати індивідуальну температуру в різних зонах чи кімнатах будинку без прокладання кабелів.

**Протоколи зв'язку: Zigbee та Wi-Fi**

Елементи системи керуються дистанційно за допомогою двох протоколів зв'язку: Zigbee та Wi-Fi.

Wi-Fi — відома й популярна технологія бездротового зв'язку, яка дає змогу пристроям підключатися до інтернету через радіохвилі.

Бездротовий протокол зв'язку Zigbee спеціально розроблений для пристроїв автоматизації, особливо в системах розумного будинку. Він підтримує енергоефективний обмін даними між пристроями, добре масштабується та стійкий до перешкод.

**Коли обирати бездротову систему**

Безумовна перевага бездротової системи — її можна встановити під час модернізації опалення в будинку, де вже зроблено ремонт і живуть мешканці.

**Схема бездротової системи зонального керування**

Типова схема бездротової системи зонального керування виглядає так:

![Схема бездротової системи зонального керування опаленням Termojet: хаб EGW-100, центр комутації TJ-03-RF, регулятори WT-150, приймач R06, сервоприводи M30x1,5](${IMG_R})

**Основні елементи системи та їх функції**

- [EGW-100](${ZK}/egw100wf) — хаб (центральний контролер, або шлюз). Головний пристрій бездротової системи: об'єднує всі елементи в єдину мережу й виконує роль «містка» між бездротовими пристроями, що працюють на радіосигналі Zigbee 868 МГц, і вашою домашньою мережею Wi-Fi.
- [TJ-03-RF](${ZK}/tj03rfws) — 8-зонний бездротовий центр комутації. Керує температурою максимум у 8 зонах і 16 сервоприводами, а також циркуляційним насосом і котлом, працюючи з бездротовими кімнатними регуляторами. Один хаб EGW-100 — на один TJ-03-RF.
- [WT-150](${ZK}/wt150wht) — бездротовий кімнатний регулятор. Точно контролює температуру у своїй зоні й передає команди керування на бездротовий центр комутації TJ-03-RF.
- [Сервоприводи M30x1,5](${ZK}/920018tj) — забезпечують плавне регулювання потоку теплоносія, керуючи відповідними клапанами [колектора теплої підлоги](/catalog/kolektory-pidloha).
- [Циркуляційний насос (водяна помпа)](/catalog/nasosy) — забезпечує циркуляцію теплоносія, керується електричним сигналом ~230 В, 50 Гц.
- Котел — джерело тепла, керується через безпотенційний контакт.
- [R06](${ZK}/ro6wifir) — Wi-Fi приймач бездротового зв'язку. Забезпечує дистанційне керування котлом за допомогою безпотенційного сигналу. Працює з обома протоколами зв'язку — Zigbee і Wi-Fi. Живлення — 230 В, 50 Гц.
- Смартфон — дистанційно керує бездротовою системою зонального керування через застосунок Smart Life по Wi-Fi.

**Ключові висновки**

- Зональна система керування опаленням зменшує витрати теплової енергії на 15–35% завдяки опаленню лише тих зон, які використовуються в цей момент.
- Вищий комфорт для кожного мешканця завдяки індивідуальному контролю температури в різних зонах.
- Повна автоматизація та дистанційне керування всіма процесами, що дуже зручно в щоденній експлуатації системи.

Будуєте новий будинок і можете прокласти кабелі? Порівняйте з [дротовою системою зонального керування](/blog/${W}) на центрі комутації TJ-03-C і термостатах HT-120/HT-130. Усе обладнання — у розділі [«Зональне керування»](${ZK}).`,
    i18n: {
      en: {
        category: 'Articles',
        title: 'Wireless Zone Control System for Home Heating',
        seo_title: 'Wireless Zone Heating Control: System Diagram | Termojet',
        meta_description: 'Wireless zone heating control with no cabling: Zigbee and Wi-Fi, EGW-100 hub, TJ-03-RF wiring centre, WT-150 thermostats. Diagram and 15–35% savings.',
        excerpt: 'Wireless zone control lets you keep a separate temperature in every room without laying cables — a solution for homes where the interior finishing is already done. We walk through the diagram and the equipment.',
        content: `Unlike the [wired zone heating control system](/blog/${W}), the wireless system lets you set and maintain an individual temperature in different zones or rooms of the house without laying any cables.

**Communication protocols: Zigbee and Wi-Fi**

The system components are controlled remotely using two communication protocols: Zigbee and Wi-Fi.

Wi-Fi is a well-known and popular wireless technology that lets devices connect to the internet via radio waves.

The Zigbee wireless protocol was designed specifically for automation devices, especially in smart home systems. It supports energy-efficient data exchange between devices, scales well and is resistant to interference.

**When to choose a wireless system**

The clear advantage of the wireless system is that it can be installed when upgrading the heating in a house where the interior finishing is already done and people are living.

**Wireless zone control system diagram**

A typical wireless zone control system looks like this:

![Termojet wireless zone heating control diagram: EGW-100 hub, TJ-03-RF wiring centre, WT-150 thermostats, R06 receiver, M30x1.5 actuators](${IMG_R})

**Main components and their functions**

- [EGW-100](${ZK}/egw100wf) — hub (central controller or gateway). The main device of the wireless system: it joins all components into a single network and acts as a «bridge» between wireless devices running on the Zigbee 868 MHz radio signal and your home Wi-Fi network.
- [TJ-03-RF](${ZK}/tj03rfws) — 8-zone wireless wiring centre. Controls the temperature in up to 8 zones and up to 16 actuators, as well as the circulation pump and the boiler, working with wireless room thermostats. One EGW-100 hub per TJ-03-RF.
- [WT-150](${ZK}/wt150wht) — wireless room thermostat. Precisely controls the temperature in its zone and sends control commands to the TJ-03-RF wireless wiring centre.
- [M30x1.5 actuators](${ZK}/920018tj) — provide smooth regulation of the heating water flow by operating the corresponding valves of the [underfloor heating manifold](/catalog/kolektory-pidloha).
- [Circulation pump](/catalog/nasosy) — circulates the heating water; controlled by a ~230 V, 50 Hz electrical signal.
- Boiler — the heat source; controlled via a volt-free contact.
- [R06](${ZK}/ro6wifir) — Wi-Fi wireless receiver. Provides remote control of the boiler via a volt-free signal. Works with both protocols — Zigbee and Wi-Fi. Power supply — 230 V, 50 Hz.
- Smartphone — remotely controls the wireless zone control system via the Smart Life app over Wi-Fi.

**Key takeaways**

- A zoned heating control system cuts heat energy consumption by 15–35% because only the zones in use at the moment are heated.
- Greater comfort for every occupant thanks to individual temperature control in different zones.
- Full automation and remote control of all processes, which makes day-to-day operation very convenient.

Building a new house and able to lay cables? Compare it with the [wired zone control system](/blog/${W}) based on the TJ-03-C wiring centre and HT-120/HT-130 thermostats. All the equipment is in the [Zone control](${ZK}) section.`,
      },
      pl: {
        category: 'Artykuły',
        title: 'Bezprzewodowy system strefowego sterowania ogrzewaniem domu',
        seo_title: 'Bezprzewodowe sterowanie strefowe ogrzewaniem | Termojet',
        meta_description: 'Bezprzewodowe sterowanie strefowe ogrzewaniem bez kabli: Zigbee i Wi-Fi, hub EGW-100, listwa TJ-03-RF, termostaty WT-150. Schemat i oszczędność 15–35%.',
        excerpt: 'Bezprzewodowe sterowanie strefowe pozwala utrzymywać osobną temperaturę w każdym pomieszczeniu bez prowadzenia kabli — rozwiązanie dla domów po remoncie. Omawiamy schemat i urządzenia.',
        content: `W przeciwieństwie do [przewodowego systemu strefowego sterowania ogrzewaniem](/blog/${W}) system bezprzewodowy pozwala ustawiać i utrzymywać indywidualną temperaturę w różnych strefach lub pomieszczeniach domu bez prowadzenia kabli.

**Protokoły komunikacji: Zigbee i Wi-Fi**

Elementy systemu są sterowane zdalnie za pomocą dwóch protokołów komunikacji: Zigbee i Wi-Fi.

Wi-Fi to znana i popularna technologia łączności bezprzewodowej, która pozwala urządzeniom łączyć się z internetem za pomocą fal radiowych.

Bezprzewodowy protokół Zigbee został opracowany specjalnie dla urządzeń automatyki, zwłaszcza w systemach inteligentnego domu. Zapewnia energooszczędną wymianę danych między urządzeniami, dobrze się skaluje i jest odporny na zakłócenia.

**Kiedy wybrać system bezprzewodowy**

Niewątpliwą zaletą systemu bezprzewodowego jest możliwość montażu podczas modernizacji ogrzewania w domu, w którym wykończenie jest już zrobione, a domownicy mieszkają.

**Schemat bezprzewodowego systemu sterowania strefowego**

Typowy schemat bezprzewodowego systemu sterowania strefowego wygląda tak:

![Schemat bezprzewodowego strefowego sterowania ogrzewaniem Termojet: hub EGW-100, listwa TJ-03-RF, termostaty WT-150, odbiornik R06, siłowniki M30x1,5](${IMG_R})

**Główne elementy systemu i ich funkcje**

- [EGW-100](${ZK}/egw100wf) — hub (centralny sterownik, czyli bramka). Główne urządzenie systemu bezprzewodowego: łączy wszystkie elementy w jedną sieć i pełni rolę «mostu» między urządzeniami bezprzewodowymi pracującymi na sygnale radiowym Zigbee 868 MHz a Twoją domową siecią Wi-Fi.
- [TJ-03-RF](${ZK}/tj03rfws) — 8-strefowa bezprzewodowa listwa sterująca. Steruje temperaturą maksymalnie w 8 strefach i 16 siłownikami, a także pompą obiegową i kotłem, współpracując z bezprzewodowymi regulatorami pokojowymi. Jeden hub EGW-100 na jedną listwę TJ-03-RF.
- [WT-150](${ZK}/wt150wht) — bezprzewodowy regulator pokojowy. Precyzyjnie kontroluje temperaturę w swojej strefie i przesyła polecenia sterujące do listwy TJ-03-RF.
- [Siłowniki M30x1,5](${ZK}/920018tj) — zapewniają płynną regulację przepływu czynnika grzewczego, sterując odpowiednimi zaworami [rozdzielacza ogrzewania podłogowego](/catalog/kolektory-pidloha).
- [Pompa obiegowa](/catalog/nasosy) — zapewnia cyrkulację czynnika grzewczego, sterowana sygnałem elektrycznym ~230 V, 50 Hz.
- Kocioł — źródło ciepła, sterowany przez styk bezpotencjałowy.
- [R06](${ZK}/ro6wifir) — odbiornik łączności bezprzewodowej Wi-Fi. Zapewnia zdalne sterowanie kotłem za pomocą sygnału bezpotencjałowego. Obsługuje oba protokoły — Zigbee i Wi-Fi. Zasilanie — 230 V, 50 Hz.
- Smartfon — zdalnie steruje bezprzewodowym systemem strefowym przez aplikację Smart Life przez Wi-Fi.

**Najważniejsze wnioski**

- Strefowy system sterowania ogrzewaniem zmniejsza zużycie energii cieplnej o 15–35%, ponieważ ogrzewane są tylko strefy używane w danej chwili.
- Większy komfort każdego domownika dzięki indywidualnej kontroli temperatury w różnych strefach.
- Pełna automatyzacja i zdalne sterowanie wszystkimi procesami, co jest bardzo wygodne w codziennej eksploatacji.

Budujesz nowy dom i możesz poprowadzić kable? Porównaj z [przewodowym systemem sterowania strefowego](/blog/${W}) opartym na listwie TJ-03-C i termostatach HT-120/HT-130. Wszystkie urządzenia znajdziesz w dziale [Sterowanie strefowe](${ZK}).`,
      },
      fr: {
        category: 'Articles',
        title: 'Système sans fil de régulation du chauffage par zones',
        seo_title: 'Chauffage par zones sans fil : schéma | Termojet',
        meta_description: 'Régulation sans fil du chauffage par zones, sans câbles : Zigbee et Wi-Fi, passerelle EGW-100, centrale TJ-03-RF, thermostats WT-150. Schéma et économies.',
        excerpt: 'La régulation sans fil par zones permet de maintenir une température propre à chaque pièce sans poser de câbles — idéale pour les maisons déjà rénovées. Nous détaillons le schéma et les équipements.',
        content: `Contrairement au [système filaire de régulation du chauffage par zones](/blog/${W}), le système sans fil permet de régler et de maintenir une température individuelle dans différentes zones ou pièces de la maison sans poser de câbles.

**Protocoles de communication : Zigbee et Wi-Fi**

Les éléments du système sont pilotés à distance grâce à deux protocoles de communication : Zigbee et Wi-Fi.

Le Wi-Fi est une technologie sans fil bien connue et très répandue, qui permet aux appareils de se connecter à Internet par ondes radio.

Le protocole sans fil Zigbee a été conçu spécialement pour les appareils d'automatisation, notamment dans les systèmes de maison connectée. Il assure un échange de données économe en énergie entre les appareils, s'adapte facilement à la taille de l'installation et résiste bien aux interférences.

**Quand choisir un système sans fil**

L'avantage incontestable du système sans fil est qu'il peut être installé lors de la modernisation du chauffage dans une maison déjà rénovée et habitée.

**Schéma du système sans fil de régulation par zones**

Voici le schéma type d'un système sans fil de régulation par zones :

![Schéma de la régulation sans fil du chauffage par zones Termojet : passerelle EGW-100, centrale TJ-03-RF, thermostats WT-150, récepteur R06, actionneurs M30x1,5](${IMG_R})

**Principaux éléments du système et leurs fonctions**

- [EGW-100](${ZK}/egw100wf) — hub (contrôleur central ou passerelle). L'appareil principal du système sans fil : il réunit tous les éléments en un seul réseau et sert de « pont » entre les appareils sans fil fonctionnant sur le signal radio Zigbee 868 MHz et votre réseau Wi-Fi domestique.
- [TJ-03-RF](${ZK}/tj03rfws) — centrale de raccordement sans fil 8 zones. Régule la température dans 8 zones au maximum et pilote jusqu'à 16 actionneurs, ainsi que le circulateur et la chaudière, en fonctionnant avec des thermostats d'ambiance sans fil. Une passerelle EGW-100 par centrale TJ-03-RF.
- [WT-150](${ZK}/wt150wht) — thermostat d'ambiance sans fil. Contrôle précisément la température de sa zone et transmet les commandes à la centrale sans fil TJ-03-RF.
- [Actionneurs M30x1,5](${ZK}/920018tj) — assurent une régulation progressive du débit d'eau de chauffage en pilotant les vannes correspondantes du [collecteur de plancher chauffant](/catalog/kolektory-pidloha).
- [Circulateur](/catalog/nasosy) — assure la circulation de l'eau de chauffage ; piloté par un signal électrique ~230 V, 50 Hz.
- Chaudière — source de chaleur, pilotée par un contact sec.
- [R06](${ZK}/ro6wifir) — récepteur sans fil Wi-Fi. Permet de piloter la chaudière à distance au moyen d'un contact sec. Fonctionne avec les deux protocoles, Zigbee et Wi-Fi. Alimentation : 230 V, 50 Hz.
- Smartphone — commande à distance le système sans fil de régulation par zones via l'application Smart Life en Wi-Fi.

**À retenir**

- Un système de régulation du chauffage par zones réduit la consommation d'énergie thermique de 15 à 35 %, car seules les zones utilisées sont chauffées.
- Plus de confort pour chaque occupant grâce au contrôle individuel de la température dans chaque zone.
- Automatisation complète et commande à distance de tous les processus, ce qui est très pratique au quotidien.

Vous construisez une maison neuve et pouvez poser des câbles ? Comparez avec le [système filaire de régulation par zones](/blog/${W}), basé sur la centrale TJ-03-C et les thermostats HT-120/HT-130. Tous les équipements sont dans la rubrique [Régulation par zones](${ZK}).`,
      },
      de: {
        category: 'Artikel',
        title: 'Funkbasierte Einzelraumregelung der Hausheizung',
        seo_title: 'Funk-Einzelraumregelung der Heizung: Schema | Termojet',
        meta_description: 'Funkbasierte Einzelraumregelung der Heizung ohne Kabel: Zigbee und WLAN, Hub EGW-100, Klemmleiste TJ-03-RF, Thermostate WT-150. Schema, 15–35 % Ersparnis.',
        excerpt: 'Mit einer funkbasierten Einzelraumregelung halten Sie in jedem Raum eine eigene Temperatur, ohne Kabel zu verlegen — ideal für bereits renovierte Häuser. Wir erklären Schema und Komponenten.',
        content: `Im Gegensatz zur [kabelgebundenen Einzelraumregelung](/blog/${W}) ermöglicht das Funksystem, in verschiedenen Zonen oder Räumen des Hauses eine individuelle Temperatur einzustellen und zu halten, ohne Kabel zu verlegen.

**Kommunikationsprotokolle: Zigbee und WLAN**

Die Systemkomponenten werden über zwei Kommunikationsprotokolle aus der Ferne gesteuert: Zigbee und WLAN (Wi-Fi).

WLAN ist eine bekannte und weit verbreitete Funktechnologie, mit der sich Geräte über Funkwellen mit dem Internet verbinden.

Das Funkprotokoll Zigbee wurde speziell für Automatisierungsgeräte entwickelt, insbesondere für Smart-Home-Systeme. Es ermöglicht einen energieeffizienten Datenaustausch zwischen den Geräten, ist gut skalierbar und störungsresistent.

**Wann sich ein Funksystem lohnt**

Der klare Vorteil des Funksystems: Es lässt sich bei der Modernisierung der Heizung in Häusern installieren, die bereits fertig renoviert und bewohnt sind.

**Schema der funkbasierten Einzelraumregelung**

So sieht ein typisches funkbasiertes System zur Einzelraumregelung aus:

![Schema der funkbasierten Einzelraumregelung von Termojet: Hub EGW-100, Klemmleiste TJ-03-RF, Thermostate WT-150, Empfänger R06, Stellantriebe M30x1,5](${IMG_R})

**Hauptkomponenten und ihre Funktionen**

- [EGW-100](${ZK}/egw100wf) — Hub (zentraler Controller bzw. Gateway). Das Hauptgerät des Funksystems: Es verbindet alle Komponenten zu einem Netzwerk und dient als «Brücke» zwischen den Funkgeräten, die mit dem Zigbee-Signal auf 868 MHz arbeiten, und Ihrem Heim-WLAN.
- [TJ-03-RF](${ZK}/tj03rfws) — funkbasierte 8-Zonen-Klemmleiste. Regelt die Temperatur in bis zu 8 Zonen und steuert bis zu 16 Stellantriebe sowie Umwälzpumpe und Kessel an — im Zusammenspiel mit Funk-Raumthermostaten. Ein Hub EGW-100 pro TJ-03-RF.
- [WT-150](${ZK}/wt150wht) — Funk-Raumthermostat. Regelt die Temperatur in seiner Zone präzise und sendet Steuerbefehle an die Funk-Klemmleiste TJ-03-RF.
- [Stellantriebe M30x1,5](${ZK}/920018tj) — regeln den Heizwasserdurchfluss stufenlos, indem sie die zugehörigen Ventile des [Fußbodenheizungsverteilers](/catalog/kolektory-pidloha) ansteuern.
- [Umwälzpumpe](/catalog/nasosy) — sorgt für die Zirkulation des Heizwassers; wird über ein elektrisches Signal ~230 V, 50 Hz gesteuert.
- Kessel — Wärmequelle; wird über einen potenzialfreien Kontakt gesteuert.
- [R06](${ZK}/ro6wifir) — WLAN-Funkempfänger. Ermöglicht die Fernsteuerung des Kessels über ein potenzialfreies Signal. Arbeitet mit beiden Protokollen — Zigbee und WLAN. Stromversorgung: 230 V, 50 Hz.
- Smartphone — steuert das funkbasierte System per App Smart Life über WLAN aus der Ferne.

**Das Wichtigste in Kürze**

- Eine Einzelraumregelung senkt den Wärmeenergieverbrauch um 15–35 %, weil nur die gerade genutzten Zonen beheizt werden.
- Mehr Komfort für jeden Bewohner durch individuelle Temperaturregelung in den einzelnen Zonen.
- Vollständige Automatisierung und Fernsteuerung aller Prozesse — das ist im täglichen Betrieb sehr bequem.

Sie bauen neu und können Kabel verlegen? Vergleichen Sie mit der [kabelgebundenen Einzelraumregelung](/blog/${W}) mit Klemmleiste TJ-03-C und Thermostaten HT-120/HT-130. Alle Komponenten finden Sie im Bereich [Einzelraumregelung](${ZK}).`,
      },
      ro: {
        category: 'Articole',
        title: 'Sistem wireless de control zonal al încălzirii casei',
        seo_title: 'Control zonal wireless al încălzirii: schemă | Termojet',
        meta_description: 'Control zonal wireless al încălzirii, fără cabluri: Zigbee și Wi-Fi, hub EGW-100, centrală TJ-03-RF, termostate WT-150. Schemă și economie de 15–35%.',
        excerpt: 'Controlul zonal wireless vă permite să mențineți o temperatură separată în fiecare cameră fără a trage cabluri — soluția pentru casele deja renovate. Analizăm schema și echipamentele.',
        content: `Spre deosebire de [sistemul cu fir de control zonal al încălzirii](/blog/${W}), sistemul wireless vă permite să setați și să mențineți o temperatură individuală în diferite zone sau camere ale casei fără a trage cabluri.

**Protocoale de comunicare: Zigbee și Wi-Fi**

Elementele sistemului sunt comandate de la distanță prin două protocoale de comunicare: Zigbee și Wi-Fi.

Wi-Fi este o tehnologie de comunicare wireless cunoscută și populară, care permite dispozitivelor să se conecteze la internet prin unde radio.

Protocolul wireless Zigbee a fost creat special pentru dispozitivele de automatizare, mai ales în sistemele de casă inteligentă. Asigură un schimb de date eficient energetic între dispozitive, se extinde ușor și este rezistent la interferențe.

**Când să alegeți un sistem wireless**

Avantajul incontestabil al sistemului wireless este că poate fi instalat la modernizarea încălzirii în casele în care finisajele sunt deja făcute și locuiesc oameni.

**Schema sistemului wireless de control zonal**

Schema tipică a unui sistem wireless de control zonal arată astfel:

![Schema controlului zonal wireless al încălzirii Termojet: hub EGW-100, centrala TJ-03-RF, termostatele WT-150, receptorul R06, actuatoarele M30x1,5](${IMG_R})

**Elementele principale ale sistemului și funcțiile lor**

- [EGW-100](${ZK}/egw100wf) — hub (controler central sau gateway). Dispozitivul principal al sistemului wireless: unește toate elementele într-o singură rețea și joacă rolul de «punte» între dispozitivele wireless care funcționează pe semnal radio Zigbee 868 MHz și rețeaua Wi-Fi a locuinței.
- [TJ-03-RF](${ZK}/tj03rfws) — centrală de conexiuni wireless pentru 8 zone. Controlează temperatura în maximum 8 zone și până la 16 actuatoare, precum și pompa de circulație și centrala termică, lucrând cu termostate de cameră wireless. Un hub EGW-100 pentru o centrală TJ-03-RF.
- [WT-150](${ZK}/wt150wht) — termostat de cameră wireless. Controlează precis temperatura din zona sa și transmite comenzile către centrala wireless TJ-03-RF.
- [Actuatoare M30x1,5](${ZK}/920018tj) — asigură reglarea lină a debitului agentului termic, comandând robinetele corespunzătoare ale [distribuitorului pentru încălzire în pardoseală](/catalog/kolektory-pidloha).
- [Pompă de circulație](/catalog/nasosy) — asigură circulația agentului termic; comandată printr-un semnal electric ~230 V, 50 Hz.
- Centrală termică — sursa de căldură; comandată printr-un contact liber de potențial.
- [R06](${ZK}/ro6wifir) — receptor wireless Wi-Fi. Asigură comanda de la distanță a centralei termice printr-un semnal liber de potențial. Funcționează cu ambele protocoale — Zigbee și Wi-Fi. Alimentare: 230 V, 50 Hz.
- Smartphone — comandă de la distanță sistemul zonal wireless prin aplicația Smart Life, prin Wi-Fi.

**Concluzii principale**

- Sistemul de control zonal al încălzirii reduce consumul de energie termică cu 15–35%, deoarece se încălzesc doar zonele folosite în acel moment.
- Confort sporit pentru fiecare locatar datorită controlului individual al temperaturii în diferite zone.
- Automatizare completă și comandă de la distanță a tuturor proceselor, ceea ce este foarte comod în exploatarea zilnică.

Construiți o casă nouă și puteți trage cabluri? Comparați cu [sistemul cu fir de control zonal](/blog/${W}), bazat pe centrala TJ-03-C și termostatele HT-120/HT-130. Toate echipamentele se află în secțiunea [Control zonal](${ZK}).`,
      },
    },
  },
]
