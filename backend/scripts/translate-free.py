#!/usr/bin/env python3
"""
Безкоштовний переклад контенту з БД (products, blog_posts) на EN/PL/FR/DE через
deep-translator (free Google). Заповнює колонку i18n. Ідемпотентний (хеш джерела).

  python3 scripts/translate-free.py [--table products] [--limit 3] [--force] [--db PATH]

Описи — HTML (теги зберігаються Google'ом). specs — JSON (перекладаємо лише
Cyrillic-рядки: ключі + текстові значення; числа/символи лишаємо). Доменний glossary
підправляє типові машинні помилки (термокран→thermostatic valve тощо).
"""
import sys, os, re, json, time, hashlib, sqlite3, argparse
from deep_translator import GoogleTranslator

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_DB = os.path.join(ROOT, 'data', 'termojet.db')
LANGS = ['en', 'pl', 'fr', 'de']
CYR = re.compile('[А-Яа-яЇїІіЄєҐґ]')
MAXLEN = 4500  # ліміт Google на запит
SLEEP = 0.4    # пауза між запитами (бережемо free-endpoint)

# Доменний glossary: machine-output → виправлене (per lang). Лагодить системні похибки MT.
GLOSSARY = {
    'en': {'thermocock': 'thermostatic valve', 'thermo-cock': 'thermostatic valve',
           'thermal cock': 'thermostatic valve', 'thermal tap': 'thermostatic valve',
           'thermo tap': 'thermostatic valve', 'Pumping group': 'Pump group',
           'pumping group': 'pump group'},
    'pl': {'kurkiem termicznym': 'zaworem termostatycznym', 'kurek termiczny': 'zawór termostatyczny',
           'kurka termicznego': 'zaworu termostatycznego', 'kranem termicznym': 'zaworem termostatycznym'},
    'fr': {'thermo-robinet': 'vanne thermostatique', 'robinet thermique': 'vanne thermostatique',
           'robinet thermostatique': 'vanne thermostatique'},
    'de': {'Thermohahn': 'Thermostatventil', 'Thermo-Hahn': 'Thermostatventil',
           'thermischer Hahn': 'Thermostatventil', 'Thermokran': 'Thermostatventil'},
}

ENTITIES = {
    'products': {'id': 'id', 'fields': {
        'name': 'text', 'short_desc': 'text', 'description': 'html',
        'specs': 'json', 'seo_title': 'text', 'meta_description': 'text', 'subcategory': 'text',
    }},
    'blog_posts': {'id': 'id', 'fields': {
        'title': 'text', 'excerpt': 'text', 'content': 'html', 'category': 'text',
    }},
}

_translators = {}
def tr(lang):
    if lang not in _translators:
        _translators[lang] = GoogleTranslator(source='uk', target=lang)
    return _translators[lang]

def apply_glossary(text, lang):
    for bad, good in GLOSSARY.get(lang, {}).items():
        text = text.replace(bad, good)
    return text

def chunk(s, n=MAXLEN):
    if len(s) <= n:
        return [s]
    # ділимо по межах тегів/речень, щоб не різати слова
    parts, cur = [], ''
    for piece in re.split(r'(</(?:p|li|ul|h[1-6])>)', s):
        if len(cur) + len(piece) > n and cur:
            parts.append(cur); cur = ''
        cur += piece
    if cur: parts.append(cur)
    return parts

def translate_str(s, lang):
    if not s or not CYR.search(s):
        return s  # нема кирилиці — лишаємо (числа/одиниці/бренди)
    out = ''.join(tr(lang).translate(c) or '' for c in chunk(s))
    time.sleep(SLEEP)
    return apply_glossary(out, lang)

def translate_many(strings, lang):
    """Перекласти список коротких рядків одним запитом (через \n-join зі split-fallback)."""
    if not strings:
        return []
    flat = [s.replace('\n', ' ').strip() for s in strings]
    joined = '\n'.join(flat)
    if len(joined) <= MAXLEN:
        out = tr(lang).translate(joined) or ''
        parts = out.split('\n')
        if len(parts) == len(flat):
            time.sleep(SLEEP)
            return [apply_glossary(p.strip(), lang) for p in parts]
    # fallback: по одному (надійно, але повільніше)
    return [translate_str(s, lang) for s in strings]

