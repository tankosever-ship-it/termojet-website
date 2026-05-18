// catalog.jsx — Catalog page with sticky filters, smart toolbar, dense product grid
const { useState: useS_c, useMemo: useM_c } = React;

function ProductCard({ product, saved, onSave, onQuickOrder }) {
  const cat = window.TJ_DATA.categories.find(c => c.id === product.category);
  return (
    <div className="product-card">
      <div className="thumb">
        <img src={product.img} alt={product.name} loading="lazy" />
        {product.badge && (
          <div className="badges">
            <span className={`pcard-badge ${product.badge === "HIT" ? "red" : product.badge === "NEW" ? "green" : ""}`}>{product.badge}</span>
          </div>
        )}
        <div className="quick-bar">
          <button className="qb-btn primary" onClick={(e) => { e.stopPropagation(); onQuickOrder(); }}>
            <window.Icon.plus /> Швидка заявка
          </button>
          <button className={`qb-icon ${saved ? "active" : ""}`} onClick={(e) => { e.stopPropagation(); onSave(); }} title="Зберегти">
            <window.Icon.bookmark />
          </button>
          <button className="qb-icon" title="Деталі">
            <window.Icon.arrowUR />
          </button>
        </div>
      </div>
      <div className="meta">
        <div className="pcat">{cat?.short}</div>
        <div className="pname">{product.name}</div>
        <div className="pspecs">
          {product.specs.map(s => <span key={s} className="spec-pill">{s}</span>)}
        </div>
        <div className="pfoot">
          <div className="psku">{product.sku}</div>
          <div className={`pstock ${product.stock === "low" ? "low" : ""}`}>
            {product.stock === "low" ? "Під замовлення" : "В наявності"}
          </div>
        </div>
      </div>
    </div>
  );
}
window.ProductCard = ProductCard;

function FilterCheck({ item, on, onToggle }) {
  return (
    <label className="filt-check">
      <input type="checkbox" checked={on} onChange={onToggle} />
      <span>{item.name}</span>
      <span className="filt-num">{item.count}</span>
    </label>
  );
}

