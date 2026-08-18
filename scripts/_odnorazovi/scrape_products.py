#!/usr/bin/env python3
"""
Termojet product scraper (Elementor-based site)
Fetches enriched data from termojet.com.ua for products with missing descriptions
Outputs: src/data/products-enriched-v2.js

Usage:
  python3 scrape_products.py              # Run on all products needing enrichment
  python3 scrape_products.py --test       # Test on first 5 products
  python3 scrape_products.py --test --save  # Test + save output
"""

import json
import re
import time
import sys
import os
import copy
import requests
from bs4 import BeautifulSoup

BASE_URL = "https://termojet.com.ua/product/"
PRODUCTS_JS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src/data/products.js")
OUTPUT_JS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src/data/products-enriched-v2.js")
DELAY = 0.7  # seconds between requests

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "uk-UA,uk;q=0.9,en;q=0.8",
}

# Min chars for a "good" description
MIN_DESC_LEN = 10


def load_products(js_file: str) -> list:
    """Parse products.js — extract the JSON array from JS module"""
    with open(js_file, "r", encoding="utf-8") as f:
        content = f.read()
    match = re.search(r"export const PRODUCTS\s*=\s*(\[[\s\S]*\]);?\s*$", content)
    if not match:
        raise ValueError("Could not find PRODUCTS array in file")
    return json.loads(match.group(1))


def needs_enrichment(product: dict) -> bool:
    """Return True if product needs scraping (empty or short description)"""
    desc = product.get("description", "")
    return len(desc.strip()) < MIN_DESC_LEN


def extract_description(soup: BeautifulSoup) -> str:
    """Extract product description from Elementor text-editor widgets.

    The Termojet site uses Elementor page builder. The description and specs
    table are inside a .elementor-widget-text-editor div. We extract text
    before the table (or all text if no table).
    """
    # Strings that indicate non-description widgets (payment/delivery/address)
    SKIP_KEYWORDS = [
        "ОПЛАТА", "ДОСТАВКА", "ГАРАНТІЯ", "Самовивіз", "Нова пошта",
        "Готівка", "Безготівкова", "Сервісний центр", "Борщагівка",
        "Незалежності", "termojet@", "+380", "ПРАВА ЗАХИЩЕНО",
        "Розділ:", "Артикул:",
    ]

    opys_desc = ""    # Widget that explicitly contains "Опис" heading
    best_desc = ""    # Longest non-skipped widget

    for widget in soup.select(".elementor-widget-text-editor"):
        container = widget.select_one(".elementor-widget-container")
        if not container:
            continue

        full_text = container.get_text(strip=True)
        # Skip very short widgets (prices, artykul, etc.)
        if len(full_text) < 20:
            continue

        # Skip known non-product-description widgets
        if any(kw in full_text for kw in SKIP_KEYWORDS):
            continue

        # Clone to avoid mutating the tree
        clone = BeautifulSoup(str(container), "html.parser")

        # Remove all tables from clone (specs table lives here)
        for t in clone.find_all("table"):
            t.decompose()

        # Remove the "Опис" strong/heading
        has_opys = False
        for strong in clone.find_all("strong"):
            if strong.get_text(strip=True) in ("Опис", "Опис:", "Description"):
                has_opys = True
                strong.decompose()

        desc = clone.get_text(separator="\n", strip=True)
        # Clean up multiple blank lines
        desc = re.sub(r'\n{3,}', '\n\n', desc).strip()

        if not desc:
            continue

        # If this widget had the "Опис" heading, prefer it
        if has_opys:
            if len(desc) > len(opys_desc):
                opys_desc = desc
        elif len(desc) > len(best_desc):
            best_desc = desc

    # Prefer the explicit "Опис" widget; fall back to longest clean widget
    return opys_desc if opys_desc else best_desc


def extract_images(soup: BeautifulSoup) -> list:
    """Extract all product images from anchor links to wp-content/uploads."""
    images = []
    seen = set()

    for a in soup.find_all("a", href=True):
        href = a["href"]
        if ("wp-content/uploads" in href and
                re.search(r'\.(jpg|jpeg|png|webp)(\?.*)?$', href, re.I) and
                href not in seen):
            seen.add(href)
            images.append(href)

    return images


