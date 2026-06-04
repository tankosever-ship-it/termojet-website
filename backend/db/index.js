const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const DB_PATH = path.join(__dirname, '..', 'data', 'termojet.db')

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

function setup() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id          TEXT PRIMARY KEY,
      wp_id       INTEGER,
      name        TEXT NOT NULL,
      slug        TEXT UNIQUE NOT NULL,
      sku         TEXT,
      price       REAL,
      currency    TEXT DEFAULT 'UAH',
      category_slug TEXT,
      subcategory TEXT,
      image       TEXT,
      images      TEXT DEFAULT '[]',
      short_desc  TEXT DEFAULT '',
      description TEXT DEFAULT '',
      specs       TEXT DEFAULT '{}',
      features    TEXT DEFAULT '[]',
      in_stock    INTEGER DEFAULT 1,
      is_visible  INTEGER DEFAULT 1,
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      items       TEXT NOT NULL,
      total       REAL,
      name        TEXT,
      phone       TEXT,
      email       TEXT,
      address     TEXT,
      comment     TEXT,
      status      TEXT DEFAULT 'new',
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS consultations (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT,
      phone       TEXT,
      email       TEXT,
      message     TEXT,
      status      TEXT DEFAULT 'new',
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS dealers (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      company     TEXT,
      name        TEXT,
      phone       TEXT,
      email       TEXT,
      city        TEXT,
      message     TEXT,
      status      TEXT DEFAULT 'new',
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      slug        TEXT UNIQUE NOT NULL,
      title       TEXT NOT NULL,
      excerpt     TEXT DEFAULT '',
      content     TEXT DEFAULT '',
      image       TEXT DEFAULT '',
      tags        TEXT DEFAULT '[]',
      published   INTEGER DEFAULT 0,
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS portfolio (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      location    TEXT,
      year        INTEGER,
      power       TEXT,
      description TEXT DEFAULT '',
      images      TEXT DEFAULT '[]',
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT,
      company     TEXT,
      rating      INTEGER DEFAULT 5,
      text        TEXT,
      published   INTEGER DEFAULT 1,
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS files (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      filename    TEXT NOT NULL,
      category    TEXT DEFAULT '',
      size        TEXT DEFAULT '',
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS subscribers (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      email       TEXT NOT NULL UNIQUE,
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key         TEXT PRIMARY KEY,
      value       TEXT
    );
  `)

  // default settings
  const insertSetting = db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`)
  insertSetting.run('phone', '+380 (50) 450 64 24')
  insertSetting.run('email', 'termojet@sofievka.kiev.ua')
  insertSetting.run('address', 'м. Київ, вул. Виробнича, 1')
  insertSetting.run('workHours', 'Пн-Пт 9:00–18:00')
  insertSetting.run('telegram', '')
  insertSetting.run('adminPassword', 'termojet2024')
}

function seedProducts() {
  const count = db.prepare('SELECT COUNT(*) as c FROM products').get().c
  if (count > 0) return

  const seedPath = path.join(__dirname, '..', 'seed-products.json')
  if (!fs.existsSync(seedPath)) {
    console.warn('seed-products.json not found, skipping product seed')
    return
  }

  const products = JSON.parse(fs.readFileSync(seedPath, 'utf8'))
  const insert = db.prepare(`
    INSERT OR IGNORE INTO products
      (id, wp_id, name, slug, sku, price, currency, category_slug, subcategory,
       image, images, short_desc, description, specs, features, in_stock)
    VALUES
      (@id, @wp_id, @name, @slug, @sku, @price, @currency, @category_slug, @subcategory,
       @image, @images, @short_desc, @description, @specs, @features, @in_stock)
  `)

  const seedAll = db.transaction((rows) => {
    for (const p of rows) {
      insert.run({
        id:            p.id || `p_${Date.now()}_${Math.random()}`,
        wp_id:         p.wpId || null,
        name:          p.name || '',
        slug:          p.slug || '',
        sku:           p.sku || '',
        price:         parseFloat(p.price) || 0,
        currency:      p.currency || 'UAH',
        category_slug: p.categorySlug || '',
        subcategory:   p.subcategory || '',
        image:         p.image || '',
        images:        JSON.stringify(p.images || []),
        short_desc:    p.shortDesc || '',
        description:   p.description || '',
        specs:         JSON.stringify(p.specs || {}),
        features:      JSON.stringify(p.features || []),
        in_stock:      p.inStock !== false ? 1 : 0,
      })
    }
  })

  seedAll(products)
  console.log(`Seeded ${products.length} products into SQLite`)
}

// Міграція: для вже засіяної живої БД додати колонку currency і заповнити з seed.
// Ідемпотентно — виконується щостарту (CREATE TABLE IF NOT EXISTS не додає колонок).
function migrateCurrency() {
  const cols = db.prepare('PRAGMA table_info(products)').all().map(c => c.name)
  if (!cols.includes('currency')) {
    // без DEFAULT — інакше всі наявні рядки одразу стануть 'UAH' і backfill їх не зачепить
    db.exec('ALTER TABLE products ADD COLUMN currency TEXT')
  }
  const seedPath = path.join(__dirname, '..', 'seed-products.json')
  if (fs.existsSync(seedPath)) {
    const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'))
    // безумовно проставляємо валюту з seed (джерело істини) — самовиправляється щостарту
    const upd = db.prepare('UPDATE products SET currency = ? WHERE id = ?')
    const tx = db.transaction(rows => { for (const p of rows) upd.run(p.currency || 'UAH', p.id) })
    tx(seed)
  }
  // будь-що без валюти → 'UAH' (за замовчуванням)
  db.prepare("UPDATE products SET currency = 'UAH' WHERE currency IS NULL OR currency = ''").run()
}

setup()
seedProducts()
migrateCurrency()

module.exports = db
