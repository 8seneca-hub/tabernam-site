import { createDirectus, rest, staticToken, readItems, readSingleton } from '@directus/sdk';
import {
  ContactOffice,
  DEFAULT_SETTINGS,
  HeroSlide,
  LabeledRow,
  PageTexts,
  SiteSettings,
} from './data';
import { FALLBACK_DICTIONARIES, FALLBACK_LANGS, type LangInfo } from './i18n';
import { CMSSchema, GlobeCity, GlobeCityTranslation } from './type';
import pageKeysConfig from './page-keys.json';

export type {
  HeroSlide, ContactOffice, LabeledRow, PageTexts, SiteSettings,
} from './data';
export type { GlobeCity, GlobeCityTranslation } from './type';
export type { LangInfo };


const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
const directusToken = process.env.DIRECTUS_TOKEN || '';

const directus = createDirectus<CMSSchema>(directusUrl)
  .with(staticToken(directusToken))
  .with(rest({
    onRequest: (options) => ({ ...options, cache: 'no-store' as RequestCache }),
  }));

export default directus;

function assetUrl(value: string | null | undefined): string {
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (value.startsWith('/')) return value;
  return `${directusUrl}/assets/${value}`;
}

export function pickTranslation(city: GlobeCity, lang: string): GlobeCityTranslation {
  return (
    city.translations.find((t) => t.language === lang) ??
    city.translations.find((t) => t.language === 'en') ??
    city.translations[0] ?? {
      language: 'en',
      name: city.slug,
      business: city.slug,
      description: '',
    }
  );
}