def translate_specs(specs, lang):
    # specs: dict {label: value}. Перекладаємо ключі та Cyrillic-значення.
    out = {}
    for k, v in specs.items():
        nk = translate_str(k, lang) if CYR.search(k) else k
        nv = translate_str(str(v), lang) if (isinstance(v, str) and CYR.search(v)) else v
        out[nk] = nv
    return out

def src_hash(src):
    return hashlib.sha256(json.dumps(src, ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:16]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--table'); ap.add_argument('--limit', type=int)
    ap.add_argument('--force', action='store_true'); ap.add_argument('--db', default=DEFAULT_DB)
    ap.add_argument('--show', action='store_true', help='print translations to stdout')
    a = ap.parse_args()
    db = sqlite3.connect(a.db)
    db.row_factory = sqlite3.Row
    tables = [a.table] if a.table else list(ENTITIES.keys())
    for table in tables:
        cfg = ENTITIES[table]
        rows = db.execute(f'SELECT * FROM {table}').fetchall()
        if a.limit: rows = rows[:a.limit]
        print(f'\n=== {table} ({len(rows)} rows) ===')
        for ri, row in enumerate(rows, 1):
            src = {}
            for f, kind in cfg['fields'].items():
                raw = row[f] if f in row.keys() else None
                if raw in (None, '', '{}', '[]'): continue
                src[f] = (kind, raw)
            if not src: continue
            sh = src_hash({f: v for f, (k, v) in src.items()})
            try: i18n = json.loads(row['i18n'] or '{}')
            except Exception: i18n = {}
            for lang in LANGS:
                fresh = i18n.get(lang) and i18n.get('_srcHash', {}).get(lang) == sh
                if fresh and not a.force: continue
                lang_obj = {}
                batch, slots = [], []          # рядки для одного запиту + куди покласти
                specs_field = None
                for f, (kind, raw) in src.items():
                    if kind == 'html':
                        lang_obj[f] = translate_str(raw, lang)   # окремо (чанкінг тегів)
                    elif kind == 'json':
                        try: specs = json.loads(raw)
                        except Exception: continue
                        items = list(specs.items())
                        specs_field = (f, items)
                        for idx, (k, v) in enumerate(items):
                            if CYR.search(k): slots.append(('sk', idx)); batch.append(k)
                            if isinstance(v, str) and CYR.search(v): slots.append(('sv', idx)); batch.append(v)
                    else:  # text
                        if CYR.search(raw): slots.append(('f', f)); batch.append(raw)
                        else: lang_obj[f] = raw
                res = translate_many(batch, lang)
                # розкласти результати
                sk, sv = {}, {}
                for (slot, res_v) in zip(slots, res):
                    if slot[0] == 'f': lang_obj[slot[1]] = res_v
                    elif slot[0] == 'sk': sk[slot[1]] = res_v
                    elif slot[0] == 'sv': sv[slot[1]] = res_v
                if specs_field:
                    fname, items = specs_field
                    out_specs = {}
                    for idx, (k, v) in enumerate(items):
                        out_specs[sk.get(idx, k)] = sv.get(idx, v)
                    lang_obj[fname] = out_specs
                i18n[lang] = lang_obj
                i18n.setdefault('_srcHash', {})[lang] = sh
                if a.show:
                    print(f'  [{table} {row[cfg["id"]]} {lang}] name={lang_obj.get("name") or lang_obj.get("title","")!r}')
            db.execute(f'UPDATE {table} SET i18n = ? WHERE {cfg["id"]} = ?',
                       (json.dumps(i18n, ensure_ascii=False), row[cfg['id']]))
            db.commit()
            sys.stdout.write(f'\r  {ri}/{len(rows)}'); sys.stdout.flush()
        print()
    db.close()
    print('Done.')

if __name__ == '__main__':
    main()
