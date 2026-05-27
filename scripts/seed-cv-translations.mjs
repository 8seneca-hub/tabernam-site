#!/usr/bin/env node
// Seed CV_TRANSLATIONS into translation_keys + translation_table.
//
// Idempotent: skips key+language pairs that already exist.
//
// Usage:
//   DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=tabernam-admin-token \
//     node scripts/seed-cv-translations.mjs

import {
  createDirectus, rest, staticToken, readItems, createItem,
} from '@directus/sdk';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_TOKEN || 'tabernam-admin-token';

const directus = createDirectus(URL).with(staticToken(TOKEN)).with(rest());

// Parse src/lib/translations-cv.ts by stripping the TS type annotation and
// evaluating the object literal. The file's content is trusted (in-repo).
function loadCvTranslations() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const path = resolve(__dirname, '../src/lib/translations-cv.ts');
  const src = readFileSync(path, 'utf8');
  const match = src.match(/CV_TRANSLATIONS[^=]*=\s*({[\s\S]*});\s*$/m);
  if (!match) throw new Error('Could not locate CV_TRANSLATIONS object literal');
  // Strip JS line comments so eval is happy (the file has // comments)
  const cleaned = match[1].replace(/^\s*\/\/.*$/gm, '');
  return (0, eval)('(' + cleaned + ')');
}

(async () => {
  console.log(`==> Targeting Directus at ${URL}`);

  const cv = loadCvTranslations();
  const langCodes = Object.keys(cv);
  console.log(`==> Loaded CV translations for langs: ${langCodes.join(', ')}`);

  // Map lang code → language id
  const langs = await directus.request(
    readItems('languages', { limit: -1, fields: ['id', 'code'] }),
  );
  const codeToId = new Map(langs.map((l) => [l.code, l.id]));
  for (const code of langCodes) {
    if (!codeToId.has(code)) {
      console.warn(`  !! language "${code}" not found in languages collection — skipping its values`);
    }
  }

  // Existing translation_keys → id
  const existingKeys = await directus.request(
    readItems('translation_keys', { limit: -1, fields: ['id', 'key'] }),
  );
  const keyToId = new Map(existingKeys.map((k) => [k.key, k.id]));

  // Existing (translation_keys_id, language) pairs to dedupe
  const existingRows = await directus.request(
    readItems('translation_table', {
      limit: -1,
      fields: ['translation_keys_id', 'language'],
    }),
  );
  const pairExists = new Set(
    existingRows.map((r) => `${r.translation_keys_id}|${typeof r.language === 'object' && r.language ? r.language.id : r.language}`),
  );

  // Collect all unique keys
  const allKeys = new Set();
  for (const code of langCodes) for (const k of Object.keys(cv[code])) allKeys.add(k);
  console.log(`==> ${allKeys.size} unique CV keys`);

  // Create missing keys
  let newKeys = 0;
  for (const key of allKeys) {
    if (keyToId.has(key)) continue;
    const created = await directus.request(createItem('translation_keys', { key }));
    keyToId.set(key, created.id);
    newKeys += 1;
  }
  console.log(`==> Created ${newKeys} new translation_keys (${allKeys.size - newKeys} already existed)`);

  // Insert translation rows
  let newRows = 0;
  let skipped = 0;
  for (const code of langCodes) {
    const langId = codeToId.get(code);
    if (!langId) continue;
    for (const [key, value] of Object.entries(cv[code])) {
      const keyId = keyToId.get(key);
      const pair = `${keyId}|${langId}`;
      if (pairExists.has(pair)) {
        skipped += 1;
        continue;
      }
      await directus.request(createItem('translation_table', {
        translation_keys_id: keyId,
        language: langId,
        value,
      }));
      pairExists.add(pair);
      newRows += 1;
      if (newRows % 40 === 0) console.log(`    inserted ${newRows}...`);
    }
  }
  console.log(`==> Inserted ${newRows} translation rows (${skipped} already existed)`);
  console.log('==> Done.');
})();
