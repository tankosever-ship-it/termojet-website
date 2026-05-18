// app.jsx — Root app, routing, footer, drawer (saved), quick-order modal, toasts
const { useState: useS_a, useEffect: useE_a } = React;

// Footer
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <h2>Готові зібрати<br/>вашу котельню?</h2>
        <div style={{display: "flex", gap: 12, marginBottom: 56, flexWrap: "wrap"}}>
          <button className="cta-btn">Каталог продукції <window.Icon.arrow /></button>
          <button className="cta-btn" style={{background: "white", color: "var(--ink-900)"}}>+380 (50) 718 91 65</button>
        </div>

        <div className="footer-grid">
          <div>
            <h5>Termojet</h5>
            <p style={{color: "var(--ink-300)", fontSize: 14, maxWidth: 340, lineHeight: 1.55}}>
              Виробнича сімейна компанія, заснована у 2002р у Києві. Найбільший в Україні завод-виробник систем швидкого монтажу для котельних.
            </p>
            <p style={{color: "var(--ink-400)", fontSize: 13, marginTop: 18, fontFamily: "var(--font-mono)"}}>
              м. Київ, Софіївська Борщагівка<br/>
              вул. Київська 3<br/>
              <br/>
              м. Житомир, пр. Незалежності 79
            </p>
          </div>
          <div>
            <h5>Каталог</h5>
            <div className="footer-links">
              <a>Колектори</a>
              <a>Гідрострілки</a>
              <a>Насосні групи</a>
              <a>Серія Mega</a>
              <a>Серія Mini</a>
              <a>BOX</a>
              <a>Насоси</a>
              <a>Автоматика</a>
            </div>
          </div>
          <div>
            <h5>Компанія</h5>
            <div className="footer-links">
              <a>Про нас</a>
              <a>Дилерам</a>
              <a>ОЕМ</a>
              <a>Новини</a>
              <a>Галерея</a>
              <a>Файли</a>
              <a>Контакти</a>
            </div>
          </div>
          <div>
            <h5>Сервіс</h5>
            <div className="footer-links">
              <a>Доставка</a>
              <a>Оплата</a>
              <a>Реквізити</a>
              <a>Договір поставки</a>
              <a>Сервіс</a>
              <a>Гарантія</a>
              <a>Технічна підтримка</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 TERMOJET — Усі права захищено</span>
          <span>UA · PL · EN · DE · FR</span>
        </div>
      </div>
    </footer>
  );
}