function CatalogPage({ initialCategory, onNav, saved, onSave, onQuickOrder }) {
  const cats = window.TJ_DATA.categories;
  const F = window.TJ_DATA.filters;
  const [activeCat, setActiveCat] = useS_c(initialCategory || "all");
  const [activeFilters, setActiveFilters] = useS_c(new Set());
  const [view, setView] = useS_c("grid");
  const [sort, setSort] = useS_c("popular");
  const [q, setQ] = useS_c("");

  const toggle = (id) => {
    const next = new Set(activeFilters);
    next.has(id) ? next.delete(id) : next.add(id);
    setActiveFilters(next);
  };

  const filtered = useM_c(() => {
    let list = [...window.TJ_DATA.products];
    if (activeCat !== "all") list = list.filter(p => p.category === activeCat);
    if (q.trim()) list = list.filter(p => (p.name + " " + p.sku).toLowerCase().includes(q.toLowerCase()));
    if (sort === "new") list = [...list].sort((a, b) => (b.badge === "NEW") - (a.badge === "NEW"));
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [activeCat, q, sort, activeFilters]);

  const activeCatObj = cats.find(c => c.id === activeCat);

  return (
    <div className="page-enter">
      <div className="container">
        <div className="crumb">
          <a onClick={() => onNav("home")}>Головна</a>
          <span className="sep">/</span>
          <a>Каталог</a>
          {activeCat !== "all" && <>
            <span className="sep">/</span>
            <span style={{color: "var(--ink-900)"}}>{activeCatObj?.short}</span>
          </>}
        </div>
        <h1 className="cat-title">
          {activeCat === "all" ? "Каталог продукції" : activeCatObj?.name}
        </h1>
        <p className="cat-desc">
          {activeCat === "all"
            ? "Понад 372 позицій котельного обладнання — від міні-колекторів до промислових систем 2 МВт. Всі товари в наявності або під замовлення з нашого складу в Києві."
            : `Серія товарів категорії "${activeCatObj?.short}". Власне виробництво, теплоізоляція, гарантія 24 міс.`
          }
        </p>
      </div>

      <div className="container catalog-shell">
        <aside className="cat-sidebar">
          <div className="filt-group">
            <div className="filt-head">Категорія <span className="filt-count">{cats.length}</span></div>
            <div style={{display: "flex", flexDirection: "column", gap: 1}}>
              <label className="filt-check" onClick={() => setActiveCat("all")}>
                <input type="radio" checked={activeCat === "all"} readOnly />
                <span>Усі категорії</span>
                <span className="filt-num">372</span>
              </label>
              {cats.map(c => (
                <label key={c.id} className="filt-check" onClick={() => setActiveCat(c.id)}>
                  <input type="radio" checked={activeCat === c.id} readOnly />
                  <span>{c.short}</span>
                  <span className="filt-num">{c.count}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filt-group">
            <div className="filt-head">Серія <span className="filt-count">4</span></div>
            {F.series.map(i => <FilterCheck key={i.id} item={i} on={activeFilters.has(i.id)} onToggle={() => toggle(i.id)} />)}
          </div>

          <div className="filt-group">
            <div className="filt-head">Потужність котельної <span className="filt-count">5</span></div>
            {F.power.map(i => <FilterCheck key={i.id} item={i} on={activeFilters.has(i.id)} onToggle={() => toggle(i.id)} />)}
          </div>

          <div className="filt-group">
            <div className="filt-head">Діаметр приєднання <span className="filt-count">5</span></div>
            {F.connection.map(i => <FilterCheck key={i.id} item={i} on={activeFilters.has(i.id)} onToggle={() => toggle(i.id)} />)}
          </div>

          <div className="filt-group">
            <div className="filt-head">Теплоізоляція <span className="filt-count">2</span></div>
            {F.insulation.map(i => <FilterCheck key={i.id} item={i} on={activeFilters.has(i.id)} onToggle={() => toggle(i.id)} />)}
          </div>

          <div className="filt-group">
            <div className="filt-head">Особливості</div>
            {F.features.map(i => <FilterCheck key={i.id} item={i} on={activeFilters.has(i.id)} onToggle={() => toggle(i.id)} />)}
          </div>

          <div className="filt-group">
            <div className="filt-head">Ціна, грн</div>
            <div className="range-row">
              <input placeholder="від" defaultValue="0" />
              <input placeholder="до" defaultValue="120000" />
            </div>
          </div>

          <button className="cta-btn ghost" style={{width: "100%", justifyContent: "center", marginTop: 16}}
            onClick={() => { setActiveFilters(new Set()); setActiveCat("all"); setQ(""); }}>
            Скинути всі фільтри
          </button>
        </aside>

        <main className="cat-main">
          <div className="cat-toolbar">
            <div className="cat-search">
              <window.Icon.search />
              <input placeholder="Швидкий пошук в категорії…" value={q} onChange={(e) => setQ(e.target.value)} />
              <span className="search-kbd">⌘K</span>
            </div>

            <div className="chip-row">
              {[...activeFilters].slice(0, 3).map(id => {
                const item = [...F.series, ...F.power, ...F.connection, ...F.insulation, ...F.features].find(x => x.id === id);
                return (
                  <span key={id} className="toolbar-chip active" onClick={() => toggle(id)}>
                    {item?.name} <span className="x"><window.Icon.close /></span>
                  </span>
                );
              })}
            </div>

            <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="popular">Спочатку популярні</option>
              <option value="new">Новинки</option>
              <option value="name">За назвою A–Я</option>
              <option value="price-asc">Ціна ↑</option>
              <option value="price-desc">Ціна ↓</option>
            </select>

            <div className="view-toggle">
              <button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")}><window.Icon.grid /></button>
              <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}><window.Icon.list /></button>
            </div>
          </div>

          <div className="cat-results-meta">
            <span>Показано <span className="mono">{filtered.length}</span> із <span className="mono">372</span> позицій</span>
            <span className="mono" style={{fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: "0.1em"}}>
              {activeFilters.size > 0 ? `${activeFilters.size} фільтр(ів) активно` : "Без фільтрів"}
            </span>
          </div>

          <div className={`product-grid ${view === "list" ? "list" : ""}`}>
            {filtered.map(p => (
              <ProductCard
                key={p.sku}
                product={p}
                saved={saved.has(p.sku)}
                onSave={() => onSave(p.sku)}
                onQuickOrder={() => onQuickOrder(p)}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{padding: 80, textAlign: "center", color: "var(--ink-400)"}}>
              Нічого не знайдено. Спробуйте змінити фільтри.
            </div>
          )}

          {filtered.length > 0 && (
            <div style={{display: "flex", justifyContent: "center", marginTop: 40}}>
              <button className="cta-btn ghost">Показати ще <window.Icon.arrow /></button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

window.CatalogPage = CatalogPage;
