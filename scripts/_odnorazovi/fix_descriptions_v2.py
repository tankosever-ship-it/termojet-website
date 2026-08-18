#!/usr/bin/env python3
"""
Fix product descriptions in products-enriched-v2.js v2:
- Better text extraction that skips payment/delivery boilerplate
- Handle remaining issues from v1
"""

import re
import json
import time
import html
import urllib.request

FILE_PATH = "/home/coder/projects/termojet-website-redesign/src/data/products-enriched-v2.js"

# Boilerplate text patterns to skip
BOILERPLATE_PATTERNS = [
    r'Готівка \(РРО\)',
    r'Безготівкова на р/р',
    r'Самовивіз',
    r'Нова пошта',
    r'Об.єктова',
    r'ФОП',
    r'ТОВ з ПДВ',
]


def fetch_page(url):
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/91.0'
        })
        with urllib.request.urlopen(req, timeout=20) as resp:
            return resp.read().decode('utf-8', errors='replace')
    except Exception as e:
        print(f"  ERROR fetching {url}: {e}")
        return None


def clean_text(text):
    text = html.unescape(text)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = text.replace('&nbsp;', ' ')
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def is_boilerplate(text):
    for pattern in BOILERPLATE_PATTERNS:
        if re.search(pattern, text):
            return True
    return False


def extract_meta_description(html_content):
    m = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']{30,})["\']', html_content, re.IGNORECASE)
    if m:
        cleaned = clean_text(m.group(1))
        # Remove leading "Опис " if present
        cleaned = re.sub(r'^Опис\s+', '', cleaned)
        return cleaned
    return None


def extract_youtube_url(html_content):
    patterns = [
        r'https://youtu\.be/[\w\-\?&=]+',
        r'https://www\.youtube\.com/embed/[\w\-\?&=]+',
        r'https://www\.youtube\.com/watch\?v=[\w\-\?&=]+',
    ]
    for pattern in patterns:
        m = re.search(pattern, html_content)
        if m:
            url = m.group(0).strip()
            if 'embed/' in url:
                vid_id = re.search(r'embed/([\w\-]+)', url)
                if vid_id:
                    return f"https://youtu.be/{vid_id.group(1)}"
            return url
    return None


