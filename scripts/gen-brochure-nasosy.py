# -*- coding: utf-8 -*-
"""Брошура Termojet: серії GRANDLIFT і SILENCER з роздрібними цінами сайту.

Дві сторінки на модель: картка (фото, опис, характеристики, ціна) і технічний
розворот (крива Q–H, габаритні креслення, сфери застосування).
Ціни — роздрібні, з бази сайту (backend/data/termojet.db), у EUR.

Використання:  python3 gen-brochure-nasosy.py
"""
import json, re, os, html, sqlite3, fitz

ROOT = "/Users/pavelkucevich/CODE/termojet/website"
ZVITY = "/Users/pavelkucevich/CODE/pipelines/_zvity"
SEED = f"{ROOT}/backend/seed-products.json"
DB = f"{ROOT}/backend/data/termojet.db"
IMG = f"{ROOT}/public/images/nasosy"
LOGO_WHITE = f"{ROOT}/public/logo-white.png"
OUTDIR = f"{ZVITY}/vyhody/Брошура-насоси"
OUT = f"{OUTDIR}/Брошура-Termojet-GRANDLIFT-SILENCER.pdf"

ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf"
ARIAL_BD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

ACCENT = (1, 0.333, 0)
DARK   = (0.12, 0.12, 0.12)
GRAY   = (0.42, 0.42, 0.42)
LIGHT  = (0.96, 0.96, 0.96)
LINE   = (0.85, 0.85, 0.85)
WHITE  = (1, 1, 1)

DATE = "03.08.2026"
FOOTER = "termojet.com.ua    ·    +380 50 718 91 65    ·    termojet@sofievka.kiev.ua"
SKUS = ["GL2075", "GL6075", "GL120220", "GL150370", "SILENCER300", "SILENCER900"]

SERIES_TEXT = {
    "GRANDLIFT": (
        "Каналізаційні насосні станції для примусового відведення стічних вод там, де "
        "самопливна каналізація неможлива або економічно недоцільна. Чотири моделі — від "
        "компактної 20-75SW для одного санвузла до двонасосної 150-370DW промислового класу. "
        "Ріжучий насос, герметичний поліетиленовий бак, клас захисту насоса IP68, зворотний "
        "клапан у комплекті."),
    "SILENCER": (
        "Підвищувальні (бустерні) насоси у шумоізольованому корпусі для автоматичного "
        "підвищення тиску води. Двигун на постійних магнітах і вбудований частотний "
        "перетворювач тримають стабільний тиск при будь-якому водорозборі. Рівень шуму від "
        "45 дБ, захист від сухого ходу, перевантаження та стрибків напруги."),
}

W, H = 595, 842
MX = 40


def fit(page, rect, text, bold=False, size=10, color=DARK, align=0, lineheight=1.35, minsize=6.5):
    """Малює текст, зменшуючи кегль доки він не влізе в rect.

    insert_textbox мовчки не малює нічого, якщо текст не вміщується (повертає < 0),
    тому кожен виклик перевіряємо, інакше рядок зникає з готового PDF.
    """
    ff, fn = (ARIAL_BD, "ab") if bold else (ARIAL, "ar")
    s = size
    while s >= minsize:
        if page.insert_textbox(rect, text, fontfile=ff, fontname=fn, fontsize=s,
                               color=color, align=align, lineheight=lineheight) >= 0:
            return s
        s -= 0.5
    page.insert_textbox(rect, text[:60] + "…", fontfile=ff, fontname=fn,
                        fontsize=minsize, color=color, align=align)
    return minsize


