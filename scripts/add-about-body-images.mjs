#!/usr/bin/env node
// Add `body_image_1/2/3` asset fields to the About page singleton so the three
// hardcoded /carousel/photo-*.jpg slots in AboutContent's ContentBlocks become
// editable in Directus. Idempotent.
//
// Usage:
//   DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=tabernam-admin-token \
//     node scripts/add-about-body-images.mjs

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

async function ensureField(collection, def) {
  if (await exists(`/fields/${collection}/${def.field}`)) {
    console.log(`  skip ${collection}.${def.field} (exists)`);
    return;
  }
  await api(`/fields/${collection}`, 'POST', {
    field: def.field,
    type: def.type,
    meta: {
      interface: def.interface,
      special: def.special || null,
      required: false,
      options: null,
      note: def.note || null,
      hidden: false,
    },
    schema: { name: def.field },
  });
  console.log(`  added ${collection}.${def.field}`);
}

async function ensureFileRelation(collection, field) {
  const all = await api('/relations');
  if (all.data.find((r) => r.collection === collection && r.field === field)) return;
  await api('/relations', 'POST', {
    collection,
    field,
    related_collection: 'directus_files',
    meta: {
      many_collection: collection,
      many_field: field,
      one_collection: 'directus_files',
      one_field: null,
      one_deselect_action: 'nullify',
      junction_field: null,
      sort_field: null,
    },
    schema: { on_delete: 'SET NULL', on_update: 'NO ACTION' },
  });
  console.log(`    rel ${collection}.${field} → directus_files`);
}

const FIELDS = [
  { field: 'body_image_1', type: 'uuid', interface: 'file-image', special: ['file'], note: 'Left image of the two-image block under the intro paragraphs.' },
  { field: 'body_image_2', type: 'uuid', interface: 'file-image', special: ['file'], note: 'Right image of the two-image block under the intro paragraphs.' },
  { field: 'body_image_3', type: 'uuid', interface: 'file-image', special: ['file'], note: 'Single image shown between the mid-page paragraphs.' },
];

for (const def of FIELDS) {
  await ensureField('about', def);
  await ensureFileRelation('about', def.field);
}

console.log('Done.');
