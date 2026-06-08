#!/usr/bin/env node
// Build per-page singletons on the LOCAL Directus (http://localhost:8055):
//
//   home    (+ home_translations)   — hero + quote + globe intro text
//   about   (+ about_translations)  — full About page content + assets
//   contact (+ contact_translations + contact_files) — page text +
//                                      contact_offices ops data merged in
//   cv      (+ cv_translations)     — full CV content (~114 fields)
//
// Each translation row's `language` is an integer FK to languages.id, but
// both the form-edit interface AND the list-view display use the template
// `{{code}}` so the admin sees "en" / "sk" / "vn" everywhere instead of
// "1" / "2" / "3".
//
// Data is copied from the existing page_text_keys / translation_keys /
// contact_offices sources. The legacy collections are NOT dropped — that's
// a separate cleanup step once the frontend is verified.
//
// Idempotent: re-running skips collections/fields that already exist and
// rewrites translation rows from the current source state.
//
// Usage:
//   DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=tabernam-admin-token \
//     node scripts/build-page-models-local.mjs

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
      note: def.note || null,
      hidden: def.hidden || false,
    },
    schema: def.schema || { name: def.field },
  });
  console.log(`    ${collection}.${def.field}`);
}

async function ensureRelation({ collection, field, related, alias = null, onDelete = 'SET NULL', junctionField = null }) {
  const all = await api('/relations');
  if (all.data.find((r) => r.collection === collection && r.field === field)) return;
  await api('/relations', 'POST', {
    collection,
    field,
    related_collection: related,
    meta: {
      many_collection: collection,
      many_field: field,
      one_collection: related,
      one_field: alias,
      one_deselect_action: onDelete === 'CASCADE' ? 'delete' : 'nullify',
      junction_field: junctionField,
      sort_field: null,
    },
    schema: { on_delete: onDelete, on_update: 'NO ACTION' },
  });
  console.log(`    rel ${collection}.${field} → ${related}`);
}

async function ensureAlias(collection, field, special = ['o2m'], interfaceType = 'list-o2m') {
  if (await exists(`/fields/${collection}/${field}`)) return;
  await api(`/fields/${collection}`, 'POST', {
    field, type: 'alias',
    meta: { special, interface: interfaceType },
  });
  console.log(`    ${collection}.${field} (alias)`);
}

// Build a `<page>_translations` collection with a parent FK + language FK +
// the listed text fields. Returns nothing.
async function buildTranslationsTable(parent, textFields) {
  const tCollection = `${parent}_translations`;
  const parentFk = `${parent}_id`;

  await ensureCollection(tCollection, {
    icon: 'translate',
    note: `Per-language content for ${parent}`,
    singleton: false,
  });
  await ensureField(tCollection, {
    field: parentFk, type: 'integer', interface: 'select-dropdown-m2o', hidden: true,
  });
  // Integer FK to languages.id, BUT both the dropdown interface and the
  // list-view display use template `{{code}}` so the admin only ever sees
  // "en" / "sk" / "vn".
  await ensureField(tCollection, {
    field: 'language', type: 'integer', required: true,
    interface: 'select-dropdown-m2o',
    options: { enableCreate: false, template: '{{code}}' },
    display: 'related-values',
    display_options: { template: '{{code}}' },
  });
  for (const def of textFields) await ensureField(tCollection, def);

  await ensureRelation({
    collection: tCollection, field: parentFk, related: parent,
    alias: 'translations', onDelete: 'CASCADE',
  });
  await ensureRelation({
    collection: tCollection, field: 'language', related: 'languages',
  });
  await ensureAlias(parent, 'translations');
}

// ----- Field definitions per page ----------------------------------------

const str = (field, note) => ({ field, type: 'string', interface: 'input', note });
const txt = (field, note) => ({ field, type: 'text', interface: 'input-multiline', note });
const file = (field, note) => ({
  field, type: 'uuid', interface: 'file-image', special: ['file'], note,
});

