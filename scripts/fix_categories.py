#!/usr/bin/env python3
"""
Fix product categories, names, and add missing products.
Run from project root: python3 scripts/fix_categories.py
"""
import re, json

PRODUCTS_FILE = 'src/data/products.js'

with open(PRODUCTS_FILE, 'r') as f:
    content = f.read()

# ── 1. Category moves via SKU → new categorySlug ──────────────────────────────

MOVES = {
    # НГ 61-82 series → termojet-mega
    '84030610':  'termojet-mega',
    '84030620':  'termojet-mega',
    '84131670':  'termojet-mega',
    '84130670':  'termojet-mega',
    '84030710':  'termojet-mega',
    '84030082':  'termojet-mega',   # НГ-82.250 Л (correct one)
    '84030720 L': 'termojet-mega',  # НГ-72.250 Л (misnamed as 82, fixed below)
    # Колектори 271-381 → termojet-mega
    '84040271':  'termojet-mega',
    '84040281250': 'termojet-mega',
    '84040371':  'termojet-mega',
    '84040381250': 'termojet-mega',
    # Гідрострілки Mega 31-34 → termojet-mega
    '84040031':  'termojet-mega',
    '84040032':  'termojet-mega',
    '84040033':  'termojet-mega',
    '84040034':  'termojet-mega',
    # НГ-36/37/38 → termojet-box
    '84130390':  'termojet-box',
    '84130370':  'termojet-box',
    '84142380':  'termojet-box',
    '84142380A': 'termojet-box',
    # Колектори в теплоізоляції (Mini/К-серія) → rozpodilchi-kolektory
    '84040291':  'rozpodilchi-kolektory',
    '84040211':  'rozpodilchi-kolektory',
    '84040391':  'rozpodilchi-kolektory',
    '84040311':  'rozpodilchi-kolektory',
    '84040491':  'rozpodilchi-kolektory',
    '84040492':  'rozpodilchi-kolektory',
    '84040591':  'rozpodilchi-kolektory',
    # Кабель живлення → nasosy
    '33250618':  'nasosy',
}

def replace_category(content, sku, new_cat):
    """Replace categorySlug for product with given sku."""
    # Find the product block containing this SKU
    pattern = r'("sku":\s*"' + re.escape(sku) + r'".*?"categorySlug":\s*")([^"]+)(")'
    def repl(m):
        if m.group(2) != new_cat:
            print(f'  SKU {sku}: {m.group(2)} → {new_cat}')
        return m.group(1) + new_cat + m.group(3)
    new_content = re.sub(pattern, repl, content, flags=re.DOTALL)
    if new_content == content:
        # Try reverse order (sku after categorySlug)
        pattern2 = r'("categorySlug":\s*")([^"]+)("(?:[^{]*)"sku":\s*"' + re.escape(sku) + r'")'
        new_content = re.sub(pattern2, lambda m: m.group(1) + new_cat + m.group(3), content, flags=re.DOTALL)
    return new_content

for sku, cat in MOVES.items():
    content = replace_category(content, sku, cat)

# ── 2. Fix НГ-72 name (was wrongly named НГ-82) ──────────────────────────────
print('\nFix НГ-72 name:')
old = '"НГ-82.250 Насосна група зі змішувачем 2 1/2\\" ВР в теплоізоляції без насоса"'
new = '"НГ-72.250 Л Насосна група зі змішувачем 2\\" ВР в теплоізоляції без насоса"'
if old in content:
    content = content.replace(old, new, 1)
    print('  НГ-82.250 (SKU 84030720 L) → renamed to НГ-72.250 Л')
else:
    print('  WARNING: НГ-72 rename target not found')

