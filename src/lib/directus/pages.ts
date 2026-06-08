import { readSingleton } from '@directus/sdk';
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

export function allTextFieldsFor(page: 'home' | 'about' | 'contact' | 'cv' | 'nav' | 'footer'): string[] {
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

// Read a page singleton with all its translations and asset fields. Exported
// so `site.ts`'s dictionary loader can reuse it.
export async function readPageSingleton(
  page: 'home' | 'about' | 'contact' | 'cv' | 'nav' | 'footer',
  textFields: string[],
  assetFields: string[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  extraSingletonFields: string[] = [],
): Promise<SingletonReadShape> {
  // Query `*` + a wildcard expansion on translations so renaming/dropping
  // a single field on the singleton never 403s the whole batch. We then
  // pick out the fields the caller asked for client-side.
  const fields: unknown[] = ['*', { translations: ['*', { language: ['code'] }] }];
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
    const langObj = t.language as { code?: string } | null;
    const code = langObj && typeof langObj === 'object' ? langObj.code : null;
    if (!code) continue;
    byLang[code] = {};
    for (const f of textFields) {
      const v = t[f];
      if (typeof v === 'string') byLang[code][f] = v;
    }
  }
  return { assets, byLang };
}

export type PageTextsBundle = Record<string, PageTexts>;

export function pickPageTexts(bundle: PageTextsBundle, lang: string): PageTexts {
  return { ...(bundle['en'] ?? {}), ...(bundle[lang] ?? {}) };
}

// Build a PageTextsBundle for any page singleton. Per-page fetchers
// (`getHomeTexts`, `getAboutTexts`, etc.) call this with their own page name.
// Returns {} on failure so callers fall back to empty maps without crashing.
export async function composePageBundle(
  page: 'home' | 'about' | 'contact' | 'cv',
): Promise<PageTextsBundle> {
  const cfg = (pageKeysConfig.pageTexts as Record<string, { text?: string[]; assets?: string[]; _fieldRename?: Record<string, string> }>)[page];
  if (!cfg) return {};

  const textFields = allTextFieldsFor(page);
  const assetFields = cfg.assets ?? [];
  const fieldRename = cfg._fieldRename ?? {};

  try {
    const { assets, byLang } = await readPageSingleton(
      page,
      // Some singletons store fields under renamed names (e.g. contact's
      // heading_title vs the heading_title alias). Translate when querying.
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
      // Asset URLs aren't language-specific — repeat them under each lang
      // so the existing pickPageTexts/texts.X access pattern keeps working.
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