def extract_product_description(html_content):
    """Extract actual product description from termojet pages.

    Strategies:
    1. .woocommerce-product-details__short-description
    2. #tab-description content (excluding payment sections)
    3. elementor-widget-text-editor blocks that aren't boilerplate
    4. meta description as last resort
    """

    texts = []

    # Strategy 1: Short description div
    short_desc_m = re.search(
        r'<div[^>]*class=["\'][^"\']*woocommerce-product-details__short-description[^"\']*["\'][^>]*>(.*?)</div>',
        html_content, re.DOTALL | re.IGNORECASE
    )
    if short_desc_m:
        block = short_desc_m.group(1)
        if 'youtu' not in block.lower():
            paras = re.findall(r'<p[^>]*>(.*?)</p>', block, re.DOTALL | re.IGNORECASE)
            for p in paras:
                cleaned = clean_text(p)
                if cleaned and len(cleaned) > 30 and not is_boilerplate(cleaned):
                    texts.append(cleaned)
            # Also try direct text
            if not texts:
                cleaned = clean_text(block)
                if cleaned and len(cleaned) > 30 and not is_boilerplate(cleaned):
                    texts.append(cleaned)

    # Strategy 2: Tab description
    if not texts:
        tab_desc_m = re.search(
            r'<div[^>]*id=["\']tab-description["\'][^>]*>(.*?)<div[^>]*id=["\']tab-',
            html_content, re.DOTALL | re.IGNORECASE
        )
        if tab_desc_m:
            block = tab_desc_m.group(1)
            paras = re.findall(r'<p[^>]*>(.*?)</p>', block, re.DOTALL | re.IGNORECASE)
            for p in paras:
                cleaned = clean_text(p)
                if cleaned and len(cleaned) > 30 and not is_boilerplate(cleaned) and 'youtu' not in cleaned:
                    texts.append(cleaned)

    # Strategy 3: elementor-text-editor blocks - but more carefully
    # Look for blocks that come before the payment section
    if not texts:
        # Find all text editor divs
        editor_pattern = r'<div[^>]*class=["\'][^"\']*elementor-widget-text-editor[^"\']*["\'][^>]*>(.*?)</div>\s*</div>\s*</div>'
        blocks = re.findall(editor_pattern, html_content, re.DOTALL | re.IGNORECASE)

        for block in blocks:
            if 'youtu' in block.lower() or 'iframe' in block.lower():
                continue
            if is_boilerplate(block):
                continue

            paras = re.findall(r'<p[^>]*>(.*?)</p>', block, re.DOTALL | re.IGNORECASE)
            for p in paras:
                cleaned = clean_text(p)
                if cleaned and len(cleaned) > 30 and not is_boilerplate(cleaned):
                    texts.append(cleaned)

    # Strategy 4: Look for description in product-description section specifically
    if not texts:
        # Find the Elementor section that contains product info (before checkout widget)
        # Look for first substantial text near the product title
        entry_summary = re.search(
            r'<div[^>]*class=["\'][^"\']*entry-summary[^"\']*["\'][^>]*>(.*?)</div>\s*</section>',
            html_content, re.DOTALL | re.IGNORECASE
        )
        if entry_summary:
            block = entry_summary.group(1)
            paras = re.findall(r'<p[^>]*>(.*?)</p>', block, re.DOTALL | re.IGNORECASE)
            for p in paras:
                cleaned = clean_text(p)
                if cleaned and len(cleaned) > 30 and not is_boilerplate(cleaned):
                    texts.append(cleaned)

    return texts


def extract_specs_from_table(html_content):
    """Extract specs from tables, filtering out navigation/boilerplate tables."""
    specs = {}

    # Find tablepress tables specifically
    tables = re.findall(r'<table[^>]*class=["\'][^"\']*tablepress[^"\']*["\'][^>]*>(.*?)</table>',
                        html_content, re.DOTALL | re.IGNORECASE)

    if not tables:
        # Try any table
        tables = re.findall(r'<table[^>]*>(.*?)</table>', html_content, re.DOTALL | re.IGNORECASE)

    for table in tables[:3]:  # Only first 3 tables
        rows = re.findall(r'<tr[^>]*>(.*?)</tr>', table, re.DOTALL | re.IGNORECASE)
        for row in rows:
            cells = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', row, re.DOTALL | re.IGNORECASE)
            if len(cells) >= 2:
                key = clean_text(cells[0])
                val = clean_text(cells[1])
                if key and val and len(key) < 80 and len(val) < 200:
                    # Skip if key looks like navigation/boilerplate
                    if not is_boilerplate(key) and not is_boilerplate(val):
                        specs[key] = val

    return specs


def scrape_product_page(slug):
    url = f"https://termojet.com.ua/product/{slug}/"
    print(f"\nFetching: {url}")
    html_content = fetch_page(url)
    if not html_content:
        return None

    result = {
        'description': None,
        'video': None,
        'specs': {},
        'meta_description': None,
    }

    result['video'] = extract_youtube_url(html_content)
    if result['video']:
        print(f"  Video: {result['video']}")

    result['meta_description'] = extract_meta_description(html_content)

    text_blocks = extract_product_description(html_content)

    if text_blocks:
        result['description'] = ' '.join(text_blocks)
        print(f"  Description ({len(text_blocks)} blocks): {result['description'][:120]}")
    elif result['meta_description'] and not is_boilerplate(result['meta_description']):
        result['description'] = result['meta_description']
        print(f"  Using meta: {result['description'][:120]}")
    else:
        print(f"  No description found!")
        if result['meta_description']:
            print(f"  Meta was: {result['meta_description'][:120]}")

    result['specs'] = extract_specs_from_table(html_content)
    if result['specs']:
        print(f"  Specs: {list(result['specs'].items())[:3]}")

    return result


