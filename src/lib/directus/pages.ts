import { readItems, readSingleton } from '@directus/sdk';
import directus, { assetUrl } from './client';
import type { PageTexts } from '../data';
import pageKeysConfig from '../page-keys.json';

type DictEntry = { page: string; field: string };
const RAW_DICTIONARY = pageKeysConfig.dictionary as unknown as Record<string, DictEntry>;
const DYNAMIC_DICTIONARY = pageKeysConfig.dictionaryDynamic as unknown as Record<string, DictEntry & { range: number }>;

const DICTIONARY: Record<string, DictEntry> = (() => {
  const out: Record<string, DictEntry> = {};
  for (const [k, v] of Object.entries(RAW_DICTIONARY)) {
    if (k.startsWith('_')) continue;
    out[k] = { page: v.page, field: v.field };
  }
  for (const [pattern, def] of Object.entries(DYNAMIC_DICTIONARY)) {
    if (pattern.startsWith('_')) continue;
    for (let i = 0; i < def.range; i++) {
      out[pattern.replace('{i}', String(i))] = {
        page: def.page,
        field: def.field.replace('{i}', String(i)),
      };
    }
  }
  return out;
})();

// Dictionary entries grouped by owning page singleton. Exported so the
// dictionary loader in `site.ts` can iterate it.
export const DICT_BY_PAGE: Record<string, Array<{ key: string; field: string }>> = (() => {
  const grouped: Record<string, Array<{ key: string; field: string }>> = {};
  for (const [key, { page, field }] of Object.entries(DICTIONARY)) {
    (grouped[page] ||= []).push({ key, field });
  }
  return grouped;
})();

export function allTextFieldsFor(page: 'contact' | 'cv' | 'header' | 'footer'): string[] {
  const dictFields = (DICT_BY_PAGE[page] || []).map((x) => x.field);
  const pageTextConfig = (pageKeysConfig.pageTexts as Record<string, { text?: string[] }>)[page];
  const extra = pageTextConfig?.text ?? [];
  return Array.from(new Set([...dictFields, ...extra]));
}

export interface SingletonReadShape {
  // Asset fields (URLs after resolution)
  assets: Record<string, string>;
  // For each language code, a map of field → value
  byLang: Record<string, Record<string, string>>;
}

// Read a page's translation rows and (when applicable) singleton asset fields.
// `contact` and `cv` still own a singleton parent (with an asset field set);
// `header` and `footer` are now bare translation tables.
export async function readPageSingleton(
  page: 'contact' | 'cv' | 'header' | 'footer',
  textFields: string[],
  assetFields: string[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  extraSingletonFields: string[] = [],
): Promise<SingletonReadShape> {
  if (page === 'header' || page === 'footer') {
    return readStandaloneTranslations(`${page}_translations`, textFields);
  }
  // Query `*` + a wildcard expansion on translations so renaming/dropping
  // a single field on the singleton never 403s the whole batch. `*` includes
  // the `language_code` column on every translation row.
  const fields: unknown[] = ['*', { translations: ['*'] }];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = (await directus.request(readSingleton(page, { fields } as any))) as Record<string, unknown>;
  const assets: Record<string, string> = {};
  for (const f of assetFields) {
    const v = row[f];
    assets[f] = typeof v === 'string' ? assetUrl(v) : '';
  }
  const byLang: Record<string, Record<string, string>> = {};
  const translations = (row.translations as Array<Record<string, unknown>>) ?? [];
  for (const t of translations) {
    const code = typeof t.language_code === 'string' ? t.language_code : null;
    if (!code) continue;
    byLang[code] = {};
    for (const f of textFields) {
      const v = t[f];
      if (typeof v === 'string') byLang[code][f] = v;
    }
  }
  return { assets, byLang };
}

async function readStandaloneTranslations(
  collection: 'header_translations' | 'footer_translations',
  textFields: string[],
): Promise<SingletonReadShape> {
  const rows = (await directus.request(
    readItems(collection, { limit: -1, fields: ['*'] }),
  )) as Array<Record<string, unknown>>;
  const byLang: Record<string, Record<string, string>> = {};
  for (const t of rows) {
    const code = typeof t.language_code === 'string' ? t.language_code : null;
    if (!code) continue;
    byLang[code] = {};
    for (const f of textFields) {
      const v = t[f];
      if (typeof v === 'string') byLang[code][f] = v;
    }
  }
  return { assets: {}, byLang };
}

export type PageTextsBundle = Record<string, PageTexts>;

export function pickPageTexts(bundle: PageTextsBundle, lang: string): PageTexts {
  return { ...(bundle['en'] ?? {}), ...(bundle[lang] ?? {}) };
}

export async function composePageBundle(
  page: 'contact' | 'cv',
): Promise<PageTextsBundle> {
  const cfg = (pageKeysConfig.pageTexts as Record<string, { text?: string[]; assets?: string[]; _fieldRename?: Record<string, string> }>)[page];
  if (!cfg) return {};

  const textFields = allTextFieldsFor(page);
  const assetFields = cfg.assets ?? [];
  const fieldRename = cfg._fieldRename ?? {};

  try {
    const { assets, byLang } = await readPageSingleton(
      page,
      textFields.map((f) => fieldRename[f] ?? f),
      assetFields,
    );

    const bundle: PageTextsBundle = {};
    const reverseRename: Record<string, string> = {};
    for (const [original, renamed] of Object.entries(fieldRename)) {
      reverseRename[renamed] = original;
    }

    for (const [lang, fields] of Object.entries(byLang)) {
      const entry: PageTexts = {};
      for (const [storedField, value] of Object.entries(fields)) {
        const outKey = reverseRename[storedField] ?? storedField;
        if (value) entry[outKey] = value;
      }
      for (const [f, v] of Object.entries(assets)) {
        if (v) entry[f] = v;
      }
      bundle[lang] = entry;
    }
    return bundle;
  } catch (e) {
    console.warn(`Directus fetch failed for ${page} singleton, using empty:`, e);
    return {};
  }
}
