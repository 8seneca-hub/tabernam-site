#!/usr/bin/env node
// Create the `home_marquee` collection on the LOCAL Directus
// (http://localhost:8055). Stores the images shown in the three-row marquee
// on the Home page. Each row in the marquee is one document; the `row` field
// (1, 2, or 3) decides which track the image scrolls on. `sort` orders
// images within a row.
//
// Idempotent: re-running skips the collection and any fields that already
// exist.
//
// Usage:
//   DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=tabernam-admin-token \
//     node scripts/create-home-marquee.mjs

const URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_TOKEN || 'tabernam-admin-token';

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

async function exists(p) {
  try { await api(p); return true; } catch { return false; }
}

async function ensureCollection(collection, meta) {
  if (await exists(`/collections/${collection}`)) return;
  await api('/collections', 'POST', {
    collection,
    meta: { collection, hidden: false, ...meta },
    schema: { name: collection },
  });
  console.log(`  ${collection}: created`);
}

async function ensureField(collection, def) {
  if (await exists(`/fields/${collection}/${def.field}`)) return;
  await api(`/fields/${collection}`, 'POST', {
    field: def.field,
    type: def.type,
    meta: {
      interface: def.interface,
      special: def.special || null,
      required: def.required || false,
      options: def.options || null,
      display: def.display || null,
      display_options: def.display_options || null,
      note: def.note || null,
      hidden: def.hidden || false,
    },
    schema: def.schema || { name: def.field },
  });
  console.log(`    ${collection}.${def.field}`);
}

await ensureCollection('home_marquee', {
  icon: 'view_carousel',
  note: 'Images shown in the three-row marquee on the Home page.',
  singleton: false,
  sort_field: 'sort',
  display_template: 'Row {{row}} — {{alt}}',
});

await ensureField('home_marquee', {
  field: 'image',
  type: 'uuid',
  interface: 'file-image',
  special: ['file'],
  required: true,
  note: 'Marquee image (used by <img>; alt text below).',
});

await ensureField('home_marquee', {
  field: 'alt',
  type: 'string',
  interface: 'input',
  note: 'Alt text for screen readers. Leave blank for decorative-only images.',
});

await ensureField('home_marquee', {
  field: 'row',
  type: 'integer',
  interface: 'select-dropdown',
  required: true,
  options: {
    choices: [
      { text: 'Row 1 (scrolls right)', value: 1 },
      { text: 'Row 2 (scrolls left)', value: 2 },
      { text: 'Row 3 (scrolls right)', value: 3 },
    ],
  },
  note: 'Which marquee track this image belongs to.',
  schema: { name: 'row', default_value: 1 },
});

await ensureField('home_marquee', {
  field: 'sort',
  type: 'integer',
  interface: 'input',
  hidden: true,
});

// Foreign-key relation so deleting the file nullifies the row instead of
// orphaning the reference.
const relations = await api('/relations');
const hasFileRel = relations.data.find(
  (r) => r.collection === 'home_marquee' && r.field === 'image',
);
if (!hasFileRel) {
  await api('/relations', 'POST', {
    collection: 'home_marquee',
    field: 'image',
    related_collection: 'directus_files',
    meta: {
      many_collection: 'home_marquee',
      many_field: 'image',
      one_collection: 'directus_files',
      one_field: null,
      one_deselect_action: 'nullify',
      junction_field: null,
      sort_field: null,
    },
    schema: { on_delete: 'SET NULL', on_update: 'NO ACTION' },
  });
  console.log('    rel home_marquee.image → directus_files');
}

console.log('Done.');
