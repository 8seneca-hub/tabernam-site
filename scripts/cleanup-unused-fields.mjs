#!/usr/bin/env node
// Drop Directus fields that the codebase doesn't read. Idempotent — DELETE
// 404s are treated as already-removed.
//
// Usage (run against local AND production):
//   DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=tabernam-admin-token \
//     node scripts/cleanup-unused-fields.mjs

const URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_TOKEN || 'tabernam-admin-token';

const TARGETS = {
  home_translations: ['btn_viewCities', 'hero_cta_label'],
  footer_translations: [
    'footer_connectHeading', 'footer_contact', 'footer_established',
    'footer_globalOffices', 'footer_navigation', 'footer_presenceHeading',
    'footer_privacy', 'footer_terms',
  ],
  contact_translations: [
    'contact_address1', 'contact_address2', 'contact_address3',
    'contact_bankCredentials', 'contact_corporateIdsLabel', 'contact_identifiersLabel',
    'maps_title', 'quote_text', 'quote_author',
  ],
  cv_translations: [
    'hero_address', 'hero_nationality_label', 'hero_nationality_value',
    'hero_wechat_label', 'contact_address', 'contact_email', 'contact_phone',
  ],
  about_translations: [
    'leadership_title', 'leadership_description',
    'leadership_body_1', 'leadership_body_2', 'leadership_body_3',
    'leadership_body_4', 'leadership_body_5', 'leadership_body_6',
    'philanthropy_title', 'philanthropy_body',
    'philanthropy_story_1_desc', 'philanthropy_story_2_desc',
  ],
  about: [
    'leadership_body_1_image', 'leadership_body_2_image', 'leadership_body_3_image',
    'leadership_body_4_image', 'leadership_body_5_image', 'leadership_body_6_image',
  ],
};

for (const [collection, fields] of Object.entries(TARGETS)) {
  console.log(`\n== ${collection} ==`);
  for (const field of fields) {
    const res = await fetch(`${URL}/fields/${collection}/${field}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    if (res.status === 204) console.log(`  deleted ${field}`);
    else if (res.status === 403 || res.status === 404) console.log(`  skip ${field} (already absent)`);
    else console.log(`  FAIL ${field} → ${res.status}: ${await res.text()}`);
  }
}

console.log('\nDone.');