def extract_specs(soup: BeautifulSoup) -> dict:
    """Extract specs from tablepress tables."""
    specs = {}

    for table in soup.select(".tablepress"):
        rows = table.select("tr")
        for row in rows:
            cells = row.select("td")
            if len(cells) >= 2:
                key = cells[0].get_text(strip=True)
                val = cells[1].get_text(strip=True)
                # Skip header row
                if key and val and key not in ("Характеристика", "Параметр", "Parameter"):
                    specs[key] = val

    # Also try WooCommerce attributes table (fallback)
    if not specs:
        attr_table = soup.select_one(".woocommerce-product-attributes")
        if attr_table:
            for row in attr_table.select("tr"):
                label_el = row.select_one("th, .woocommerce-product-attributes-item__label")
                value_el = row.select_one("td, .woocommerce-product-attributes-item__value")
                if label_el and value_el:
                    key = label_el.get_text(strip=True)
                    val = value_el.get_text(separator="; ", strip=True)
                    if key and val:
                        specs[key] = val

    return specs


def extract_docs(soup: BeautifulSoup) -> list:
    """Extract downloadable documents (PDF, DXF, DWG, etc.) from the page."""
    docs = []
    seen_urls = set()

    doc_extensions = {
        ".pdf": "pdf",
        ".dxf": "dxf",
        ".dwg": "dwg",
        ".stp": "3d",
        ".step": "3d",
        ".zip": "archive",
        ".rar": "archive",
    }

    for a in soup.find_all("a", href=True):
        href = a["href"]
        lower_href = href.lower()

        for ext, doc_type in doc_extensions.items():
            if lower_href.endswith(ext) or f"{ext}?" in lower_href:
                if href not in seen_urls:
                    name = a.get_text(strip=True) or os.path.basename(href)
                    # Reclassify brochures
                    combined = (name + lower_href).lower()
                    if any(kw in combined for kw in ["catalog", "каталог", "брошур", "brochure"]):
                        doc_type = "brochure"
                    docs.append({"name": name, "url": href, "type": doc_type})
                    seen_urls.add(href)
                break

    return docs


def scrape_product(slug: str, session: requests.Session) -> dict | None:
    """Fetch and parse a product page. Returns enriched data dict or None on error."""
    url = f"{BASE_URL}{slug}/"

    try:
        resp = session.get(url, headers=HEADERS, timeout=15)
    except requests.RequestException as e:
        print(f"  [NET ERROR] {slug}: {e}")
        return None

    if resp.status_code == 404:
        return {"_status": "404", "slug": slug}

    if resp.status_code != 200:
        print(f"  [HTTP {resp.status_code}] {slug}")
        return {"_status": str(resp.status_code), "slug": slug}

    soup = BeautifulSoup(resp.text, "html.parser")

    return {
        "_status": "ok",
        "_source_url": url,
        "description": extract_description(soup),
        "images": extract_images(soup),
        "specs": extract_specs(soup),
        "docs": extract_docs(soup),
    }


def merge_product(original: dict, scraped: dict) -> dict:
    """Merge scraped data into original product, only adding/improving data."""
    merged = dict(original)

    # Description: use scraped if it's longer/better
    scraped_desc = scraped.get("description", "")
    original_desc = merged.get("description", "")
    if len(scraped_desc) > len(original_desc):
        merged["description"] = scraped_desc

    # Images: use scraped list if it's larger
    scraped_images = scraped.get("images", [])
    existing_images = merged.get("images", [])
    if scraped_images and len(scraped_images) > len(existing_images):
        merged["images"] = scraped_images
        merged["image"] = scraped_images[0]

    # Specs: merge — scraped data for new keys, keep existing values
    scraped_specs = scraped.get("specs", {})
    if scraped_specs:
        existing_specs = merged.get("specs", {})
        merged_specs = dict(scraped_specs)
        for k, v in existing_specs.items():
            if k not in merged_specs:
                merged_specs[k] = v
        merged["specs"] = merged_specs

    # Docs: add any new docs from scraped data
    scraped_docs = scraped.get("docs", [])
    if scraped_docs:
        existing_docs = merged.get("docs", [])
        existing_urls = {d.get("url") for d in existing_docs}
        for doc in scraped_docs:
            if doc["url"] not in existing_urls:
                existing_docs.append(doc)
        merged["docs"] = existing_docs

    return merged