const HOME_TRANSLATION_FIELDS = [
  str('hero_title', 'Hero headline'),
  txt('hero_body', 'Hero subtitle paragraph'),
  str('hero_cta_label', 'CTA button label below the hero'),
  txt('quote_primary', 'QuoteSection text'),
  str('globe_intro_heading', 'Heading shown over the globe before opening'),
  txt('globe_intro_body', 'Paragraph shown over the globe before opening'),
];

const ABOUT_ASSET_FIELDS = [
  file('portrait_image'),
  file('closing_background'),
  file('leadership_body_1_image'),
  file('leadership_body_2_image'),
  file('leadership_body_3_image'),
  file('leadership_body_4_image'),
  file('leadership_body_5_image'),
  file('leadership_body_6_image'),
];

const ABOUT_TRANSLATION_FIELDS = [
  str('hero_name'),
  str('about_eyebrow'),
  txt('about_body_1'), txt('about_body_2'), txt('about_body_3'), txt('about_body_4'),
  str('leadership_title'), txt('leadership_description'),
  txt('leadership_body_1'), txt('leadership_body_2'), txt('leadership_body_3'),
  txt('leadership_body_4'), txt('leadership_body_5'), txt('leadership_body_6'),
  str('experience_eyebrow'), str('experience_title'), txt('experience_body'),
  str('experience_video_title'), str('experience_video_url'),
  str('philanthropy_title'), txt('philanthropy_body'),
  str('philanthropy_story_1_title'), txt('philanthropy_story_1_desc'), str('philanthropy_story_1_video_url'),
  str('philanthropy_story_2_title'), txt('philanthropy_story_2_desc'), str('philanthropy_story_2_video_url'),
  txt('closing_quote'), str('closing_quote_author'), str('closing_cta'),
];

// Contact merges contact_offices ops fields onto the singleton.
const CONTACT_OPS_FIELDS = [
  str('slug', 'Office identifier'),
  str('region', 'Region label (e.g. SLOVAKIA)'),
  str('label', 'Card label (e.g. Corporate Headquarters)'),
  str('icon', 'Icon key: pin / globe / group'),
  str('org_name', 'Organization legal name'),
  str('zone', 'Zone label (e.g. CENTRAL EUROPE)'),
  str('role_label', 'Role label (e.g. CEO / Managing Director)'),
  str('role_name', 'Person name'),
  txt('address', 'Address lines, newline separated'),
  txt('corporate_ids', 'Corporate IDs, one "Label: Value" per line'),
  str('phone'),
  str('website_url'),
  str('work_email'),
  str('personal_email'),
  txt('bank_credentials', 'Bank credentials, "Label: Value" per line'),
  file('portrait_image', 'Portrait image shown on the contact page'),
];

const CONTACT_TRANSLATION_FIELDS = [
  str('heading_title', 'Contact page heading'),
  txt('subheading', 'Subheading paragraph below the title'),
  str('maps_title', 'Heading above the travel-route maps'),
  txt('quote_text', 'Inline quote text'),
  str('quote_author', 'Quote attribution'),
];

