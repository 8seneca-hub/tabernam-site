#!/usr/bin/env node
// Make the TravelRoutes block on the About page editable in Directus:
//   • text: heading, body, and per-tab name → about_translations
//   • assets: per-tab map image → about singleton
// Seeds the current hardcoded copy into the en + sk translation rows so the
// UI keeps rendering identically until someone edits it. Idempotent.
//
// Usage:
//   DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=tabernam-admin-token \
//     node scripts/add-travel-routes-i18n.mjs

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

const TEXT_FIELDS = [
  { field: 'travel_routes_heading', type: 'string', interface: 'input', note: 'Heading for the TravelRoutes block.' },
  { field: 'travel_routes_body', type: 'text', interface: 'input-multiline', note: 'Body paragraph under the heading.' },
  { field: 'travel_routes_china_name', type: 'string', interface: 'input', note: 'Tab label for the China map.' },
  { field: 'travel_routes_america_name', type: 'string', interface: 'input', note: 'Tab label for the America map.' },
  { field: 'travel_routes_europe_name', type: 'string', interface: 'input', note: 'Tab label for the Europe map.' },
];

const ASSET_FIELDS = [
  { field: 'travel_routes_china_image', type: 'uuid', interface: 'file-image', special: ['file'], note: 'Map image shown when the China tab is active.' },
  { field: 'travel_routes_america_image', type: 'uuid', interface: 'file-image', special: ['file'], note: 'Map image shown when the America tab is active.' },
  { field: 'travel_routes_europe_image', type: 'uuid', interface: 'file-image', special: ['file'], note: 'Map image shown when the Europe tab is active.' },
];

for (const def of TEXT_FIELDS) await ensureField('about_translations', def);
for (const def of ASSET_FIELDS) {
  await ensureField('about', def);
  await ensureFileRelation('about', def.field);
}

// Seed the current hardcoded text values per language.
const EN_BODY = 'My work and curiosity have carried me across continents — from long chapters in Asia to projects spanning Europe. Every destination left something behind: a partner, a lesson, a story worth telling. Explore where I’ve been, and reach out if any of these places speak to you.';
const SK_BODY = 'Moja práca a zvedavosť ma zaviedli naprieč kontinentmi — od dlhých kapitol v Ázii až po projekty v Európe. Každá destinácia po sebe niečo zanechala: partnera, lekciu, príbeh, ktorý stojí za rozprávanie. Pozrite sa, kde som bol, a ozvite sa, ak vás niektoré z týchto miest zaujme.';

const VALUES = {
  en: {
    travel_routes_heading: 'My Travel Routes',
    travel_routes_body: EN_BODY,
    travel_routes_china_name: 'China',
    travel_routes_america_name: 'America',
    travel_routes_europe_name: 'Europe',
  },
  sk: {
    travel_routes_heading: 'Moje cesty',
    travel_routes_body: SK_BODY,
    travel_routes_china_name: 'Čína',
    travel_routes_america_name: 'Amerika',
    travel_routes_europe_name: 'Európa',
  },
};

const rowsRes = await api('/items/about_translations?fields=id,language.code');
const idByLang = Object.fromEntries(rowsRes.data.map((r) => [r.language?.code, r.id]));

for (const [lang, values] of Object.entries(VALUES)) {
  const id = idByLang[lang];
  if (!id) { console.log(`  skip seed ${lang} (no row)`); continue; }
  await api(`/items/about_translations/${id}`, 'PATCH', values);
  console.log(`  patched ${lang} row (id=${id}) with ${Object.keys(values).length} values`);
}

console.log('Done.');