# Fix НГ-82 SKU: 84030082 → correct, but add specs/image
old_ng82_image = '"image": "",'
ng82_block_start = '"id": "excel_84030082"'
# Only fix the image/desc for НГ-82
BASE = 'https://termojet.com.ua/wp-content/uploads'
ng82_image_url = f'{BASE}/2023/10/6272.png'
content = content.replace(
    '"id": "excel_84030082",\n    "name": "НГ-82.250 Л Насосна група зі змішувачем 2 1/2\\" ВР в теплоізоляції без насоса",\n    "slug": "nh-82-250-l-nasosna-hrupa-zi-zmishuvachem-2-1-2-vr-v-teploizolyatsiyi-bez-nasosa",\n    "sku": "84030082",\n    "price": "58381.3",\n    "currency": "UAH",\n    "categorySlug": "termojet-mega",\n    "image": "",\n    "images": [],\n    "shortDesc": "",\n    "description": "",\n    "specs": {}',
    f'"id": "excel_84030082",\n    "name": "НГ-82.250 Л Насосна група зі змішувачем 2 1/2\\" ВР в теплоізоляції без насоса",\n    "slug": "nh-82-250-l-nasosna-hrupa-zi-zmishuvachem-2-1-2-vr-v-teploizolyatsiyi-bez-nasosa",\n    "sku": "84030082",\n    "price": "58381.3",\n    "currency": "UAH",\n    "categorySlug": "termojet-mega",\n    "image": "{ng82_image_url}",\n    "images": ["{ng82_image_url}"],\n    "shortDesc": "Насосна група зі змішувачем ДУ65 для модульної системи серії Termojet Mega. До 350 кВт при ΔT=20°C.",\n    "description": "Насосна група зі змішувальним вузлом НГ-82 для модульної системи серії Termojet Mega. Підключення ДУ65. Для компенсації висоти насосної бази використовуються спеціальні проставки. Комплектація: термометр, запірний вентиль подачі та зворотної лінії, зворотний клапан, проставки, затискні з\'єднання, електричний сервопривід 220В.",\n    "specs": {{\n      "Артикул": "84030082",\n      "DN": "65",\n      "Qmax: △Т=10°С": "180 кВт",\n      "Qmax: △Т=20°С": "350 кВт",\n      "KVS": "40 м³/год",\n      "Висота": "873 мм",\n      "Ширина": "496 мм"\n    }}'
)
print('  НГ-82 specs/image filled')

# ── 3. New products to append ─────────────────────────────────────────────────
BASE = 'https://termojet.com.ua/wp-content/uploads'