def parse_js_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.search(r'export const PRODUCTS = (\[.*\]);?\s*$', content, re.DOTALL)
    if not match:
        match = re.search(r'export const PRODUCTS = (\[.*\])', content, re.DOTALL)

    if not match:
        raise ValueError("Could not find PRODUCTS array in file")

    json_str = match.group(1)
    products = json.loads(json_str)
    return products


def write_js_file(file_path, products):
    json_str = json.dumps(products, ensure_ascii=False, indent=2)
    output = f"// Auto-generated — enriched with data scraped from termojet.com.ua\n// {len(products)} products\nexport const PRODUCTS = {json_str};\n"
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(output)
    print(f"\nWrote {len(products)} products to {file_path}")


def fix_description_text(text):
    if not text:
        return text
    cleaned = html.unescape(text)
    cleaned = re.sub(r'<[^>]+>', ' ', cleaned)
    cleaned = cleaned.replace('&nbsp;', ' ')
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned


def is_youtube_url(text):
    if not text:
        return False
    text = text.strip()
    return bool(re.match(r'https?://youtu', text) or re.match(r'https?://www\.youtube\.com', text))


def is_boilerplate_desc(text):
    """Check if the description is the payment/delivery boilerplate."""
    if not text:
        return True
    return is_boilerplate(text)


# Generate fallback descriptions based on product type
FALLBACK_DESCRIPTIONS = {
    'silownik': "Сервопривід AQUA 401 від Termojet — електричний виконавчий механізм для керування триходовими або чотириходовими клапанами в системах опалення. Час спрацювання 60 секунд, живлення 230V AC.",
    'elektropryvid-z-trypozyczijnym': "Електричний привід з трипозиційним керуванням TERMOJET 401N — виконавчий механізм для роботи з триходовими та чотириходовими поворотними клапанами в системах опалення та гарячого водопостачання. Живлення 230V AC, час роботи 120 секунд.",
    'elektropryvid-termojet-411': "Електричний привід TERMOJET 411 з аналоговим сигналом керування 0-10V — виконавчий механізм для точного позиціонування клапанів у системах опалення та кліматизації. Живлення 24V AC/DC, час переходу 60-120 секунд, крутний момент 6 Нм.",
    'elektropryvid-keruvannya-postijnoyu-temperaturoyu-pro400': None,  # Will be filled from scraping
    '3-hodovyj-zonalnyj-klapan': "3-ходовий зональний кран 1\" з приводом 230V AC від Termojet — електромеханічний клапан для зонального регулювання систем опалення. Час спрацювання 8 секунд, крутний момент 6,5 Нм, підходить для систем теплої підлоги та радіаторного опалення.",
    'tmv121': "Термостатичний 3-ходовий змішувальний кран TERMOJET TMV121 — підтримує постійну задану температуру в системах підлогового опалення та ГВП. Діапазон змішування 20-43°C.",
    'tmv122': "Термостатичний 3-ходовий змішувальний кран TERMOJET TMV122 — підтримує постійну задану температуру в системах підлогового опалення та ГВП. Діапазон температур 35-60°C.",
    'tmv131': "Термостатичний 3-ходовий змішувальний кран TERMOJET TMV131 — підтримує постійну задану температуру в системах підлогового опалення та ГВП. Діапазон температур 20-43°C, різьба G 3/4\".",
    'tmv132': "Термостатичний 3-ходовий змішувальний кран TERMOJET TMV132 — підтримує постійну задану температуру в системах підлогового опалення та ГВП. Діапазон температур 35-60°C, різьба G 3/4\".",
    'tmv231': "Термостатичний 3-ходовий змішувальний кран TERMOJET TMV231 — підтримує постійну задану температуру в системах підлогового опалення та ГВП. Діапазон температур 20-43°C, різьба G 1\".",
    'tmv232': "Термостатичний 3-ходовий змішувальний кран TERMOJET TMV232 — підтримує постійну задану температуру в системах підлогового опалення та ГВП. Діапазон температур 35-60°C, різьба G 1\".",
}


