#!/usr/bin/env node
// Normalize `page_texts` (flat: page, section, lang, content) into:
//
//   page_text_keys         (id, page, section, translations[])
//   page_text_translations (id, page_text_keys_id → page_text_keys,
//                            language → languages, content)
//
// Idempotent: re-running drops page_text_translations and rebuilds from
// page_texts. page_text_keys rows are deduped by (page, section).
//
// Usage:
//   DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=tabernam-admin-token \
//     node scripts/migrate-page-texts.mjs

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
  try { await api(path); return true; } catch { return false; }
}

async function ensurePageTextKeys() {
  if (await exists('/collections/page_text_keys')) {
    console.log('  page_text_keys: already exists');
    return;
  }
  await api('/collections', 'POST', {
    collection: 'page_text_keys',
    meta: {
      icon: 'description',
      note: 'Per-page text sections. Per-language content stored in page_text_translations.',
    },
    schema: { name: 'page_text_keys' },
    fields: [
      { field: 'id', type: 'integer',
        meta: { hidden: true, interface: 'input', readonly: true },
        schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'page', type: 'string',
        meta: { interface: 'input', required: true, note: 'e.g. "home", "about", "contact"', sort: 2, width: 'half' } },
      { field: 'section', type: 'string',
        meta: { interface: 'input', required: true, note: 'e.g. "hero_title", "about_body_1"', sort: 3, width: 'half' } },
    ],
  });
  console.log('  page_text_keys: created');
}

async function dropOldPageTextTranslations() {
  if (await exists('/collections/page_text_translations')) {
    await api('/collections/page_text_translations', 'DELETE');
    console.log('  page_text_translations: dropped (will rebuild)');
  }
  if (await exists('/fields/page_text_keys/translations')) {
    await api('/fields/page_text_keys/translations', 'DELETE');
    console.log('  page_text_keys.translations alias: dropped');
  }
}

async function createPageTextTranslations() {
  await api('/collections', 'POST', {
    collection: 'page_text_translations',
    meta: {
      icon: 'translate',
      note: 'Per-language content for page_text_keys.',
    },
    schema: { name: 'page_text_translations' },
    fields: [
      { field: 'id', type: 'integer',
        meta: { hidden: true, interface: 'input', readonly: true },
        schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'page_text_keys_id', type: 'integer',
        meta: { hidden: true, interface: 'select-dropdown-m2o', sort: 2 } },
      { field: 'language', type: 'integer',
        meta: {
          interface: 'select-dropdown-m2o', required: true, sort: 3, width: 'half',
          options: { template: '{{code}} — {{name}}', enableCreate: false },
        } },
      { field: 'content', type: 'text',
        meta: { interface: 'input-multiline', sort: 4, width: 'full' } },
    ],
  });
  console.log('  page_text_translations: created');

  await api('/relations', 'POST', {
    collection: 'page_text_translations',
    field: 'page_text_keys_id',
    related_collection: 'page_text_keys',
    meta: { one_field: 'translations', one_deselect_action: 'delete', sort_field: null },
    schema: { on_delete: 'CASCADE' },
  });
  console.log('  relation page_text_translations.page_text_keys_id → page_text_keys: created');

  await api('/relations', 'POST', {
    collection: 'page_text_translations',
    field: 'language',
    related_collection: 'languages',
    meta: { one_deselect_action: 'nullify', sort_field: null },
    schema: { on_delete: 'SET NULL' },
  });
  console.log('  relation page_text_translations.language → languages: created');

  await api('/fields/page_text_keys', 'POST', {
    field: 'translations',
    type: 'alias',
    meta: {
      interface: 'list-o2m',
      special: ['o2m'],
      sort: 4,
      width: 'full',
      options: { template: '{{language.code}} — {{content}}', enableSelect: false },
    },
  });
  console.log('  alias page_text_keys.translations: created');
}

async function migrateData() {
  const rows = await directus.request(readItems('page_texts', { limit: -1 }));
  console.log(`  read ${rows.length} rows from page_texts`);

  const langs = await directus.request(readItems('languages', { limit: -1, fields: ['id', 'code'] }));
  const codeToId = new Map(langs.map((l) => [l.code, l.id]));

  // Group by (page, section)
  const byPair = new Map();
  for (const r of rows) {
    if (!codeToId.has(r.lang)) {
      console.warn(`  skipping row with unknown language: ${r.lang}`);
      continue;
    }
    const k = `${r.page}|${r.section}`;
    if (!byPair.has(k)) byPair.set(k, { page: r.page, section: r.section, translations: [] });
    byPair.get(k).translations.push({ language: codeToId.get(r.lang), content: r.content });
  }
  console.log(`  ${byPair.size} unique (page, section) pairs`);

  // Existing keys (idempotent)
  const existingKeys = await directus.request(
    readItems('page_text_keys', { limit: -1, fields: ['id', 'page', 'section'] }),
  );
  const existingByPair = new Map(existingKeys.map((k) => [`${k.page}|${k.section}`, k.id]));

  let newKeys = 0;
  let appended = 0;
  for (const [pair, entry] of byPair) {
    if (existingByPair.has(pair)) {
      // Append translations to existing key
      for (const t of entry.translations) {
        await directus.request(createItem('page_text_translations', {
          ...t,
          page_text_keys_id: existingByPair.get(pair),
        }));
        appended += 1;
      }
    } else {
      await directus.request(createItem('page_text_keys', {
        page: entry.page,
        section: entry.section,
        translations: entry.translations,
      }));
      newKeys += 1;
    }
    if ((newKeys + appended) % 30 === 0) {
      console.log(`    progress: ${newKeys} new keys, ${appended} translations appended`);
    }
  }
  console.log(`  done: ${newKeys} new keys, ${appended} translations appended to existing keys`);
}

(async () => {
  console.log(`==> Targeting Directus at ${URL}`);
  console.log('==> 1. Ensure page_text_keys...');
  await ensurePageTextKeys();
  console.log('==> 2. Drop old page_text_translations (if any)...');
  await dropOldPageTextTranslations();
  console.log('==> 3. Build page_text_translations...');
  await createPageTextTranslations();
  console.log('==> 4. Migrate data...');
  await migrateData();
  console.log('==> Done.');
})();
