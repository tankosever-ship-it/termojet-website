// Дві статті 05.11.2026 — дані для apply-blog-posts.js:
//   1) новина про YouTube-канал @termojetofficial з оглядом котельні (joBhzJgfT5M);
//   2) «Навіщо потрібна гідрострілка і як вона працює» з відео-поясненням (J1lAZ6wardI).
// Відео вставляється рядком «@[назва](https://youtu.be/ID)» (розмітка BlogPostPage);
// дата й тривалість для VideoObject — у src/data/product-videos.json (videos / other).
// Обкладинки — постери відео (public/images/video/, вписуються без обрізки: на них текст).

const CH = 'https://www.youtube.com/@termojetofficial'
const V_KOT = 'https://youtu.be/joBhzJgfT5M'
const V_HS = 'https://youtu.be/J1lAZ6wardI'
const V_WC = '/blog/vystavka-waterclima-liha-maistriv-2026'
const HS_SLUG = '/blog/navishcho-potribna-hidrostrilka-yak-pratsyuye'
const HS_PICK = '/blog/yak-vybraty-hidravlichnyy-rozdilnyk'
const HS_VS = '/blog/gidrostrilka-rozdilnyk-rozpodilnyk-koly-shcho-stavyty'
const KOT = '/blog/kotelnya-pid-klyuch-modulna-obvyazka'
const HS = '/catalog/hidravlichni-rozdilnyky'
const GS = s => `${HS}/gidrostrilka-gs-${s}-v-izolyacziyi`
const KGS = '/catalog/kolektory-z-hidrostrilkoyu'
const NG = '/catalog/nasosni-hrupy'
const K = '/catalog/rozpodilchi-kolektory'
const BOX = '/catalog/termojet-box'
const SEP = '/catalog/separatory'
const NAS = '/catalog/nasosy'
const ZK = '/catalog/zonalne-keruvannya'