def products_to_js(products: list) -> str:
    """Convert products list to JS module format."""
    json_str = json.dumps(products, ensure_ascii=False, indent=2)
    return (
        "// Auto-generated — enriched with data scraped from termojet.com.ua\n"
        f"// {len(products)} products\n"
        f"export const PRODUCTS = {json_str};\n"
    )


def main():
    print("=== Termojet Product Scraper ===")
    print(f"Loading {PRODUCTS_JS}...")
    products = load_products(PRODUCTS_JS)
    print(f"Loaded {len(products)} products")

    needs_scrape = [p for p in products if needs_enrichment(p)]
    already_good = len(products) - len(needs_scrape)
    print(f"Already have descriptions: {already_good}")
    print(f"Need enrichment: {len(needs_scrape)}")

    # Test mode
    test_mode = "--test" in sys.argv
    save_output = not test_mode or "--save" in sys.argv

    if test_mode:
        needs_scrape = needs_scrape[:5]
        print(f"TEST MODE: scraping only {len(needs_scrape)} products")

    # Build ID-keyed product map (preserves all original data)
    product_map = {p["id"]: dict(p) for p in products}

    session = requests.Session()
    stats = {"ok": 0, "404": 0, "error": 0}
    fields_found = {"description": 0, "images": 0, "specs": 0, "docs": 0}
    errors = []

    print(f"\nStarting scrape with {DELAY}s delay between requests...\n")

    for i, product in enumerate(needs_scrape):
        slug = product["slug"]
        pid = product["id"]

        if i > 0:
            time.sleep(DELAY)

        if i % 10 == 0 or i < 3 or test_mode:
            print(f"[{i+1}/{len(needs_scrape)}] {slug}")

        scraped = scrape_product(slug, session)

        if scraped is None:
            stats["error"] += 1
            errors.append({"slug": slug, "reason": "network error"})
            continue

        status = scraped.get("_status", "")

        if status == "404":
            stats["404"] += 1
            errors.append({"slug": slug, "reason": "404"})
            if test_mode:
                print(f"  -> 404 not found")
            continue

        if status != "ok":
            stats["error"] += 1
            errors.append({"slug": slug, "reason": f"HTTP {status}"})
            continue

        # Track what was found
        if len(scraped.get("description", "")) >= MIN_DESC_LEN:
            fields_found["description"] += 1
        if scraped.get("images"):
            fields_found["images"] += 1
        if scraped.get("specs"):
            fields_found["specs"] += 1
        if scraped.get("docs"):
            fields_found["docs"] += 1

        # Merge into map
        product_map[pid] = merge_product(product_map[pid], scraped)
        stats["ok"] += 1

        if test_mode:
            desc = scraped.get("description", "")
            print(f"  description ({len(desc)} chars): {desc[:120]!r}")
            print(f"  images: {scraped.get('images', [])}")
            print(f"  specs keys: {list(scraped.get('specs', {}).keys())[:8]}")
            print(f"  docs: {scraped.get('docs', [])}")

    print(f"\n{'='*40}")
    print(f"RESULTS:")
    print(f"  Successfully scraped: {stats['ok']}")
    print(f"  404 errors:           {stats['404']}")
    print(f"  Other errors:         {stats['error']}")
    print(f"\nFields found (of {stats['ok']} successful):")
    for field, count in fields_found.items():
        pct = int(count / max(stats['ok'], 1) * 100)
        print(f"  {field:15s}: {count:3d} ({pct}%)")

    if errors:
        print(f"\nErrors/404s ({len(errors)}):")
        for e in errors[:20]:
            print(f"  [{e['reason']}] {e['slug']}")
        if len(errors) > 20:
            print(f"  ... and {len(errors) - 20} more")

    if save_output:
        # Reconstruct ordered list
        enriched_products = [product_map[p["id"]] for p in products]
        print(f"\nWriting {len(enriched_products)} products to {OUTPUT_JS}...")
        js_content = products_to_js(enriched_products)
        with open(OUTPUT_JS, "w", encoding="utf-8") as f:
            f.write(js_content)
        print("Done!")
    else:
        print("\n[Test mode — use --save flag to write output]")

    return stats


if __name__ == "__main__":
    main()