def get_fallback_description(slug, name):
    """Get fallback description based on slug pattern."""
    for key, desc in FALLBACK_DESCRIPTIONS.items():
        if key in slug:
            if desc:
                return desc
    # Generic fallback
    return f"{name} від виробника Termojet — надійний компонент для систем опалення та гарячого водопостачання."


def main():
    print("Loading products file...")
    products = parse_js_file(FILE_PATH)
    print(f"Loaded {len(products)} products")

    # Find products that still need fixing (YouTube URL or boilerplate as description)
    slugs_to_fix = []
    for p in products:
        desc = p.get('description', '')
        if is_youtube_url(desc) or is_boilerplate_desc(desc):
            slugs_to_fix.append(p['slug'])

    print(f"\nProducts still needing description fix: {len(slugs_to_fix)}")
    for s in slugs_to_fix:
        print(f"  - {s}")

    # Scrape pages for remaining products
    scraped_data = {}
    for slug in slugs_to_fix:
        data = scrape_product_page(slug)
        if data:
            scraped_data[slug] = data
        time.sleep(0.8)

    # Update products
    fixed_count = 0
    html_fixed_count = 0

    for p in products:
        slug = p['slug']
        desc = p.get('description', '')

        # Fix YouTube URL descriptions
        if is_youtube_url(desc) or is_boilerplate_desc(desc):
            # Move YouTube URL to video field
            if is_youtube_url(desc):
                yt_match = re.search(r'https?://youtu\S+', desc)
                if yt_match and not p.get('video'):
                    p['video'] = yt_match.group(0).strip()

            new_desc = None
            if slug in scraped_data:
                data = scraped_data[slug]
                scraped_desc = data.get('description', '')

                if data.get('video') and not p.get('video'):
                    p['video'] = data['video']

                if data.get('specs') and len(data['specs']) > len(p.get('specs', {})):
                    p['specs'] = data['specs']

                if scraped_desc and not is_youtube_url(scraped_desc) and not is_boilerplate(scraped_desc):
                    new_desc = scraped_desc

            if not new_desc:
                new_desc = get_fallback_description(slug, p.get('name', ''))

            old_desc = desc
            p['description'] = new_desc
            print(f"\n✓ [{slug}]:")
            print(f"  OLD: {old_desc[:60]}")
            print(f"  NEW: {new_desc[:100]}")
            fixed_count += 1

        # Fix HTML entities in all descriptions
        current_desc = p.get('description', '')
        if current_desc:
            fixed = fix_description_text(current_desc)
            if fixed != current_desc:
                p['description'] = fixed
                html_fixed_count += 1

        # Fix shortDesc too
        short = p.get('shortDesc', '')
        if short:
            fixed_short = fix_description_text(short)
            if fixed_short != short:
                p['shortDesc'] = fixed_short

    print(f"\n{'='*60}")
    print(f"Fixed {fixed_count} bad descriptions")
    print(f"Cleaned {html_fixed_count} HTML entities")

    write_js_file(FILE_PATH, products)

    video_count = sum(1 for p in products if p.get('video'))
    print(f"Products with video field: {video_count}")

    # Print final state of fixed products
    print("\n--- FINAL DESCRIPTIONS FOR FIXED PRODUCTS ---")
    for p in products:
        if p['slug'] in slugs_to_fix:
            print(f"\n[{p['slug']}]")
            print(f"  description: {p.get('description', '')[:150]}")
            print(f"  video: {p.get('video', 'none')}")


if __name__ == '__main__':
    main()
