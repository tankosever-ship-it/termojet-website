// Виставка WaterClima («Ліга майстрів», Київ, 25.09.2026) — дані для apply-blog-posts.js.
// Першоджерело — стаття на tjheatpump.com.ua/blog/vystavka-waterclima-liha-maistriv-2026/.
// Текст навмисно переписано під профіль termojet.com.ua (спершу обладнання для котелень,
// теплові насоси — посиланнями на tjheatpump), щоб два наші сайти не мали дубля тексту.

const HP = 'https://tjheatpump.com.ua'
const SUNGLOW = `${HP}/teplovi-nasosy/termojet-sunglow-9-kw/`
const DOLPHIN = `${HP}/baseiny/termojet-dolphin-11-kw/`
const IMG_STEND = '/images/blog/exh-waterclima-2026-stend.jpg =1280x960'
const IMG_KONS = '/images/blog/exh-waterclima-2026-konsultatsiya.jpg =1056x700'
const IMG_KOM = '/images/blog/exh-waterclima-2026-komanda.jpg =1058x698'
const W = '/blog/drotove-zonalne-keruvannya-opalennyam'
const R = '/blog/bezdrotove-zonalne-keruvannya-opalennyam'
const KOT = '/blog/kotelnya-pid-klyuch-modulna-obvyazka'
const SEM = '/blog/seminar-teplovi-nasosy-2026'

