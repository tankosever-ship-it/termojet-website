#!/usr/bin/env python3
"""
og-prays.py — картка попереднього перегляду для сторінки /prays.

Її бачить партнер, коли посилання вставляють у Viber, Telegram чи пошту.
Оновити дату в прайсі → перезапустити цей скрипт → закомітити public/og-prays.png.

    python3 scripts/og-prays.py "8 вересня 2026" 417

Шрифт: IBM Plex Sans. Archivo, яким набрано сайт, кирилиці НЕ має взагалі —
підпис нею просто не намалювався б (див. пам'ятку gotcha-archivo-no-cyrillic).
"""
import sys
from PIL import Image, ImageDraw, ImageFont

DATE = sys.argv[1] if len(sys.argv) > 1 else '8 вересня 2026'
COUNT = sys.argv[2] if len(sys.argv) > 2 else '417'

W, H = 1200, 630
BG, ACCENT, DIM = '#0D0D0D', '#FF5500', '#CC4400'
WHITE, GREY, MUTED = '#FFFFFF', '#CCCCCC', '#8A8A8A'
FONT = '/Users/pavelkucevich/CODE/pipelines/product-video/fonts/IBMPlexSans-var.ttf'

def f(size, weight='Regular'):
    ft = ImageFont.truetype(FONT, size)
    ft.set_variation_by_name(weight)
    return ft

im = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(im)

# Ліва помаранчева грань — той самий акцент, що на сайті
d.rectangle([0, 0, 10, H], fill=ACCENT)

# Стос смуг праворуч: натяк на рядки прайсу, без буквальної іконки таблиці
x0, y0 = 792, 150
for i, w in enumerate([300, 244, 276, 208, 300, 232, 264, 190]):
    y = y0 + i * 42
    d.rounded_rectangle([x0, y, x0 + w, y + 22], radius=11,
                        fill=ACCENT if i % 3 == 0 else '#1F1F1F')

# Логотип
try:
    logo = Image.open('public/logo-white.png').convert('RGBA')
    logo.thumbnail((420, 58), Image.LANCZOS)
    im.paste(logo, (72, 62), logo)
except Exception as e:
    d.text((72, 62), 'TERMOJET', font=f(44, 'Bold'), fill=WHITE)

# Надзаголовок
d.text((72, 208), 'НОВА РЕДАКЦІЯ', font=f(23, 'SemiBold'), fill=ACCENT)

# Заголовок
d.text((70, 248), 'Прайс-лист', font=f(108, 'Bold'), fill=WHITE)

# Дата дії
d.text((72, 388), f'Ціни діють з {DATE}', font=f(38, 'Medium'), fill=GREY)

# Лінійка і нижній рядок
d.rectangle([72, 470, 148, 474], fill=ACCENT)
d.text((72, 508), f'{COUNT} позицій · формат Excel', font=f(26), fill=MUTED)
d.text((72, 548), 'termojet.com.ua', font=f(26, 'Medium'), fill=WHITE)

im.save('public/og-prays.png', optimize=True)
print(f'public/og-prays.png — {W}×{H}, дата «{DATE}», позицій {COUNT}')