export async function getActivities(): Promise<GlobeCity[]> {
  try {
    const items = await directus.request(
      readItems('activities', {
        sort: ['sort'],
        limit: -1,
        fields: [
          'slug',
          'lat',
          'lng',
          'altitude',
          { translations: ['name', 'business', 'description', { language: ['code'] }] },
          { photos: ['directus_files_id'] },
        ],
      }),
    );
    return items.map((a) => ({
      slug: a.slug,
      lat: a.lat,
      lng: a.lng,
      altitude: a.altitude,
      translations: (a.translations || [])
        .map((t) => {
          const code = typeof t.language === 'object' && t.language ? t.language.code : null;
          if (!code) return null;
          return {
            language: code,
            name: t.name,
            business: t.business,
            description: t.description,
          };
        })
        .filter((t): t is GlobeCityTranslation => t !== null),
      photos: (a.photos || [])
        .map((p) => p.directus_files_id)
        .filter((id): id is string => !!id)
        .map((id) => assetUrl(id)),
    }));
  } catch (e) {
    console.warn('Directus fetch failed for activities, using fallback:', e);
    return [];
  }
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const items = await directus.request(
      readItems('hero_slides', {
        sort: ['sort'],
        limit: -1,
      })
    );
    return items.map((s) => ({
      image: assetUrl(s.image),
      alt: s.alt,
    }));
  } catch (e) {
    console.warn('Directus fetch failed for hero_slides, using fallback:', e);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Page singletons (home/about/contact/cv) are now the source of truth for
// translated text. The legacy `page_text_keys` / `translation_keys` tables
// were removed — see scripts/build-page-models-local.mjs and
// scripts/extend-page-models-local.mjs.
//
// The page singleton row holds language-agnostic fields (e.g.
// portrait_image, operational contact fields). Its `<page>_translations`
// O2M holds one row per language with all translatable text fields.
// `src/lib/page-keys.json` maps every i18n key and page-text section to its
// (page singleton, field name) location.
// ---------------------------------------------------------------------------

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

// Group dictionary entries by page → array of (key, field) pairs.
const DICT_BY_PAGE: Record<string, Array<{ key: string; field: string }>> = (() => {
  const grouped: Record<string, Array<{ key: string; field: string }>> = {};
  for (const [key, { page, field }] of Object.entries(DICTIONARY)) {
    (grouped[page] ||= []).push({ key, field });
  }
  return grouped;
})();

// All translatable field names per page (dict fields + page-text fields).
function allTextFieldsFor(page: 'home' | 'about' | 'contact' | 'cv'): string[] {
  const dictFields = (DICT_BY_PAGE[page] || []).map((x) => x.field);
  const pageTextConfig = (pageKeysConfig.pageTexts as Record<string, { text?: string[] }>)[page];
  const extra = pageTextConfig?.text ?? [];
  return Array.from(new Set([...dictFields, ...extra]));
}

interface SingletonReadShape {
  // Asset fields (URLs after resolution)
  assets: Record<string, string>;
  // For each language code, a map of field → value
  byLang: Record<string, Record<string, string>>;
}

// Read a page singleton with all its translations and asset fields.
async function readPageSingleton(
  page: 'home' | 'about' | 'contact' | 'cv',
  textFields: string[],
  assetFields: string[],
  extraSingletonFields: string[] = [],
): Promise<SingletonReadShape> {
  const fields: unknown[] = [
    ...assetFields,
    ...extraSingletonFields,
    { translations: [...textFields, { language: ['code'] }] },
  ];
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

// Compose a PageTextsBundle for the given page that the legacy frontend
// code consumes via `texts.<section>` and `pickPageTexts(bundle, lang)`.
export async function getPageTexts(page: string): Promise<PageTextsBundle> {
  if (page !== 'about' && page !== 'contact') return {};
  const cfg = (pageKeysConfig.pageTexts as Record<string, { text?: string[]; assets?: string[]; _fieldRename?: Record<string, string> }>)[page];
  if (!cfg) return {};

  const textFields = allTextFieldsFor(page as 'about' | 'contact');
  const assetFields = cfg.assets ?? [];
  const fieldRename = cfg._fieldRename ?? {};

  try {
    const { assets, byLang } = await readPageSingleton(
      page as 'about' | 'contact',
      // For contact, the singleton fields are stored under renamed names
      // (heading_title, not contact_heading_title). Translate when querying.
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

function splitLines(value: string | null | undefined): string[] {
  return (value || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseLabeledRows(value: string | null | undefined): LabeledRow[] {
  return splitLines(value).map((line) => {
    const idx = line.indexOf(':');
    if (idx === -1) return { label: '', value: line };
    return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
  });
}

// Operational contact data is now stored as singleton-level fields on the
// `contact` collection (formerly `contact_offices`). Map images live in the
// `contact_files` junction.
export async function getContactOffice(): Promise<ContactOffice | null> {
  try {
    const o = (await directus.request(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readSingleton('contact', { fields: ['*', { maps: ['directus_files_id'] }] } as any),
    )) as unknown as {
      slug: string; region: string; label: string; icon: string;
      org_name: string; zone: string; role_label: string; role_name: string;
      address: string; corporate_ids: string;
      phone: string; website_url: string;
      work_email: string; personal_email: string;
      bank_credentials: string;
      maps?: Array<{ directus_files_id: string }>;
    };
    return {
      slug: o.slug,
      region: o.region,
      label: o.label,
      icon: o.icon,
      orgName: o.org_name,
      zone: o.zone,
      roleLabel: o.role_label,
      roleName: o.role_name,
      addressLines: splitLines(o.address),
      corporateIds: parseLabeledRows(o.corporate_ids),
      phone: o.phone,
      websiteUrl: o.website_url,
      workEmail: o.work_email,
      personalEmail: o.personal_email,
      bankCredentials: parseLabeledRows(o.bank_credentials),
      mapImages: (o.maps || [])
        .map((m) => m.directus_files_id)
        .filter((id): id is string => !!id)
        .map((id) => assetUrl(id)),
    };
  } catch (e) {
    console.warn('Directus fetch failed for contact singleton, using fallback:', e);
    return null;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const s = await directus.request(readSingleton('site_settings'));
    return {
      colorBg: s.color_bg || DEFAULT_SETTINGS.colorBg,
      colorBrand: s.color_brand || DEFAULT_SETTINGS.colorBrand,
      colorText: s.color_text || DEFAULT_SETTINGS.colorText,
      colorMuted: s.color_muted || DEFAULT_SETTINGS.colorMuted,
      colorSurface: s.color_surface || DEFAULT_SETTINGS.colorSurface,
      colorButton: s.color_button || DEFAULT_SETTINGS.colorButton,
      colorButtonText: s.color_button_text || DEFAULT_SETTINGS.colorButtonText,
      colorButtonHover: s.color_button_hover || DEFAULT_SETTINGS.colorButtonHover,
      colorHeader: s.color_header || DEFAULT_SETTINGS.colorHeader,
      colorBorder: s.color_border || DEFAULT_SETTINGS.colorBorder,
      colorFooterBg: s.color_footer_bg || DEFAULT_SETTINGS.colorFooterBg,
      fontFamily: s.font_family || DEFAULT_SETTINGS.fontFamily,
      logoImage: s.logo_image ? assetUrl(s.logo_image) : DEFAULT_SETTINGS.logoImage,
      logoText: s.logo_text || DEFAULT_SETTINGS.logoText,
      maxWidth: s.max_width || DEFAULT_SETTINGS.maxWidth,
      sidePadding: s.side_padding || DEFAULT_SETTINGS.sidePadding,
      headerHeight: s.header_height || DEFAULT_SETTINGS.headerHeight,
    };
  } catch (e) {
    console.warn('Directus fetch failed for site_settings, using defaults:', e);
    return DEFAULT_SETTINGS;
  }
}

export async function getLanguages(): Promise<LangInfo[]> {
  try {
    const items = await directus.request(
      readItems('languages', { sort: ['sort'], limit: -1 })
    );
    return items.map((l) => ({
      code: l.code,
      name: l.name,
      flag: l.flag || '',
      isDefault: l.is_default,
    }));
  } catch (e) {
    console.warn('Directus fetch failed for languages, using fallback:', e);
    return FALLBACK_LANGS;
  }
}

// Build the global i18n dictionary from all four page singletons. Each
// dictionary entry from page-keys.json points at one (page, field); we
// query that page's translations and emit `{ [code]: { [key]: value } }`.
export async function getDictionaries(): Promise<Record<string, Record<string, string>>> {
  try {
    const pages: Array<'home' | 'about' | 'contact' | 'cv'> = ['home', 'about', 'contact', 'cv'];
    const result: Record<string, Record<string, string>> = {};

    for (const page of pages) {
      const entries = DICT_BY_PAGE[page] || [];
      if (entries.length === 0) continue;
      const fields = entries.map((e) => e.field);
      const { byLang } = await readPageSingleton(page, fields, []);
      for (const [code, fieldValues] of Object.entries(byLang)) {
        if (!result[code]) result[code] = {};
        for (const { key, field } of entries) {
          const v = fieldValues[field];
          if (v != null && v !== '') result[code][key] = v;
        }
      }
    }
    // Merge with hardcoded fallbacks so any missing key still resolves.
    for (const [lang, dict] of Object.entries(FALLBACK_DICTIONARIES)) {
      result[lang] = { ...dict, ...(result[lang] ?? {}) };
    }
    return result;
  } catch (e) {
    console.warn('Directus fetch failed for dictionaries, using fallback:', e);
    return FALLBACK_DICTIONARIES;
  }
}
