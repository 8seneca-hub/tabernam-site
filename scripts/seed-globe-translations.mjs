#!/usr/bin/env node
// Seed translation keys for the GlobeActivitySection. Idempotent: skips
// (key, language) pairs that already exist.
//
// Usage:
//   DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=tabernam-admin-token \
//     node scripts/seed-globe-translations.mjs

import { createDirectus, rest, staticToken, readItems, createItem } from '@directus/sdk';

const URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_TOKEN || 'tabernam-admin-token';

const directus = createDirectus(URL).with(staticToken(TOKEN)).with(rest());

const TRANSLATIONS = {
  'globe.intro.heading': {
    en: 'A career mapped across continents.',
    sk: 'Kariéra zachytená naprieč kontinentmi.',
  },
  'globe.intro.description': {
    en: 'Each pin marks years of work — negotiations, factories, partnerships and the people behind them. Explore the cities that have shaped four decades of foreign trade, with a focus on the relationships built across China.',
    sk: 'Každý bod označuje roky práce — rokovania, továrne, partnerstvá a ľudí, ktorí za nimi stoja. Objavte mestá, ktoré formovali štyri desaťročia zahraničného obchodu, s dôrazom na vzťahy vybudované naprieč Čínou.',
  },
  'globe.intro.cta': {
    en: 'View cities',
    sk: 'Zobraziť mestá',
  },
  'globe.hint.text': {
    en: 'Spin the globe to view all cities that I have travelled',
    sk: 'Otáčaj zemeguľou a pozri si všetky mestá, ktoré som navštívil',
  },
  'globe.panel.viewDetails': {
    en: 'View Details',
    sk: 'Zobraziť detaily',
  },
  'globe.panel.close': {
    en: 'Close',
    sk: 'Zavrieť',
  },
  'globe.zoom.in': {
    en: 'Zoom in',
    sk: 'Priblížiť',
  },
  'globe.zoom.out': {
    en: 'Zoom out',
    sk: 'Oddialiť',
  },
};

(async () => {
  console.log(`==> Targeting Directus at ${URL}`);

  const langs = await directus.request(
    readItems('languages', { limit: -1, fields: ['id', 'code'] }),
  );
  const codeToId = new Map(langs.map((l) => [l.code, l.id]));

  const existingKeys = await directus.request(
    readItems('translation_keys', { limit: -1, fields: ['id', 'key'] }),
  );
  const keyToId = new Map(existingKeys.map((k) => [k.key, k.id]));

  const existingRows = await directus.request(
    readItems('translation_table', {
      limit: -1,
      fields: ['translation_keys_id', 'language'],
    }),
  );
  const pairExists = new Set(
    existingRows.map((r) => {
      const langId =
        typeof r.language === 'object' && r.language !== null
          ? r.language.id
          : r.language;
      return `${r.translation_keys_id}|${langId}`;
    }),
  );

  let newKeys = 0;
  let newRows = 0;
  let skipped = 0;

  for (const [key, byLang] of Object.entries(TRANSLATIONS)) {
    let keyId = keyToId.get(key);
    if (!keyId) {
      const created = await directus.request(createItem('translation_keys', { key }));
      keyId = created.id;
      keyToId.set(key, keyId);
      newKeys += 1;
    }

    for (const [code, value] of Object.entries(byLang)) {
      const langId = codeToId.get(code);
      if (!langId) {
        console.warn(`  !! language "${code}" not found, skipping`);
        continue;
      }
      const pair = `${keyId}|${langId}`;
      if (pairExists.has(pair)) {
        skipped += 1;
        continue;
      }
      await directus.request(
        createItem('translation_table', {
          translation_keys_id: keyId,
          language: langId,
          value,
        }),
      );
      pairExists.add(pair);
      newRows += 1;
    }
  }

  console.log(`==> Created ${newKeys} new keys, ${newRows} new translation rows (${skipped} already existed)`);
})();
