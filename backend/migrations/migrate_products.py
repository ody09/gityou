"""Migrate default PRODUCTS from settings.js into the online Products table.

This script parses the `buildDefaultProducts()` object in `settings.js`,
converts it to JSON, and upserts each product into the `Products` table
using the existing `conn.get_conn()` helper.

Run: python migrate_products.py
"""
from __future__ import annotations

import re
import json
from pathlib import Path
from conn import get_conn


SETTINGS = Path(__file__).with_name('settings.js')


def extract_js_object(js_text: str, fn_name: str = 'buildDefaultProducts') -> str:
    # find the function declaration
    m = re.search(rf'function\s+{fn_name}\s*\(\)\s*\{{', js_text)
    if not m:
        raise RuntimeError('function not found')
    idx = m.end()
    # find 'return {' after the function start
    m2 = re.search(r'return\s*\{', js_text[idx:])
    if not m2:
        raise RuntimeError('return object not found')
    start = idx + m2.start() + js_text[idx+m2.start():].find('{')
    # now find matching closing brace for this object
    i = start
    depth = 0
    while i < len(js_text):
        if js_text[i] == '{':
            depth += 1
        elif js_text[i] == '}':
            depth -= 1
            if depth == 0:
                end = i
                return js_text[start:end+1]
        i += 1
    raise RuntimeError('matching brace not found')


def js_object_to_json(js_obj: str) -> str:
    # Convert simple JS object literal (with single quotes) to JSON.
    s = js_obj
    # remove JS-style trailing commas before closing braces/brackets
    s = re.sub(r',\s*([}\]])', r"\1", s)
    # convert single quotes to double quotes
    s = s.replace("'", '"')
    # quote unquoted property names (e.g. { name: -> { "name": )
    s = re.sub(r'([\{\[,]\s*)([A-Za-z0-9_]+)\s*:', r'\1"\2":', s)
    return s


def main():
    txt = SETTINGS.read_text(encoding='utf-8')
    obj_js = extract_js_object(txt, 'buildDefaultProducts')
    json_text = js_object_to_json(obj_js)
    Path('migrated_products_raw.js').write_text(obj_js, encoding='utf-8')
    Path('migrated_products.json').write_text(json_text, encoding='utf-8')
    data = json.loads(json_text)

    # upsert each product into online DB using get_conn()
    with get_conn() as conn:
        for key, val in data.items():
            name = val.get('name')
            specs = val.get('specs', [])
            lines = []
            specs_txt = json.dumps(specs, ensure_ascii=False)
            lines_txt = json.dumps(lines, ensure_ascii=False)
            sql = ('INSERT INTO Products (pkey, name, specs, lines) VALUES (?, ?, ?, ?) '
                   'ON CONFLICT(pkey) DO UPDATE SET name=excluded.name, specs=excluded.specs, lines=excluded.lines;')
            conn.execute(sql, (key, name, specs_txt, lines_txt))
    print(f'Migrated {len(data)} products to Products table')


if __name__ == '__main__':
    main()
