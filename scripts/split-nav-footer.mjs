#!/usr/bin/env node
// Split the nav.* and footer.* dictionary keys out of `home_translations`
// into two dedicated singletons + translation tables: `nav`/`nav_translations`
// and `footer`/`footer_translations`. Mirrors the per-page singleton
// pattern used by home/about/contact/cv.
//
// Idempotent — re-running adds missing fields, refreshes data from
// home_translations, and drops the moved fields off home_translations.
//
// Usage:
//   DIRECTUS_URL=... DIRECTUS_TOKEN=... node scripts/split-nav-footer.mjs

const URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_TOKEN || 'tabernam-admin-token';

async function api(p, method = 'GET', body) {
  const res = await fetch(`${URL}${p}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${p} → ${res.status}: ${text}`);
  }
  return res.status === 204 ? null : res.json();
}
async function exists(p) { try { await api(p); return true; } catch { return false; } }

const NAV_FIELDS = ['nav_home', 'nav_about', 'nav_activity', 'nav_contact'];
const FOOTER_FIELDS = [
  'footer_navigation', 'footer_contact', 'footer_copyright',
  'footer_connectHeading', 'footer_established', 'footer_exploreHeading',
  'footer_globalOffices', 'footer_location', 'footer_presenceHeading',
  'footer_privacy', 'footer_tagline', 'footer_terms',
];

// ----- Schema helpers ----------------------------------------------------

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
      hidden: def.hidden || false,
    },
    schema: { name: def.field },
  });
  console.log(`    ${collection}.${def.field}`);
}

async function ensureRelation({ collection, field, related, alias = null, onDelete = 'SET NULL' }) {
  const all = await api('/relations');
  if (all.data.find((r) => r.collection === collection && r.field === field)) return;
  await api('/relations', 'POST', {
    collection, field, related_collection: related,
    meta: {
      many_collection: collection, many_field: field,
      one_collection: related, one_field: alias,
      one_deselect_action: onDelete === 'CASCADE' ? 'delete' : 'nullify',
      junction_field: null, sort_field: null,
    },
    schema: { on_delete: onDelete, on_update: 'NO ACTION' },
  });
  console.log(`    rel ${collection}.${field} → ${related}`);
}

async function ensureAlias(collection, field) {
  if (await exists(`/fields/${collection}/${field}`)) return;
  await api(`/fields/${collection}`, 'POST', {
    field, type: 'alias',
    meta: { special: ['o2m'], interface: 'list-o2m' },
  });
  console.log(`    ${collection}.${field} (alias)`);
}

async function buildSingleton(parent, fieldNames) {
  console.log(`\n==> ${parent}`);
  await ensureCollection(parent, { icon: parent === 'nav' ? 'menu' : 'horizontal_rule', singleton: true });

  const t = `${parent}_translations`;
  const parentFk = `${parent}_id`;
  await ensureCollection(t, { icon: 'translate', singleton: false });
  await ensureField(t, { field: parentFk, type: 'integer', interface: 'select-dropdown-m2o', hidden: true });
  await ensureField(t, {
    field: 'language', type: 'integer', required: true,
    interface: 'select-dropdown-m2o',
    options: { enableCreate: false, template: '{{code}}' },
    display: 'related-values',
    display_options: { template: '{{code}}' },
  });
  for (const f of fieldNames) {
    await ensureField(t, { field: f, type: 'string', interface: 'input' });
  }
  await ensureRelation({ collection: t, field: parentFk, related: parent, alias: 'translations', onDelete: 'CASCADE' });
  await ensureRelation({ collection: t, field: 'language', related: 'languages' });
  await ensureAlias(parent, 'translations');
}

// ----- Data migration ----------------------------------------------------

async function listLanguages() {
  return (await api('/items/languages?fields=id,code&limit=-1')).data || [];
}

async function migrate(parent, fieldNames, languages) {
  console.log(`\n==> Migrating ${parent} data from home_translations`);
  // Read existing values from home_translations
  const fieldsParam = ['id', 'language', ...fieldNames].join(',');
  const homeRows = (await api(`/items/home_translations?fields=${fieldsParam}&limit=-1`)).data || [];

  // Ensure the parent singleton exists with an id
  await api(`/items/${parent}`, 'PATCH', {});
  const parentId = (await api(`/items/${parent}`)).data.id;

  // Wipe + repopulate translations
  const tCollection = `${parent}_translations`;
  const existing = (await api(`/items/${tCollection}?fields=id&limit=-1`)).data || [];
  const ids = existing.map((r) => r.id);
  if (ids.length) {
    await api(`/items/${tCollection}`, 'DELETE', ids);
    console.log(`  wiped ${ids.length} existing rows`);
  }

  const rows = [];
  for (const home of homeRows) {
    const row = { [`${parent}_id`]: parentId, language: home.language };
    let hasContent = false;
    for (const f of fieldNames) {
      if (home[f] != null && home[f] !== '') {
        row[f] = home[f];
        hasContent = true;
      }
    }
    if (hasContent) rows.push(row);
  }
  if (rows.length) {
    await api(`/items/${tCollection}`, 'POST', rows);
    console.log(`  inserted ${rows.length} rows`);
  }
}

async function dropFieldsFromHome(fieldNames) {
  console.log('\n==> Dropping moved fields from home_translations');
  for (const f of fieldNames) {
    if (await exists(`/fields/home_translations/${f}`)) {
      await api(`/fields/home_translations/${f}`, 'DELETE');
      console.log(`  dropped home_translations.${f}`);
    }
  }
}

async function main() {
  console.log(`Splitting nav + footer out of home on ${URL}`);
  await buildSingleton('nav', NAV_FIELDS);
  await buildSingleton('footer', FOOTER_FIELDS);

  const languages = await listLanguages();
  console.log(`\nLanguages: ${languages.map((l) => `${l.id}=${l.code}`).join(', ')}`);

  await migrate('nav', NAV_FIELDS, languages);
  await migrate('footer', FOOTER_FIELDS, languages);

  await dropFieldsFromHome([...NAV_FIELDS, ...FOOTER_FIELDS]);

  console.log('\nDone.');
}

main().catch((e) => { console.error(e); process.exit(1); });
