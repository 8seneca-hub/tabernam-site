#!/usr/bin/env node
// Migrate flat `i18n_strings` (key, lang, value) into normalized schema:
//
//   languages         (id, code, name, flag, is_default, sort)
//   translation_keys  (id, key, translations[])
//   translation_table (id, translation_keys_id → translation_keys,
//                       language → languages, value)
//
// Idempotent: re-running drops the old translation_table and rebuilds it
// from i18n_strings. Languages and translation_keys are preserved if present.
//
// Usage:
//   DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=tabernam-admin-token \
//     node scripts/migrate-i18n.mjs

import { createDirectus, rest, staticToken, readItems, createItem } from '@directus/sdk';

const URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_TOKEN || 'tabernam-admin-token';

const directus = createDirectus(URL).with(staticToken(TOKEN)).with(rest());

async function api(path, method = 'GET', body) {
  const res = await fetch(`${URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

async function exists(path) {
  try {
    await api(path);
    return true;
  } catch {
    return false;
  }
}

const FALLBACK_LANGS = [
  { code: 'en', name: 'English', flag: '\u{1F1FA}\u{1F1F8}', is_default: true, sort: 1 },
  { code: 'sk', name: 'Slovakia', flag: '\u{1F1F8}\u{1F1F0}', is_default: false, sort: 2 },
];

async function ensureLanguages() {
  if (await exists('/collections/languages')) {
    console.log('  languages: already exists');
  } else {
    await api('/collections', 'POST', {
      collection: 'languages',
      meta: { icon: 'language', note: 'Site languages.' },
      schema: { name: 'languages' },
      fields: [
        { field: 'id', type: 'integer',
          meta: { hidden: true, interface: 'input', readonly: true },
          schema: { is_primary_key: true, has_auto_increment: true } },
        { field: 'code', type: 'string',
          meta: { interface: 'input', required: true, note: 'ISO code, e.g. "en"', sort: 2, width: 'half' },
          schema: { is_unique: true } },
        { field: 'name', type: 'string',
          meta: { interface: 'input', required: true, sort: 3, width: 'half' } },
        { field: 'flag', type: 'string',
          meta: { interface: 'input', note: 'Emoji flag', sort: 4, width: 'half' } },
        { field: 'is_default', type: 'boolean',
          meta: { interface: 'boolean', sort: 5, width: 'half' },
          schema: { default_value: false } },
        { field: 'sort', type: 'integer',
          meta: { interface: 'input', hidden: true, sort: 6 } },
      ],
    });
    console.log('  languages: created');
  }

  const existing = await directus.request(readItems('languages', { limit: -1, fields: ['code'] }));
  const existingCodes = new Set(existing.map((l) => l.code));
  for (const lang of FALLBACK_LANGS) {
    if (existingCodes.has(lang.code)) continue;
    await directus.request(createItem('languages', lang));
    console.log(`  languages: seeded ${lang.code}`);
  }
}

async function ensureTranslationKeys() {
  if (await exists('/collections/translation_keys')) {
    console.log('  translation_keys: already exists');
    return;
  }
  await api('/collections', 'POST', {
    collection: 'translation_keys',
    meta: {
      icon: 'translate',
      note: 'Translation keys (e.g. "nav.home"). Values stored per-language in translation_table.',
    },
    schema: { name: 'translation_keys' },
    fields: [
      { field: 'id', type: 'integer',
        meta: { hidden: true, interface: 'input', readonly: true },
        schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'key', type: 'string',
        meta: { interface: 'input', required: true, note: 'Translation key (e.g. "nav.home")', sort: 2, width: 'full' },
        schema: { is_unique: true } },
    ],
  });
  console.log('  translation_keys: created');
}

async function dropOldTranslationTables() {
  // Old name from a prior migration run; drop to allow clean rebuild.
  if (await exists('/collections/translation_keys_translations')) {
    await api('/collections/translation_keys_translations', 'DELETE');
    console.log('  translation_keys_translations: dropped (legacy)');
  }
  if (await exists('/collections/translation_table')) {
    await api('/collections/translation_table', 'DELETE');
    console.log('  translation_table: dropped (will rebuild)');
  }
  // The alias field on translation_keys may have survived; remove it so we
  // can recreate it pointing at the new relation.
  if (await exists('/fields/translation_keys/translations')) {
    await api('/fields/translation_keys/translations', 'DELETE');
    console.log('  translation_keys.translations alias: dropped');
  }
}

async function createTranslationTable() {
  await api('/collections', 'POST', {
    collection: 'translation_table',
    meta: {
      icon: 'translate',
      note: 'Per-language values for translation_keys.',
    },
    schema: { name: 'translation_table' },
    fields: [
      { field: 'id', type: 'integer',
        meta: { hidden: true, interface: 'input', readonly: true },
        schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'translation_keys_id', type: 'integer',
        meta: { hidden: true, interface: 'select-dropdown-m2o', sort: 2 } },
      { field: 'language', type: 'integer',
        meta: { interface: 'select-dropdown-m2o', required: true, sort: 3, width: 'half',
                options: { template: '{{code}} — {{name}}' } } },
      { field: 'value', type: 'text',
        meta: { interface: 'input-multiline', sort: 4, width: 'full' } },
    ],
  });
  console.log('  translation_table: created');

  await api('/relations', 'POST', {
    collection: 'translation_table',
    field: 'translation_keys_id',
    related_collection: 'translation_keys',
    meta: { one_field: 'translations', one_deselect_action: 'delete', sort_field: null },
    schema: { on_delete: 'CASCADE' },
  });
  console.log('  relation translation_table.translation_keys_id → translation_keys: created');

  await api('/relations', 'POST', {
    collection: 'translation_table',
    field: 'language',
    related_collection: 'languages',
    meta: { one_deselect_action: 'nullify', sort_field: null },
    schema: { on_delete: 'SET NULL' },
  });
  console.log('  relation translation_table.language → languages: created');

  await api('/fields/translation_keys', 'POST', {
    field: 'translations',
    type: 'alias',
    meta: {
      interface: 'list-o2m',
      special: ['o2m'],
      sort: 3,
      width: 'full',
      options: { template: '{{language.code}} — {{value}}', enableSelect: false },
    },
  });
  console.log('  alias translation_keys.translations: created');
}

async function migrateData() {
  const rows = await directus.request(readItems('i18n_strings', { limit: -1 }));
  console.log(`  read ${rows.length} rows from i18n_strings`);

  const langs = await directus.request(readItems('languages', { limit: -1, fields: ['id', 'code'] }));
  const codeToId = new Map(langs.map((l) => [l.code, l.id]));

  const byKey = {};
  for (const r of rows) {
    if (!codeToId.has(r.lang)) {
      console.warn(`  skipping row with unknown language: ${r.lang}`);
      continue;
    }
    if (!byKey[r.key]) byKey[r.key] = [];
    byKey[r.key].push({ language: codeToId.get(r.lang), value: r.value });
  }
  const keys = Object.keys(byKey);
  console.log(`  ${keys.length} unique keys`);

  const existing = await directus.request(
    readItems('translation_keys', { limit: -1, fields: ['key'] }),
  );
  const existingSet = new Set(existing.map((e) => e.key));

  let createdKeys = 0;
  let appendedTranslations = 0;
  for (const key of keys) {
    if (existingSet.has(key)) {
      // Look up existing key id, append translations
      const [row] = await directus.request(
        readItems('translation_keys', { filter: { key: { _eq: key } }, fields: ['id'], limit: 1 }),
      );
      if (!row) continue;
      for (const t of byKey[key]) {
        await directus.request(createItem('translation_table', { ...t, translation_keys_id: row.id }));
        appendedTranslations += 1;
      }
    } else {
      await directus.request(createItem('translation_keys', { key, translations: byKey[key] }));
      createdKeys += 1;
    }
    const total = createdKeys + appendedTranslations;
    if (total % 40 === 0 && total > 0) console.log(`    progress: ${createdKeys} new keys, ${appendedTranslations} translations appended`);
  }
  console.log(`  done: ${createdKeys} new keys, ${appendedTranslations} translations on existing keys`);
}

(async () => {
  console.log(`==> Targeting Directus at ${URL}`);
  console.log('==> 1. Languages...');
  await ensureLanguages();
  console.log('==> 2. Translation keys...');
  await ensureTranslationKeys();
  console.log('==> 3. Drop old translation tables (if any)...');
  await dropOldTranslationTables();
  console.log('==> 4. Build translation_table...');
  await createTranslationTable();
  console.log('==> 5. Migrate data...');
  await migrateData();
  console.log('==> Done.');
})();
