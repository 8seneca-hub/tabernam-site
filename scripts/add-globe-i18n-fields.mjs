#!/usr/bin/env node
// Add the translatable strings rendered by GlobeSection.tsx as fields on
// `home_translations`. Idempotent — re-running skips fields that exist.
//
// Usage:
//   DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=tabernam-admin-token \
//     node scripts/add-globe-i18n-fields.mjs

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

const FIELDS = [
  { field: 'globe_hint_drag', type: 'string', interface: 'input', note: 'Globe hint: drag instruction (use \\n for line break).' },
  { field: 'globe_hint_zoom', type: 'string', interface: 'input', note: 'Globe hint: zoom instruction (use \\n for line break).' },
  { field: 'globe_hint_clickCity', type: 'string', interface: 'input', note: 'Globe hint: click-city instruction (use \\n for line break).' },
  { field: 'globe_zoom_maxToast', type: 'string', interface: 'input', note: 'Toast shown when user hits the maximum zoom level.' },
  { field: 'globe_zoom_minToast', type: 'string', interface: 'input', note: 'Toast shown when user hits the minimum zoom level.' },
  { field: 'region_world', type: 'string', interface: 'input', note: 'Region selector label: World.' },
  { field: 'region_europe', type: 'string', interface: 'input', note: 'Region selector label: Europe.' },
  { field: 'region_asia', type: 'string', interface: 'input', note: 'Region selector label: Asia.' },
  { field: 'region_africa', type: 'string', interface: 'input', note: 'Region selector label: Africa.' },
  { field: 'region_americas', type: 'string', interface: 'input', note: 'Region selector label: Americas.' },
  { field: 'region_oceania', type: 'string', interface: 'input', note: 'Region selector label: Oceania.' },
];

for (const def of FIELDS) {
  await ensureField('home_translations', def);
}

console.log('Done.');