module.exports = [
  {
    slug: 'termojet-youtube-kanal',
    image: '/images/video/kotelnya-termojet-yak-use-zyednano.jpg',
    published_at: '2026-11-05T09:30:00Z',
    category: 'Новини',
    title: 'У Termojet з\'явився YouTube-канал: огляди, монтаж і налаштування обладнання',
    seo_title: 'YouTube-канал Termojet: відео про обладнання для котелень',
    meta_description: 'Termojet запустив YouTube-канал @termojetofficial: огляд котельні, монтаж насосних груп, колекторів, гідрострілок, насосів і зонального керування.',
    excerpt: 'Ми запустили канал @termojetofficial: короткі відео про те, як вибрати, змонтувати й запустити обладнання Termojet. Почніть з огляду котельні.',
    content: `Termojet запустив власний YouTube-канал [@termojetofficial](${CH}). Там ми коротко й наочно показуємо, як працює наше обладнання, як його вибрати, змонтувати й запустити — без довгих інструкцій і пошуку відповідей на форумах.

**З чого почати: огляд котельні Termojet**

У першому огляді на схемі розібрано, як з'єднується вся котельня: котел, гідрострілка, розподільчий колектор і насосні групи на окремі контури — радіатори, теплу підлогу та бойлер.

@[Котельня Termojet — як усе з'єднано: котел, гідрострілка, колектор, насосні групи](${V_KOT})

Обладнання з відео є в каталозі:

- [гідрострілки](${HS}) — розділяють контур котла й контури споживачів, щоб насоси не заважали один одному;
- [розподільчі колектори](${K}) і [колектори з гідрострілкою](${KGS}) — збирають обв'язку котельні в один вузол;
- [насосні групи](${NG}) — готові вузли для кожного контуру: прямі, зі змішувачем, з термокраном;
- [Termojet BOX](${BOX}) — компактна котельня на стіні.

**Що ще є на каналі**

- монтаж і запуск [насосних груп](${NG}), [колекторів](${K}) та модулів [Termojet BOX](${BOX});
- [циркуляційні насоси](${NAS}) Termojet: підключення, режими роботи, коди помилок;
- [сепаратори повітря і бруду](${SEP}): як працюють, де ставити, як чистити;
- [зональне керування](${ZK}) теплою підлогою: термостати, приймачі, центри комутації та налаштування в Smart Life;
- пояснення на схемах — наприклад, [навіщо потрібна гідрострілка](${HS_SLUG}), а також відео з виставок, як-от [WaterClima](${V_WC}).

Відео до конкретного товару ми додаємо і прямо в його картку на сайті — у галерею поруч із фото.

[Підписуйтеся на канал](${CH}), щоб не пропустити нові огляди, а якщо маєте питання щодо підбору обладнання — пишіть нам у [контакти](/contacts).`,
    i18n: {
      en: {
        category: 'News',
        title: 'Termojet Launches a YouTube Channel: Reviews, Installation and Setup',
        seo_title: 'Termojet YouTube Channel: Boiler Room Equipment Videos',
        meta_description: 'Termojet has launched the @termojetofficial YouTube channel: boiler room overview, installation of pump groups, manifolds, hydraulic separators, pumps.',
        excerpt: 'We have launched @termojetofficial: short videos on how to choose, install and start up Termojet equipment. Start with the boiler room overview.',
        content: `Termojet has launched its own YouTube channel, [@termojetofficial](${CH}). There we show briefly and clearly how our equipment works and how to choose, install and start it up — without long manuals or searching forums for answers.

**Where to start: the Termojet boiler room overview**

The first overview uses a diagram to explain how the whole boiler room is connected: the boiler, the hydraulic separator, the distribution manifold and pump groups for separate circuits — radiators, underfloor heating and the DHW cylinder.

@[Termojet boiler room — how it all connects: boiler, hydraulic separator, manifold, pump groups](${V_KOT})

The equipment from the video is in our catalogue:

- [hydraulic separators](${HS}) — separate the boiler circuit from the consumer circuits so the pumps do not interfere with each other;
- [distribution manifolds](${K}) and [manifolds with a hydraulic separator](${KGS}) — bring the boiler room pipework together into one unit;
- [pump groups](${NG}) — ready-made units for each circuit: direct, with a mixing valve, with a thermostatic valve;
- [Termojet BOX](${BOX}) — a compact wall-mounted boiler room.

**What else is on the channel**

- installation and start-up of [pump groups](${NG}), [manifolds](${K}) and [Termojet BOX](${BOX}) modules;
- Termojet [circulation pumps](${NAS}): connection, operating modes, error codes;
- [air and dirt separators](${SEP}): how they work, where to install them, how to clean them;
- underfloor heating [zone control](${ZK}): thermostats, receivers, wiring centres and setup in Smart Life;
- explanations on diagrams — for example, [why you need a hydraulic separator](${HS_SLUG}) — as well as videos from exhibitions such as [WaterClima](${V_WC}).

We also add product videos directly to the product page on the website — in the gallery next to the photos.

[Subscribe to the channel](${CH}) so you don't miss new reviews, and if you have questions about choosing equipment, get in touch via our [contacts](/contacts).`,
      },
      pl: {
        category: 'Aktualności',
        title: 'Termojet uruchomił kanał YouTube: przeglądy, montaż i konfiguracja',
        seo_title: 'Kanał YouTube Termojet: filmy o wyposażeniu kotłowni',
        meta_description: 'Termojet uruchomił kanał YouTube @termojetofficial: przegląd kotłowni, montaż grup pompowych, rozdzielaczy, separatorów hydraulicznych i pomp.',
        excerpt: 'Uruchomiliśmy kanał @termojetofficial: krótkie filmy o tym, jak dobrać, zamontować i uruchomić urządzenia Termojet. Zacznij od przeglądu kotłowni.',
        content: `Termojet uruchomił własny kanał YouTube [@termojetofficial](${CH}). Pokazujemy na nim krótko i obrazowo, jak działają nasze urządzenia oraz jak je dobrać, zamontować i uruchomić — bez długich instrukcji i szukania odpowiedzi na forach.

**Od czego zacząć: przegląd kotłowni Termojet**

W pierwszym przeglądzie na schemacie pokazujemy, jak połączona jest cała kotłownia: kocioł, separator hydrauliczny, rozdzielacz i grupy pompowe dla osobnych obiegów — grzejników, ogrzewania podłogowego i zasobnika c.w.u.

@[Kotłownia Termojet — jak wszystko jest połączone: kocioł, separator hydrauliczny, rozdzielacz, grupy pompowe](${V_KOT})

Urządzenia z filmu znajdziesz w katalogu:

- [separatory hydrauliczne](${HS}) — oddzielają obieg kotła od obiegów odbiorników, aby pompy nie przeszkadzały sobie nawzajem;
- [rozdzielacze](${K}) i [rozdzielacze z separatorem hydraulicznym](${KGS}) — łączą orurowanie kotłowni w jeden zespół;
- [grupy pompowe](${NG}) — gotowe zespoły dla każdego obiegu: bezpośrednie, z zaworem mieszającym, z zaworem termostatycznym;
- [Termojet BOX](${BOX}) — kompaktowa kotłownia naścienna.

**Co jeszcze jest na kanale**

- montaż i uruchomienie [grup pompowych](${NG}), [rozdzielaczy](${K}) i modułów [Termojet BOX](${BOX});
- [pompy obiegowe](${NAS}) Termojet: podłączenie, tryby pracy, kody błędów;
- [separatory powietrza i zanieczyszczeń](${SEP}): jak działają, gdzie je montować, jak czyścić;
- [sterowanie strefowe](${ZK}) ogrzewaniem podłogowym: termostaty, odbiorniki, listwy sterujące i konfiguracja w Smart Life;
- wyjaśnienia na schematach — np. [po co jest separator hydrauliczny](${HS_SLUG}) — oraz filmy z targów, takich jak [WaterClima](${V_WC}).

Filmy o konkretnym produkcie dodajemy też bezpośrednio do jego karty na stronie — do galerii obok zdjęć.

[Subskrybuj kanał](${CH}), aby nie przegapić nowych przeglądów, a jeśli masz pytania dotyczące doboru urządzeń — napisz do nas przez [kontakty](/contacts).`,
      },
      fr: {
        category: 'Actualités',
        title: 'Termojet lance sa chaîne YouTube : présentations, montage et réglages',
        seo_title: 'Chaîne YouTube Termojet : vidéos sur la chaufferie',
        meta_description: 'Termojet lance la chaîne YouTube @termojetofficial : présentation de la chaufferie, montage des groupes de pompage, collecteurs, séparateurs hydrauliques.',
        excerpt: 'Nous avons lancé @termojetofficial : de courtes vidéos pour choisir, installer et mettre en service les équipements Termojet. Commencez par la chaufferie.',
        content: `Termojet a lancé sa propre chaîne YouTube, [@termojetofficial](${CH}). Nous y montrons de façon courte et visuelle comment fonctionnent nos équipements et comment les choisir, les installer et les mettre en service — sans longues notices ni recherches sur les forums.

**Par où commencer : la présentation de la chaufferie Termojet**

La première vidéo explique sur un schéma comment toute la chaufferie est raccordée : la chaudière, le séparateur hydraulique, le collecteur de distribution et les groupes de pompage pour chaque circuit — radiateurs, plancher chauffant et ballon d'eau chaude.

@[Chaufferie Termojet — comment tout est raccordé : chaudière, séparateur hydraulique, collecteur, groupes de pompage](${V_KOT})

Les équipements de la vidéo sont dans notre catalogue :

- [séparateurs hydrauliques](${HS}) — séparent le circuit de la chaudière des circuits consommateurs pour que les pompes ne se gênent pas ;
- [collecteurs de distribution](${K}) et [collecteurs avec séparateur hydraulique](${KGS}) — regroupent la tuyauterie de la chaufferie en un seul ensemble ;
- [groupes de pompage](${NG}) — ensembles prêts à poser pour chaque circuit : directs, avec vanne mélangeuse, avec vanne thermostatique ;
- [Termojet BOX](${BOX}) — une chaufferie murale compacte.

**Ce que vous trouverez aussi sur la chaîne**

- montage et mise en service des [groupes de pompage](${NG}), des [collecteurs](${K}) et des modules [Termojet BOX](${BOX}) ;
- les [circulateurs](${NAS}) Termojet : raccordement, modes de fonctionnement, codes d'erreur ;
- les [séparateurs d'air et de boues](${SEP}) : fonctionnement, emplacement, nettoyage ;
- la [régulation par zones](${ZK}) du plancher chauffant : thermostats, récepteurs, centrales de câblage et réglage dans Smart Life ;
- des explications sur schéma — par exemple, [à quoi sert un séparateur hydraulique](${HS_SLUG}) — ainsi que des vidéos de salons comme [WaterClima](${V_WC}).

Nous ajoutons aussi les vidéos d'un produit directement sur sa fiche du site — dans la galerie, à côté des photos.

[Abonnez-vous à la chaîne](${CH}) pour ne manquer aucune nouvelle vidéo, et pour toute question sur le choix des équipements, écrivez-nous via la page [contacts](/contacts).`,
      },
      de: {
        category: 'Neuigkeiten',
        title: 'Termojet startet einen YouTube-Kanal: Übersichten, Montage und Einstellung',
        seo_title: 'YouTube-Kanal von Termojet: Videos zur Heizraumtechnik',
        meta_description: 'Termojet hat den YouTube-Kanal @termojetofficial gestartet: Heizraum-Übersicht, Montage von Pumpengruppen, Verteilern, hydraulischen Weichen und Pumpen.',
        excerpt: 'Wir haben @termojetofficial gestartet: kurze Videos zur Auswahl, Montage und Inbetriebnahme von Termojet-Geräten. Beginnen Sie mit dem Heizraum.',
        content: `Termojet hat einen eigenen YouTube-Kanal gestartet: [@termojetofficial](${CH}). Dort zeigen wir kurz und anschaulich, wie unsere Geräte funktionieren und wie man sie auswählt, montiert und in Betrieb nimmt — ohne lange Anleitungen und ohne Antworten in Foren suchen zu müssen.

**Der Einstieg: Übersicht des Termojet-Heizraums**

Die erste Übersicht erklärt anhand eines Schemas, wie der gesamte Heizraum verbunden ist: Kessel, hydraulische Weiche, Verteiler und Pumpengruppen für die einzelnen Kreise — Heizkörper, Fußbodenheizung und Warmwasserspeicher.

@[Termojet-Heizraum — wie alles verbunden ist: Kessel, hydraulische Weiche, Verteiler, Pumpengruppen](${V_KOT})

Die Geräte aus dem Video finden Sie im Katalog:

- [hydraulische Weichen](${HS}) — trennen den Kesselkreis von den Verbraucherkreisen, damit sich die Pumpen nicht gegenseitig stören;
- [Verteiler](${K}) und [Verteiler mit hydraulischer Weiche](${KGS}) — fassen die Verrohrung des Heizraums zu einer Einheit zusammen;
- [Pumpengruppen](${NG}) — fertige Einheiten für jeden Kreis: ungemischt, mit Mischventil, mit Thermostatventil;
- [Termojet BOX](${BOX}) — ein kompakter Heizraum an der Wand.

**Was es sonst noch auf dem Kanal gibt**

- Montage und Inbetriebnahme von [Pumpengruppen](${NG}), [Verteilern](${K}) und [Termojet BOX](${BOX})-Modulen;
- Termojet-[Umwälzpumpen](${NAS}): Anschluss, Betriebsarten, Fehlercodes;
- [Luft- und Schlammabscheider](${SEP}): Funktion, Einbauort, Reinigung;
- [Zonenregelung](${ZK}) der Fußbodenheizung: Thermostate, Empfänger, Klemmleisten und Einrichtung in Smart Life;
- Erklärungen am Schema — zum Beispiel, [wozu eine hydraulische Weiche dient](${HS_SLUG}) — sowie Videos von Messen wie der [WaterClima](${V_WC}).

Videos zu einem bestimmten Produkt fügen wir auch direkt auf seiner Produktseite ein — in der Galerie neben den Fotos.

[Abonnieren Sie den Kanal](${CH}), um keine neuen Videos zu verpassen, und bei Fragen zur Geräteauswahl schreiben Sie uns über die [Kontakte](/contacts).`,
      },
      ro: {
        category: 'Știri',
        title: 'Termojet a lansat un canal YouTube: prezentări, montaj și configurare',
        seo_title: 'Canalul YouTube Termojet: video despre centrale termice',
        meta_description: 'Termojet a lansat canalul YouTube @termojetofficial: prezentarea centralei termice, montajul grupurilor de pompare, distribuitoarelor, separatoarelor.',
        excerpt: 'Am lansat canalul @termojetofficial: video scurte despre alegerea, montajul și punerea în funcțiune a echipamentelor Termojet. Începeți cu centrala termică.',
        content: `Termojet a lansat propriul canal YouTube, [@termojetofficial](${CH}). Acolo arătăm pe scurt și clar cum funcționează echipamentele noastre și cum se aleg, se montează și se pun în funcțiune — fără instrucțiuni lungi și fără căutări pe forumuri.

**De unde să începeți: prezentarea centralei termice Termojet**

Prima prezentare explică pe o schemă cum este conectată întreaga centrală termică: cazanul, separatorul hidraulic, distribuitorul și grupurile de pompare pentru circuite separate — calorifere, încălzire prin pardoseală și boiler.

@[Centrala termică Termojet — cum se conectează totul: cazan, separator hidraulic, distribuitor, grupuri de pompare](${V_KOT})

Echipamentele din video se găsesc în catalog:

- [separatoare hidraulice](${HS}) — separă circuitul cazanului de circuitele consumatorilor, astfel încât pompele să nu se încurce reciproc;
- [distribuitoare](${K}) și [distribuitoare cu separator hidraulic](${KGS}) — reunesc conductele centralei într-un singur ansamblu;
- [grupuri de pompare](${NG}) — ansambluri gata de montat pentru fiecare circuit: directe, cu vană de amestec, cu vană termostatică;
- [Termojet BOX](${BOX}) — o centrală termică compactă, montată pe perete.

**Ce mai găsiți pe canal**

- montajul și punerea în funcțiune a [grupurilor de pompare](${NG}), [distribuitoarelor](${K}) și modulelor [Termojet BOX](${BOX});
- [pompele de circulație](${NAS}) Termojet: conectare, moduri de funcționare, coduri de eroare;
- [separatoarele de aer și nămol](${SEP}): cum funcționează, unde se montează, cum se curăță;
- [controlul pe zone](${ZK}) al încălzirii prin pardoseală: termostate, receptoare, centre de comutare și configurare în Smart Life;
- explicații pe schemă — de exemplu, [la ce folosește separatorul hidraulic](${HS_SLUG}) — precum și video de la expoziții, cum ar fi [WaterClima](${V_WC}).

Video despre un anumit produs adăugăm și direct în fișa lui de pe site — în galerie, lângă fotografii.

[Abonați-vă la canal](${CH}) ca să nu ratați prezentările noi, iar dacă aveți întrebări despre alegerea echipamentelor, scrieți-ne prin pagina de [contacte](/contacts).`,
      },
    },
  },
  {
    slug: 'navishcho-potribna-hidrostrilka-yak-pratsyuye',
    image: '/images/video/navishcho-potribna-hidrostrilka.jpg',
    published_at: '2026-11-05T09:00:00Z',
    category: 'Статті',
    title: 'Навіщо потрібна гідрострілка і як вона працює',
    seo_title: 'Навіщо потрібна гідрострілка і як вона працює | Termojet',
    meta_description: 'Як працює гідрострілка в котельні: розділення контурів котла й споживачів, захист насосів і котла, сепарація повітря та шламу. Відео-пояснення на схемі.',
    excerpt: 'Котел і кілька насосних груп без «боротьби» насосів: пояснюємо на схемі, що робить гідрострілка, коли вона потрібна і як підібрати типорозмір.',
    content: `Коли в котельні один контур — котел і радіатори, — циркуляційний насос котла справляється сам. Але щойно з'являються кілька контурів зі своїми насосами (радіатори, тепла підлога, бойлер), вони починають впливати один на одного: один «перетягує» потік, інший недоотримує витрату, котел працює ривками. Щоб цього не було, між котлом і споживачами ставлять [гідрострілку](${HS}) — гідравлічний розділювач.

@[Навіщо потрібна гідрострілка і як вона працює — пояснює Termojet на схемі](${V_HS})

**Як працює гідрострілка**

Гідрострілка — це вертикальна ємність великого перерізу, до якої з одного боку підключено контур котла (первинний), а з іншого — контури споживачів (вторинні). Усередині швидкість потоку мала, тож утворюється зона з майже нульовим перепадом тиску. Завдяки цьому кожен насос працює лише «на свій» контур і не впливає на інші.

- **Витрата котла більша за витрату споживачів** — надлишок гарячої води проходить через стрілку вниз і повертається в котел. Котел не перегрівається й не вимикається через закриті контури.
- **Споживачам потрібно більше, ніж дає котел** — частина зворотної води підмішується в подачу всередині стрілки. Насоси отримують свою розрахункову витрату, а котел працює у стабільному режимі.
- **Витрати однакові** — потік іде «транзитом» майже без змішування.

**Що ще робить гідрострілка Termojet**

У корпусі [гідрострілок Termojet](${HS}) вбудовано сепаратор повітря та шламоуловлювач: мікробульбашки піднімаються до повітровідвідника, а бруд осідає внизу і зливається через кран. Є гніздо під датчик температури для автоматики котельні, а теплоізоляція зменшує втрати тепла.

**Коли гідрострілка потрібна**

- у системі два і більше контурів із власними насосами — радіатори, тепла підлога, бойлер ГВП;
- котел із власним насосом (зокрема настінний газовий) або каскад із кількох котлів;
- твердопаливний котел чи тепловий насос, яким важлива стабільна витрата через теплообмінник.

**Як підібрати типорозмір**

Головне — максимальна витрата і потужність системи. Орієнтири для різьбових стрілок у теплоізоляції:

- [ГС-25](${GS(25)}), 1″ — до 25 кВт при ΔT=10 °C (до 50 кВт при ΔT=20 °C);
- [ГС-26](${GS(26)}), 1¼″ — до 60 кВт (до 90 кВт);
- [ГС-27](${GS(27)}), 1½″ — до 95 кВт (до 145 кВт);
- [ГС-28](${GS(28)}), 2″ — до 150 кВт (до 250 кВт).

Для потужніших котелень є фланцеві стрілки з підставкою. Детальніше про підбір — у статті [«Як вибрати гідравлічний розділювач (гідрострілку) для котельні»](${HS_PICK}), а чим гідрострілка відрізняється від колектора й КГС — у матеріалі [«Гідрострілка, колектор чи КГС: що і коли ставити»](${HS_VS}).

**Гідрострілка у складі котельні**

Після гідрострілки зазвичай ставлять [розподільчий колектор](${K}), а на нього — [насосні групи](${NG}) для кожного контуру. Щоб не збирати вузол із окремих деталей, можна взяти [колектор із вбудованою гідрострілкою](${KGS}) — він займає менше місця й монтується швидше. Як усе це з'єднується в готову котельню, показуємо в [огляді котельні Termojet](/blog/termojet-youtube-kanal) та в статті [«Котельня «під ключ» за день»](${KOT}).

Не впевнені, яку стрілку обрати під ваш котел і кількість контурів? Надішліть нам схему чи список обладнання через [контакти](/contacts) — інженер Termojet допоможе з підбором.`,
    i18n: {
      en: {
        category: 'Articles',
        title: 'Why You Need a Hydraulic Separator and How It Works',
        seo_title: 'Why You Need a Hydraulic Separator and How It Works | Termojet',
        meta_description: 'How a hydraulic separator works in a boiler room: separating boiler and consumer circuits, protecting pumps and the boiler, removing air and sludge. Video.',
        excerpt: 'A boiler and several pump groups without pumps «fighting» each other: we explain on a diagram what a hydraulic separator does, when you need one and how to size it.',
        content: `When a boiler room has one circuit — a boiler and radiators — the boiler's circulation pump copes on its own. But as soon as there are several circuits with their own pumps (radiators, underfloor heating, a DHW cylinder), they start to affect each other: one pump «pulls» the flow, another gets too little, and the boiler runs in fits and starts. To prevent this, a [hydraulic separator](${HS}) is installed between the boiler and the consumers.

@[Why you need a hydraulic separator and how it works — Termojet explains on a diagram](${V_HS})

**How a hydraulic separator works**

A hydraulic separator is a vertical vessel with a large cross-section. The boiler circuit (primary) is connected on one side and the consumer circuits (secondary) on the other. The flow velocity inside is low, so a zone with almost zero pressure difference is created. As a result, each pump works only «for its own» circuit and does not affect the others.

- **The boiler flow is greater than the consumer flow** — the surplus hot water goes down through the separator and back to the boiler. The boiler does not overheat or shut down because of closed circuits.
- **The consumers need more than the boiler supplies** — some return water is mixed into the supply inside the separator. The pumps get their design flow and the boiler runs steadily.
- **The flows are equal** — water passes straight through with almost no mixing.

**What else a Termojet hydraulic separator does**

[Termojet hydraulic separators](${HS}) have a built-in air separator and sludge trap: microbubbles rise to the air vent, while dirt settles at the bottom and is drained through a valve. There is a pocket for a temperature sensor for the boiler room controls, and the thermal insulation reduces heat loss.

**When you need a hydraulic separator**

- the system has two or more circuits with their own pumps — radiators, underfloor heating, a DHW cylinder;
- a boiler with its own pump (including a wall-hung gas boiler) or a cascade of several boilers;
- a solid fuel boiler or a heat pump that needs a stable flow through its heat exchanger.

**How to choose the size**

What matters most is the maximum flow rate and the system output. Guide values for threaded insulated separators:

- [HS-25](${GS(25)}), 1″ — up to 25 kW at ΔT=10 °C (up to 50 kW at ΔT=20 °C);
- [HS-26](${GS(26)}), 1¼″ — up to 60 kW (up to 90 kW);
- [HS-27](${GS(27)}), 1½″ — up to 95 kW (up to 145 kW);
- [HS-28](${GS(28)}), 2″ — up to 150 kW (up to 250 kW).

For larger boiler rooms there are flanged separators with a base. Read more about sizing in [«How to Choose a Hydraulic Separator for Your Boiler Room»](${HS_PICK}), and about the difference between a separator, a manifold and a combined unit in [«Hydraulic Separator, Manifold, or Combined Unit: What to Choose and When»](${HS_VS}).

**The hydraulic separator as part of the boiler room**

A [distribution manifold](${K}) is usually installed after the hydraulic separator, with [pump groups](${NG}) for each circuit mounted on it. Instead of assembling the unit from separate parts, you can choose a [manifold with a built-in hydraulic separator](${KGS}) — it takes up less space and is quicker to install. How it all comes together into a ready-made boiler room is shown in the [Termojet boiler room overview](/blog/termojet-youtube-kanal) and in the article [«A turnkey boiler room in one day»](${KOT}).

Not sure which separator to choose for your boiler and number of circuits? Send us a diagram or a list of equipment via [contacts](/contacts) — a Termojet engineer will help you choose.`,
      },
      pl: {
        category: 'Artykuły',
        title: 'Po co jest separator hydrauliczny i jak działa',
        seo_title: 'Po co jest separator hydrauliczny i jak działa | Termojet',
        meta_description: 'Jak działa separator hydrauliczny w kotłowni: rozdzielenie obiegu kotła i odbiorników, ochrona pomp i kotła, odpowietrzanie i odmulanie. Film na schemacie.',
        excerpt: 'Kocioł i kilka grup pompowych bez «walki» pomp: wyjaśniamy na schemacie, co robi separator hydrauliczny, kiedy jest potrzebny i jak dobrać jego wielkość.',
        content: `Gdy w kotłowni jest jeden obieg — kocioł i grzejniki — pompa obiegowa kotła radzi sobie sama. Ale gdy pojawia się kilka obiegów z własnymi pompami (grzejniki, ogrzewanie podłogowe, zasobnik c.w.u.), zaczynają one wpływać na siebie nawzajem: jedna pompa «przeciąga» przepływ, inna dostaje go za mało, a kocioł pracuje nierówno. Aby temu zapobiec, między kotłem a odbiornikami montuje się [separator hydrauliczny](${HS}), zwany też sprzęgłem hydraulicznym.

@[Po co jest separator hydrauliczny i jak działa — Termojet wyjaśnia na schemacie](${V_HS})

**Jak działa separator hydrauliczny**

Separator hydrauliczny to pionowy zbiornik o dużym przekroju. Z jednej strony podłączony jest obieg kotła (pierwotny), z drugiej — obiegi odbiorników (wtórne). Prędkość przepływu w środku jest mała, więc powstaje strefa o niemal zerowej różnicy ciśnień. Dzięki temu każda pompa pracuje tylko «na swój» obieg i nie wpływa na pozostałe.

- **Przepływ kotła jest większy niż odbiorników** — nadmiar gorącej wody przepływa przez separator w dół i wraca do kotła. Kocioł nie przegrzewa się i nie wyłącza z powodu zamkniętych obiegów.
- **Odbiorniki potrzebują więcej, niż daje kocioł** — część wody powrotnej domieszywana jest do zasilania wewnątrz separatora. Pompy otrzymują przepływ obliczeniowy, a kocioł pracuje stabilnie.
- **Przepływy są równe** — woda przepływa «tranzytem» prawie bez mieszania.

**Co jeszcze robi separator hydrauliczny Termojet**

[Separatory hydrauliczne Termojet](${HS}) mają wbudowany separator powietrza i odmulacz: mikropęcherzyki unoszą się do odpowietrznika, a zanieczyszczenia osiadają na dole i są spuszczane przez zawór. Jest też gniazdo na czujnik temperatury dla automatyki kotłowni, a izolacja termiczna ogranicza straty ciepła.

**Kiedy separator hydrauliczny jest potrzebny**

- w instalacji są dwa lub więcej obiegów z własnymi pompami — grzejniki, ogrzewanie podłogowe, zasobnik c.w.u.;
- kocioł z własną pompą (w tym wiszący kocioł gazowy) lub kaskada kilku kotłów;
- kocioł na paliwo stałe lub pompa ciepła, dla których ważny jest stabilny przepływ przez wymiennik.

**Jak dobrać wielkość**

Najważniejsze są maksymalny przepływ i moc instalacji. Wartości orientacyjne dla gwintowanych separatorów w izolacji:

- [HS-25](${GS(25)}), 1″ — do 25 kW przy ΔT=10 °C (do 50 kW przy ΔT=20 °C);
- [HS-26](${GS(26)}), 1¼″ — do 60 kW (do 90 kW);
- [HS-27](${GS(27)}), 1½″ — do 95 kW (do 145 kW);
- [HS-28](${GS(28)}), 2″ — do 150 kW (do 250 kW).

Do większych kotłowni są separatory kołnierzowe z podstawą. Więcej o doborze — w artykule [«Jak wybrać sprzęgło hydrauliczne do kotłowni»](${HS_PICK}), a czym separator różni się od rozdzielacza i KGS — w tekście [«Sprzęgło hydrauliczne, rozdzielacz czy KGS: co i kiedy stosować»](${HS_VS}).

**Separator hydrauliczny w kotłowni**

Za separatorem zwykle montuje się [rozdzielacz](${K}), a na nim [grupy pompowe](${NG}) dla każdego obiegu. Zamiast składać zespół z osobnych części, można wybrać [rozdzielacz z wbudowanym separatorem hydraulicznym](${KGS}) — zajmuje mniej miejsca i montuje się szybciej. Jak to wszystko łączy się w gotową kotłownię, pokazujemy w [przeglądzie kotłowni Termojet](/blog/termojet-youtube-kanal) i w artykule [«Kotłownia "pod klucz" w jeden dzień»](${KOT}).

Nie wiesz, który separator wybrać do swojego kotła i liczby obiegów? Wyślij nam schemat lub listę urządzeń przez [kontakty](/contacts) — inżynier Termojet pomoże w doborze.`,
      },
      fr: {
        category: 'Articles',
        title: 'À quoi sert un séparateur hydraulique et comment il fonctionne',
        seo_title: 'À quoi sert un séparateur hydraulique | Termojet',
        meta_description: 'Fonctionnement du séparateur hydraulique : découplage chaudière et circuits, protection des pompes et de la chaudière, séparation de l\'air et des boues. Vidéo.',
        excerpt: 'Une chaudière et plusieurs groupes de pompage sans « conflit » entre pompes : nous expliquons sur un schéma le rôle du séparateur hydraulique et comment le dimensionner.',
        content: `Quand une chaufferie n'a qu'un circuit — une chaudière et des radiateurs — le circulateur de la chaudière suffit. Mais dès qu'il y a plusieurs circuits avec leurs propres pompes (radiateurs, plancher chauffant, ballon d'eau chaude), ils s'influencent mutuellement : une pompe « tire » le débit, une autre en manque, et la chaudière fonctionne par à-coups. Pour l'éviter, on installe un [séparateur hydraulique](${HS}) (bouteille de découplage) entre la chaudière et les circuits consommateurs.

@[À quoi sert un séparateur hydraulique et comment il fonctionne — Termojet l'explique sur un schéma](${V_HS})

**Comment fonctionne un séparateur hydraulique**

Le séparateur hydraulique est un réservoir vertical de grande section. D'un côté est raccordé le circuit de la chaudière (primaire), de l'autre les circuits consommateurs (secondaires). La vitesse d'écoulement à l'intérieur est faible, ce qui crée une zone où la différence de pression est quasi nulle. Ainsi, chaque pompe ne travaille que « pour son » circuit sans influencer les autres.

- **Le débit de la chaudière est supérieur à celui des circuits** — l'excédent d'eau chaude descend dans le séparateur et retourne à la chaudière. Celle-ci ne surchauffe pas et ne s'arrête pas lorsque des circuits sont fermés.
- **Les circuits demandent plus que la chaudière ne fournit** — une partie de l'eau de retour est mélangée au départ à l'intérieur du séparateur. Les pompes obtiennent leur débit nominal et la chaudière fonctionne de façon stable.
- **Les débits sont égaux** — l'eau passe directement, presque sans mélange.

**Ce que fait aussi le séparateur hydraulique Termojet**

Les [séparateurs hydrauliques Termojet](${HS}) intègrent un séparateur d'air et un pot à boues : les microbulles montent vers le purgeur et les impuretés se déposent au fond, d'où elles sont évacuées par un robinet. Un doigt de gant accueille la sonde de température de la régulation, et l'isolation thermique limite les pertes de chaleur.

**Quand un séparateur hydraulique est nécessaire**

- l'installation comporte deux circuits ou plus avec leurs propres pompes — radiateurs, plancher chauffant, ballon d'eau chaude ;
- une chaudière avec sa propre pompe (y compris une chaudière murale gaz) ou une cascade de plusieurs chaudières ;
- une chaudière à combustible solide ou une pompe à chaleur qui a besoin d'un débit stable dans son échangeur.

**Comment choisir la taille**

L'essentiel est le débit maximal et la puissance de l'installation. Valeurs indicatives pour les séparateurs filetés isolés :

- [HS-25](${GS(25)}), 1″ — jusqu'à 25 kW à ΔT=10 °C (jusqu'à 50 kW à ΔT=20 °C) ;
- [HS-26](${GS(26)}), 1¼″ — jusqu'à 60 kW (jusqu'à 90 kW) ;
- [HS-27](${GS(27)}), 1½″ — jusqu'à 95 kW (jusqu'à 145 kW) ;
- [HS-28](${GS(28)}), 2″ — jusqu'à 150 kW (jusqu'à 250 kW).

Pour les chaufferies plus puissantes, il existe des séparateurs à brides avec socle. Pour en savoir plus sur le dimensionnement, lisez [« Comment choisir un séparateur hydraulique pour votre chaufferie »](${HS_PICK}), et sur la différence avec un collecteur ou une unité combinée, [« Séparateur hydraulique, collecteur ou unité combinée : que choisir et quand »](${HS_VS}).

**Le séparateur hydraulique dans la chaufferie**

Après le séparateur hydraulique, on installe généralement un [collecteur de distribution](${K}) sur lequel sont montés les [groupes de pompage](${NG}) de chaque circuit. Plutôt que d'assembler l'ensemble pièce par pièce, vous pouvez choisir un [collecteur avec séparateur hydraulique intégré](${KGS}) — plus compact et plus rapide à installer. La façon dont tout cela forme une chaufferie complète est présentée dans la [vidéo sur la chaufferie Termojet](/blog/termojet-youtube-kanal) et dans l'article [« Une chaufferie clé en main en une journée »](${KOT}).

Vous hésitez sur le séparateur adapté à votre chaudière et au nombre de circuits ? Envoyez-nous un schéma ou la liste des équipements via la page [contacts](/contacts) — un ingénieur Termojet vous aidera à choisir.`,
      },
      de: {
        category: 'Artikel',
        title: 'Wozu eine hydraulische Weiche dient und wie sie funktioniert',
        seo_title: 'Wozu eine hydraulische Weiche dient und wie sie funktioniert',
        meta_description: 'So funktioniert eine hydraulische Weiche im Heizraum: Trennung von Kessel- und Verbraucherkreisen, Schutz von Pumpen und Kessel, Luft- und Schlammabscheidung.',
        excerpt: 'Ein Kessel und mehrere Pumpengruppen, ohne dass sich die Pumpen «bekämpfen»: Wir erklären am Schema, was eine hydraulische Weiche macht und wie man sie auslegt.',
        content: `Hat ein Heizraum nur einen Kreis — Kessel und Heizkörper —, kommt die Umwälzpumpe des Kessels allein zurecht. Sobald es aber mehrere Kreise mit eigenen Pumpen gibt (Heizkörper, Fußbodenheizung, Warmwasserspeicher), beeinflussen sie sich gegenseitig: Eine Pumpe «zieht» den Volumenstrom an sich, eine andere bekommt zu wenig, und der Kessel taktet. Damit das nicht passiert, wird zwischen Kessel und Verbrauchern eine [hydraulische Weiche](${HS}) eingebaut.

@[Wozu eine hydraulische Weiche dient und wie sie funktioniert — Termojet erklärt am Schema](${V_HS})

**So funktioniert eine hydraulische Weiche**

Die hydraulische Weiche ist ein senkrechter Behälter mit großem Querschnitt. Auf der einen Seite ist der Kesselkreis (Primärkreis) angeschlossen, auf der anderen die Verbraucherkreise (Sekundärkreise). Die Strömungsgeschwindigkeit im Inneren ist gering, sodass eine Zone mit nahezu null Druckdifferenz entsteht. Dadurch arbeitet jede Pumpe nur für «ihren» Kreis und beeinflusst die anderen nicht.

- **Der Kesselvolumenstrom ist größer als der der Verbraucher** — das überschüssige Heizwasser strömt durch die Weiche nach unten und zurück zum Kessel. Der Kessel überhitzt nicht und schaltet bei geschlossenen Kreisen nicht ab.
- **Die Verbraucher brauchen mehr, als der Kessel liefert** — ein Teil des Rücklaufwassers wird in der Weiche dem Vorlauf beigemischt. Die Pumpen erhalten ihren Auslegungsvolumenstrom, und der Kessel läuft stabil.
- **Die Volumenströme sind gleich** — das Wasser fließt nahezu ohne Vermischung durch.

**Was die hydraulische Weiche von Termojet zusätzlich leistet**

[Hydraulische Weichen von Termojet](${HS}) haben einen integrierten Luftabscheider und Schlammabscheider: Mikroblasen steigen zum Entlüfter auf, Schmutz setzt sich unten ab und wird über einen Hahn abgelassen. Eine Tauchhülse nimmt den Temperaturfühler der Heizraumregelung auf, und die Wärmedämmung verringert Wärmeverluste.

**Wann eine hydraulische Weiche nötig ist**

- die Anlage hat zwei oder mehr Kreise mit eigenen Pumpen — Heizkörper, Fußbodenheizung, Warmwasserspeicher;
- ein Kessel mit eigener Pumpe (auch ein wandhängender Gaskessel) oder eine Kaskade aus mehreren Kesseln;
- ein Festbrennstoffkessel oder eine Wärmepumpe, die einen stabilen Volumenstrom durch den Wärmetauscher benötigt.

**So wählen Sie die Größe**

Entscheidend sind der maximale Volumenstrom und die Leistung der Anlage. Richtwerte für gedämmte Weichen mit Gewindeanschluss:

- [HS-25](${GS(25)}), 1″ — bis 25 kW bei ΔT=10 °C (bis 50 kW bei ΔT=20 °C);
- [HS-26](${GS(26)}), 1¼″ — bis 60 kW (bis 90 kW);
- [HS-27](${GS(27)}), 1½″ — bis 95 kW (bis 145 kW);
- [HS-28](${GS(28)}), 2″ — bis 150 kW (bis 250 kW).

Für größere Heizräume gibt es Flansch-Weichen mit Sockel. Mehr zur Auslegung lesen Sie im Artikel [«Wie Sie eine hydraulische Weiche für Ihren Heizraum auswählen»](${HS_PICK}), und worin sich eine Weiche von einem Verteiler oder einer Kombieinheit unterscheidet, in [«Hydraulische Weiche, Verteiler oder Kombieinheit: Was wählen und wann»](${HS_VS}).

**Die hydraulische Weiche im Heizraum**

Nach der hydraulischen Weiche wird in der Regel ein [Verteiler](${K}) eingebaut, auf dem die [Pumpengruppen](${NG}) für jeden Kreis sitzen. Statt die Einheit aus Einzelteilen zusammenzubauen, können Sie einen [Verteiler mit integrierter hydraulischer Weiche](${KGS}) wählen — er braucht weniger Platz und ist schneller montiert. Wie daraus ein fertiger Heizraum wird, zeigen wir in der [Übersicht des Termojet-Heizraums](/blog/termojet-youtube-kanal) und im Artikel [«Eine schlüsselfertige Heizanlage an einem Tag»](${KOT}).

Sie sind nicht sicher, welche Weiche zu Ihrem Kessel und zur Anzahl der Kreise passt? Schicken Sie uns ein Schema oder eine Geräteliste über die [Kontakte](/contacts) — ein Termojet-Ingenieur hilft bei der Auswahl.`,
      },
      ro: {
        category: 'Articole',
        title: 'La ce folosește separatorul hidraulic și cum funcționează',
        seo_title: 'La ce folosește separatorul hidraulic | Termojet',
        meta_description: 'Cum funcționează separatorul hidraulic în centrala termică: separarea circuitelor cazanului și consumatorilor, protecția pompelor, eliminarea aerului și nămolului.',
        excerpt: 'Un cazan și mai multe grupuri de pompare fără ca pompele să se „lupte”: explicăm pe o schemă ce face separatorul hidraulic, când e necesar și cum se dimensionează.',
        content: `Când centrala termică are un singur circuit — cazan și calorifere —, pompa de circulație a cazanului se descurcă singură. Dar de îndată ce apar mai multe circuite cu pompe proprii (calorifere, încălzire prin pardoseală, boiler), ele încep să se influențeze reciproc: o pompă „trage” debitul, alta primește prea puțin, iar cazanul funcționează intermitent. Pentru a evita acest lucru, între cazan și consumatori se montează un [separator hidraulic](${HS}) (butelie de egalizare).

@[La ce folosește separatorul hidraulic și cum funcționează — Termojet explică pe schemă](${V_HS})

**Cum funcționează separatorul hidraulic**

Separatorul hidraulic este un recipient vertical cu secțiune mare. Pe o parte se conectează circuitul cazanului (primar), pe cealaltă — circuitele consumatorilor (secundare). Viteza de curgere în interior este mică, astfel încât se formează o zonă cu diferență de presiune aproape nulă. Datorită acestui lucru, fiecare pompă lucrează doar „pentru” circuitul ei și nu le influențează pe celelalte.

- **Debitul cazanului este mai mare decât al consumatorilor** — surplusul de apă caldă coboară prin separator și revine în cazan. Cazanul nu se supraîncălzește și nu se oprește din cauza circuitelor închise.
- **Consumatorii au nevoie de mai mult decât oferă cazanul** — o parte din apa de retur se amestecă în tur în interiorul separatorului. Pompele primesc debitul de calcul, iar cazanul funcționează stabil.
- **Debitele sunt egale** — apa trece „în tranzit”, aproape fără amestec.

**Ce mai face separatorul hidraulic Termojet**

[Separatoarele hidraulice Termojet](${HS}) au separator de aer și separator de nămol integrate: microbulele urcă spre aerisitor, iar impuritățile se depun la bază și se evacuează printr-un robinet. Există și un locaș pentru senzorul de temperatură al automatizării, iar izolația termică reduce pierderile de căldură.

**Când este necesar separatorul hidraulic**

- instalația are două sau mai multe circuite cu pompe proprii — calorifere, încălzire prin pardoseală, boiler ACM;
- un cazan cu pompă proprie (inclusiv un cazan mural pe gaz) sau o cascadă de mai multe cazane;
- un cazan pe combustibil solid sau o pompă de căldură, pentru care contează debitul stabil prin schimbător.

**Cum se alege dimensiunea**

Contează în primul rând debitul maxim și puterea instalației. Valori orientative pentru separatoarele filetate cu izolație:

- [GS-25](${GS(25)}), 1″ — până la 25 kW la ΔT=10 °C (până la 50 kW la ΔT=20 °C);
- [GS-26](${GS(26)}), 1¼″ — până la 60 kW (până la 90 kW);
- [GS-27](${GS(27)}), 1½″ — până la 95 kW (până la 145 kW);
- [GS-28](${GS(28)}), 2″ — până la 150 kW (până la 250 kW).

Pentru centralele mai puternice există separatoare cu flanșe și suport. Mai multe despre dimensionare găsiți în articolul [„Cum să alegeți separatorul hidraulic pentru centrala termică”](${HS_PICK}), iar despre diferența dintre separator, colector și КГС — în [„Separator hidraulic, colector sau КГС: ce și când se montează”](${HS_VS}).

**Separatorul hidraulic în centrala termică**

După separatorul hidraulic se montează de obicei un [distribuitor](${K}), iar pe el — [grupurile de pompare](${NG}) pentru fiecare circuit. În loc să asamblați ansamblul din piese separate, puteți alege un [distribuitor cu separator hidraulic integrat](${KGS}) — ocupă mai puțin loc și se montează mai repede. Cum se leagă totul într-o centrală termică gata făcută arătăm în [prezentarea centralei termice Termojet](/blog/termojet-youtube-kanal) și în articolul [„Centrală termică «la cheie» într-o zi”](${KOT}).

Nu sunteți sigur ce separator să alegeți pentru cazanul și numărul de circuite? Trimiteți-ne o schemă sau lista echipamentelor prin pagina de [contacte](/contacts) — un inginer Termojet vă va ajuta cu alegerea.`,
      },
    },
  },
]