const CV_TRANSLATION_FIELDS = [
  // hero
  str('hero_address'),
  str('hero_nationality_label'), str('hero_nationality_value'),
  str('hero_wechat_label'),
  // section headings
  str('section_education'), str('section_experience'), str('section_china'),
  str('section_languages'), str('section_skills'),
  // education × 6
  ...Array.from({ length: 6 }, (_, i) => [
    str(`edu_${i}_title`), str(`edu_${i}_org`), str(`edu_${i}_date`),
  ]).flat(),
  // experience × 9 (desc optional)
  ...Array.from({ length: 9 }, (_, i) => [
    str(`exp_${i}_title`), str(`exp_${i}_org`), str(`exp_${i}_date`), txt(`exp_${i}_desc`),
  ]).flat(),
  // china × 9
  ...Array.from({ length: 9 }, (_, i) => [
    txt(`china_${i}_text`), str(`china_${i}_years`),
  ]).flat(),
  // languages × 5
  ...Array.from({ length: 5 }, (_, i) => [
    str(`lang_${i}_name`), str(`lang_${i}_descriptor`),
  ]).flat(),
  // skills × 5
  ...Array.from({ length: 5 }, (_, i) => str(`skill_${i}`)),
  // CTAs
  str('cta_view_full'),
  // contact card on CV
  str('contact_intro'), str('contact_title'), str('contact_cta'),
  str('contact_address'), str('contact_email'), str('contact_phone'),
  // request-CV modal
  str('modal_title'), txt('modal_intro'), txt('modal_default_body'),
  str('modal_subject'),
  str('modal_field_name'), str('modal_field_email'), str('modal_field_company'), str('modal_field_message'),
  str('modal_message_placeholder'),
  str('modal_submit'), str('modal_cancel'), str('modal_close'),
];

// ----- Build schema ------------------------------------------------------

async function buildPage(name, { icon, note, assets = [], translations, extraSetup = null }) {
  console.log(`\n==> ${name}`);
  await ensureCollection(name, { icon, note, singleton: true });
  for (const def of assets) await ensureField(name, def);
  for (const def of assets) {
    if (def.type === 'uuid') {
      await ensureRelation({ collection: name, field: def.field, related: 'directus_files' });
    }
  }
  if (extraSetup) await extraSetup();
  await buildTranslationsTable(name, translations);
}

async function buildContactFilesJunction() {
  // M2M from contact to directus_files for the travel-map images
  // (mirrors the existing contact_offices_files pattern).
  await ensureCollection('contact_files', {
    icon: 'image', note: 'Travel-route map images for contact', singleton: false, hidden: true,
  });
  await ensureField('contact_files', {
    field: 'contact_id', type: 'integer', interface: 'select-dropdown-m2o', hidden: true,
  });
  await ensureField('contact_files', {
    field: 'directus_files_id', type: 'uuid', interface: 'file', special: ['file'],
  });
  await ensureField('contact_files', { field: 'sort', type: 'integer', interface: 'input' });

  await ensureRelation({
    collection: 'contact_files', field: 'contact_id', related: 'contact',
    alias: 'maps', onDelete: 'CASCADE', junctionField: 'directus_files_id',
  });
  await ensureRelation({
    collection: 'contact_files', field: 'directus_files_id', related: 'directus_files',
    junctionField: 'contact_id',
  });
  // Explicit alias field on the parent so Directus exposes `contact.maps`
  // as an M2M editor in the admin and via the REST API.
  await ensureAlias('contact', 'maps', ['m2m'], 'list-m2m');
}

// ----- Data migration helpers --------------------------------------------

async function listLanguages() {
  const data = await api('/items/languages?fields=id,code&limit=-1');
  return data.data || [];
}

async function wipe(collection) {
  const all = await api(`/items/${collection}?fields=id&limit=-1`);
  const ids = (all.data || []).map((r) => r.id);
  if (ids.length === 0) return;
  await api(`/items/${collection}`, 'DELETE', ids);
  console.log(`  wiped ${ids.length} from ${collection}`);
}

// Read all page_text_keys for a given page, returning:
//   { [section]: { [languageId]: content } }
async function readPageTextKeys(page) {
  const filter = encodeURIComponent(JSON.stringify({ page: { _eq: page } }));
  const data = await api(
    `/items/page_text_keys?fields=section,translations.language,translations.content&filter=${filter}&limit=-1`,
  );
  const out = {};
  for (const row of data.data || []) {
    out[row.section] = {};
    for (const t of row.translations || []) {
      out[row.section][t.language] = t.content;
    }
  }
  return out;
}