NEW_PRODUCTS = [
    # НГ-81
    {
        "id": "new_84030810",
        "name": "НГ-81 Насосна група без змішувача ДУ65 в теплоізоляції Termojet Mega",
        "slug": "ng-81-nasosna-hrupa-bez-zmishuvача-du65-termojet-mega",
        "sku": "84030810",
        "price": "",
        "currency": "UAH",
        "categorySlug": "termojet-mega",
        "image": f"{BASE}/2023/10/6272.png",
        "images": [f"{BASE}/2023/10/6272.png"],
        "shortDesc": "Насосна група без змішувача ДУ65 для модульної системи серії Termojet Mega. До 220 кВт при ΔT=20°C.",
        "description": "Насосна група без змішувального вузла НГ-81 для модульної системи серії Termojet Mega. Підключення ДУ65 (сумісна з насосами ДУ 40/50/65, довжина 220/250/280 мм). Для компенсації висоти насосної бази використовуються спеціальні проставки. Комплектація: термометр, запірний вентиль зворотної лінії, запірний вентиль подачі, зворотний клапан, проставка для насоса, затискні з'єднання.",
        "specs": {
            "Артикул": "84030810",
            "DN": "65",
            "Qmax: △Т=10°С": "120 кВт",
            "Qmax: △Т=20°С": "220 кВт",
            "KVS": "40 м³/год",
            "Висота": "873 мм",
            "Ширина": "496 мм"
        },
        "inStock": True
    },
    # Каналізаційні установки WT400-A/B/C
    {
        "id": "new_WT400A",
        "name": "Каналізаційна установка Termojet WT 400-A (4 в 1, для унітазу)",
        "slug": "kanalizatsiyna-ustanovka-termojet-wt-400-a",
        "sku": "WT400A",
        "price": "252.82",
        "currency": "EUR",
        "categorySlug": "nasosy",
        "image": f"{BASE}/2025/04/spe12-1.4.png",
        "images": [f"{BASE}/2025/04/spe12-1.4.png"],
        "shortDesc": "Каналізаційна установка 4 в 1 для повноцінної ванної кімнати (з підвісним унітазом). 400 Вт, 116 л/хв, горизонтальна подача 80 м.",
        "description": "Каналізаційна установка Termojet WT400-A — модель «4 в 1» для повноцінної ванної кімнати з підвісним унітазом. Безшумна робота, сервісна панель. Підходить для систем з температурою води 1–75°C.",
        "specs": {
            "Потужність": "400 Вт",
            "Живлення": "220–240В / 50Гц",
            "Продуктивність": "116 л/хв",
            "Температура води": "1–75°C",
            "Горизонтальна подача": "80 м",
            "Вертикальна подача": "8 м",
            "Вхід": "1×100 мм / 3×40 мм",
            "Вихід": "23/28/32/44 мм",
            "Клас захисту": "IPX4"
        },
        "inStock": True
    },
    {
        "id": "new_WT400B",
        "name": "Каналізаційна установка Termojet WT 400-B (4 в 1, підвісний унітаз)",
        "slug": "kanalizatsiyna-ustanovka-termojet-wt-400-b",
        "sku": "WT400B",
        "price": "252.82",
        "currency": "EUR",
        "categorySlug": "nasosy",
        "image": f"{BASE}/2025/04/spe12-1.4.png",
        "images": [f"{BASE}/2025/04/spe12-1.4.png"],
        "shortDesc": "Каналізаційна установка 4 в 1 для підвісних унітазів. 400 Вт, 116 л/хв, горизонтальна подача 80 м.",
        "description": "Каналізаційна установка Termojet WT400-B — модель «4 в 1» для підвісних унітазів. Безшумна, з сервісною панеллю. Підходить для температури 1–75°C.",
        "specs": {
            "Потужність": "400 Вт",
            "Живлення": "220–240В / 50Гц",
            "Продуктивність": "116 л/хв",
            "Температура води": "1–75°C",
            "Горизонтальна подача": "80 м",
            "Вертикальна подача": "8 м",
            "Вхід": "1×100 мм / 3×40 мм",
            "Вихід": "23/28/32/44 мм",
            "Клас захисту": "IPX4"
        },
        "inStock": True
    },
    {
        "id": "new_WT400C",
        "name": "Каналізаційна установка Termojet WT 400-C (3 в 1, без унітазу)",
        "slug": "kanalizatsiyna-ustanovka-termojet-wt-400-c",
        "sku": "WT400C",
        "price": "252.82",
        "currency": "EUR",
        "categorySlug": "nasosy",
        "image": f"{BASE}/2025/04/spe12-1.4.png",
        "images": [f"{BASE}/2025/04/spe12-1.4.png"],
        "shortDesc": "Каналізаційна установка 3 в 1 без розʼєму для унітазу. Для пральних машин, ванн, душових. 400 Вт, 125 л/хв.",
        "description": "Каналізаційна установка Termojet WT400-C — модель «3 в 1» без роз'єму для унітазу. Ідеальна для пральних машин, ванн та душових кабін. Безшумна, з сервісною панеллю.",
        "specs": {
            "Потужність": "400 Вт",
            "Живлення": "220–240В / 50Гц",
            "Продуктивність": "125 л/хв",
            "Температура води": "1–75°C",
            "Горизонтальна подача": "80 м",
            "Вертикальна подача": "8 м",
            "Вхід": "3×40 мм",
            "Вихід": "23/28/32/44 мм",
            "Клас захисту": "IPX4"
        },
        "inStock": True
    },
    # Балансувальні клапани SBV
    {
        "id": "new_SBV012",
        "name": "Статичний балансувальний клапан Termojet SBV DN15 (Rp 1/2\")",
        "slug": "statychnyi-balansuvalny-klapan-termojet-sbv-dn15",
        "sku": "SBV-012",
        "price": "",
        "currency": "EUR",
        "categorySlug": "balansuval-klapany",
        "image": f"{BASE}/2023/11/krn-5001-1-1000x1000-1-800x800.jpg",
        "images": [f"{BASE}/2023/11/krn-5001-1-1000x1000-1-800x800.jpg"],
        "shortDesc": "Статичний балансувальний клапан DN15 для систем опалення та охолодження. Функції: балансування, налаштування, вимірювання, перекривання.",
        "description": "Статичний балансувальний клапан SBV-012 Termojet DN15 призначений для балансування систем опалення, охолодження та водопостачання. Виконує функції балансування, попереднього налаштування, вимірювання витрат та перекривання. Матеріал: латунь CW617N, ущільнення EPDM. KVS (4 оберти): 2,56 м³/год.",
        "specs": {
            "DN": "15",
            "Підключення": "Rp 1/2\"",
            "KVS (4 оберти)": "2,56 м³/год",
            "PN": "20 бар",
            "L": "90 мм",
            "H": "98 мм",
            "Вага": "580 г",
            "Макс. температура": "120°C",
            "Матеріал": "Латунь CW617N"
        },
        "inStock": True
    },
    {
        "id": "new_SBV034",
        "name": "Статичний балансувальний клапан Termojet SBV DN20 (Rp 3/4\")",
        "slug": "statychnyi-balansuvalny-klapan-termojet-sbv-dn20",
        "sku": "SBV-034",
        "price": "",
        "currency": "EUR",
        "categorySlug": "balansuval-klapany",
        "image": f"{BASE}/2023/11/krn-5001-1-1000x1000-1-800x800.jpg",
        "images": [f"{BASE}/2023/11/krn-5001-1-1000x1000-1-800x800.jpg"],
        "shortDesc": "Статичний балансувальний клапан DN20 для систем опалення та охолодження. KVS 5,39 м³/год.",
        "description": "Статичний балансувальний клапан SBV-034 Termojet DN20 для балансування систем опалення та охолодження. KVS (4 оберти): 5,39 м³/год. Матеріал: латунь CW617N, ущільнення EPDM.",
        "specs": {
            "DN": "20",
            "Підключення": "Rp 3/4\"",
            "KVS (4 оберти)": "5,39 м³/год",
            "PN": "20 бар",
            "L": "97 мм",
            "H": "98 мм",
            "Вага": "680 г",
            "Макс. температура": "120°C",
            "Матеріал": "Латунь CW617N"
        },
        "inStock": True
    },
    {
        "id": "new_SBV100",
        "name": "Статичний балансувальний клапан Termojet SBV DN25 (Rp 1\")",
        "slug": "statychnyi-balansuvalny-klapan-termojet-sbv-dn25",
        "sku": "SBV-100",
        "price": "",
        "currency": "EUR",
        "categorySlug": "balansuval-klapany",
        "image": f"{BASE}/2023/11/krn-5001-1-1000x1000-1-800x800.jpg",
        "images": [f"{BASE}/2023/11/krn-5001-1-1000x1000-1-800x800.jpg"],
        "shortDesc": "Статичний балансувальний клапан DN25 для систем опалення та охолодження. KVS 8,59 м³/год.",
        "description": "Статичний балансувальний клапан SBV-100 Termojet DN25 для балансування систем опалення та охолодження. KVS (4 оберти): 8,59 м³/год. Матеріал: латунь CW617N, ущільнення EPDM.",
        "specs": {
            "DN": "25",
            "Підключення": "Rp 1\"",
            "KVS (4 оберти)": "8,59 м³/год",
            "PN": "20 бар",
            "L": "100 мм",
            "H": "101 мм",
            "Вага": "780 г",
            "Макс. температура": "120°C",
            "Матеріал": "Латунь CW617N"
        },
        "inStock": True
    },
]

