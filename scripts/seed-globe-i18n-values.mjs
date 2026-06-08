#!/usr/bin/env node
// Populate the 11 globe-related fields on home_translations (en + sk).
// Idempotent — PATCH overwrites whatever value was there. Run against both
// local and production:
//
//   DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=tabernam-admin-token \
//     node scripts/seed-globe-i18n-values.mjs
//
//   DIRECTUS_URL=<prod> DIRECTUS_TOKEN=<prod> node scripts/seed-globe-i18n-values.mjs

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

const VALUES = {
  en: {
    globe_hint_drag: 'Drag to move the\nglobe around',
    globe_hint_zoom: 'Zoom in & out\nto view',
    globe_hint_clickCity: 'Click on city to view\ndetails',
    globe_zoom_maxToast: "Maximum zoom — you can't zoom in any closer.",
    globe_zoom_minToast: "Minimum zoom — you can't zoom out any further.",
    region_world: 'World',
    region_europe: 'Europe',
    region_asia: 'Asia',
    region_africa: 'Africa',
    region_americas: 'Americas',
    region_oceania: 'Oceania',
  },
  sk: {
    globe_hint_drag: 'Ťahaj pre pohyb\npo zemeguli',
    globe_hint_zoom: 'Priblíž a oddiaľ\npre prehliadanie',
    globe_hint_clickCity: 'Klikni na mesto\npre detaily',
    globe_zoom_maxToast: 'Maximálne priblíženie — bližšie sa už nedostaneš.',
    globe_zoom_minToast: 'Minimálne priblíženie — ďalej už oddialiť nemôžeš.',
    region_world: 'Svet',
    region_europe: 'Európa',
    region_asia: 'Ázia',
    region_africa: 'Afrika',
    region_americas: 'Amerika',
    region_oceania: 'Oceánia',
  },
};

const rowsRes = await api('/items/home_translations?fields=id,language.code');
const idByLang = Object.fromEntries(rowsRes.data.map((r) => [r.language?.code, r.id]));

for (const [lang, values] of Object.entries(VALUES)) {
  const id = idByLang[lang];
  if (!id) {
    console.log(`  skip ${lang} (no row found on this Directus)`);
    continue;
  }
  await api(`/items/home_translations/${id}`, 'PATCH', values);
  console.log(`  patched ${lang} row (id=${id}) with ${Object.keys(values).length} fields`);
}

console.log('Done.');
