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

export type PageTextsBundle = Record<string, PageTexts>;

export function pickPageTexts(bundle: PageTextsBundle, lang: string): PageTexts {
  return { ...(bundle['en'] ?? {}), ...(bundle[lang] ?? {}) };
}

export async function getPageTexts(page: string): Promise<PageTextsBundle> {
  try {
    const items = await directus.request(
      readItems('page_text_keys', {
        filter: { page: { _eq: page } },
        limit: -1,
        fields: ['section', { translations: ['content', { language: ['code'] }] }],
      })
    );
    const IMAGE_SECTIONS = new Set([
      'hero_image_1',
      'hero_image_2',
      'portrait_image',
      'closing_background',
    ]);
    const isImageSection = (s: string) =>
      IMAGE_SECTIONS.has(s) || /^leadership_body_\d+_image$/.test(s);
    const bundle: PageTextsBundle = {};
    items.forEach((k) => {
      (k.translations || []).forEach((t) => {
        const code = typeof t.language === 'object' && t.language ? t.language.code : null;
        if (!code) return;
        if (!bundle[code]) bundle[code] = {};
        bundle[code][k.section] = isImageSection(k.section) ? assetUrl(t.content) : t.content;
      });
    });
    return bundle;
  } catch (e) {
    console.warn(`Directus fetch failed for page_text_keys (${page}), using empty:`, e);
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

export async function getContactOffice(): Promise<ContactOffice | null> {
  try {
    const o = (await directus.request(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readSingleton('contact_offices', { fields: ['*', { map: ['directus_files_id'] }] } as any),
    )) as unknown as CMSSchema['contact_offices'];
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
      mapImages: (o.map || [])
        .map((m) => m.directus_files_id)
        .filter((id): id is string => !!id)
        .map((id) => assetUrl(id)),
    };
  } catch (e) {
    console.warn('Directus fetch failed for contact_offices, using fallback:', e);
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

export async function getDictionaries(): Promise<Record<string, Record<string, string>>> {
  try {
    const items = await directus.request(
      readItems('translation_keys', {
        limit: -1,
        fields: ['key', { translations: ['value', { language: ['code'] }] }],
      })
    );
    const result: Record<string, Record<string, string>> = {};
    items.forEach((k) => {
      (k.translations || []).forEach((t) => {
        const code = typeof t.language === 'object' && t.language ? t.language.code : null;
        if (!code) return;
        if (!result[code]) result[code] = {};
        result[code][k.key] = t.value;
      });
    });
    for (const [lang, dict] of Object.entries(FALLBACK_DICTIONARIES)) {
      result[lang] = { ...dict, ...result[lang] };
    }
    return result;
  } catch (e) {
    console.warn('Directus fetch failed for translation_keys, using fallback:', e);
    return FALLBACK_DICTIONARIES;
  }
}
