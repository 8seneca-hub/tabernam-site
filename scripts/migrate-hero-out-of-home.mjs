#!/usr/bin/env node
// Move hero text (hero.title / hero.body) out of home_translations into a
// dedicated `hero` singleton + `hero_translations` collection. Idempotent:
// re-running converges. Pass `--dry-run` to skip the destructive step that
// drops hero_title / hero_body from home_translations.
//
// Usage:
//   DIRECTUS_URL=https://directus-production-3a8d.up.railway.app \
//     DIRECTUS_TOKEN=tabernam-admin-token \
//     node scripts/migrate-hero-out-of-home.mjs [--dry-run]

const URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_TOKEN || 'tabernam-admin-token';
const DRY_RUN = process.argv.includes('--dry-run');

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
  if (await exists(`/collections/${collection}`)) {
    console.log(`  skip collection ${collection} (exists)`);
    return;
  }
  await api('/collections', 'POST', {
    collection,
    meta: { collection, hidden: false, ...meta },
    schema: { name: collection },
  });
  console.log(`  collection ${collection} created`);
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
      required: def.required || false,
      options: def.options || null,
      note: def.note || null,
      hidden: def.hidden || false,
    },
    schema: def.schema === null ? null : (def.schema || { name: def.field }),
  });
  console.log(`  added ${collection}.${def.field}`);
}

async function ensureRelation(many, field, related, oneField) {
  const list = await api('/relations');
  const has = list.data.find((r) => r.collection === many && r.field === field);
  if (has) {
    console.log(`  skip relation ${many}.${field} → ${related} (exists)`);
    return;
  }
  await api('/relations', 'POST', {
    collection: many,
    field,
    related_collection: related,
    meta: {
      many_collection: many,
      many_field: field,
      one_collection: related,
      one_field: oneField,
      one_deselect_action: 'nullify',
      junction_field: null,
      sort_field: null,
    },
    schema: { on_delete: 'SET NULL', on_update: 'NO ACTION' },
  });
  console.log(`  rel ${many}.${field} → ${related}${oneField ? ` (alias: ${oneField})` : ''}`);
}

// 1) Parent singleton
await ensureCollection('hero', {
  singleton: true,
  icon: 'wallpaper',
  note: 'Home page hero section. Singleton — exactly one row.',
});

// 2) Translations collection
await ensureCollection('hero_translations', {
  hidden: false,
  icon: 'translate',
  note: 'Per-language hero text (title, body).',
});

// 3) Translations table columns
await ensureField('hero_translations', {
  field: 'hero_id', type: 'integer', interface: 'select-dropdown-m2o', special: ['m2o'], hidden: true,
});
await ensureField('hero_translations', {
  field: 'language', type: 'integer', interface: 'select-dropdown-m2o', special: ['m2o'],
});
await ensureField('hero_translations', {
  field: 'title', type: 'string', interface: 'input', note: 'Hero headline.',
});
await ensureField('hero_translations', {
  field: 'body', type: 'text', interface: 'input-multiline', note: 'Hero subhead / body.',
});

// 4) Alias on parent so the admin UI shows a Translations tab
await ensureField('hero', {
  field: 'translations',
  type: 'alias',
  interface: 'translations',
  special: ['translations'],
  schema: null,
  note: 'Per-language hero content.',
});

// 5) Relations: hero_id → hero (with `translations` alias on parent), language → languages
await ensureRelation('hero_translations', 'hero_id', 'hero', 'translations');
await ensureRelation('hero_translations', 'language', 'languages', null);

// 6) Ensure the singleton row exists.
// Singletons don't accept POST /items/<col>; use PATCH (upsert) instead.
// GET returns `data: {id, ...}` once the row exists, or 404s / nulls before.
let heroId;
try {
  const heroRowsRes = await api('/items/hero?fields=id');
  heroId = heroRowsRes?.data?.id ?? null;
} catch {
  heroId = null;
}
if (!heroId) {
  const created = await api('/items/hero', 'PATCH', {});
  heroId = created.data.id;
  console.log(`  hero: inserted singleton row (id=${heroId})`);
} else {
  console.log(`  hero: singleton row exists (id=${heroId})`);
}

// 7) Copy values from home_translations.
// languages.id (integer) is the actual FK target — `code` is just a label.
// Build a code→id map so we send integer FKs, matching home_translations.language.
const langRes = await api('/items/languages?fields=id,code&limit=-1');
const langIdByCode = Object.fromEntries((langRes.data || []).map((l) => [l.code, l.id]));

const homeRows = await api('/items/home_translations?fields=id,language.code,hero_title,hero_body');
const existingHeroTrRes = await api(`/items/hero_translations?fields=id,language.code&filter%5Bhero_id%5D%5B_eq%5D=${heroId}`);
const existingByLang = Object.fromEntries(
  (existingHeroTrRes.data || []).map((r) => [r.language?.code, r.id]),
);

for (const row of homeRows.data || []) {
  const code = row.language?.code;
  if (!code) continue;
  const langId = langIdByCode[code];
  if (!langId) {
    console.log(`  skip ${code}: language row not found in languages collection`);
    continue;
  }
  const payload = {
    hero_id: heroId,
    language: langId,
    title: row.hero_title ?? '',
    body: row.hero_body ?? '',
  };
  if (existingByLang[code]) {
    await api(`/items/hero_translations/${existingByLang[code]}`, 'PATCH', payload);
    console.log(`  hero_translations[${code}]: updated`);
  } else {
    await api('/items/hero_translations', 'POST', payload);
    console.log(`  hero_translations[${code}]: created`);
  }
}

// 8) Destructive: drop old fields. Skipped when --dry-run.
if (DRY_RUN) {
  console.log('\n--dry-run set: skipping field drops on home_translations.');
} else {
  for (const f of ['hero_title', 'hero_body']) {
    if (await exists(`/fields/home_translations/${f}`)) {
      console.log(`\nAbout to delete home_translations.${f}`);
      await api(`/fields/home_translations/${f}`, 'DELETE');
      console.log(`  home_translations.${f}: deleted`);
    } else {
      console.log(`  skip drop home_translations.${f} (already absent)`);
    }
  }
}

console.log('\nDone.');
