#!/usr/bin/env python3
"""
Офлайн-переклад контенту з БД (products, blog_posts) на EN/PL/FR/DE через argostranslate
(нейро-MT, повністю локально, без мережі/лімітів). Заповнює колонку i18n. Ідемпотентний.

  python3 scripts/translate-argos.py [--table products] [--limit 3] [--force] [--install]

--install : завантажити мовні моделі (uk->en, en->pl/fr/de) і вийти.
HTML-поля (description/content): переклад текстових вузлів через bs4 зі збереженням тегів.
specs: ключі + Cyrillic-значення. uk->pl/fr/de через пивот англійською, якщо нема прямої моделі.
"""
import sys, os, re, json, hashlib, sqlite3, argparse
import argostranslate.package, argostranslate.translate
from bs4 import BeautifulSoup, NavigableString, Comment

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_DB = os.path.join(ROOT, 'data', 'termojet.db')
LANGS = ['en', 'pl', 'fr', 'de']
CYR = re.compile('[А-Яа-яЇїІіЄєҐґ]')

GLOSSARY = {
    'en': {'thermal tap': 'thermostatic valve', 'thermo tap': 'thermostatic valve',
           'thermal crane': 'thermostatic valve', 'Pumping group': 'Pump group'},
    'pl': {'kurkiem termicznym': 'zaworem termostatycznym', 'kurek termiczny': 'zawór termostatyczny'},
    'fr': {'robinet thermique': 'vanne thermostatique', 'thermo-robinet': 'vanne thermostatique'},
    'de': {'Thermohahn': 'Thermostatventil', 'thermischer Hahn': 'Thermostatventil'},
}

def install_packages():
    argostranslate.package.update_package_index()
    avail = argostranslate.package.get_available_packages()
    want = [('uk', 'en'), ('en', 'pl'), ('en', 'fr'), ('en', 'de'),
            ('uk', 'pl'), ('uk', 'fr'), ('uk', 'de')]  # прямі, якщо є
    installed = {(p.from_code, p.to_code) for p in argostranslate.package.get_installed_packages()}
    for frm, to in want:
        if (frm, to) in installed:
            continue
        pk = next((p for p in avail if p.from_code == frm and p.to_code == to), None)
        if pk:
            print(f'  downloading {frm}->{to} ...'); pk.install()
        else:
            print(f'  (no direct {frm}->{to} package — will pivot via en)')

def has_direct(frm, to):
    return any(p.from_code == frm and p.to_code == to
               for p in argostranslate.package.get_installed_packages())

def t_raw(text, to):
    """uk->to, з пивотом через англійську якщо нема прямої моделі."""
    if has_direct('uk', to):
        return argostranslate.translate.translate(text, 'uk', to)
    en = argostranslate.translate.translate(text, 'uk', 'en')
    if to == 'en':
        return en
    return argostranslate.translate.translate(en, 'en', to)

def glo(text, lang):
    for a, b in GLOSSARY.get(lang, {}).items():
        text = text.replace(a, b)
    return text

def translate_text(s, lang):
    if not s or not CYR.search(s):
        return s
    return glo(t_raw(s, lang), lang)

def translate_html(html, lang):
    soup = BeautifulSoup(html, 'html.parser')
    for node in list(soup.find_all(string=True)):
        if isinstance(node, Comment):
            continue
        s = str(node)
        if s.strip() and CYR.search(s):
            node.replace_with(glo(t_raw(s, lang), lang))
    return str(soup)

def src_hash(src):
    return hashlib.sha256(json.dumps(src, ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:16]

FIELDS = {
    'products': {'name': 'text', 'short_desc': 'text', 'description': 'html',
                 'specs': 'json', 'seo_title': 'text', 'meta_description': 'text', 'subcategory': 'text'},
    'blog_posts': {'title': 'text', 'excerpt': 'text', 'content': 'html', 'category': 'text'},
}

def build_lang_obj(src, lang):
    out = {}
    for f, (kind, raw) in src.items():
        if kind == 'html':
            out[f] = translate_html(raw, lang)
        elif kind == 'json':
            specs = json.loads(raw)
            out[f] = {translate_text(k, lang): (translate_text(v, lang) if isinstance(v, str) else v)
                      for k, v in specs.items()}
        else:
            out[f] = translate_text(raw, lang)
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--table'); ap.add_argument('--limit', type=int)
    ap.add_argument('--force', action='store_true'); ap.add_argument('--db', default=DEFAULT_DB)
    ap.add_argument('--install', action='store_true')
    a = ap.parse_args()
    if a.install:
        install_packages(); print('packages ready'); return
    db = sqlite3.connect(a.db); db.row_factory = sqlite3.Row
    tables = [a.table] if a.table else list(FIELDS.keys())
    for table in tables:
        rows = db.execute(f'SELECT * FROM {table}').fetchall()
        if a.limit: rows = rows[:a.limit]
        print(f'\n=== {table} ({len(rows)} rows) ===')
        for ri, row in enumerate(rows, 1):
            src = {}
            for f, kind in FIELDS[table].items():
                raw = row[f] if f in row.keys() else None
                if raw in (None, '', '{}', '[]'): continue
                src[f] = (kind, raw)
            if not src: continue
            sh = src_hash({f: v for f, (k, v) in src.items()})
            try: i18n = json.loads(row['i18n'] or '{}')
            except Exception: i18n = {}
            wrote = False
            for lang in LANGS:
                if i18n.get(lang) and i18n.get('_srcHash', {}).get(lang) == sh and not a.force:
                    continue
                try:
                    i18n[lang] = build_lang_obj(src, lang)
                    i18n.setdefault('_srcHash', {})[lang] = sh
                    wrote = True
                except Exception as e:
                    sys.stderr.write(f'\n  SKIP {table} {row["id"]} [{lang}]: {e}\n')
            if wrote:
                db.execute(f'UPDATE {table} SET i18n=? WHERE id=?',
                           (json.dumps(i18n, ensure_ascii=False), row['id']))
                db.commit()
            sys.stdout.write(f'\r  {ri}/{len(rows)}'); sys.stdout.flush()
        print()
    db.close(); print('Done.')

if __name__ == '__main__':
    main()