// Read translation_keys for a set of keys, returning:
//   { [key]: { [languageId]: value } }
async function readTranslationKeys(keys) {
  const filter = encodeURIComponent(JSON.stringify({ key: { _in: keys } }));
  const data = await api(
    `/items/translation_keys?fields=key,translations.language,translations.value&filter=${filter}&limit=-1`,
  );
  const out = {};
  for (const row of data.data || []) {
    out[row.key] = {};
    for (const t of row.translations || []) {
      out[row.key][t.language] = t.value;
    }
  }
  return out;
}

// Take a per-language record and a key → field mapping; return rows
// suitable for POST /items/<page>_translations.
function buildTranslationRows(source, mapping, languages, parentFkField, parentId) {
  const rowsByLang = {};
  for (const lang of languages) {
    rowsByLang[lang.id] = { [parentFkField]: parentId, language: lang.id };
  }
  for (const [sourceKey, destField] of Object.entries(mapping)) {
    const valueByLang = source[sourceKey];
    if (!valueByLang) continue;
    for (const lang of languages) {
      const v = valueByLang[lang.id];
      if (v != null && v !== '') rowsByLang[lang.id][destField] = v;
    }
  }
  // Drop language rows with no content beyond FK + language columns.
  return Object.values(rowsByLang).filter((r) => Object.keys(r).length > 2);
}

// Pick the first non-empty value across languages (for singleton asset fields).
function pickAny(valueByLang) {
  if (!valueByLang) return null;
  for (const v of Object.values(valueByLang)) {
    if (v != null && v !== '') return v;
  }
  return null;
}

// ----- Migrations --------------------------------------------------------

async function migrateAbout(languages) {
  console.log('\n==> Migrating about');
  const src = await readPageTextKeys('about');

  await api('/items/about', 'PATCH', {
    portrait_image: pickAny(src.portrait_image),
    closing_background: pickAny(src.closing_background),
    leadership_body_1_image: pickAny(src.leadership_body_1_image),
    leadership_body_2_image: pickAny(src.leadership_body_2_image),
    leadership_body_3_image: pickAny(src.leadership_body_3_image),
    leadership_body_4_image: pickAny(src.leadership_body_4_image),
    leadership_body_5_image: pickAny(src.leadership_body_5_image),
    leadership_body_6_image: pickAny(src.leadership_body_6_image),
  });
  const parentId = (await api('/items/about')).data.id;

  await wipe('about_translations');
  const mapping = {
    hero_name: 'hero_name',
    about_eyebrow: 'about_eyebrow',
    about_body_1: 'about_body_1', about_body_2: 'about_body_2',
    about_body_3: 'about_body_3', about_body_4: 'about_body_4',
    leadership_title: 'leadership_title', leadership_description: 'leadership_description',
    leadership_body_1: 'leadership_body_1', leadership_body_2: 'leadership_body_2',
    leadership_body_3: 'leadership_body_3', leadership_body_4: 'leadership_body_4',
    leadership_body_5: 'leadership_body_5', leadership_body_6: 'leadership_body_6',
    experience_eyebrow: 'experience_eyebrow', experience_title: 'experience_title',
    experience_body: 'experience_body',
    experience_video_title: 'experience_video_title', experience_video_url: 'experience_video_url',
    philanthropy_title: 'philanthropy_title', philanthropy_body: 'philanthropy_body',
    philanthropy_story_1_title: 'philanthropy_story_1_title',
    philanthropy_story_1_desc: 'philanthropy_story_1_desc',
    philanthropy_story_1_video_url: 'philanthropy_story_1_video_url',
    philanthropy_story_2_title: 'philanthropy_story_2_title',
    philanthropy_story_2_desc: 'philanthropy_story_2_desc',
    philanthropy_story_2_video_url: 'philanthropy_story_2_video_url',
    closing_quote: 'closing_quote', closing_quote_author: 'closing_quote_author',
    closing_cta: 'closing_cta',
  };
  const rows = buildTranslationRows(src, mapping, languages, 'about_id', parentId);
  if (rows.length) await api('/items/about_translations', 'POST', rows);
  console.log(`  inserted ${rows.length} about_translations rows`);
}

