#!/usr/bin/env node
// Convert `activities_translations.language` from a plain string code into
// an M2O integer FK to the `languages` collection — matching the pattern
// used by translation_table and page_text_translations.
//
// Steps:
//   1. Read existing activities_translations rows (backup in memory).
//   2. Drop the activities_translations collection (also removes the
//      'translations' alias on activities).
//   3. Recreate with language as integer M2O to languages.
//   4. Re-insert rows, mapping each row's language code → languages.id.
//
// Idempotent: safe to re-run; if the new shape already exists it falls
// through to data migration.
//
// Usage:
//   DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=tabernam-admin-token \
//     node scripts/migrate-activities-translations.mjs

import { createDirectus, rest, staticToken, readItems, createItem } from '@directus/sdk';

const URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_TOKEN || 'tabernam-admin-token';

const directus = createDirectus(URL).with(staticToken(TOKEN)).with(rest());

async function api(path, method = 'GET', body) {
  const res = await fetch(`${URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
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

async function getLanguageField() {
  try {
    const res = await api('/fields/activities_translations/language');
    return res.data;
  } catch {
    return null;
  }
}

async function backupRows() {
  if (!(await exists('/collections/activities_translations'))) return [];
  const rows = await directus.request(
    readItems('activities_translations', {
      limit: -1,
      fields: ['activities_id', 'language', 'name', 'business', 'description'],
    }),
  );
  console.log(`  backed up ${rows.length} rows`);
  return rows;
}

async function dropOld() {
  if (await exists('/collections/activities_translations')) {
    await api('/collections/activities_translations', 'DELETE');
    console.log('  activities_translations: dropped');
  }
  if (await exists('/fields/activities/translations')) {
    await api('/fields/activities/translations', 'DELETE');
    console.log('  activities.translations alias: dropped');
  }
}

async function recreate() {
  await api('/collections', 'POST', {
    collection: 'activities_translations',
    meta: {
      icon: 'translate',
      note: 'Per-language fields for activities',
    },
    schema: { name: 'activities_translations' },
    fields: [
      { field: 'id', type: 'integer',
        meta: { hidden: true, interface: 'input', readonly: true },
        schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'activities_id', type: 'integer',
        meta: { hidden: true, interface: 'select-dropdown-m2o', sort: 2 } },
      { field: 'language', type: 'integer',
        meta: {
          interface: 'select-dropdown-m2o', required: true, sort: 3, width: 'half',
          options: { template: '{{code}} — {{name}}', enableCreate: false },
        } },
      { field: 'name', type: 'string',
        meta: { interface: 'input', note: 'City / region label (e.g. Beijing)', sort: 4, width: 'full' } },
      { field: 'business', type: 'string',
        meta: { interface: 'input', note: 'Office / business title shown big', sort: 5, width: 'full' } },
      { field: 'description', type: 'text',
        meta: { interface: 'input-multiline', note: 'Card body paragraph', sort: 6, width: 'full' } },
    ],
  });
  console.log('  activities_translations: created');

  await api('/relations', 'POST', {
    collection: 'activities_translations',
    field: 'activities_id',
    related_collection: 'activities',
    meta: { one_field: 'translations', one_deselect_action: 'delete', sort_field: null },
    schema: { on_delete: 'CASCADE' },
  });
  console.log('  relation activities_translations.activities_id → activities: created');

  await api('/relations', 'POST', {
    collection: 'activities_translations',
    field: 'language',
    related_collection: 'languages',
    meta: { one_deselect_action: 'nullify', sort_field: null },
    schema: { on_delete: 'SET NULL' },
  });
  console.log('  relation activities_translations.language → languages: created');

  await api('/fields/activities', 'POST', {
    field: 'translations',
    type: 'alias',
    meta: {
      interface: 'list-o2m',
      special: ['o2m'],
      sort: 7,
      width: 'full',
      options: { template: '{{language.code}} — {{name}}', enableSelect: false },
    },
  });
  console.log('  alias activities.translations: created');
}

async function restoreRows(rows) {
  if (rows.length === 0) {
    console.log('  no rows to restore');
    return;
  }
  const langs = await directus.request(readItems('languages', { limit: -1, fields: ['id', 'code'] }));
  const codeToId = new Map(langs.map((l) => [l.code, l.id]));

  let count = 0;
  for (const r of rows) {
    const langId = codeToId.get(r.language);
    if (!langId) {
      console.warn(`  skipping row with unknown language: ${r.language}`);
      continue;
    }
    await directus.request(createItem('activities_translations', {
      activities_id: r.activities_id,
      language: langId,
      name: r.name,
      business: r.business,
      description: r.description,
    }));
    count += 1;
    if (count % 20 === 0) console.log(`    restored ${count}/${rows.length}`);
  }
  console.log(`  restored ${count} rows`);
}

(async () => {
  console.log(`==> Targeting Directus at ${URL}`);

  // Detect if already migrated: language field is integer not string
  const langField = await getLanguageField();
  if (langField && langField.type === 'integer') {
    console.log('==> activities_translations.language is already integer — nothing to do.');
    return;
  }

  console.log('==> 1. Backing up existing rows...');
  const rows = await backupRows();
  console.log('==> 2. Dropping old collection...');
  await dropOld();
  console.log('==> 3. Recreating with new schema...');
  await recreate();
  console.log('==> 4. Restoring rows with language FK...');
  await restoreRows(rows);
  console.log('==> Done.');
})();