module.exports = [
  {
    slug: 'vystavka-waterclima-liha-maistriv-2026',
    image: '/images/blog/exh-waterclima-2026-obladnannya.jpg',
    published_at: '2026-09-25T09:00:00Z',
    category: 'Виставки',
    title: 'Termojet на виставці WaterClima в рамках «Ліги майстрів» у Києві',
    seo_title: 'Termojet на WaterClima 2026: обладнання для котелень',
    meta_description: 'Termojet на виставці WaterClima в рамках «Ліги майстрів» у Києві: насосні групи, гідрострілки, колектори, клапани, зональне керування й теплові насоси.',
    excerpt: '25 вересня ми представили на WaterClima в Києві системи швидкого монтажу котелень, насоси, регулюючу арматуру, теплові насоси та бойлери Termojet.',
    content: `25 вересня Termojet узяв участь у виставці WaterClima, що відбулася в Києві в рамках «Ліги майстрів» — події для монтажників, проєктувальників і всіх, хто працює з опаленням, водопостачанням і кліматичною технікою. Ми привезли майже весь асортимент: від обладнання, яке збирає котельню в один компактний вузол, до теплових насосів.

![Стенд Termojet на виставці WaterClima: теплові насоси, бойлери та обладнання для котелень](${IMG_STEND})

**Системи швидкого монтажу котелень**

Окремий стенд зібрав обладнання Termojet для котелень під гаслом «Швидко. Надійно. Ефективно». Готові заводські вузли стикуються без зварювання, тож котельня збирається за години, а не за дні:

- [насосні групи](/catalog/nasosni-hrupy) у теплоізоляції — готові вузли для контурів радіаторів і теплої підлоги;
- [гідравлічні розділювачі](/catalog/hidravlichni-rozdilnyky) та [розподільчі колектори](/catalog/rozpodilchi-kolektory), що збирають обв'язку котельні в один вузол;
- [колектори для теплої підлоги](/catalog/kolektory-pidloha) разом із термостатами та [зональним керуванням](/catalog/zonalne-keruvannya).

Чому модульна обв'язка вигідніша за класичну «з труб і фітингів», розповідаємо в статті [«Котельня "під ключ" за день»](${KOT}). А як працює зональне керування, яке ми показували поруч із колекторами, — у статтях про [дротову](${W}) та [бездротову](${R}) системи.

**Насоси та регулююча арматура**

Експозицію доповнювали [циркуляційні насоси](/catalog/nasosy), [триходові та чотирьохходові змішувальні клапани](/catalog/klapany) з електроприводами і [сепаратори повітря та шламу](/catalog/separatory) — усе, що потрібно, щоб тепло від джерела дійшло до кожного контуру.

**Теплові насоси та бойлери**

Центр стенду займали [теплові насоси Termojet](${HP}/) для опалення, охолодження й гарячого водопостачання. Відвідувачі роздивлялися зовнішні блоки, порівнювали моделі різної потужності, питали про рівень шуму та роботу взимку. Серед представленого — моноблок [Termojet Sunglow](${SUNGLOW}) на природному холодоагенті R290 і [тепловий насос для басейну Termojet Dolphin](${DOLPHIN}). Поруч стояли бойлери ГВП, буферні ємності та комбіновані баки з нержавіючої сталі: буферна ємність згладжує роботу теплового насоса й зменшує кількість пусків компресора, а бойлер забезпечує гарячою водою весь будинок.

**Живе спілкування з фахівцями**

Найцінніше на виставці — розмови. Наша команда консультувала монтажників і проєктувальників щодо підбору обладнання, обв'язки котельні й теплового насоса та реальних об'єктів.

![Консультація на стенді Termojet: бойлер з нержавіючої сталі та насосна група](${IMG_KONS})

Дякуємо організаторам WaterClima та «Ліги майстрів» за подію і всім, хто завітав на наш стенд!

![Команда Termojet на стенді виставки WaterClima](${IMG_KOM})

**Не встигли на виставку?**

Усе обладнання для котелень є в [каталозі](/catalog), а поставити запитання інженеру можна через [контакти](/contacts). Ми регулярно проводимо [семінари для монтажників і проєктувальників](/navchannya) — як минув останній, читайте у [звіті про семінар з теплових насосів](${SEM}).`,
    i18n: {
      en: {
        category: 'Exhibitions',
        title: 'Termojet at the WaterClima Exhibition at Liga Maistriv in Kyiv',
        seo_title: 'Termojet at WaterClima 2026: Boiler Room Equipment',
        meta_description: 'Termojet at WaterClima, part of Liga Maistriv in Kyiv: pump groups, hydraulic separators, manifolds, valves, zone control and heat pumps.',
        excerpt: 'On 25 September we presented Termojet quick-installation boiler room systems, pumps, control valves, heat pumps and DHW cylinders at WaterClima in Kyiv.',
        content: `On 25 September, Termojet took part in the WaterClima exhibition held in Kyiv as part of Liga Maistriv («League of Masters») — an event for installers, designers and everyone working with heating, water supply and climate equipment. We brought almost our entire range: from equipment that assembles a boiler room into a single compact unit to heat pumps.

![Termojet stand at the WaterClima exhibition: heat pumps, DHW cylinders and boiler room equipment](${IMG_STEND})

**Quick-installation boiler room systems**

A separate stand brought together Termojet boiler room equipment under the slogan «Fast. Reliable. Efficient». Factory-made units connect without welding, so a boiler room is assembled in hours rather than days:

- insulated [pump groups](/catalog/nasosni-hrupy) — ready-made units for radiator and underfloor heating circuits;
- [hydraulic separators](/catalog/hidravlichni-rozdilnyky) and [distribution manifolds](/catalog/rozpodilchi-kolektory) that bring the boiler room pipework together into one unit;
- [underfloor heating manifolds](/catalog/kolektory-pidloha) together with thermostats and [zone control](/catalog/zonalne-keruvannya).

Why modular pipework beats the classic «pipes and fittings» approach is explained in our article [«A turnkey boiler room in a day»](${KOT}). And how the zone control we showed next to the manifolds works is covered in our articles on [wired](${W}) and [wireless](${R}) systems.

**Pumps and control valves**

The display was completed by [circulation pumps](/catalog/nasosy), [three-way and four-way mixing valves](/catalog/klapany) with electric actuators, and [air and dirt separators](/catalog/separatory) — everything needed to get heat from the source to every circuit.

**Heat pumps and DHW cylinders**

The centre of the stand was taken by [Termojet heat pumps](${HP}/) for heating, cooling and domestic hot water. Visitors examined the outdoor units, compared models of different capacities and asked about noise levels and winter operation. Among the units on show were the [Termojet Sunglow](${SUNGLOW}) monoblock on natural R290 refrigerant and the [Termojet Dolphin pool heat pump](${DOLPHIN}). Next to them stood DHW cylinders, buffer tanks and combined stainless steel tanks: a buffer tank smooths heat pump operation and reduces compressor starts, while a DHW cylinder supplies hot water to the whole house.

**Face-to-face with specialists**

The most valuable part of any exhibition is the conversations. Our team advised installers and designers on equipment selection, boiler room and heat pump pipework, and real projects.

![Consultation at the Termojet stand: stainless steel DHW cylinder and pump group](${IMG_KONS})

Thank you to the organisers of WaterClima and Liga Maistriv for the event, and to everyone who visited our stand!

![The Termojet team at the WaterClima exhibition stand](${IMG_KOM})

**Missed the exhibition?**

All boiler room equipment is in our [catalogue](/catalog), and you can ask an engineer a question via our [contacts](/contacts). We regularly run [seminars for installers and designers](/navchannya) — read how the latest one went in our [heat pump seminar report](${SEM}).`,
      },
      pl: {
        category: 'Targi',
        title: 'Termojet na targach WaterClima w ramach «Ligi Mistrzów» w Kijowie',
        seo_title: 'Termojet na WaterClima 2026: urządzenia do kotłowni',
        meta_description: 'Termojet na targach WaterClima w ramach «Ligi Mistrzów» w Kijowie: grupy pompowe, sprzęgła hydrauliczne, rozdzielacze, zawory, sterowanie strefowe.',
        excerpt: '25 września na targach WaterClima w Kijowie pokazaliśmy systemy szybkiego montażu kotłowni, pompy, armaturę regulacyjną, pompy ciepła i zasobniki Termojet.',
        content: `25 września Termojet wziął udział w targach WaterClima, które odbyły się w Kijowie w ramach «Ligi Mistrzów» — wydarzenia dla instalatorów, projektantów i wszystkich, którzy zajmują się ogrzewaniem, wodociągami i techniką klimatyzacyjną. Przywieźliśmy niemal cały asortyment: od urządzeń, które łączą kotłownię w jeden kompaktowy węzeł, po pompy ciepła.

![Stoisko Termojet na targach WaterClima: pompy ciepła, zasobniki i urządzenia do kotłowni](${IMG_STEND})

**Systemy szybkiego montażu kotłowni**

Osobne stoisko zgromadziło urządzenia Termojet do kotłowni pod hasłem «Szybko. Niezawodnie. Skutecznie». Gotowe fabryczne węzły łączy się bez spawania, dzięki czemu kotłownię montuje się w kilka godzin, a nie dni:

- [grupy pompowe](/catalog/nasosni-hrupy) w izolacji termicznej — gotowe węzły do obiegów grzejnikowych i ogrzewania podłogowego;
- [sprzęgła hydrauliczne](/catalog/hidravlichni-rozdilnyky) i [rozdzielacze](/catalog/rozpodilchi-kolektory), które łączą orurowanie kotłowni w jeden węzeł;
- [rozdzielacze do ogrzewania podłogowego](/catalog/kolektory-pidloha) wraz z termostatami i [sterowaniem strefowym](/catalog/zonalne-keruvannya).

Dlaczego modułowe orurowanie jest korzystniejsze od klasycznego «z rur i kształtek», wyjaśniamy w artykule [«Kotłownia "pod klucz" w jeden dzień»](${KOT}). A jak działa sterowanie strefowe, które pokazywaliśmy obok rozdzielaczy, opisujemy w artykułach o systemie [przewodowym](${W}) i [bezprzewodowym](${R}).

**Pompy i armatura regulacyjna**

Ekspozycję uzupełniały [pompy obiegowe](/catalog/nasosy), [trójdrogowe i czterodrogowe zawory mieszające](/catalog/klapany) z siłownikami elektrycznymi oraz [separatory powietrza i zanieczyszczeń](/catalog/separatory) — wszystko, czego potrzeba, by ciepło ze źródła dotarło do każdego obiegu.

**Pompy ciepła i zasobniki**

Centrum stoiska zajmowały [pompy ciepła Termojet](${HP}/) do ogrzewania, chłodzenia i ciepłej wody użytkowej. Odwiedzający oglądali jednostki zewnętrzne, porównywali modele o różnej mocy, pytali o poziom hałasu i pracę zimą. Wśród prezentowanych urządzeń był monoblok [Termojet Sunglow](${SUNGLOW}) na naturalnym czynniku R290 i [pompa ciepła do basenu Termojet Dolphin](${DOLPHIN}). Obok stały zasobniki CWU, zbiorniki buforowe i kombinowane zbiorniki ze stali nierdzewnej: bufor wygładza pracę pompy ciepła i zmniejsza liczbę startów sprężarki, a zasobnik zapewnia ciepłą wodę dla całego domu.

**Rozmowy ze specjalistami**

Najcenniejsze na targach są rozmowy. Nasz zespół doradzał instalatorom i projektantom w doborze urządzeń, orurowaniu kotłowni i pompy ciepła oraz w realnych projektach.

![Konsultacja na stoisku Termojet: zasobnik ze stali nierdzewnej i grupa pompowa](${IMG_KONS})

Dziękujemy organizatorom WaterClima i «Ligi Mistrzów» za wydarzenie oraz wszystkim, którzy odwiedzili nasze stoisko!

![Zespół Termojet na stoisku targów WaterClima](${IMG_KOM})

**Nie zdążyli Państwo na targi?**

Wszystkie urządzenia do kotłowni znajdą Państwo w [katalogu](/catalog), a pytanie inżynierowi można zadać przez [kontakty](/contacts). Regularnie prowadzimy [seminaria dla instalatorów i projektantów](/navchannya) — o ostatnim przeczytają Państwo w [relacji z seminarium o pompach ciepła](${SEM}).`,
      },
      fr: {
        category: 'Salons',
        title: 'Termojet au salon WaterClima dans le cadre de la «Ligue des maîtres» à Kyiv',
        seo_title: 'Termojet à WaterClima 2026 : équipements de chaufferie',
        meta_description: 'Termojet au salon WaterClima, «Ligue des maîtres», Kyiv : groupes de pompage, bouteilles de découplage, collecteurs, vannes, régulation par zones.',
        excerpt: 'Le 25 septembre, nous avons présenté à WaterClima, à Kyiv, les systèmes de chaufferie à montage rapide, les pompes, la robinetterie de régulation, les pompes à chaleur et les ballons Termojet.',
        content: `Le 25 septembre, Termojet a participé au salon WaterClima, organisé à Kyiv dans le cadre de la «Ligue des maîtres» — un événement pour les installateurs, les bureaux d'études et tous ceux qui travaillent dans le chauffage, l'eau et la climatisation. Nous avons apporté presque toute notre gamme : des équipements qui réunissent une chaufferie en un seul module compact jusqu'aux pompes à chaleur.

![Stand Termojet au salon WaterClima : pompes à chaleur, ballons et équipements de chaufferie](${IMG_STEND})

**Systèmes de chaufferie à montage rapide**

Un stand dédié réunissait les équipements de chaufferie Termojet sous le slogan «Rapide. Fiable. Efficace». Les modules préfabriqués en usine s'assemblent sans soudure : une chaufferie se monte en quelques heures, et non en plusieurs jours :

- [groupes de pompage](/catalog/nasosni-hrupy) isolés — modules prêts à l'emploi pour les circuits de radiateurs et de plancher chauffant ;
- [bouteilles de découplage](/catalog/hidravlichni-rozdilnyky) et [collecteurs de distribution](/catalog/rozpodilchi-kolektory), qui regroupent la tuyauterie de la chaufferie en un seul module ;
- [collecteurs de plancher chauffant](/catalog/kolektory-pidloha) avec thermostats et [régulation par zones](/catalog/zonalne-keruvannya).

Pourquoi la tuyauterie modulaire est plus avantageuse que la méthode classique «tubes et raccords» : nous l'expliquons dans l'article [«Une chaufferie clé en main en une journée»](${KOT}). Et le fonctionnement de la régulation par zones, présentée à côté des collecteurs, est détaillé dans nos articles sur les systèmes [filaire](${W}) et [sans fil](${R}).

**Pompes et robinetterie de régulation**

L'exposition était complétée par des [circulateurs](/catalog/nasosy), des [vannes mélangeuses trois voies et quatre voies](/catalog/klapany) avec servomoteurs électriques et des [séparateurs d'air et de boues](/catalog/separatory) — tout ce qu'il faut pour que la chaleur arrive de la source jusqu'à chaque circuit.

**Pompes à chaleur et ballons**

Le centre du stand était occupé par les [pompes à chaleur Termojet](${HP}/) pour le chauffage, le rafraîchissement et l'eau chaude sanitaire. Les visiteurs ont examiné les unités extérieures, comparé des modèles de différentes puissances et posé des questions sur le niveau sonore et le fonctionnement en hiver. Parmi les modèles présentés : le monobloc [Termojet Sunglow](${SUNGLOW}) au réfrigérant naturel R290 et la [pompe à chaleur pour piscine Termojet Dolphin](${DOLPHIN}). À côté se trouvaient des ballons ECS, des ballons tampons et des ballons combinés en acier inoxydable : le ballon tampon lisse le fonctionnement de la pompe à chaleur et réduit le nombre de démarrages du compresseur, tandis que le ballon ECS fournit de l'eau chaude à toute la maison.

**Échanges avec les spécialistes**

Le plus précieux sur un salon, ce sont les échanges. Notre équipe a conseillé installateurs et bureaux d'études sur le choix des équipements, le raccordement de la chaufferie et de la pompe à chaleur, ainsi que sur des projets concrets.

![Conseil sur le stand Termojet : ballon en acier inoxydable et groupe de pompage](${IMG_KONS})

Merci aux organisateurs de WaterClima et de la «Ligue des maîtres» pour cet événement, et à tous ceux qui sont venus sur notre stand !

![L'équipe Termojet sur le stand du salon WaterClima](${IMG_KOM})

**Vous avez manqué le salon ?**

Tous les équipements de chaufferie sont dans notre [catalogue](/catalog), et vous pouvez poser vos questions à un ingénieur via nos [contacts](/contacts). Nous organisons régulièrement des [séminaires pour installateurs et bureaux d'études](/navchannya) — découvrez le dernier dans notre [compte rendu du séminaire sur les pompes à chaleur](${SEM}).`,
      },
      de: {
        category: 'Messen',
        title: 'Termojet auf der WaterClima im Rahmen der «Liga der Meister» in Kyjiw',
        seo_title: 'Termojet auf der WaterClima 2026: Heizraumtechnik',
        meta_description: 'Termojet auf der WaterClima («Liga der Meister», Kyjiw): Pumpengruppen, hydraulische Weichen, Verteiler, Ventile, Einzelraumregelung und Wärmepumpen.',
        excerpt: 'Am 25. September haben wir auf der WaterClima in Kyjiw Termojet-Schnellmontagesysteme für Heizräume, Pumpen, Regelarmaturen, Wärmepumpen und Speicher gezeigt.',
        content: `Am 25. September nahm Termojet an der Messe WaterClima teil, die in Kyjiw im Rahmen der «Liga der Meister» stattfand — einer Veranstaltung für Installateure, Planer und alle, die mit Heizung, Wasserversorgung und Klimatechnik arbeiten. Wir hatten fast unser gesamtes Sortiment dabei: von Komponenten, die einen Heizraum zu einer kompakten Einheit zusammenfassen, bis hin zu Wärmepumpen.

![Termojet-Stand auf der Messe WaterClima: Wärmepumpen, Speicher und Heizraumtechnik](${IMG_STEND})

**Schnellmontagesysteme für Heizräume**

Ein eigener Stand zeigte die Termojet-Heizraumtechnik unter dem Motto «Schnell. Zuverlässig. Effizient». Die vormontierten Werkseinheiten werden ohne Schweißen verbunden, sodass ein Heizraum in Stunden statt in Tagen steht:

- gedämmte [Pumpengruppen](/catalog/nasosni-hrupy) — fertige Einheiten für Heizkörper- und Fußbodenheizkreise;
- [hydraulische Weichen](/catalog/hidravlichni-rozdilnyky) und [Verteiler](/catalog/rozpodilchi-kolektory), die die Verrohrung des Heizraums zu einer Einheit zusammenfassen;
- [Fußbodenheizungsverteiler](/catalog/kolektory-pidloha) samt Thermostaten und [Einzelraumregelung](/catalog/zonalne-keruvannya).

Warum eine modulare Verrohrung günstiger ist als die klassische Lösung «aus Rohren und Fittings», erklären wir im Artikel [«Heizraum schlüsselfertig an einem Tag»](${KOT}). Wie die Einzelraumregelung funktioniert, die wir neben den Verteilern gezeigt haben, lesen Sie in unseren Artikeln über das [kabelgebundene](${W}) und das [funkbasierte](${R}) System.

**Pumpen und Regelarmaturen**

Ergänzt wurde die Ausstellung durch [Umwälzpumpen](/catalog/nasosy), [Dreiwege- und Vierwege-Mischventile](/catalog/klapany) mit elektrischen Stellantrieben sowie [Luft- und Schlammabscheider](/catalog/separatory) — alles, was nötig ist, damit die Wärme von der Quelle in jeden Heizkreis gelangt.

**Wärmepumpen und Speicher**

Im Mittelpunkt des Stands standen [Termojet-Wärmepumpen](${HP}/) für Heizung, Kühlung und Warmwasser. Die Besucher sahen sich die Außeneinheiten an, verglichen Modelle verschiedener Leistung und fragten nach Geräuschpegel und Winterbetrieb. Zu sehen waren unter anderem die Monoblock-Wärmepumpe [Termojet Sunglow](${SUNGLOW}) mit dem natürlichen Kältemittel R290 und die [Schwimmbad-Wärmepumpe Termojet Dolphin](${DOLPHIN}). Daneben standen Warmwasserspeicher, Pufferspeicher und Kombispeicher aus Edelstahl: Der Pufferspeicher glättet den Betrieb der Wärmepumpe und reduziert die Verdichterstarts, der Warmwasserspeicher versorgt das ganze Haus mit warmem Wasser.

**Im Gespräch mit Fachleuten**

Das Wertvollste auf einer Messe sind die Gespräche. Unser Team beriet Installateure und Planer zur Geräteauswahl, zur Einbindung von Heizraum und Wärmepumpe sowie zu konkreten Projekten.

![Beratung am Termojet-Stand: Edelstahl-Warmwasserspeicher und Pumpengruppe](${IMG_KONS})

Vielen Dank an die Veranstalter der WaterClima und der «Liga der Meister» und an alle, die unseren Stand besucht haben!

![Das Termojet-Team am Stand der Messe WaterClima](${IMG_KOM})

**Messe verpasst?**

Die gesamte Heizraumtechnik finden Sie in unserem [Katalog](/catalog), Fragen an einen Ingenieur stellen Sie über unsere [Kontakte](/contacts). Wir veranstalten regelmäßig [Seminare für Installateure und Planer](/navchannya) — wie das letzte verlief, lesen Sie im [Bericht vom Wärmepumpen-Seminar](${SEM}).`,
      },
      ro: {
        category: 'Expoziții',
        title: 'Termojet la expoziția WaterClima în cadrul «Ligii Meșterilor» de la Kiev',
        seo_title: 'Termojet la WaterClima 2026: echipamente pentru centrale',
        meta_description: 'Termojet la expoziția WaterClima, «Liga Meșterilor», Kiev: grupuri de pompare, butelii de egalizare, distribuitoare, robinete și control zonal.',
        excerpt: 'Pe 25 septembrie am prezentat la WaterClima, la Kiev, sistemele Termojet de montaj rapid pentru centrale termice, pompe, armături de reglare, pompe de căldură și boilere.',
        content: `Pe 25 septembrie, Termojet a participat la expoziția WaterClima, desfășurată la Kiev în cadrul «Ligii Meșterilor» — un eveniment pentru instalatori, proiectanți și toți cei care lucrează cu încălzire, alimentare cu apă și echipamente de climatizare. Am adus aproape întreaga gamă: de la echipamentele care reunesc o centrală termică într-un singur modul compact până la pompele de căldură.

![Standul Termojet la expoziția WaterClima: pompe de căldură, boilere și echipamente pentru centrale termice](${IMG_STEND})

**Sisteme de montaj rapid pentru centrale termice**

Un stand separat a reunit echipamentele Termojet pentru centrale termice sub sloganul «Rapid. Fiabil. Eficient». Modulele gata făcute din fabrică se îmbină fără sudură, astfel că o centrală termică se montează în câteva ore, nu în zile:

- [grupuri de pompare](/catalog/nasosni-hrupy) izolate termic — module gata pentru circuitele de calorifere și de încălzire în pardoseală;
- [butelii de egalizare hidraulică](/catalog/hidravlichni-rozdilnyky) și [distribuitoare](/catalog/rozpodilchi-kolektory), care reunesc instalația centralei într-un singur modul;
- [distribuitoare pentru încălzire în pardoseală](/catalog/kolektory-pidloha) împreună cu termostate și [control zonal](/catalog/zonalne-keruvannya).

De ce instalația modulară este mai avantajoasă decât cea clasică «din țevi și fitinguri» explicăm în articolul [«Centrală termică la cheie într-o zi»](${KOT}). Iar cum funcționează controlul zonal pe care l-am prezentat lângă distribuitoare aflați din articolele despre sistemul [cu fir](${W}) și cel [wireless](${R}).

**Pompe și armături de reglare**

Expoziția a fost completată de [pompe de circulație](/catalog/nasosy), [robinete de amestec cu trei și patru căi](/catalog/klapany) cu servomotoare electrice și [separatoare de aer și nămol](/catalog/separatory) — tot ce este necesar pentru ca agentul termic să ajungă de la sursă în fiecare circuit.

**Pompe de căldură și boilere**

Centrul standului a fost ocupat de [pompele de căldură Termojet](${HP}/) pentru încălzire, răcire și apă caldă menajeră. Vizitatorii au examinat unitățile exterioare, au comparat modele de diferite puteri și au întrebat despre nivelul de zgomot și funcționarea iarna. Printre modelele expuse: monoblocul [Termojet Sunglow](${SUNGLOW}) cu agent frigorific natural R290 și [pompa de căldură pentru piscină Termojet Dolphin](${DOLPHIN}). Alături erau boilere ACM, rezervoare tampon și rezervoare combinate din oțel inoxidabil: rezervorul tampon uniformizează funcționarea pompei de căldură și reduce numărul de porniri ale compresorului, iar boilerul asigură apă caldă pentru toată casa.

**Discuții cu specialiștii**

Cel mai valoros la o expoziție sunt discuțiile. Echipa noastră i-a consiliat pe instalatori și proiectanți privind alegerea echipamentelor, racordarea centralei termice și a pompei de căldură, precum și proiecte reale.

![Consultanță la standul Termojet: boiler din oțel inoxidabil și grup de pompare](${IMG_KONS})

Mulțumim organizatorilor WaterClima și ai «Ligii Meșterilor» pentru eveniment și tuturor celor care ne-au vizitat standul!

![Echipa Termojet la standul expoziției WaterClima](${IMG_KOM})

**Nu ați ajuns la expoziție?**

Toate echipamentele pentru centrale termice se află în [catalog](/catalog), iar o întrebare pentru un inginer puteți adresa prin pagina de [contacte](/contacts). Organizăm regulat [seminare pentru instalatori și proiectanți](/navchannya) — despre ultimul citiți în [relatarea de la seminarul despre pompe de căldură](${SEM}).`,
      },
    },
  },
]
