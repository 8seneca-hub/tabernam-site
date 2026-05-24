import { createDirectus, rest, staticToken, readItems, readSingleton } from '@directus/sdk';

// ── Directus collection types ────────────────────────────────────

export interface CMSActivity {
  id: number;
  slug: string;
  name: string;
  label: string;
  lat: number;
  lng: number;
  altitude: number;
  dot_x: number;
  dot_y: number;
  focus_x: number;
  focus_y: number;
  focus_scale: number;
  image: string;
  title: string;
  body: string;
  sort: number;
}

export interface CMSHeroSlide {
  id: number;
  image: string;
  alt: string;
  sort: number;
}

export interface CMSPageText {
  id: number;
  page: string;       // 'home' | 'about' | 'activity' | 'contact'
  section: string;    // e.g. 'hero_title', 'hero_body', 'quote_en', 'quote_zh'
  content: string;
}

export interface CMSContactAddress {
  id: number;
  title_en: string;
  title_sk: string;
  lines: string;      // newline-separated address lines
  portrait_index: number;
  image: string | null;
  sort: number;
}

export interface CMSContactOffice {
  id: number;
  sort: number;
  slug: string;
  region: string;
  label: string;
  icon: 'pin' | 'globe' | 'group' | string;
  org_name: string;
  zone: string;
  role_label: string;
  role_name: string;
  address: string;            // newline-separated lines
  corporate_ids: string;      // "Label: Value" per line
  phone: string;
  email: string;
  bank_credentials: string;   // "Label: Value" per line
}

export interface CMSI18nString {
  id: number;
  key: string;
  lang: string;
  value: string;
}

export interface CMSLanguage {
  id: number;
  code: string;
  name: string;
  flag: string | null;
  is_default: boolean;
  sort: number | null;
}

export interface CMSFeature {
  id: number;
  icon_svg: string | null;
  text: string;
  sort: number | null;
}

export interface CMSSchema {
  activities: CMSActivity[];
  hero_slides: CMSHeroSlide[];
  page_texts: CMSPageText[];
  contact_addresses: CMSContactAddress[];
  contact_offices: CMSContactOffice[];
  i18n_strings: CMSI18nString[];
  features: CMSFeature[];
  languages: CMSLanguage[];
  site_settings: CMSSiteSettings;
}

export interface CMSSiteSettings {
  id: number;
  color_bg: string | null;
  color_text: string | null;
  color_muted: string | null;
  color_surface: string | null;
  color_button: string | null;
  color_button_text: string | null;
  color_button_hover: string | null;
  color_header: string | null;
  color_border: string | null;
  color_footer_bg: string | null;
  font_family: string | null;
  logo_text: string | null;
  max_width: string | null;
  side_padding: string | null;
  header_height: string | null;
}

// ── Client ──────────────────────────────────────────────────────

const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
const directusToken = process.env.DIRECTUS_TOKEN || '';

const directus = createDirectus<CMSSchema>(directusUrl)
  .with(staticToken(directusToken))
  .with(rest());

export default directus;

/** Convert a Directus file UUID (or full URL) to an asset URL. */
function assetUrl(value: string | null | undefined): string {
  if (!value) return '';
  // Already a full URL — return as-is
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  // UUID — build asset URL
  return `${directusUrl}/assets/${value}`;
}

// ── Fetchers (server-side, with fallbacks) ──────────────────────

import {
  DEFAULT_SETTINGS,
  ACTIVITIES as FALLBACK_ACTIVITIES,
  CONTACT_ADDRESSES as FALLBACK_CONTACT_ADDRESSES,
  HERO_SLIDES as FALLBACK_HERO_SLIDES
} from './data';
import { FALLBACK_DICTIONARIES, FALLBACK_LANGS, type LangInfo } from './i18n';
import type { Activity, HeroSlide, ContactAddress, SiteSettings, PageTexts, Feature, ContactOffice, LabeledRow } from './data';
export type { Activity, HeroSlide, ContactAddress, SiteSettings, PageTexts, Feature, ContactOffice, LabeledRow };
export type { LangInfo };

export async function getActivities(): Promise<Activity[]> {
  try {
    const items = await directus.request(
      readItems('activities', {
        sort: ['sort'],
        limit: -1,
      })
    );
    return items.map((b) => ({
      id: b.slug,
      name: b.name,
      label: b.label,
      coords: { lat: b.lat, lng: b.lng },
      altitude: b.altitude,
      dot: { x: b.dot_x, y: b.dot_y },
      focus: { x: b.focus_x, y: b.focus_y, scale: b.focus_scale },
      image: assetUrl(b.image),
      title: b.title,
      body: b.body,
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

export async function getFeatures(): Promise<Feature[]> {
  try {
    const items = await directus.request(
      readItems('features', {
        sort: ['sort'],
        limit: -1,
      })
    );
    return items.map((f) => ({
      iconSvg: f.icon_svg || '',
      text: f.text,
    }));
  } catch (e) {
    console.warn('Directus fetch failed for features, using fallback:', e);
    return [];
  }
}

export async function getPageTexts(page: string): Promise<PageTexts> {
  try {
    const items = await directus.request(
      readItems('page_texts', {
        filter: { page: { _eq: page } },
        limit: -1,
      })
    );
    const IMAGE_SECTIONS = new Set(['hero_image_1', 'hero_image_2', 'portrait_image']);
    const isImageSection = (s: string) =>
      IMAGE_SECTIONS.has(s) || /^leadership_body_\d+_image$/.test(s);
    const texts: PageTexts = {};
    items.forEach((t) => {
      texts[t.section] = isImageSection(t.section) ? assetUrl(t.content) : t.content;
    });
    return texts;
  } catch (e) {
    console.warn(`Directus fetch failed for page_texts (${page}), using empty:`, e);
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

export async function getContactOffices(): Promise<ContactOffice[]> {
  try {
    const items = await directus.request(
      readItems('contact_offices', { sort: ['sort'], limit: -1 }),
    );
    return items.map((o) => ({
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
      email: o.email,
      bankCredentials: parseLabeledRows(o.bank_credentials),
    }));
  } catch (e) {
    console.warn('Directus fetch failed for contact_offices, using fallback:', e);
    return [];
  }
}

export async function getContactAddresses(): Promise<ContactAddress[]> {
  try {
    const items = await directus.request(
      readItems('contact_addresses', {
        sort: ['sort'],
        limit: -1,
      })
    );
    return items.map((a) => ({
      title_en: a.title_en,
      title_sk: a.title_sk,
      lines: a.lines.split('\n').filter(Boolean),
      portrait_index: a.portrait_index,
      image: assetUrl(a.image),
    }));
  } catch (e) {
    console.warn('Directus fetch failed for contact_addresses, using fallback:', e);
    return [];
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const s = await directus.request(readSingleton('site_settings'));
    return {
      colorBg: s.color_bg || DEFAULT_SETTINGS.colorBg,
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
      readItems('i18n_strings', { limit: -1 })
    );
    const result: Record<string, Record<string, string>> = {};
    items.forEach((s) => {
      if (!result[s.lang]) result[s.lang] = {};
      result[s.lang][s.key] = s.value;
    });
    for (const [lang, dict] of Object.entries(FALLBACK_DICTIONARIES)) {
      result[lang] = { ...dict, ...result[lang] };
    }
    return result;
  } catch (e) {
    console.warn('Directus fetch failed for i18n_strings, using fallback:', e);
    return FALLBACK_DICTIONARIES;
  }
}
