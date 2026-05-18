// home.jsx — Homepage: hero with big stats, category tiles, popular products, configurator, news
const { useState: useState_h, useEffect: useEffect_h, useRef: useRef_h } = React;

// Animated counter
function CountUp({ end, suffix, duration = 1800 }) {
  const [val, setVal] = useState_h(0);
  const startRef = useRef_h(null);
  useEffect_h(() => {
    let raf;
    const tick = (t) => {
      if (!startRef.current) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(end * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end]);
  return <span>{val.toLocaleString("uk-UA")}{suffix && <span className="suffix">{suffix}</span>}</span>;
}

// Hero
function Hero({ onNav }) {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          <div>
            <div className="eyebrow" style={{marginBottom: 24}}>● Системи швидкого монтажу · Виробництво з 2002</div>
            <h1>
              Котельня,<br/>
              зібрана за <span className="accent">години</span>,<br/>
              <span className="outline">а не за тижні.</span>
            </h1>
            <p className="hero-sub">
              Колектори, гідрострілки та насосні групи з власного заводу в Києві.
              Готові системи для монтажу — від міні-котелень 30 кВт до промислових 2 МВт.
            </p>
            <div className="hero-ctas">
              <button className="cta-btn" onClick={() => onNav("catalog")}>
                Відкрити каталог <window.Icon.arrow />
              </button>
              <button className="cta-btn ghost">
                <window.Icon.cmd /> Підібрати систему
              </button>
            </div>
          </div>

          <div className="hero-side">
            <div className="hero-visual">
              <img src="https://termojet.com.ua/wp-content/uploads/2024/09/photo_2024-04-05_18-35-38-1.jpg" alt="Виробництво" />
              <div className="vis-tag">м. Київ · виробничий цех · 3 000 м²</div>
            </div>
          </div>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="ord">01</div>
            <div className="num"><CountUp end={20} suffix="років" /></div>
            <div className="label">На ринку котельного обладнання</div>
          </div>
          <div className="stat">
            <div className="ord">02</div>
            <div className="num"><CountUp end={15} suffix="країн" /></div>
            <div className="label">Експорт у Європу — філія в Польщі</div>
          </div>
          <div className="stat">
            <div className="ord">03</div>
            <div className="num"><CountUp end={50000} suffix="" /></div>
            <div className="label">Укомплектованих котелень за 22 роки</div>
          </div>
          <div className="stat">
            <div className="ord">04</div>
            <div className="num"><CountUp end={70000} suffix="" /></div>
            <div className="label">Виробів на рік на власному заводі</div>
          </div>
        </div>
      </div>

      <div className="marquee">
        <div className="marquee-track">
          <span>Швидко<span className="dot"></span></span>
          <span>Надійно<span className="dot"></span></span>
          <span>Ефективно<span className="dot"></span></span>
          <span>З теплоізоляцією<span className="dot"></span></span>
          <span>Власне виробництво<span className="dot"></span></span>
          <span>Швидко<span className="dot"></span></span>
          <span>Надійно<span className="dot"></span></span>
          <span>Ефективно<span className="dot"></span></span>
          <span>З теплоізоляцією<span className="dot"></span></span>
          <span>Власне виробництво<span className="dot"></span></span>
        </div>
      </div>
    </section>
  );
}

// Category tiles
function CategoryTiles({ onNav }) {
  const cats = window.TJ_DATA.categories;
  // Custom sizes layout — 12-col grid
  const layout = [
    { ...cats[0], size: "t-large", n: "01" },
    { ...cats[3], size: "t-medium", n: "02" },
    { ...cats[8], size: "t-medium", n: "03" },
    { ...cats[2], size: "t-small", n: "04" },
    { ...cats[7], size: "t-small", n: "05" },
    { ...cats[6], size: "t-small", n: "06" },
    { ...cats[11], size: "t-small", n: "07" },
    { ...cats[9], size: "t-medium", n: "08" },
    { ...cats[10], size: "t-wide", n: "09" }
  ];
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">Каталог · 13 категорій · 372 SKU</div>
            <h2>Все для котельні —<br/>в одному місці.</h2>
          </div>
          <div className="head-right">
            <button className="cta-btn ghost" onClick={() => onNav("catalog")}>
              Усі категорії <window.Icon.arrow />
            </button>
          </div>
        </div>
        <div className="cat-tiles">
          {layout.map(c => (
            <div key={c.id + c.n} className={`cat-tile ${c.size}`} onClick={() => onNav("catalog", c.id)}>
              <img className="bg" src={c.img} alt={c.name} loading="lazy" />
              <div className="veil"></div>
              <div className="count">{c.count} моделей</div>
              <div className="arrow-btn"><window.Icon.arrow /></div>
              <div className="cat-no">{c.n} · Категорія</div>
              <h3>{c.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Popular products
function PopularProducts({ onSave, saved, onQuickOrder, onNav }) {
  const top = window.TJ_DATA.products.slice(0, 8);
  return (
    <section className="section" style={{background: "var(--ink-0)", paddingTop: 64, paddingBottom: 96}}>
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">● HIT · оновлюється щотижня</div>
            <h2>Найпопулярніше<br/>цього сезону.</h2>
          </div>
          <div className="head-right">
            <button className="cta-btn ghost" onClick={() => onNav("catalog")}>
              Весь каталог <window.Icon.arrow />
            </button>
          </div>
        </div>
        <div className="product-grid">
          {top.map(p => (
            <window.ProductCard
              key={p.sku}
              product={p}
              saved={saved.has(p.sku)}
              onSave={() => onSave(p.sku)}
              onQuickOrder={() => onQuickOrder(p)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Configurator promo (dark section)
function ConfiguratorPromo() {
  return (
    <section className="section dark">
      <div className="container">
        <div className="config-block">
          <div className="config-visual">
            <ConfigDiagram />
          </div>
          <div className="config-text">
            <div className="eyebrow" style={{color: "var(--tj-red)"}}>● Termojet App · Безкоштовно</div>
            <h2>Конфігуратор котельної системи —<br/>в одному додатку.</h2>
            <p>
              Підберіть колектор, гідрострілку та насосні групи без помилок сумісності.
              Експорт схеми в PDF, відправка менеджеру в один клік.
            </p>
            <div className="config-steps">
              <div className="config-step">
                <div className="num">КРОК 01</div>
                <h4>Вибір потужності</h4>
                <p>Від 30 кВт до 2 МВт — система сама запропонує серію.</p>
              </div>
              <div className="config-step">
                <div className="num">КРОК 02</div>
                <h4>Контури системи</h4>
                <p>Радіатори, тепла підлога, бойлер ГВС, басейн.</p>
              </div>
              <div className="config-step">
                <div className="num">КРОК 03</div>
                <h4>Авто-підбір груп</h4>
                <p>100+ моделей колекторів і насосних груп зіставляються автоматично.</p>
              </div>
              <div className="config-step">
                <div className="num">КРОК 04</div>
                <h4>PDF та замовлення</h4>
                <p>Експорт схеми, перелік обладнання, відправка менеджеру.</p>
              </div>
            </div>
            <div className="flex gap-3" style={{marginTop: 28}}>
              <button className="cta-btn" style={{background: "white", color: "var(--ink-900)"}}>
                <window.Icon.arrowUR /> App Store
              </button>
              <button className="cta-btn" style={{background: "white", color: "var(--ink-900)"}}>
                <window.Icon.arrowUR /> Google Play
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Decorative diagram for configurator
function ConfigDiagram() {
  return (
    <svg viewBox="0 0 500 400" width="100%" height="100%" style={{display: "block"}}>
      <defs>
        <pattern id="dotgrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.07)"/>
        </pattern>
      </defs>
      <rect width="500" height="400" fill="url(#dotgrid)"/>

      {/* Pipes */}
      <g stroke="#E0301E" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M70 140 L70 70 L430 70 L430 140" />
        <path d="M70 200 L70 270 L430 270 L430 200" />
      </g>

      {/* Central manifold */}
      <rect x="180" y="120" width="140" height="100" rx="6" fill="#181715" stroke="#E0301E" strokeWidth="2"/>
      <text x="250" y="155" fill="#fff" fontFamily="JetBrains Mono, monospace" fontSize="11" textAnchor="middle" letterSpacing="0.1em">KOLEKTOR</text>
      <text x="250" y="172" fill="#FF5A3C" fontFamily="Archivo, sans-serif" fontWeight="800" fontSize="22" textAnchor="middle">KGS22</text>
      <text x="250" y="195" fill="#8A8579" fontFamily="JetBrains Mono, monospace" fontSize="10" textAnchor="middle">2+1 · до 105 кВт</text>

      {/* Pump groups */}
      {[80, 200, 320, 410].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy="70" r="14" fill="#E0301E" />
          <text x={x} y="74" fill="#fff" fontFamily="Archivo" fontWeight="800" fontSize="11" textAnchor="middle">НГ{i+1}</text>
          <line x1={x} y1="84" x2={x} y2="120" stroke="#E0301E" strokeWidth="2"/>
        </g>
      ))}

      {/* Boiler */}
      <rect x="40" y="320" width="80" height="50" rx="4" fill="#2A2824" stroke="#5B574F" strokeWidth="1"/>
      <text x="80" y="350" fill="#B8B3A6" fontFamily="JetBrains Mono, monospace" fontSize="10" textAnchor="middle">KOTEL · 120kW</text>

      {/* Tags */}
      <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8A8579">
        <text x="20" y="60">01 · РАДІАТОРИ</text>
        <text x="190" y="60">02 · ТЕПЛА ПІДЛОГА</text>
        <text x="310" y="60">03 · ГВС</text>
        <text x="395" y="60">04 · БАСЕЙН</text>
      </g>

      {/* Live indicator */}
      <g>
        <circle cx="450" cy="350" r="4" fill="#1F8A5B"/>
        <text x="460" y="354" fill="#1F8A5B" fontFamily="JetBrains Mono, monospace" fontSize="10">CONFIG · LIVE</text>
      </g>
    </svg>
  );
}

// About strip
function AboutStrip() {
  const photos = [
    "https://termojet.com.ua/wp-content/uploads/2024/04/photo_2024-04-05_18-34-32.jpg",
    "https://termojet.com.ua/wp-content/uploads/2024/04/photo_2024-04-05_18-34-36.jpg",
    "https://termojet.com.ua/wp-content/uploads/2024/04/photo_2024-04-05_18-34-26.jpg",
    "https://termojet.com.ua/wp-content/uploads/2024/04/photo_2024-04-05_18-34-22.jpg",
    "https://termojet.com.ua/wp-content/uploads/2024/04/photo_2024-04-05_18-34-19.jpg"
  ];
  return (
    <section className="section" style={{paddingTop: 80, paddingBottom: 80, background: "var(--ink-50)"}}>
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">● Виробництво · Київ, Софіївська Борщагівка</div>
            <h2>Від листа сталі —<br/>до готової котельної.</h2>
          </div>
          <div className="head-right" style={{maxWidth: 420, textAlign: "right"}}>
            <p style={{color: "var(--ink-500)", fontSize: 15, margin: 0}}>
              Лазерні верстати, листогини, напівавтоматичне зварювання та власна лінія
              порошкового фарбування. 100+ співробітників, 5 500 м² площ.
            </p>
          </div>
        </div>
        <div style={{display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 12, height: 360}}>
          {photos.map((src, i) => (
            <div key={i} style={{
              borderRadius: 12,
              overflow: "hidden",
              background: "var(--ink-200)",
              position: "relative"
            }}>
              <img src={src} alt="" loading="lazy" style={{width: "100%", height: "100%", objectFit: "cover"}}/>
              {i === 0 && (
                <div style={{
                  position: "absolute", bottom: 16, left: 16,
                  background: "rgba(255,255,255,0.95)",
                  padding: "10px 14px", borderRadius: 8,
                  fontFamily: "var(--font-mono)", fontSize: 11
                }}>● Цех лазерного різання</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// News
function News() {
  return (
    <section className="section" style={{paddingTop: 80, paddingBottom: 100, background: "var(--ink-0)"}}>
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">● Журнал</div>
            <h2>Новини та виставки.</h2>
          </div>
          <div className="head-right">
            <button className="cta-btn ghost">Весь блог <window.Icon.arrow /></button>
          </div>
        </div>
        <div className="news-grid">
          {window.TJ_DATA.news.map(n => (
            <div key={n.title} className="news-card">
              <div className="thumb"><img src={n.img} alt={n.title} loading="lazy" /></div>
              <div className="meta">
                <div className="date">{n.date} · Подія</div>
                <h3>{n.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Big CTA footer-strip
function BigCTA({ onNav }) {
  return (
    <section className="section dark" style={{paddingTop: 80, paddingBottom: 80}}>
      <div className="container">
        <div style={{display: "grid", gridTemplateColumns: "1.4fr 0.6fr", gap: 48, alignItems: "end"}}>
          <h2 style={{fontSize: "clamp(56px, 7vw, 120px)", letterSpacing: "-0.04em", lineHeight: 0.9, margin: 0}}>
            Готові<br/>
            <span style={{WebkitTextStroke: "2px white", color: "transparent"}}>проєктувати</span><br/>
            котельню?
          </h2>
          <div>
            <p style={{color: "var(--ink-300)", fontSize: 17, lineHeight: 1.5}}>
              Завантажте додаток або відкрийте каталог. Наші менеджери допоможуть з підбором обладнання за 1 робочий день.
            </p>
            <div className="flex gap-3" style={{marginTop: 24, flexWrap: "wrap"}}>
              <button className="cta-btn">Відкрити каталог <window.Icon.arrow /></button>
              <button className="cta-btn" style={{background: "white", color: "var(--ink-900)"}}>Замовити дзвінок</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomePage({ onNav, saved, onSave, onQuickOrder }) {
  return (
    <div className="page-enter">
      <Hero onNav={onNav} />
      <CategoryTiles onNav={onNav} />
      <PopularProducts saved={saved} onSave={onSave} onQuickOrder={onQuickOrder} onNav={onNav} />
      <ConfiguratorPromo />
      <AboutStrip />
      <News />
      <BigCTA onNav={onNav} />
    </div>
  );
}

window.HomePage = HomePage;
