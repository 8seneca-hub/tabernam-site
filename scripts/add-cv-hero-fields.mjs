#!/usr/bin/env node
// CV is moving off of About's PageTexts and onto its own model. The CV hero
// component currently reads `hero_name` and `portrait_image` from About — add
// those onto the cv collection so CV owns its own copy. Seeds hero_name from
// About's existing values so the UI keeps rendering identically.
//
// Usage:
//   DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=tabernam-admin-token \
//     node scripts/add-cv-hero-fields.mjs

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

await ensureField('cv_translations', {
  field: 'hero_name', type: 'string', interface: 'input',
  note: 'Name shown in the big hero banner on the CV page.',
});
await ensureField('cv', {
  field: 'portrait_image', type: 'uuid', interface: 'file-image', special: ['file'],
  note: 'Portrait photo in the CV hero (circular). Falls back to /tibor_image.png if unset.',
});
await ensureFileRelation('cv', 'portrait_image');

// Seed cv_translations.hero_name from About's existing values so the UI
// keeps rendering the user's name on the CV page.
const aboutRows = await api('/items/about_translations?fields=language.code,hero_name');
const aboutByLang = Object.fromEntries(
  aboutRows.data.map((r) => [r.language?.code, r.hero_name]).filter(([k]) => k),
);

const cvRows = await api('/items/cv_translations?fields=id,language.code');
for (const r of cvRows.data) {
  const code = r.language?.code;
  if (!code) continue;
  const heroName = aboutByLang[code];
  if (!heroName) {
    console.log(`  skip seed cv ${code} (no source hero_name)`);
    continue;
  }
  await api(`/items/cv_translations/${r.id}`, 'PATCH', { hero_name: heroName });
  console.log(`  seeded cv_translations.${code}.hero_name = "${heroName}"`);
}

console.log('Done.');
