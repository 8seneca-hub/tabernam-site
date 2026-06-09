#!/usr/bin/env node
// Add the "Go to location" and "Explore now" CTA strings on the city detail
// card to home_translations as translatable fields. Idempotent — re-running
// skips fields that already exist and overwrites translation values.
//
// Usage:
//   DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=tabernam-admin-token \
//     node scripts/add-globe-cta-i18n.mjs

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
      special: null,
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
  { field: 'panel_goToLocation', type: 'string', interface: 'input', note: 'City card button: re-centers the map on the selected city.' },
  { field: 'btn_exploreNow', type: 'string', interface: 'input', note: 'City card CTA: links to /activities for the selected city.' },
];

for (const def of FIELDS) {
  await ensureField('home_translations', def);
}

const VALUES = {
  en: {
    panel_goToLocation: 'Go to location',
    btn_exploreNow: 'Explore now',
  },
  sk: {
    panel_goToLocation: 'Prejsť na miesto',
    btn_exploreNow: 'Preskúmať',
  },
};

const rowsRes = await api('/items/home_translations?fields=id,language.code');
const idByLang = Object.fromEntries(rowsRes.data.map((r) => [r.language?.code, r.id]));

for (const [lang, values] of Object.entries(VALUES)) {
  const id = idByLang[lang];
  if (!id) {
    console.log(`  skip seed for ${lang} (no row found)`);
    continue;
  }
  await api(`/items/home_translations/${id}`, 'PATCH', values);
  console.log(`  patched ${lang} row (id=${id}) with ${Object.keys(values).length} values`);
}

console.log('Done.');