async function migrateContact(languages) {
  console.log('\n==> Migrating contact');
  const src = await readPageTextKeys('contact');
  // Pull operational data from contact_offices.
  const office = (await api('/items/contact_offices?fields=*,map.directus_files_id')).data;

  await api('/items/contact', 'PATCH', {
    slug: office.slug, region: office.region, label: office.label, icon: office.icon,
    org_name: office.org_name, zone: office.zone,
    role_label: office.role_label, role_name: office.role_name,
    address: office.address, corporate_ids: office.corporate_ids,
    phone: office.phone, website_url: office.website_url,
    work_email: office.work_email, personal_email: office.personal_email,
    bank_credentials: office.bank_credentials,
    portrait_image: pickAny(src.portrait_image),
  });
  const parentId = (await api('/items/contact')).data.id;

  // Re-create map junction rows (contact_files)
  await wipe('contact_files');
  const mapEntries = (office.map || []).map((m, i) => ({
    contact_id: parentId,
    directus_files_id: m.directus_files_id,
    sort: i,
  })).filter((r) => r.directus_files_id);
  if (mapEntries.length) await api('/items/contact_files', 'POST', mapEntries);
  console.log(`  inserted ${mapEntries.length} contact_files rows`);

  await wipe('contact_translations');
  const mapping = {
    contact_heading_title: 'heading_title',
    contact_subheading: 'subheading',
    contact_maps_title: 'maps_title',
    contact_quote_text: 'quote_text',
    contact_quote_author: 'quote_author',
  };
  const rows = buildTranslationRows(src, mapping, languages, 'contact_id', parentId);
  if (rows.length) await api('/items/contact_translations', 'POST', rows);
  console.log(`  inserted ${rows.length} contact_translations rows`);
}

async function migrateHome(languages) {
  console.log('\n==> Migrating home');
  const keys = [
    'hero.title', 'hero.titleAccent', 'hero.body',
    'quote.primary', 'quote.secondary',
    'globeIntro.heading', 'globeIntro.body',
  ];
  const src = await readTranslationKeys(keys);

  await api('/items/home', 'PATCH', {});
  const parentId = (await api('/items/home')).data.id;

  await wipe('home_translations');
  const mapping = {
    'hero.title': 'hero_title',
    'hero.body': 'hero_body',
    'quote.primary': 'quote_primary',
    'globeIntro.heading': 'globe_intro_heading',
    'globeIntro.body': 'globe_intro_body',
  };
  const rows = buildTranslationRows(src, mapping, languages, 'home_id', parentId);
  if (rows.length) await api('/items/home_translations', 'POST', rows);
  console.log(`  inserted ${rows.length} home_translations rows`);
}

