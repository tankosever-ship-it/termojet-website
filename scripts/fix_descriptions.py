#!/usr/bin/env python3
"""
Fix product descriptions in products-enriched-v2.js:
- Replace YouTube URL descriptions with real text from termojet.com.ua
- Move YouTube URLs to a "video" field
- Strip &nbsp; and HTML tags from all descriptions
"""

import re
import json
import time
import html
import urllib.request
from html.parser import HTMLParser

SLUGS_TO_FIX = [
    "elektropryvid-keruvannya-postijnoyu-temperaturoyu-pro400",
    "silownik-termojet-aqua401-60-sek",
    "termostatychnyj-trohhodovyj-zmishuvalnyj-kran-termojet-tmv131-20-43-c",
    "termostatychnyj-trohhodovyj-zmishuvalnyj-kran-termojet-tmv121-20-43-c",
    "termostatychnyj-trohhodovyj-zmishuvalnyj-kran-termojet-tmv132-35-60-c",
    "termostatychnyj-trohhodovyj-zmishuvalnyj-kran-termojet-tmv231-20-43-c",
    "termostatychnyj-trohhodovyj-zmishuvalnyj-kran-termojet-tmv232-35-60-c",
    "termostatychnyj-trohhodovyj-zmishuvalnyj-kran-termojet-tmv122-35-60-c",
    "3-hodovyj-zonalnyj-klapan-1-z-pryvodom-230v-ac-8s-60-5nm-2",
    "elektropryvid-z-trypozyczijnym-upravlinnyam-termojet-401n-230-v-120-sek-siryj",
    "elektropryvid-termojet-411-24v-ac-dc-02-10v-60s-120s-90-6-nm",
]

FILE_PATH = "/home/coder/projects/termojet-website-redesign/src/data/products-enriched-v2.js"


class SimpleHTMLParser(HTMLParser):
    """Extract text from HTML, skipping script/style tags."""
    def __init__(self):
        super().__init__()
        self.skip = False
        self.texts = []
        self.skip_tags = {'script', 'style', 'iframe', 'noscript'}

    def handle_starttag(self, tag, attrs):
        if tag in self.skip_tags:
            self.skip = True

    def handle_endtag(self, tag):
        if tag in self.skip_tags:
            self.skip = False

    def handle_data(self, data):
        if not self.skip:
            text = data.strip()
            if text:
                self.texts.append(text)

    def get_text(self):
        return ' '.join(self.texts)


def fetch_page(url):
    """Fetch a URL and return HTML content."""
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        })
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.read().decode('utf-8', errors='replace')
    except Exception as e:
        print(f"  ERROR fetching {url}: {e}")
        return None


def extract_meta_description(html_content):
    """Extract <meta name="description" content="...">"""
    m = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']', html_content, re.IGNORECASE)
    if m:
        return clean_text(m.group(1))
    return None


def extract_youtube_url(html_content):
    """Find YouTube URLs in the page."""
    # Look for youtube embeds or links
    patterns = [
        r'https://youtu\.be/[\w\-\?&=]+',
        r'https://www\.youtube\.com/embed/[\w\-\?&=]+',
        r'https://www\.youtube\.com/watch\?v=[\w\-\?&=]+',
    ]
    for pattern in patterns:
        m = re.search(pattern, html_content)
        if m:
            url = m.group(0)
            # Convert embed to youtu.be short form
            if 'embed/' in url:
                vid_id = re.search(r'embed/([\w\-]+)', url)
                if vid_id:
                    return f"https://youtu.be/{vid_id.group(1)}"
            return url
    return None


