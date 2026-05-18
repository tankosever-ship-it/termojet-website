// header.jsx — Top bar, sticky header, mega-menu, smart search overlay
const { useState, useEffect, useRef } = React;

// === Icons ===
const Icon = {
  search: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  bookmark: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>,
  user: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  cart: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>,
  chev: (p) => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...p}><path d="m6 9 6 6 6-6"/></svg>,
  arrow: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
  arrowUR: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M7 17 17 7M7 7h10v10"/></svg>,
  close: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>,
  heart: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  phone: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  grid: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  list: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  filter: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  plus: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  cmd: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>
};

// === Top bar ===
function TopBar() {
  return (
    <div className="topbar">
      <div className="container topbar-inner">
        <div className="topbar-left">
          <span>● 20 років на ринку</span>
          <span>● Експорт у 15 країн</span>
          <span>● Власне виробництво в Києві</span>
        </div>
        <div className="topbar-right">
          <a href="#"><Icon.phone /> +380 (50) 718 91 65</a>
          <a href="mailto:termojet@sofievka.kiev.ua">termojet@sofievka.kiev.ua</a>
          <div className="lang-pick">
            <button className="active">UA</button>
            <button>PL</button>
            <button>EN</button>
            <button>DE</button>
            <button>FR</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// === Mega menu content ===
function MegaMenu({ onPick, onClose }) {
  const cats = window.TJ_DATA.categories;
  const [active, setActive] = useState(cats[0].id);
  const featured = window.TJ_DATA.products.filter(p => p.category === active || (active === "kolektory-gs" && p.sku.startsWith("K"))).slice(0, 6);
  const fallback = window.TJ_DATA.products.slice(0, 6);
  const shown = featured.length ? featured.slice(0, 6) : fallback;

  return (
    <div className="mega" onMouseLeave={onClose}>
      <div className="container">
        <div className="mega-grid">
          <div>
            <div className="mega-col-title">Категорії · 13</div>
            <div className="mega-cat-list">
              {cats.map(c => (
                <div
                  key={c.id}
                  className={`mega-cat ${active === c.id ? "active" : ""}`}
                  onMouseEnter={() => setActive(c.id)}
                  onClick={() => { onPick(c.id); onClose(); }}
                >
                  <span>{c.name}</span>
                  <span className="count">{c.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mega-col-title">Популярне · {cats.find(c => c.id === active)?.short}</div>
            <div className="mega-products">
              {shown.map(p => (
                <div key={p.sku} className="mega-product" onClick={() => { onPick(active); onClose(); }}>
                  <div className="thumb"><img src={p.img} alt={p.name} loading="lazy" /></div>
                  <div className="meta">
                    <div className="name">{p.name}</div>
                    <div className="sku">{p.sku}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mega-col-title">Інструменти</div>
            <div className="mega-promo">
              <div className="accent"></div>
              <div>
                <div className="eyebrow" style={{color: "rgba(255,255,255,0.6)"}}>Termojet App</div>
                <h4>Конфігуратор<br/>котельної системи</h4>
                <p>Підберіть колектор + насосні групи без помилок. Експорт PDF.</p>
              </div>
              <button className="cta-btn" style={{background: "white", color: "#0C0B0A", alignSelf: "flex-start"}}>
                Запустити <Icon.arrow />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// === Smart search overlay ===
function SearchOverlay({ onClose, onPick }) {
  const [q, setQ] = useState("");
  const inputRef = useRef();
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const all = window.TJ_DATA.products;
  const results = q.trim()
    ? all.filter(p => (p.name + " " + p.sku).toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : [];
  const recent = ["APE 25/60", "Гідрострілка ГС-25", "BOX3", "Автоматика PROFI"];

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrap">
          <Icon.search />
          <input
            ref={inputRef}
            placeholder="Знайти за артикулом, моделлю, серією або параметром…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <span className="search-kbd">ESC</span>
        </div>

        <div className="search-results">
          {q.trim() === "" && (
            <>
              <div className="search-section">Популярні запити</div>
              <div className="search-suggestions">
                {window.TJ_DATA.searchTrending.map(s => (
                  <span key={s} className="search-chip" onClick={() => setQ(s)}>{s}</span>
                ))}
              </div>
              <div className="search-section">Нещодавнє</div>
              {recent.map(r => (
                <div key={r} className="search-row" onClick={() => setQ(r)}>
                  <div className="thumb" style={{background: "var(--ink-100)", display: "flex", alignItems: "center", justifyContent: "center"}}>
                    <Icon.search style={{opacity: 0.4}} />
                  </div>
                  <div className="info"><div className="name">{r}</div></div>
                  <div className="arrow"><Icon.arrowUR /></div>
                </div>
              ))}
              <div className="search-section">Швидкі переходи</div>
              {["Каталог продукції", "Конфігуратор системи", "Технічна підтримка", "Дилерам"].map(r => (
                <div key={r} className="search-row" onClick={onClose}>
                  <div className="thumb" style={{background: "var(--tj-red)", display: "flex", alignItems: "center", justifyContent: "center", color: "white"}}>
                    <Icon.arrowUR />
                  </div>
                  <div className="info"><div className="name">{r}</div></div>
                  <div className="arrow"><Icon.arrow /></div>
                </div>
              ))}
            </>
          )}

          {q.trim() !== "" && (
            <>
              <div className="search-section">Знайдено · {results.length}</div>
              {results.length === 0 && (
                <div style={{padding: "20px 26px", color: "var(--ink-400)"}}>Нічого не знайдено. Спробуйте артикул або серію.</div>
              )}
              {results.map(p => (
                <div key={p.sku} className="search-row" onClick={() => { onPick(p); onClose(); }}>
                  <div className="thumb"><img src={p.img} alt={p.name} /></div>
                  <div className="info">
                    <div className="name">{p.name}</div>
                    <div className="sku">{p.sku} · {window.TJ_DATA.categories.find(c => c.id === p.category)?.short}</div>
                  </div>
                  <div className="arrow"><Icon.arrow /></div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// === Header ===
function Header({ onNav, page, savedCount, onOpenSaved }) {
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <TopBar />
      <header className="header">
        <div className="container header-inner">
          <a className="logo" onClick={() => onNav("home")} style={{cursor: "pointer"}}>
            <span className="logo-dot"></span>
            TERMOJET
            <small>EST. 2002</small>
          </a>

          <nav className="nav">
            <div
              className="nav-item"
              onMouseEnter={() => setMegaOpen(true)}
              onClick={() => onNav("catalog")}
            >
              Каталог продукції <Icon.chev className="chev" />
            </div>
            <a className="nav-item" onClick={() => onNav("catalog")}>Серія Mega</a>
            <a className="nav-item">Дилерам</a>
            <a className="nav-item">Теплові насоси</a>
            <a className="nav-item">Про нас</a>
            <a className="nav-item">Файли</a>
            <a className="nav-item">Контакти</a>
          </nav>

          <div className="header-actions">
            <button className="icon-btn" onClick={() => setSearchOpen(true)} title="Пошук (Ctrl+K)">
              <Icon.search />
            </button>
            <button className="icon-btn" onClick={onOpenSaved} title="Збережені">
              <Icon.bookmark />
              {savedCount > 0 && <span className="badge">{savedCount}</span>}
            </button>
            <button className="icon-btn" title="Кабінет дилера">
              <Icon.user />
            </button>
            <button className="cta-btn dark">
              <Icon.phone /> Передзвоніть
            </button>
          </div>
        </div>

        {megaOpen && (
          <MegaMenu
            onPick={(c) => onNav("catalog", c)}
            onClose={() => setMegaOpen(false)}
          />
        )}
      </header>

      {searchOpen && (
        <SearchOverlay
          onClose={() => setSearchOpen(false)}
          onPick={(p) => onNav("catalog", p.category)}
        />
      )}
    </>
  );
}

window.Icon = Icon;
window.Header = Header;