async function migrateCv(languages) {
  console.log('\n==> Migrating cv');
  // Build the cv.* → cv_translations field mapping.
  const mapping = {
    'cv.hero.address': 'hero_address',
    'cv.hero.nationality.label': 'hero_nationality_label',
    'cv.hero.nationality.value': 'hero_nationality_value',
    'cv.hero.wechat.label': 'hero_wechat_label',
    'cv.section.education': 'section_education',
    'cv.section.experience': 'section_experience',
    'cv.section.china': 'section_china',
    'cv.section.languages': 'section_languages',
    'cv.section.skills': 'section_skills',
    'cv.cta.viewFull': 'cta_view_full',
    'cv.contact.intro': 'contact_intro',
    'cv.contact.title': 'contact_title',
    'cv.contact.cta': 'contact_cta',
    'cv.contact.address': 'contact_address',
    'cv.contact.email': 'contact_email',
    'cv.contact.phone': 'contact_phone',
    'cv.modal.title': 'modal_title',
    'cv.modal.intro': 'modal_intro',
    'cv.modal.defaultBody': 'modal_default_body',
    'cv.modal.subject': 'modal_subject',
    'cv.modal.field.name': 'modal_field_name',
    'cv.modal.field.email': 'modal_field_email',
    'cv.modal.field.company': 'modal_field_company',
    'cv.modal.field.message': 'modal_field_message',
    'cv.modal.messagePlaceholder': 'modal_message_placeholder',
    'cv.modal.submit': 'modal_submit',
    'cv.modal.cancel': 'modal_cancel',
    'cv.modal.close': 'modal_close',
  };
  for (let i = 0; i < 6; i++) {
    mapping[`cv.edu.${i}.title`] = `edu_${i}_title`;
    mapping[`cv.edu.${i}.org`] = `edu_${i}_org`;
    mapping[`cv.edu.${i}.date`] = `edu_${i}_date`;
  }
  for (let i = 0; i < 9; i++) {
    mapping[`cv.exp.${i}.title`] = `exp_${i}_title`;
    mapping[`cv.exp.${i}.org`] = `exp_${i}_org`;
    mapping[`cv.exp.${i}.date`] = `exp_${i}_date`;
    mapping[`cv.exp.${i}.desc`] = `exp_${i}_desc`;
  }
  for (let i = 0; i < 9; i++) {
    mapping[`cv.china.${i}.text`] = `china_${i}_text`;
    mapping[`cv.china.${i}.years`] = `china_${i}_years`;
  }
  for (let i = 0; i < 5; i++) {
    mapping[`cv.lang.${i}.name`] = `lang_${i}_name`;
    mapping[`cv.lang.${i}.descriptor`] = `lang_${i}_descriptor`;
    mapping[`cv.skill.${i}`] = `skill_${i}`;
  }

  const src = await readTranslationKeys(Object.keys(mapping));

  await api('/items/cv', 'PATCH', {});
  const parentId = (await api('/items/cv')).data.id;

  await wipe('cv_translations');
  const rows = buildTranslationRows(src, mapping, languages, 'cv_id', parentId);
  if (rows.length) await api('/items/cv_translations', 'POST', rows);
  console.log(`  inserted ${rows.length} cv_translations rows`);
}

// ----- Main --------------------------------------------------------------

// Existing activities_translations.language relation was created with a
// "{{code}} — {{name}}" template and no list-view display. Update it to use
// just `{{code}}` for both edit and list views so the admin shows "en"/"sk".
async function setActivitiesLanguageDisplay() {
  console.log('\n==> activities_translations.language display template');
  if (!(await exists('/fields/activities_translations/language'))) return;
  await api('/fields/activities_translations/language', 'PATCH', {
    meta: {
      options: { enableCreate: false, template: '{{code}}' },
      display: 'related-values',
      display_options: { template: '{{code}}' },
    },
  });
  console.log('  updated to {{code}}');
}

async function main() {
  console.log(`Building per-page models on ${URL}\n`);

  // Schema
  await buildPage('home', {
    icon: 'home', note: 'Home page content (hero, quote, globe intro)',
    translations: HOME_TRANSLATION_FIELDS,
  });
  await buildPage('about', {
    icon: 'person', note: 'About page content',
    assets: ABOUT_ASSET_FIELDS,
    translations: ABOUT_TRANSLATION_FIELDS,
  });
  await buildPage('contact', {
    icon: 'mail', note: 'Contact page content + operational contact info',
    assets: CONTACT_OPS_FIELDS,
    translations: CONTACT_TRANSLATION_FIELDS,
    extraSetup: buildContactFilesJunction,
  });
  await buildPage('cv', {
    icon: 'badge', note: 'CV page content',
    translations: CV_TRANSLATION_FIELDS,
  });

  // Data
  const languages = await listLanguages();
  console.log(`\nLanguages: ${languages.map((l) => `${l.id}=${l.code}`).join(', ')}`);

  await migrateHome(languages);
  await migrateAbout(languages);
  await migrateContact(languages);
  await migrateCv(languages);

  await setActivitiesLanguageDisplay();

  console.log('\nDone.');
}

main().catch((e) => { console.error(e); process.exit(1); });