def clean_text(text):
    """Remove HTML entities and tags from text."""
    # Decode HTML entities
    text = html.unescape(text)
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Replace &nbsp; literally (in case not decoded)
    text = text.replace('&nbsp;', ' ')
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def extract_text_blocks(html_content):
    """Extract text content from relevant sections of the page."""
    texts = []

    # 1. Try .elementor-widget-text-editor paragraphs
    text_editor_blocks = re.findall(
        r'<div[^>]*class=["\'][^"\']*elementor-widget-text-editor[^"\']*["\'][^>]*>(.*?)</div>\s*</div>',
        html_content, re.DOTALL | re.IGNORECASE
    )
    for block in text_editor_blocks:
        # Skip if contains youtube
        if 'youtu' in block.lower() or 'iframe' in block.lower():
            continue
        # Extract paragraphs
        paras = re.findall(r'<p[^>]*>(.*?)</p>', block, re.DOTALL | re.IGNORECASE)
        for p in paras:
            cleaned = clean_text(p)
            if cleaned and len(cleaned) > 20:
                texts.append(cleaned)

    # 2. Try .woocommerce-product-details__short-description
    short_desc_m = re.search(
        r'<div[^>]*class=["\'][^"\']*woocommerce-product-details__short-description[^"\']*["\'][^>]*>(.*?)</div>',
        html_content, re.DOTALL | re.IGNORECASE
    )
    if short_desc_m:
        cleaned = clean_text(short_desc_m.group(1))
        if cleaned and len(cleaned) > 20:
            texts.append(cleaned)

    # 3. Try entry-summary or product description tab
    desc_tab_m = re.search(
        r'<div[^>]*id=["\']tab-description["\'][^>]*>(.*?)</div>\s*</div>',
        html_content, re.DOTALL | re.IGNORECASE
    )
    if desc_tab_m:
        block = desc_tab_m.group(1)
        if 'youtu' not in block.lower():
            paras = re.findall(r'<p[^>]*>(.*?)</p>', block, re.DOTALL | re.IGNORECASE)
            for p in paras:
                cleaned = clean_text(p)
                if cleaned and len(cleaned) > 20:
                    texts.append(cleaned)

    return texts


def extract_specs_from_table(html_content):
    """Extract specs from tablepress or any table."""
    specs = {}

    # Find tables
    tables = re.findall(r'<table[^>]*>(.*?)</table>', html_content, re.DOTALL | re.IGNORECASE)
    for table in tables:
        rows = re.findall(r'<tr[^>]*>(.*?)</tr>', table, re.DOTALL | re.IGNORECASE)
        for row in rows:
            cells = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', row, re.DOTALL | re.IGNORECASE)
            if len(cells) >= 2:
                key = clean_text(cells[0])
                val = clean_text(cells[1])
                if key and val and len(key) < 100:
                    specs[key] = val

    return specs


def scrape_product_page(slug):
    """Scrape a product page and return extracted data."""
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

    # Extract YouTube URL
    result['video'] = extract_youtube_url(html_content)
    if result['video']:
        print(f"  Found video: {result['video']}")

    # Extract meta description
    result['meta_description'] = extract_meta_description(html_content)
    if result['meta_description']:
        print(f"  Meta desc: {result['meta_description'][:80]}...")

    # Extract text blocks
    text_blocks = extract_text_blocks(html_content)
    if text_blocks:
        result['description'] = ' '.join(text_blocks)
        print(f"  Text blocks found: {len(text_blocks)}")
        print(f"  Description: {result['description'][:100]}...")
    elif result['meta_description']:
        result['description'] = result['meta_description']
        print(f"  Using meta description as fallback")

    # Extract specs
    result['specs'] = extract_specs_from_table(html_content)
    if result['specs']:
        print(f"  Specs: {list(result['specs'].keys())[:5]}")

    return result


