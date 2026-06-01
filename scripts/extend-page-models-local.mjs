#!/usr/bin/env node
// Phase 2 of the page-model consolidation on LOCAL Directus:
//   1. Read src/lib/page-keys.json — the source-of-truth mapping of i18n
//      keys → (page singleton, field name).
//   2. Add any missing `<key>` fields to each page's `_translations` table.
//   3. Backfill the new fields from existing `translation_keys` rows.
//   4. Drop the now-redundant legacy tables (translation_keys,
//      translation_table, page_text_keys, page_text_translations,
//      contact_offices, contact_offices_files).
//
// Idempotent — re-running adds only the missing fields and refreshes data.
//
// Usage:
//   DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=tabernam-admin-token \
//     node scripts/extend-page-models-local.mjs

import fs from 'node:fs';
import path from 'node:path';

const URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_TOKEN || 'tabernam-admin-token';

async function api(p, method = 'GET', body) {
  const res = await fetch(`${URL}${p}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${p} → ${res.status}: ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

async function exists(p) {
  try { await api(p); return true; } catch { return false; }
}

const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/lib/page-keys.json'), 'utf8'));

// Expand the dynamic patterns into concrete (key, page, field) entries.
function expandedDictionary() {
  const out = { ...config.dictionary };
  delete out._comment;
  for (const [keyPattern, def] of Object.entries(config.dictionaryDynamic || {})) {
    if (keyPattern === '_comment') continue;
    for (let i = 0; i < def.range; i++) {
      out[keyPattern.replace('{i}', String(i))] = {
        page: def.page,
        field: def.field.replace('{i}', String(i)),
      };
    }
  }
  return out;
}

const DICTIONARY = expandedDictionary();

// Group { i18nKey → { page, field } } by page.
function fieldsByPage() {
  const byPage = { home: [], about: [], contact: [], cv: [] };
  for (const [key, { page, field }] of Object.entries(DICTIONARY)) {
    if (!byPage[page]) byPage[page] = [];
    byPage[page].push({ key, field });
  }
  return byPage;
}

// ---- Schema additions ---------------------------------------------------

async function ensureField(collection, field, kind = 'text') {
  if (await exists(`/fields/${collection}/${field}`)) return false;
  const def = kind === 'multiline'
    ? { interface: 'input-multiline', type: 'text' }
    : { interface: 'input', type: 'string' };
  await api(`/fields/${collection}`, 'POST', {
    field,
    type: def.type,
    meta: { interface: def.interface, special: null, required: false },
    schema: { name: field },
  });
  return true;
}

// Multi-line for keys that hold paragraphs.
const MULTILINE_KEY_PATTERNS = [
  /^globe\.intro\.description$/, /^globeIntro\.body$/,
  /^footer\.tagline$/,
  /^cv\.modal\.intro$/, /^cv\.modal\.defaultBody$/,
  /^cv\.china\.\d+\.text$/,
  /^cv\.exp\.\d+\.desc$/,
  /^cv\.contact\.intro$/,
  /^cv\.section\./,
];
function kindForKey(key) {
  return MULTILINE_KEY_PATTERNS.some((re) => re.test(key)) ? 'multiline' : 'text';
}

async function addDictionaryFields() {
  console.log('\n==> Adding missing dictionary fields');
  const grouped = fieldsByPage();
  let created = 0;
  for (const [page, items] of Object.entries(grouped)) {
    const tCollection = `${page}_translations`;
    for (const { key, field } of items) {
      if (await ensureField(tCollection, field, kindForKey(key))) {
        console.log(`  ${tCollection}.${field} (key: ${key})`);
        created++;
      }
    }
  }
  console.log(`  added ${created} new fields`);
}

// ---- Data migration -----------------------------------------------------

async function listLanguages() {
  const data = await api('/items/languages?fields=id,code&limit=-1');
  return data.data || [];
}

// Returns { [key]: { [langId]: value } } for all keys we care about.
async function readTranslationKeys() {
  const keys = Object.keys(DICTIONARY);
  // Fetch in chunks to avoid URL length limits.
  const out = {};
  const chunk = 30;
  for (let i = 0; i < keys.length; i += chunk) {
    const slice = keys.slice(i, i + chunk);
    const filter = encodeURIComponent(JSON.stringify({ key: { _in: slice } }));
    const data = await api(
      `/items/translation_keys?fields=key,translations.language,translations.value&filter=${filter}&limit=-1`,
    );
    for (const row of data.data || []) {
      out[row.key] = {};
      for (const t of row.translations || []) {
        out[row.key][t.language] = t.value;
      }
    }
  }
  return out;
}

// For each page singleton, fetch the existing translation rows and PATCH
// in the new dictionary fields per language (preserving existing fields).
async function backfillDictionary(languages) {
  console.log('\n==> Backfilling dictionary data into page singletons');
  const src = await readTranslationKeys();
  const grouped = fieldsByPage();

  for (const [page, items] of Object.entries(grouped)) {
    const tCollection = `${page}_translations`;
    // Fetch current rows so we know which to update vs insert.
    const rows = (await api(`/items/${tCollection}?fields=id,language&limit=-1`)).data || [];
    const rowByLang = new Map(rows.map((r) => [r.language, r.id]));

    for (const lang of languages) {
      const rowId = rowByLang.get(lang.id);
      // Build patch object for this language
      const patch = {};
      for (const { key, field } of items) {
        const v = src[key]?.[lang.id];
        if (v != null && v !== '') patch[field] = v;
      }
      if (Object.keys(patch).length === 0) continue;

      if (rowId) {
        await api(`/items/${tCollection}/${rowId}`, 'PATCH', patch);
      } else {
        // Need the parent singleton id
        const parent = (await api(`/items/${page}`)).data;
        const newRow = { [`${page}_id`]: parent.id, language: lang.id, ...patch };
        await api(`/items/${tCollection}`, 'POST', newRow);
      }
      console.log(`  ${tCollection}[lang=${lang.code}]: patched ${Object.keys(patch).length} fields`);
    }
  }
}

// ---- Drop legacy tables -------------------------------------------------

async function dropLegacy() {
  console.log('\n==> Dropping legacy collections');
  const toDrop = [
    'page_text_translations',  // children first
    'page_text_keys',
    'translation_table',
    'translation_keys',
    'contact_offices_files',
    'contact_offices',
  ];
  for (const c of toDrop) {
    if (await exists(`/collections/${c}`)) {
      await api(`/collections/${c}`, 'DELETE');
      console.log(`  ${c}: dropped`);
    } else {
      console.log(`  ${c}: not present`);
    }
  }
}

// ---- Main ---------------------------------------------------------------

async function main() {
  console.log(`Extending page models on ${URL}`);

  await addDictionaryFields();

  const languages = await listLanguages();
  console.log(`\nLanguages: ${languages.map((l) => `${l.id}=${l.code}`).join(', ')}`);

  await backfillDictionary(languages);

  await dropLegacy();

  console.log('\nDone.');
}

main().catch((e) => { console.error(e); process.exit(1); });
