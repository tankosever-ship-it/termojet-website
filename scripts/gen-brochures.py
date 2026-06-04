# -*- coding: utf-8 -*-
"""Генерує чисті брендовані Termojet-брошури (укр.) для серій GRANDLIFT/MEGA/SILENCER."""
import json, fitz, os

ROOT = "/Users/pavelkucevich/CODE/termojet-website"
SEED = f"{ROOT}/backend/seed-products.json"
OUTDIR = f"{ROOT}/public/files"
IMG = f"{ROOT}/public/images/nasosy"
LOGO_WHITE = f"{ROOT}/public/logo-white.png"
ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf"
ARIAL_BD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

ACCENT = (1, 0.333, 0)      # #FF5500
DARK   = (0.12, 0.12, 0.12)
GRAY   = (0.42, 0.42, 0.42)
LIGHT  = (0.96, 0.96, 0.96)
LINE   = (0.85, 0.85, 0.85)

SERIES = [
    ("grandlift", "GRANDLIFT", "Каналізаційні насосні станції",
     lambda p: "GRANDLIFT" in p["name"].upper()),
    ("mega", "MEGA", "Інтелектуальні циркуляційні насоси",
     lambda p: "MEGA" in p["name"].upper()),
    ("silencer", "SILENCER", "Підвищувальні (бустерні) насоси у шумоізоляції",
     lambda p: "SILENCER" in p["name"].upper()),
]

ps = json.load(open(SEED, encoding="utf-8"))
ps = ps if isinstance(ps, list) else ps["products"]
pumps = [p for p in ps if p.get("categorySlug") == "nasosy"]

W, H = 595, 842
MX = 40

def img_path(p):
    u = (p.get("image") or "").split("/")[-1]
    fp = os.path.join(IMG, u)
    return fp if os.path.exists(fp) else None

def model_page(doc, p, series_title):
    page = doc.new_page(width=W, height=H)
    # --- header ---
    page.draw_rect(fitz.Rect(0, 0, W, 78), color=None, fill=ACCENT)
    lr = fitz.Rect(MX, 22, MX + 150, 60)
    try: page.insert_image(lr, filename=LOGO_WHITE, keep_proportion=True)
    except Exception: pass
    page.insert_textbox(fitz.Rect(W-300, 28, W-MX, 58), series_title,
                        fontfile=ARIAL_BD, fontname="ab", fontsize=13, color=(1,1,1), align=2)
    # --- model name ---
    y = 104
    name = p["name"]
    page.insert_textbox(fitz.Rect(MX, y, W-MX, y+60), name,
                        fontfile=ARIAL_BD, fontname="ab", fontsize=19, color=DARK, align=0)
    y += 58
    page.draw_line(fitz.Point(MX, y), fitz.Point(W-MX, y), color=ACCENT, width=2)
    y += 18
    # --- photo (right) ---
    ip = img_path(p)
    img_w = 210
    if ip:
        ir = fitz.Rect(W-MX-img_w, y, W-MX, y+img_w)
        try: page.insert_image(ir, filename=ip, keep_proportion=True)
        except Exception: pass
    # --- description (left) ---
    desc = p.get("description", "")
    dr = fitz.Rect(MX, y, W-MX-img_w-20, y+img_w+10)
    page.insert_textbox(dr, desc, fontfile=ARIAL, fontname="ar", fontsize=10.5,
                        color=GRAY, align=3, lineheight=1.35)
    y += img_w + 26
    # --- specs table ---
    page.insert_textbox(fitz.Rect(MX, y, W-MX, y+20), "Технічні характеристики",
                        fontfile=ARIAL_BD, fontname="ab", fontsize=12, color=DARK)
    y += 24
    specs = {k: v for k, v in (p.get("specs") or {}).items() if k.lower() != "артикул" and str(v).strip()}
    rh = 22
    for i, (k, v) in enumerate(specs.items()):
        rr = fitz.Rect(MX, y, W-MX, y+rh)
        if i % 2 == 0:
            page.draw_rect(rr, color=None, fill=LIGHT)
        page.insert_textbox(fitz.Rect(MX+8, y+5, MX+250, y+rh), str(k),
                            fontfile=ARIAL, fontname="ar", fontsize=10, color=GRAY)
        page.insert_textbox(fitz.Rect(MX+255, y+5, W-MX-8, y+rh), str(v),
                            fontfile=ARIAL_BD, fontname="ab", fontsize=10, color=DARK)
        y += rh
    page.draw_rect(fitz.Rect(MX, y-rh*len(specs), W-MX, y), color=LINE, width=0.5)
    # --- footer ---
    page.draw_rect(fitz.Rect(0, H-40, W, H), color=None, fill=DARK)
    page.insert_textbox(fitz.Rect(MX, H-30, W-MX, H-10),
                        "termojet.com.ua    ·    +380 50 718 91 65    ·    termojet@sofievka.kiev.ua",
                        fontfile=ARIAL, fontname="ar", fontsize=9, color=(1,1,1), align=1)

made = []
for key, title, subtitle, match in SERIES:
    models = [p for p in pumps if match(p)]
    if not models: continue
    doc = fitz.open()
    for p in models:
        model_page(doc, p, f"{title} · {subtitle}")
    out = f"{OUTDIR}/brochure-{key}-ua.pdf"
    doc.save(out, deflate=True)
    doc.close()
    made.append((out, len(models)))
    print(f"OK {out} — {len(models)} модель(ей)")

print("Готово:", len(made), "брошур")
