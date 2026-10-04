// Heating Tech Expo (Польща, 8–10.09.2026) — дані для apply-blog-posts.js.
// Вихідні дані від маркетингу: назва, дати, тематика, одне фото стенду. Місто не
// вказане — у тексті його немає. Склад експозиції описано за фото стенду.

const KOT = '/blog/kotelnya-pid-klyuch-modulna-obvyazka'
const POZ = '/blog/vystavka-instalacje-poznan'
const TB = '/blog/vystavka-targi-budowlane'
const NT = '/blog/vystavka-nowy-targ'
const PL = 'https://termojet.pl/'

module.exports = [
  {
    slug: 'vystavka-heating-tech-expo-2026',
    image: '/images/blog/exh-heating-tech-expo-2026.jpg',
    published_at: '2026-09-10T09:00:00Z',
    category: 'Виставки',
    title: 'Termojet на виставці Heating Tech Expo 2026 у Польщі',
    seo_title: 'Termojet на Heating Tech Expo 2026: обладнання для котелень',
    meta_description: '8–10 вересня Termojet представив на польській виставці Heating Tech Expo насосні групи, гідрострілки, колектори, клапани та зональне керування.',
    excerpt: '8–10 вересня ми взяли участь у Heating Tech Expo — польській виставці, повністю присвяченій опаленню, — і показали обладнання Termojet для котелень швидкого монтажу.',
    content: `З 8 по 10 вересня Termojet узяв участь у Heating Tech Expo (Heating Technology Expo) — польській виставці, повністю присвяченій опаленню: котлам, радіаторам, тепловим насосам і автоматиці. Для нас це ще одна нагода показати польським монтажникам, проєктувальникам і дистриб'юторам, як швидко збирається котельня з готових вузлів Termojet.

**«Wydajność Twojej kotłowni»**

Гасло стенду — «Ефективність вашої котельні», а девіз «Szybko · Niezawodnie · Skutecznie» (Швидко · Надійно · Ефективно) задав тон усій експозиції. Обладнання змонтували на демонстраційних стійках так, як воно стоїть у реальній котельні, тож кожен відвідувач міг роздивитися вузли з усіх боків.

**Що ми показали**

- [насосні групи](/catalog/nasosni-hrupy) у теплоізоляції — для прямих і змішувальних контурів радіаторів і теплої підлоги;
- [гідравлічні розділювачі](/catalog/hidravlichni-rozdilnyky) та [розподільчі колектори](/catalog/rozpodilchi-kolektory), що збирають обв'язку котельні в один компактний вузол;
- [триходові та чотирьохходові змішувальні клапани](/catalog/klapany) з електроприводами;
- [колектор теплої підлоги](/catalog/kolektory-pidloha) у зборі з монтажною шафою та демонстраційну панель [зонального керування](/catalog/zonalne-keruvannya) з кімнатними термостатами.

**Чому готові вузли**

Що більше в системі контурів і джерел тепла — котел, тепловий насос, тепла підлога, радіатори, — то більше ефективність усієї системи залежить від гідравліки котельні. Готові заводські вузли скорочують монтаж із днів до годин і прибирають типові помилки складання «на коліні». Детальніше про цей підхід — у статті [«Котельня "під ключ" за день»](${KOT}).

**Termojet у Польщі**

Heating Tech Expo продовжує нашу серію польських виставок: раніше ми представляли обладнання на [Instalacje в Познані](${POZ}), [Targi Budowlane](${TB}) та [виставці в Новому Тарзі](${NT}). Польські партнери знайдуть асортимент і контакти на сайті [termojet.pl](${PL}).

Дякуємо всім, хто завітав на стенд, — до зустрічі на наступних виставках! Обладнання з експозиції є в [каталозі](/catalog), а підібрати рішення для вашого об'єкта допоможуть наші інженери — [зв'яжіться з нами](/contacts).`,
    i18n: {
      en: {
        category: 'Exhibitions',
        title: 'Termojet at Heating Tech Expo 2026 in Poland',
        seo_title: 'Termojet at Heating Tech Expo 2026: Boiler Room Equipment',
        meta_description: 'On 8–10 September Termojet showed pump groups, hydraulic separators, manifolds, valves and zone control at the Heating Tech Expo in Poland.',
        excerpt: 'On 8–10 September we took part in Heating Tech Expo — a Polish exhibition dedicated entirely to heating — and showed Termojet quick-installation boiler room equipment.',
        content: `From 8 to 10 September, Termojet took part in Heating Tech Expo (Heating Technology Expo) — a Polish exhibition dedicated entirely to heating: boilers, radiators, heat pumps and controls. For us it was another opportunity to show Polish installers, designers and distributors how quickly a boiler room can be assembled from ready-made Termojet units.

**«Wydajność Twojej kotłowni»**

The stand's slogan — «Your boiler room's efficiency» — and the motto «Szybko · Niezawodnie · Skutecznie» (Fast · Reliable · Efficient) set the tone for the whole display. The equipment was mounted on demonstration racks exactly as it sits in a real boiler room, so every visitor could examine the units from all sides.

**What we showed**

- insulated [pump groups](/catalog/nasosni-hrupy) — for direct and mixing circuits for radiators and underfloor heating;
- [hydraulic separators](/catalog/hidravlichni-rozdilnyky) and [distribution manifolds](/catalog/rozpodilchi-kolektory) that bring the boiler room pipework together into one compact unit;
- [three-way and four-way mixing valves](/catalog/klapany) with electric actuators;
- an assembled [underfloor heating manifold](/catalog/kolektory-pidloha) with its installation cabinet, and a [zone control](/catalog/zonalne-keruvannya) demo panel with room thermostats.

**Why ready-made units**

The more circuits and heat sources a system has — boiler, heat pump, underfloor heating, radiators — the more the efficiency of the whole system depends on the boiler room hydraulics. Factory-made units cut installation from days to hours and eliminate the typical mistakes of improvised on-site assembly. Read more about this approach in our article [«A turnkey boiler room in a day»](${KOT}).

**Termojet in Poland**

Heating Tech Expo continues our series of Polish exhibitions: we previously presented our equipment at [Instalacje in Poznań](${POZ}), [Targi Budowlane](${TB}) and the [exhibition in Nowy Targ](${NT}). Polish partners will find our range and contacts at [termojet.pl](${PL}).

Thank you to everyone who visited our stand — see you at the next exhibitions! The equipment on display is in our [catalogue](/catalog), and our engineers will help you choose a solution for your project — [get in touch](/contacts).`,
      },
      pl: {
        category: 'Targi',
        title: 'Termojet na targach Heating Tech Expo 2026 w Polsce',
        seo_title: 'Termojet na Heating Tech Expo 2026: urządzenia do kotłowni',
        meta_description: 'W dniach 8–10 września Termojet pokazał na Heating Tech Expo grupy pompowe, sprzęgła hydrauliczne, rozdzielacze, zawory i sterowanie strefowe.',
        excerpt: 'W dniach 8–10 września wzięliśmy udział w Heating Tech Expo — targach w całości poświęconych ogrzewaniu — i pokazaliśmy urządzenia Termojet do kotłowni szybkiego montażu.',
        content: `W dniach 8–10 września Termojet wziął udział w Heating Tech Expo (Heating Technology Expo) — polskich targach w całości poświęconych ogrzewaniu: kotłom, grzejnikom, pompom ciepła i automatyce. Była to dla nas kolejna okazja, by pokazać polskim instalatorom, projektantom i dystrybutorom, jak szybko montuje się kotłownię z gotowych węzłów Termojet.

**«Wydajność Twojej kotłowni»**

Hasło stoiska — «Wydajność Twojej kotłowni» — oraz motto «Szybko · Niezawodnie · Skutecznie» nadały ton całej ekspozycji. Urządzenia zamontowaliśmy na stojakach demonstracyjnych tak, jak pracują w prawdziwej kotłowni, dzięki czemu każdy odwiedzający mógł obejrzeć węzły ze wszystkich stron.

**Co pokazaliśmy**

- [grupy pompowe](/catalog/nasosni-hrupy) w izolacji termicznej — do obiegów bezpośrednich i mieszających, grzejnikowych i podłogowych;
- [sprzęgła hydrauliczne](/catalog/hidravlichni-rozdilnyky) i [rozdzielacze](/catalog/rozpodilchi-kolektory), które łączą orurowanie kotłowni w jeden kompaktowy węzeł;
- [trójdrogowe i czterodrogowe zawory mieszające](/catalog/klapany) z siłownikami elektrycznymi;
- zmontowany [rozdzielacz ogrzewania podłogowego](/catalog/kolektory-pidloha) z szafką instalacyjną oraz panel demonstracyjny [sterowania strefowego](/catalog/zonalne-keruvannya) z termostatami pokojowymi.

**Dlaczego gotowe węzły**

Im więcej obiegów i źródeł ciepła w instalacji — kocioł, pompa ciepła, ogrzewanie podłogowe, grzejniki — tym bardziej sprawność całego systemu zależy od hydrauliki kotłowni. Gotowe fabryczne węzły skracają montaż z dni do godzin i eliminują typowe błędy montażu «na kolanie». Więcej o tym podejściu w artykule [«Kotłownia "pod klucz" w jeden dzień»](${KOT}).

**Termojet w Polsce**

Heating Tech Expo to kolejne polskie targi w naszym kalendarzu: wcześniej prezentowaliśmy urządzenia na [Instalacjach w Poznaniu](${POZ}), [Targach Budowlanych](${TB}) i [targach w Nowym Targu](${NT}). Asortyment i kontakty dla polskich partnerów są na stronie [termojet.pl](${PL}).

Dziękujemy wszystkim, którzy odwiedzili nasze stoisko — do zobaczenia na kolejnych targach! Urządzenia z ekspozycji znajdą Państwo w [katalogu](/catalog), a w doborze rozwiązania do Państwa obiektu pomogą nasi inżynierowie — [skontaktuj się z nami](/contacts).`,
      },
      fr: {
        category: 'Salons',
        title: 'Termojet au salon Heating Tech Expo 2026 en Pologne',
        seo_title: 'Termojet à Heating Tech Expo 2026 : chaufferie',
        meta_description: 'Du 8 au 10 septembre, Termojet a présenté au Heating Tech Expo en Pologne ses groupes de pompage, bouteilles de découplage, collecteurs et vannes.',
        excerpt: 'Du 8 au 10 septembre, nous avons participé au Heating Tech Expo, un salon polonais entièrement consacré au chauffage, et présenté les équipements de chaufferie à montage rapide Termojet.',
        content: `Du 8 au 10 septembre, Termojet a participé au Heating Tech Expo (Heating Technology Expo), un salon polonais entièrement consacré au chauffage : chaudières, radiateurs, pompes à chaleur et régulation. Ce fut pour nous une nouvelle occasion de montrer aux installateurs, bureaux d'études et distributeurs polonais à quel point une chaufferie se monte rapidement à partir de modules Termojet prêts à l'emploi.

**«Wydajność Twojej kotłowni»**

Le slogan du stand — «L'efficacité de votre chaufferie» — et la devise «Szybko · Niezawodnie · Skutecznie» (Rapide · Fiable · Efficace) ont donné le ton de toute l'exposition. Les équipements étaient montés sur des supports de démonstration, comme dans une vraie chaufferie, afin que chaque visiteur puisse examiner les modules sous tous les angles.

**Ce que nous avons présenté**

- des [groupes de pompage](/catalog/nasosni-hrupy) isolés — pour circuits directs et mélangés, radiateurs et plancher chauffant ;
- des [bouteilles de découplage](/catalog/hidravlichni-rozdilnyky) et des [collecteurs de distribution](/catalog/rozpodilchi-kolektory), qui regroupent la tuyauterie de la chaufferie en un seul module compact ;
- des [vannes mélangeuses trois voies et quatre voies](/catalog/klapany) avec servomoteurs électriques ;
- un [collecteur de plancher chauffant](/catalog/kolektory-pidloha) assemblé avec son coffret, et un panneau de démonstration de [régulation par zones](/catalog/zonalne-keruvannya) avec thermostats d'ambiance.

**Pourquoi des modules prêts à l'emploi**

Plus une installation compte de circuits et de sources de chaleur — chaudière, pompe à chaleur, plancher chauffant, radiateurs —, plus le rendement de l'ensemble dépend de l'hydraulique de la chaufferie. Les modules préfabriqués réduisent le montage de plusieurs jours à quelques heures et éliminent les erreurs typiques de l'assemblage improvisé sur chantier. Pour en savoir plus, lisez l'article [«Une chaufferie clé en main en une journée»](${KOT}).

**Termojet en Pologne**

Le Heating Tech Expo prolonge notre série de salons polonais : nous avons déjà présenté nos équipements à [Instalacje à Poznań](${POZ}), aux [Targi Budowlane](${TB}) et au [salon de Nowy Targ](${NT}). Les partenaires polonais trouveront notre gamme et nos contacts sur [termojet.pl](${PL}).

Merci à tous ceux qui sont venus sur notre stand — à bientôt sur les prochains salons ! Les équipements exposés sont dans notre [catalogue](/catalog), et nos ingénieurs vous aideront à choisir la solution adaptée à votre projet — [contactez-nous](/contacts).`,
      },
      de: {
        category: 'Messen',
        title: 'Termojet auf der Heating Tech Expo 2026 in Polen',
        seo_title: 'Termojet auf der Heating Tech Expo 2026: Heizraumtechnik',
        meta_description: 'Vom 8. bis 10. September zeigte Termojet auf der Heating Tech Expo in Polen Pumpengruppen, hydraulische Weichen, Verteiler, Ventile und Zonenregelung.',
        excerpt: 'Vom 8. bis 10. September waren wir auf der Heating Tech Expo — einer polnischen Messe ganz zum Thema Heizung — und haben Termojet-Heizraumtechnik zur Schnellmontage gezeigt.',
        content: `Vom 8. bis 10. September nahm Termojet an der Heating Tech Expo (Heating Technology Expo) teil — einer polnischen Messe, die ganz dem Thema Heizung gewidmet ist: Kessel, Heizkörper, Wärmepumpen und Regelungstechnik. Für uns war es eine weitere Gelegenheit, polnischen Installateuren, Planern und Händlern zu zeigen, wie schnell sich ein Heizraum aus vormontierten Termojet-Einheiten aufbauen lässt.

**«Wydajność Twojej kotłowni»**

Der Slogan des Stands — «Die Effizienz Ihres Heizraums» — und das Motto «Szybko · Niezawodnie · Skutecznie» (Schnell · Zuverlässig · Effizient) gaben den Ton der gesamten Ausstellung vor. Die Komponenten waren auf Demonstrationsgestellen so montiert, wie sie in einem echten Heizraum stehen, sodass jeder Besucher die Einheiten von allen Seiten betrachten konnte.

**Was wir gezeigt haben**

- gedämmte [Pumpengruppen](/catalog/nasosni-hrupy) — für ungemischte und gemischte Heizkörper- und Fußbodenheizkreise;
- [hydraulische Weichen](/catalog/hidravlichni-rozdilnyky) und [Verteiler](/catalog/rozpodilchi-kolektory), die die Verrohrung des Heizraums zu einer kompakten Einheit zusammenfassen;
- [Dreiwege- und Vierwege-Mischventile](/catalog/klapany) mit elektrischen Stellantrieben;
- einen montierten [Fußbodenheizungsverteiler](/catalog/kolektory-pidloha) samt Verteilerschrank sowie eine Vorführtafel zur [Einzelraumregelung](/catalog/zonalne-keruvannya) mit Raumthermostaten.

**Warum vormontierte Einheiten**

Je mehr Heizkreise und Wärmeerzeuger eine Anlage hat — Kessel, Wärmepumpe, Fußbodenheizung, Heizkörper —, desto stärker hängt die Effizienz des Gesamtsystems von der Hydraulik im Heizraum ab. Vormontierte Werkseinheiten verkürzen die Montage von Tagen auf Stunden und vermeiden typische Fehler improvisierter Montage vor Ort. Mehr zu diesem Ansatz lesen Sie im Artikel [«Heizraum schlüsselfertig an einem Tag»](${KOT}).

**Termojet in Polen**

Die Heating Tech Expo setzt unsere Reihe polnischer Messen fort: Zuvor haben wir unsere Produkte auf der [Instalacje in Posen](${POZ}), den [Targi Budowlane](${TB}) und der [Messe in Nowy Targ](${NT}) präsentiert. Polnische Partner finden Sortiment und Kontakte auf [termojet.pl](${PL}).

Vielen Dank an alle, die unseren Stand besucht haben — bis zu den nächsten Messen! Die ausgestellten Produkte finden Sie in unserem [Katalog](/catalog), und unsere Ingenieure helfen Ihnen, die passende Lösung für Ihr Projekt zu finden — [nehmen Sie Kontakt auf](/contacts).`,
      },
      ro: {
        category: 'Expoziții',
        title: 'Termojet la expoziția Heating Tech Expo 2026 din Polonia',
        seo_title: 'Termojet la Heating Tech Expo 2026: centrale termice',
        meta_description: 'Pe 8–10 septembrie, Termojet a prezentat la Heating Tech Expo din Polonia grupuri de pompare, butelii de egalizare, distribuitoare și robinete.',
        excerpt: 'Pe 8–10 septembrie am participat la Heating Tech Expo — o expoziție poloneză dedicată în întregime încălzirii — și am prezentat echipamentele Termojet de montaj rapid pentru centrale termice.',
        content: `În perioada 8–10 septembrie, Termojet a participat la Heating Tech Expo (Heating Technology Expo) — o expoziție poloneză dedicată în întregime încălzirii: centrale termice, calorifere, pompe de căldură și automatizări. A fost pentru noi încă o ocazie de a le arăta instalatorilor, proiectanților și distribuitorilor polonezi cât de repede se montează o centrală termică din module Termojet gata făcute.

**«Wydajność Twojej kotłowni»**

Sloganul standului — «Eficiența centralei dumneavoastră» — și deviza «Szybko · Niezawodnie · Skutecznie» (Rapid · Fiabil · Eficient) au dat tonul întregii expoziții. Echipamentele au fost montate pe suporturi demonstrative exact ca într-o centrală termică reală, astfel încât fiecare vizitator a putut examina modulele din toate părțile.

**Ce am prezentat**

- [grupuri de pompare](/catalog/nasosni-hrupy) izolate termic — pentru circuite directe și cu amestec, de calorifere și de încălzire în pardoseală;
- [butelii de egalizare hidraulică](/catalog/hidravlichni-rozdilnyky) și [distribuitoare](/catalog/rozpodilchi-kolektory), care reunesc instalația centralei într-un singur modul compact;
- [robinete de amestec cu trei și patru căi](/catalog/klapany) cu servomotoare electrice;
- un [distribuitor pentru încălzire în pardoseală](/catalog/kolektory-pidloha) asamblat, cu cutie de montaj, și un panou demonstrativ de [control zonal](/catalog/zonalne-keruvannya) cu termostate de cameră.

**De ce module gata făcute**

Cu cât o instalație are mai multe circuite și surse de căldură — centrală termică, pompă de căldură, încălzire în pardoseală, calorifere —, cu atât eficiența întregului sistem depinde mai mult de hidraulica centralei. Modulele din fabrică reduc montajul de la zile la ore și elimină greșelile tipice ale asamblării improvizate pe șantier. Mai multe despre această abordare găsiți în articolul [«Centrală termică la cheie într-o zi»](${KOT}).

**Termojet în Polonia**

Heating Tech Expo continuă seria noastră de expoziții în Polonia: anterior ne-am prezentat echipamentele la [Instalacje din Poznań](${POZ}), la [Targi Budowlane](${TB}) și la [expoziția din Nowy Targ](${NT}). Partenerii polonezi găsesc gama și datele de contact pe [termojet.pl](${PL}).

Mulțumim tuturor celor care ne-au vizitat standul — ne revedem la următoarele expoziții! Echipamentele expuse se află în [catalog](/catalog), iar inginerii noștri vă vor ajuta să alegeți soluția potrivită pentru proiectul dumneavoastră — [contactați-ne](/contacts).`,
      },
    },
  },
]