def parse_js_file(file_path):
    """Read the JS file and parse the JSON array."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the JSON array
    # File starts with "export const PRODUCTS = [" and ends with "];"
    match = re.search(r'export const PRODUCTS = (\[.*\]);?\s*$', content, re.DOTALL)
    if not match:
        # Try without semicolon
        match = re.search(r'export const PRODUCTS = (\[.*\])', content, re.DOTALL)

    if not match:
        raise ValueError("Could not find PRODUCTS array in file")

    json_str = match.group(1)
    products = json.loads(json_str)
    return products, content


def write_js_file(file_path, products):
    """Write products back to the JS file."""
    json_str = json.dumps(products, ensure_ascii=False, indent=2)
    output = f"// Auto-generated — enriched with data scraped from termojet.com.ua\n// {len(products)} products\nexport const PRODUCTS = {json_str};\n"
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(output)
    print(f"\nWrote {len(products)} products to {file_path}")


def fix_description_text(text):
    """Clean up description text - remove HTML entities and tags."""
    if not text:
        return text
    # Unescape HTML entities
    cleaned = html.unescape(text)
    # Remove HTML tags
    cleaned = re.sub(r'<[^>]+>', ' ', cleaned)
    # Replace literal &nbsp;
    cleaned = cleaned.replace('&nbsp;', ' ')
    # Normalize whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned


def is_youtube_url(text):
    """Check if text is a YouTube URL or contains only a YouTube URL."""
    if not text:
        return False
    text = text.strip()
    return bool(re.match(r'https?://youtu', text) or
                re.match(r'https?://www\.youtube\.com', text))


def is_empty_or_nbsp(text):
    """Check if text is empty or only &nbsp;/whitespace."""
    if not text:
        return True
    cleaned = text.replace('&nbsp;', '').replace('\xa0', '').strip()
    return len(cleaned) == 0


def main():
    print("Loading products file...")
    products, original_content = parse_js_file(FILE_PATH)
    print(f"Loaded {len(products)} products")

    # Step 1: Identify products that need page scraping
    slugs_needing_fix = set(SLUGS_TO_FIX)

    # Also find any with YouTube URLs or empty descriptions we didn't list
    for p in products:
        desc = p.get('description', '')
        if is_youtube_url(desc) or is_empty_or_nbsp(desc):
            slugs_needing_fix.add(p['slug'])

    print(f"\nProducts needing description fix: {len(slugs_needing_fix)}")
    for s in sorted(slugs_needing_fix):
        print(f"  - {s}")

    # Step 2: Scrape each product page
    scraped_data = {}
    for slug in slugs_needing_fix:
        data = scrape_product_page(slug)
        if data:
            scraped_data[slug] = data
        time.sleep(0.5)  # Be polite

    # Step 3: Update products
    fixed_count = 0
    nbsp_fixed_count = 0

    for p in products:
        slug = p['slug']
        desc = p.get('description', '')
        changed = False

        # Fix YouTube URL descriptions
        if is_youtube_url(desc) or is_empty_or_nbsp(desc):
            # Move YouTube URL to video field
            if is_youtube_url(desc):
                # Extract the YouTube URL
                yt_match = re.search(r'https?://youtu\S+', desc)
                if yt_match:
                    yt_url = yt_match.group(0).strip()
                    if not p.get('video'):
                        p['video'] = yt_url

            # Get scraped description
            if slug in scraped_data:
                data = scraped_data[slug]
                new_desc = data.get('description') or ''

                # Add video field from scraped data if not already set
                if data.get('video') and not p.get('video'):
                    p['video'] = data['video']

                # Update specs if we got them and product has none or few
                if data.get('specs') and len(data['specs']) > len(p.get('specs', {})):
                    p['specs'] = data['specs']

                if new_desc and not is_youtube_url(new_desc):
                    old_desc = desc
                    p['description'] = new_desc
                    print(f"\n✓ Fixed [{slug}]:")
                    print(f"  OLD: {old_desc[:80]}")
                    print(f"  NEW: {new_desc[:100]}")
                    fixed_count += 1
                    changed = True
                else:
                    # No description found - generate from product name
                    name = p.get('name', '')
                    if name:
                        p['description'] = f"{name} — виріб виробника Termojet для систем опалення."
                        print(f"\n✓ Generated desc for [{slug}]: {p['description']}")
                        fixed_count += 1
                        changed = True

        # Fix &nbsp; and HTML tags in all descriptions
        current_desc = p.get('description', '')
        if current_desc and ('&nbsp;' in current_desc or '<' in current_desc or '&' in current_desc):
            fixed = fix_description_text(current_desc)
            if fixed != current_desc:
                p['description'] = fixed
                nbsp_fixed_count += 1
                if not changed:
                    print(f"\n✓ Cleaned HTML entities in [{slug}]: {fixed[:80]}")

        # Also fix shortDesc
        short = p.get('shortDesc', '')
        if short and ('&nbsp;' in short or '<' in short):
            fixed_short = fix_description_text(short)
            if fixed_short != short:
                p['shortDesc'] = fixed_short

    print(f"\n{'='*60}")
    print(f"Fixed {fixed_count} YouTube/empty descriptions")
    print(f"Cleaned {nbsp_fixed_count} descriptions with HTML entities")
    print(f"Total products: {len(products)}")

    # Step 4: Write updated file
    write_js_file(FILE_PATH, products)

    # Summary of video fields added
    video_count = sum(1 for p in products if p.get('video'))
    print(f"Products with video field: {video_count}")


if __name__ == '__main__':
    main()