# Шафи колекторні
CABINET_IMAGE = f"{BASE}/2024/04/1713881601309906-800x800.jpg"

internal_cabinets = [
    ("TJ000200", "00", "2-4", "335×575×110", "34.96"),
    ("TJ000201", "01", "4-6", "435×575×110", "40.41"),
    ("TJ000202", "02", "6-8", "565×575×110", "47.62"),
    ("TJ000203", "03", "8-10", "715×575×110", "56.20"),
    ("TJ000204", "04", "10-12", "795×575×110", "60.72"),
    ("TJ000205", "05", "12-14", "965×575×110", "68.52"),
    ("TJ000206", "06", "14-16", "1130×575×110", "77.92"),
]
external_cabinets = [
    ("TJ002000", "00", "2-4", "335×600×125", "35.97"),
    ("TJ002001", "01", "4-6", "435×600×125", "40.90"),
    ("TJ002002", "02", "6-8", "565×600×125", "46.39"),
    ("TJ002003", "03", "8-10", "715×600×125", "56.83"),
    ("TJ002004", "04", "10-12", "795×600×125", "62.54"),
    ("TJ002005", "05", "12-14", "965×600×125", "74.02"),
    ("TJ002006", "06", "14-16", "1130×600×125", "81.67"),
]

for sku, num, outlets, dims, price in internal_cabinets:
    w, h, d = dims.split('×')
    NEW_PRODUCTS.append({
        "id": f"new_{sku}",
        "name": f"Шафа колекторна внутрішня TERMOJET №{num} ({outlets} виходів, {dims} мм)",
        "slug": f"shafa-kolektorna-vnutrishnia-termojet-{num}",
        "sku": sku,
        "price": price,
        "currency": "EUR",
        "categorySlug": "kolektory-pidloha",
        "image": CABINET_IMAGE,
        "images": [CABINET_IMAGE],
        "shortDesc": f"Шафа колекторна внутрішня для {outlets} виходів. Розміри: {dims} мм.",
        "description": f"Шафа колекторна внутрішня TERMOJET №{num} призначена для прихованого монтажу колектора теплої підлоги на {outlets} виходів. Виготовлена з оцинкованої сталі з декоративними дверцятами.",
        "specs": {
            "Тип": "Внутрішня (вбудована)",
            "Кількість виходів": outlets,
            "Ширина": f"{w} мм",
            "Висота": f"{h} мм",
            "Глибина": f"{d} мм"
        },
        "inStock": True
    })

