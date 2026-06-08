#!/usr/bin/env node
// Move the TravelRoutes map images out of the About singleton into a dedicated
// `travel_route_map` collection (one row per region). Region NAMES stay on
// `about_translations.travel_routes_<slug>_name` since they're translatable;
// this collection only stores the (language-agnostic) image + slug.
//
// Idempotent: skips fields/rows that already exist.
//
// Usage:
//   DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=tabernam-admin-token \
//     node scripts/create-travel-route-map.mjs

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
      note: def.note || null,
      hidden: def.hidden || false,
    },
    schema: def.schema || { name: def.field },
  });
  console.log(`    ${collection}.${def.field}`);
}

await ensureCollection('travel_route_map', {
  icon: 'map',
  note: 'Map images shown in the About page TravelRoutes tabs.',
  singleton: false,
  sort_field: 'sort',
  display_template: '{{slug}}',
});

await ensureField('travel_route_map', {
  field: 'slug',
  type: 'string',
  interface: 'input',
  required: true,
  note: 'Stable identifier the frontend keys on (e.g. "china", "america", "europe").',
});

await ensureField('travel_route_map', {
  field: 'image',
  type: 'uuid',
  interface: 'file-image',
  special: ['file'],
  note: 'Map image rendered when this tab is active.',
});

await ensureField('travel_route_map', {
  field: 'sort',
  type: 'integer',
  interface: 'input',
  hidden: true,
});

// FK relation so deleting the file nullifies the reference.
const relations = await api('/relations');
const hasFileRel = relations.data.find(
  (r) => r.collection === 'travel_route_map' && r.field === 'image',
);
if (!hasFileRel) {
  await api('/relations', 'POST', {
    collection: 'travel_route_map',
    field: 'image',
    related_collection: 'directus_files',
    meta: {
      many_collection: 'travel_route_map',
      many_field: 'image',
      one_collection: 'directus_files',
      one_field: null,
      one_deselect_action: 'nullify',
      junction_field: null,
      sort_field: null,
    },
    schema: { on_delete: 'SET NULL', on_update: 'NO ACTION' },
  });
  console.log('    rel travel_route_map.image → directus_files');
}

// Seed the three slugs with sort order matching the previous render order.
const existing = await api('/items/travel_route_map?fields=slug');
const existingSlugs = new Set(existing.data.map((r) => r.slug));
const SEED = [
  { slug: 'china', sort: 1 },
  { slug: 'america', sort: 2 },
  { slug: 'europe', sort: 3 },
];
for (const row of SEED) {
  if (existingSlugs.has(row.slug)) {
    console.log(`  skip row ${row.slug} (exists)`);
    continue;
  }
  await api('/items/travel_route_map', 'POST', row);
  console.log(`  seeded row ${row.slug}`);
}

// Drop the now-unused image fields on the About singleton.
const STALE = ['travel_routes_china_image', 'travel_routes_america_image', 'travel_routes_europe_image'];
for (const f of STALE) {
  const res = await fetch(`${URL}/fields/about/${f}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (res.status === 204) console.log(`  removed about.${f}`);
  else if (res.status === 403 || res.status === 404) console.log(`  skip about.${f} (already absent)`);
  else console.log(`  FAIL about.${f} → ${res.status}: ${await res.text()}`);
}

console.log('Done.');