// Saved drawer
function SavedDrawer({ items, onClose, onRemove, onQuickOrder }) {
  const products = items.map(sku => window.TJ_DATA.products.find(p => p.sku === sku)).filter(Boolean);
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose}></div>
      <aside className="drawer">
        <div className="drawer-head">
          <h3>Збережені · {products.length}</h3>
          <button className="icon-btn" onClick={onClose}><window.Icon.close /></button>
        </div>
        <div className="drawer-body">
          {products.length === 0 ? (
            <div style={{padding: 40, textAlign: "center", color: "var(--ink-400)"}}>
              <window.Icon.bookmark style={{width: 32, height: 32, opacity: 0.4, margin: "0 auto 12px"}} />
              <p>Список порожній. Натискайте на закладку біля товару, щоб зберегти.</p>
            </div>
          ) : products.map(p => (
            <div key={p.sku} className="drawer-row">
              <div className="thumb"><img src={p.img} /></div>
              <div className="info">
                <div className="name">{p.name}</div>
                <div className="sku">{p.sku}</div>
              </div>
              <button className="icon-btn rm" onClick={() => onRemove(p.sku)}><window.Icon.close /></button>
            </div>
          ))}
        </div>
        {products.length > 0 && (
          <div className="drawer-foot">
            <button className="cta-btn" onClick={() => onQuickOrder({batch: products})}>
              <window.Icon.plus /> Запит на всі товари
            </button>
            <button className="cta-btn ghost" style={{justifyContent: "center"}}>
              Експорт в PDF
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

// Quick order modal
function QuickOrderModal({ product, onClose, onSubmit }) {
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Швидка заявка</h3>
          <button className="icon-btn" onClick={onClose}><window.Icon.close /></button>
        </div>
        <div className="modal-body">
          {product && !product.batch && (
            <div className="modal-product">
              <div className="thumb"><img src={product.img} /></div>
              <div>
                <div style={{fontSize: 13, fontWeight: 600}}>{product.name}</div>
                <div style={{fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-400)", marginTop: 4}}>{product.sku}</div>
              </div>
            </div>
          )}
          {product?.batch && (
            <div className="modal-product">
              <div className="thumb" style={{background: "var(--tj-red)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700}}>
                {product.batch.length}
              </div>
              <div>
                <div style={{fontSize: 13, fontWeight: 600}}>Запит на групу товарів</div>
                <div style={{fontSize: 11, color: "var(--ink-500)", marginTop: 4}}>{product.batch.length} позицій · з ваших закладок</div>
              </div>
            </div>
          )}
          <div className="field-row">
            <div className="field">
              <label>Ім'я</label>
              <input placeholder="Олександр" />
            </div>
            <div className="field">
              <label>Телефон</label>
              <input placeholder="+380" />
            </div>
          </div>
          <div className="field">
            <label>Компанія / місто</label>
            <input placeholder="ТОВ «Київмонтаж», Київ" />
          </div>
          <div className="field">
            <label>Кількість / коментар</label>
            <textarea rows="3" placeholder="Кількість, термін, особливі вимоги…"></textarea>
          </div>
          <label style={{display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--ink-500)"}}>
            <input type="checkbox" defaultChecked style={{accentColor: "var(--tj-red)"}} />
            Я погоджуюсь на обробку персональних даних
          </label>
        </div>
        <div className="modal-foot">
          <button className="cta-btn" style={{width: "100%", justifyContent: "center"}} onClick={onSubmit}>
            Відправити заявку <window.Icon.arrow />
          </button>
          <p style={{textAlign: "center", color: "var(--ink-400)", fontSize: 12, marginTop: 12}}>
            Менеджер передзвонить протягом 30 хв у робочий час
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useS_a("home");
  const [catCategory, setCatCategory] = useS_a(null);
  const [saved, setSaved] = useS_a(new Set());
  const [drawerOpen, setDrawerOpen] = useS_a(false);
  const [modalProduct, setModalProduct] = useS_a(null);
  const [toast, setToast] = useS_a(null);

  useE_a(() => { window.scrollTo({top: 0, behavior: "instant"}); }, [page]);
  useE_a(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2400);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const nav = (p, cat) => {
    setPage(p);
    if (cat) setCatCategory(cat);
  };

  const onSave = (sku) => {
    const next = new Set(saved);
    if (next.has(sku)) {
      next.delete(sku);
      setToast({msg: "Видалено зі збережених"});
    } else {
      next.add(sku);
      setToast({msg: "Додано до збережених"});
    }
    setSaved(next);
  };

  const submitOrder = () => {
    setModalProduct(null);
    setToast({msg: "Заявку відправлено — менеджер передзвонить"});
  };

  return (
    <>
      <window.Header
        onNav={nav}
        page={page}
        savedCount={saved.size}
        onOpenSaved={() => setDrawerOpen(true)}
      />
      <main>
        {page === "home" && (
          <window.HomePage
            onNav={nav}
            saved={saved}
            onSave={onSave}
            onQuickOrder={(p) => setModalProduct(p)}
          />
        )}
        {page === "catalog" && (
          <window.CatalogPage
            initialCategory={catCategory}
            onNav={nav}
            saved={saved}
            onSave={onSave}
            onQuickOrder={(p) => setModalProduct(p)}
          />
        )}
      </main>
      <Footer />

      {drawerOpen && (
        <SavedDrawer
          items={[...saved]}
          onClose={() => setDrawerOpen(false)}
          onRemove={onSave}
          onQuickOrder={(p) => { setDrawerOpen(false); setModalProduct(p); }}
        />
      )}

      {modalProduct && (
        <QuickOrderModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onSubmit={submitOrder}
        />
      )}

      {toast && (
        <div className="toast">
          <span className="dot"></span>
          {toast.msg}
        </div>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