for sku, num, outlets, dims, price in external_cabinets:
    w, h, d = dims.split('×')
    NEW_PRODUCTS.append({
        "id": f"new_{sku}",
        "name": f"Шафа колекторна зовнішня TERMOJET №{num} ({outlets} виходів, {dims} мм)",
        "slug": f"shafa-kolektorna-zovnishnia-termojet-{num}",
        "sku": sku,
        "price": price,
        "currency": "EUR",
        "categorySlug": "kolektory-pidloha",
        "image": CABINET_IMAGE,
        "images": [CABINET_IMAGE],
        "shortDesc": f"Шафа колекторна зовнішня для {outlets} виходів. Розміри: {dims} мм.",
        "description": f"Шафа колекторна зовнішня TERMOJET №{num} для накладного монтажу колектора теплої підлоги на {outlets} виходів. Виготовлена з оцинкованої сталі з декоративними дверцятами.",
        "specs": {
            "Тип": "Зовнішня (накладна)",
            "Кількість виходів": outlets,
            "Ширина": f"{w} мм",
            "Висота": f"{h} мм",
            "Глибина": f"{d} мм"
        },
        "inStock": True
    })

# ── 4. Append new products before closing bracket ─────────────────────────────
new_entries = ''
for p in NEW_PRODUCTS:
    specs_str = json.dumps(p['specs'], ensure_ascii=False, indent=6)
    images_str = json.dumps(p['images'], ensure_ascii=False)
    entry = f'''  {{
    "id": "{p['id']}",
    "name": {json.dumps(p['name'], ensure_ascii=False)},
    "slug": "{p['slug']}",
    "sku": "{p['sku']}",
    "price": "{p['price']}",
    "currency": "{p['currency']}",
    "categorySlug": "{p['categorySlug']}",
    "image": "{p['image']}",
    "images": {images_str},
    "shortDesc": {json.dumps(p['shortDesc'], ensure_ascii=False)},
    "description": {json.dumps(p['description'], ensure_ascii=False)},
    "specs": {specs_str},
    "inStock": {str(p['inStock']).lower()}
  }}'''
    new_entries += ',\n' + entry

# Insert before the closing ]
content = content.rstrip()
if content.endswith(']'):
    content = content[:-1] + new_entries + '\n]'
elif content.endswith('];'):
    content = content[:-2] + new_entries + '\n];'

with open(PRODUCTS_FILE, 'w') as f:
    f.write(content)

print(f'\n✅ Done! Added {len(NEW_PRODUCTS)} new products, moved {len(MOVES)} products to new categories.')
print('New products:')
for p in NEW_PRODUCTS:
    print(f'  + {p["sku"]} → {p["categorySlug"]}')