def plain(h, limit=430):
    """HTML-опис → суцільний текст без службових жирних підзаголовків."""
    paras = re.findall(r"<p>(.*?)</p>", h, re.S) or [h]
    out = []
    for raw in paras:
        raw = re.sub(r"^\s*<strong>.*?</strong>\s*", "", raw, flags=re.S)
        t = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", raw))).strip()
        if len(t) < 40:
            continue
        out.append(t)
        if sum(len(x) for x in out) > limit:
            break
    txt = " ".join(out)
    if len(txt) > limit + 210:
        cut = txt[:limit + 210]
        dot = cut.rfind(". ")
        txt = (cut[:dot + 1] if dot > limit // 2 else cut.rstrip() + "…")
    return txt


def uses(desc):
    """Пункти «Де застосовується» без SEO-перелінковки."""
    blocks = re.findall(r"<ul>(.*?)</ul>", desc, re.S)
    if not blocks:
        return []
    items = []
    for li in re.findall(r"<li>(.*?)</li>", blocks[0], re.S):
        t = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", li))).strip(" ;.")
        if not t or re.match(r"^(Переглянути|Детальніше|Дивіть)", t):
            continue
        items.append(t[0].upper() + t[1:])
    return items


def img_file(name):
    fp = os.path.join(IMG, name.split("/")[-1])
    return fp if os.path.exists(fp) else None


def draw_img(page, path, cx, top, max_w, max_h):
    """Вписує зображення у рамку зі збереженням пропорцій, центрує по cx.

    Повертає нижню межу намальованого — щоб наступний блок не наїхав.
    """
    px = fitz.Pixmap(path)
    scale = min(max_w / px.width, max_h / px.height)
    w, h = px.width * scale, px.height * scale
    page.insert_image(fitz.Rect(cx - w / 2, top, cx + w / 2, top + h),
                      filename=path, keep_proportion=True)
    return top + h


def header(page, right_text):
    page.draw_rect(fitz.Rect(0, 0, W, 78), color=None, fill=ACCENT)
    try:
        page.insert_image(fitz.Rect(MX, 22, MX + 150, 60), filename=LOGO_WHITE, keep_proportion=True)
    except Exception:
        pass
    fit(page, fitz.Rect(W - 340, 26, W - MX, 62), right_text,
        bold=True, size=12, color=WHITE, align=2, lineheight=1.3, minsize=8)


def footer(page, note=None):
    page.draw_rect(fitz.Rect(0, H - 40, W, H), color=None, fill=DARK)
    fit(page, fitz.Rect(MX, H - 30, W - MX, H - 10), note or FOOTER,
        size=9, color=WHITE, align=1)


def section(page, y, title):
    """Заголовок секції з помаранчевою рискою ліворуч."""
    page.draw_rect(fitz.Rect(MX, y + 2, MX + 3, y + 15), color=None, fill=ACCENT)
    fit(page, fitz.Rect(MX + 11, y, W - MX, y + 20), title, bold=True, size=11.5, color=DARK)
    return y + 22


def fmt(n):
    return f"{n:,}".replace(",", " ") + " €"


def cover(doc, models):
    page = doc.new_page(width=W, height=H)
    header(page, "Каталог обладнання")

    y = 118
    fit(page, fitz.Rect(MX, y, W - MX, y + 44), "НАСОСНЕ ОБЛАДНАННЯ",
        bold=True, size=27, color=DARK, minsize=20)
    y += 40
    fit(page, fitz.Rect(MX, y, W - MX, y + 34), "GRANDLIFT  ·  SILENCER",
        bold=True, size=17, color=ACCENT, minsize=13)
    y += 30
    page.draw_line(fitz.Point(MX, y), fitz.Point(W - MX, y), color=ACCENT, width=2)
    y += 20

    # --- два блоки серій ---
    for series, sample in (("GRANDLIFT", "grandlift-150-370dw.png"), ("SILENCER", "silencer900.png")):
        box_h = 190
        page.draw_rect(fitz.Rect(MX, y, W - MX, y + box_h), color=None, fill=LIGHT)
        ip = img_file(sample)
        if ip:
            draw_img(page, ip, MX + 105, y + 14, 170, box_h - 28)
        tx = MX + 200
        fit(page, fitz.Rect(tx, y + 20, W - MX - 16, y + 44), series,
            bold=True, size=16, color=DARK)
        fit(page, fitz.Rect(tx, y + 48, W - MX - 16, y + box_h - 14), SERIES_TEXT[series],
            size=9.5, color=GRAY, align=3, lineheight=1.4)
        y += box_h + 16

    fit(page, fitz.Rect(MX, y + 6, W - MX, y + 40),
        f"Роздрібні ціни станом на {DATE}. Модельний ряд і ціни — на наступній сторінці.",
        size=9.5, color=GRAY)
    footer(page)


def overview(doc, models):
    page = doc.new_page(width=W, height=H)
    header(page, "Модельний ряд")

    y = 104
    fit(page, fitz.Rect(MX, y, W - MX, y + 34), "Модельний ряд і роздрібні ціни",
        bold=True, size=19, color=DARK)
    y += 32
    page.draw_line(fitz.Point(MX, y), fitz.Point(W - MX, y), color=ACCENT, width=2)
    y += 20

    c_art, c_par, c_price = MX + 10, W - MX - 210, W - MX - 10
    hr = 26
    page.draw_rect(fitz.Rect(MX, y, W - MX, y + hr), color=None, fill=DARK)
    fit(page, fitz.Rect(c_art, y + 7, c_par - 8, y + hr), "Модель", bold=True, size=9.5, color=WHITE)
    fit(page, fitz.Rect(c_par, y + 7, W - MX - 95, y + hr), "Напір · подача",
        bold=True, size=9.5, color=WHITE)
    fit(page, fitz.Rect(W - MX - 95, y + 7, c_price, y + hr), "Ціна, EUR",
        bold=True, size=9.5, color=WHITE, align=2)
    y += hr

    rh = 42
    for i, p in enumerate(models):
        if i % 2 == 0:
            page.draw_rect(fitz.Rect(MX, y, W - MX, y + rh), color=None, fill=LIGHT)
        sp = p["specs"]
        art = sp.get("Артикул", p["sku"])
        fit(page, fitz.Rect(c_art, y + 8, c_par - 8, y + 26), art, bold=True, size=9.5, color=DARK)
        kind = ("Каналізаційна насосна станція" if "GRANDLIFT" in art
                else "Підвищувальний насос")
        fit(page, fitz.Rect(c_art, y + 23, c_par - 8, y + rh - 4), kind, size=8, color=GRAY)
        par = f"{sp.get('Макс. напір', '—')} · {sp.get('Макс. продуктивність', '—')}"
        fit(page, fitz.Rect(c_par, y + 14, W - MX - 95, y + rh), par, size=9, color=GRAY)
        fit(page, fitz.Rect(W - MX - 95, y + 12, c_price, y + rh), fmt(p["retail"]),
            bold=True, size=13, color=ACCENT, align=2)
        y += rh
    page.draw_rect(fitz.Rect(MX, y - rh * len(models), W - MX, y), color=LINE, width=0.5)

    y += 20
    fit(page, fitz.Rect(MX, y, W - MX, y + 70),
        "Ціни роздрібні, вказані за одиницю обладнання в EUR і чинні на дату випуску каталогу.\n"
        "Актуальні ціни, наявність і повні описи — на termojet.com.ua.\n"
        "Комплектація, габарити та криві Q–H кожної моделі — на наступних сторінках.",
        size=9.5, color=GRAY, lineheight=1.5)
    footer(page)


def card_page(doc, p):
    """Сторінка A: фото, опис, характеристики, роздрібна ціна."""
    page = doc.new_page(width=W, height=H)
    series = "GRANDLIFT" if "GRANDLIFT" in p["name"].upper() else "SILENCER"
    header(page, series)

    y = 104
    fit(page, fitz.Rect(MX, y, W - MX, y + 58), p["name"], bold=True, size=17, color=DARK, minsize=12)
    y += 52
    page.draw_line(fitz.Point(MX, y), fitz.Point(W - MX, y), color=ACCENT, width=2)
    y += 16

    img_w = 200
    ip = img_file(p["image"])
    if ip:
        draw_img(page, ip, W - MX - img_w / 2, y, img_w, img_w)

    fit(page, fitz.Rect(MX, y, W - MX - img_w - 18, y + img_w + 4), plain(p["description"]),
        size=9.5, color=GRAY, align=3, lineheight=1.4, minsize=7.5)
    y += img_w + 20

    pr = fitz.Rect(MX, y, W - MX, y + 44)
    page.draw_rect(pr, color=None, fill=ACCENT)
    fit(page, fitz.Rect(MX + 14, y + 15, MX + 250, y + 40), "Роздрібна ціна", size=11, color=WHITE)
    fit(page, fitz.Rect(W - MX - 220, y + 10, W - MX - 14, y + 40), fmt(p["retail"]),
        bold=True, size=20, color=WHITE, align=2)
    y += 60

    y = section(page, y, "Технічні характеристики")
    specs = {k: v for k, v in p["specs"].items() if str(v).strip()}
    avail = (H - 56) - y
    rh = min(21, avail / max(len(specs), 1))
    fs = 9.5 if rh >= 18 else 8.5
    for i, (k, v) in enumerate(specs.items()):
        if i % 2 == 0:
            page.draw_rect(fitz.Rect(MX, y, W - MX, y + rh), color=None, fill=LIGHT)
        pad = (rh - fs) / 2 - 1
        fit(page, fitz.Rect(MX + 8, y + pad, MX + 250, y + rh), str(k), size=fs, color=GRAY)
        fit(page, fitz.Rect(MX + 255, y + pad, W - MX - 8, y + rh), str(v),
            bold=True, size=fs, color=DARK)
        y += rh
    page.draw_rect(fitz.Rect(MX, y - rh * len(specs), W - MX, y), color=LINE, width=0.5)
    footer(page)


def tech_page(doc, p):
    """Сторінка B: крива Q–H, габаритні креслення, сфери застосування."""
    graph = next((img_file(u) for u in p["images"] if "graph" in u and img_file(u)), None)
    draw = next((img_file(u) for u in p["images"] if "drawing" in u and img_file(u)), None)
    items = uses(p["description"])
    if not (graph or draw or items):
        return

    page = doc.new_page(width=W, height=H)
    art = p["specs"].get("Артикул", p["sku"])
    header(page, art)

    y = 104
    fit(page, fitz.Rect(MX, y, W - MX, y + 26), f"{art} — робочі характеристики",
        bold=True, size=15, color=DARK, minsize=11)
    y += 26
    page.draw_line(fitz.Point(MX, y), fitz.Point(W - MX, y), color=ACCENT, width=2)
    y += 18

    # більше місця під графік, коли креслення для моделі нема
    if graph:
        # у SILENCER графік спільний на всю серію і містить криві сусідніх моделей —
        # підписуємо його як серійний, щоб зайва крива не читалась як помилка
        shared = "silencer-graph" in os.path.basename(graph)
        y = section(page, y, "Криві напір–подача серії SILENCER (Q–H)" if shared
                    else "Крива напір–подача (Q–H)")
        y = draw_img(page, graph, W / 2, y, W - 2 * MX - 40, 250 if not draw else 195) + 16

    if draw:
        y = section(page, y, "Габаритні розміри, мм")
        y = draw_img(page, draw, W / 2, y, W - 2 * MX, 268) + 16

    if items:
        y = section(page, y, "Де застосовується")
        room = (H - 58) - y
        rh = min(30, room / len(items))
        for it in items:
            page.draw_circle(fitz.Point(MX + 5, y + 7), 2, color=None, fill=ACCENT)
            fit(page, fitz.Rect(MX + 14, y, W - MX, y + rh), it,
                size=9.5, color=GRAY, lineheight=1.3, minsize=7.5)
            y += rh
    footer(page)


def contacts(doc):
    page = doc.new_page(width=W, height=H)
    header(page, "Контакти")
    y = 190
    fit(page, fitz.Rect(MX, y, W - MX, y + 44), "TERMOJET", bold=True, size=30, color=DARK, align=1)
    y += 44
    fit(page, fitz.Rect(MX, y, W - MX, y + 30), "Обладнання для котелень", size=13, color=GRAY, align=1)
    y += 54
    page.draw_line(fitz.Point(W / 2 - 60, y), fitz.Point(W / 2 + 60, y), color=ACCENT, width=2)
    y += 34
    for label, val in (("Сайт", "termojet.com.ua"),
                       ("Телефон", "+380 50 718 91 65"),
                       ("E-mail", "termojet@sofievka.kiev.ua")):
        fit(page, fitz.Rect(MX, y, W / 2 - 12, y + 22), label, size=10.5, color=GRAY, align=2)
        fit(page, fitz.Rect(W / 2 + 12, y, W - MX, y + 22), val, bold=True, size=12, color=DARK)
        y += 30
    footer(page)


def fix_tounicode(doc):
    """PyMuPDF кодує пробіл як U+00A0, а дефіс як U+00AD (м'який перенос).

    Виглядає ідентично, але скопійований із PDF артикул містить невидимий символ
    і не збігається при пошуку. Правимо ЛИШЕ праву частину bfchar-мапінгів:
    гліфи з кодами 00a0/00ad ліворуч — це кириличні літери, їх чіпати не можна.
    """
    subs = {b"00a0": b"0020", b"00ad": b"002d"}
    pat = re.compile(rb"^(<[0-9a-fA-F]{4}>\s*)<(00a0|00ad)>\s*$", re.M | re.I)
    fixed = 0
    for xref in range(1, doc.xref_length()):
        try:
            if not doc.xref_is_stream(xref):
                continue
            s = doc.xref_stream(xref)
            if b"begincmap" not in s:
                continue
            new, n = pat.subn(lambda m: m.group(1) + b"<" + subs[m.group(2).lower()] + b">", s)
            if n:
                doc.update_stream(xref, new)
                fixed += n
        except Exception:
            continue
    return fixed


# --- дані ---
ps = json.load(open(SEED, encoding="utf-8"))
ps = ps if isinstance(ps, list) else ps["products"]
by_sku = {p["sku"]: p for p in ps}

con = sqlite3.connect(DB)
retail = {r[0]: r[1] for r in con.execute(
    "select sku, case when sale_price > 0 then sale_price else price end from products "
    "where sku in (%s)" % ",".join("?" * len(SKUS)), SKUS)}
cur = {r[0]: r[1] for r in con.execute(
    "select sku, currency from products where sku in (%s)" % ",".join("?" * len(SKUS)), SKUS)}
con.close()

models = []
for sku in SKUS:
    if sku not in by_sku:
        raise SystemExit(f"Немає в каталозі: {sku}")
    if sku not in retail:
        raise SystemExit(f"Немає ціни в базі: {sku}")
    if cur.get(sku) != "EUR":
        raise SystemExit(f"{sku}: ціна не в EUR, а в {cur.get(sku)}")
    models.append({**by_sku[sku], "retail": round(retail[sku])})

doc = fitz.open()
cover(doc, models)
overview(doc, models)
for p in models:
    card_page(doc, p)
    tech_page(doc, p)
contacts(doc)

os.makedirs(OUTDIR, exist_ok=True)
fix_tounicode(doc)
doc.set_metadata({"title": "Termojet — насосне обладнання GRANDLIFT і SILENCER",
                  "author": "TERMOJET", "subject": "Каталог із роздрібними цінами",
                  "keywords": "", "creator": "", "producer": ""})
doc.save(OUT, deflate=True, garbage=4)
print(f"OK {OUT} — {doc.page_count} стор.")
doc.close()
for p in models:
    print(f"  {p['sku']:<12} {fmt(p['retail']):>10}   {p['name'][:56]}")
