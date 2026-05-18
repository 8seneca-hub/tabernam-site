import { createDirectus, rest, staticToken, readItems, readSingleton } from '@directus/sdk';

// ── Directus collection types ────────────────────────────────────

export interface CMSBusiness {
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
  page: string;       // 'home' | 'about' | 'business' | 'contact'
  section: string;    // e.g. 'hero_title', 'hero_body', 'quote_en', 'quote_zh'
  content: string;
}

export interface CMSContactAddress {
  id: number;
  title_en: string;
  title_sk: string;
  lines: string;      // newline-separated address lines
  portrait_index: number;
  sort: number;
}

export interface CMSI18nString {
  id: number;
  key: string;         // e.g. 'nav.contact'
  en: string;
  sk: string;
}

export interface CMSSchema {
  businesses: CMSBusiness[];
  hero_slides: CMSHeroSlide[];
  page_texts: CMSPageText[];
  contact_addresses: CMSContactAddress[];
  i18n_strings: CMSI18nString[];
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

// ── Fetchers (server-side, with fallbacks) ──────────────────────

import {
  DEFAULT_SETTINGS,
  BUSINESSES as FALLBACK_BUSINESSES,
  CONTACT_ADDRESSES as FALLBACK_CONTACT_ADDRESSES,
  HERO_SLIDES as FALLBACK_HERO_SLIDES
} from './data';
import { I18N as FALLBACK_I18N } from './i18n';
import type { Business, HeroSlide, ContactAddress, SiteSettings, PageTexts } from './data';
export type { Business, HeroSlide, ContactAddress, SiteSettings, PageTexts };
import type { Lang } from './i18n';

export async function getBusinesses(): Promise<Business[]> {
  try {
    const items = await directus.request(
      readItems('businesses', {
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
      image: b.image,
      title: b.title,
      body: b.body,
    }));
  } catch (e) {
    console.warn('Directus fetch failed for businesses, using fallback:', e);
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
      image: s.image,
      alt: s.alt,
    }));
  } catch (e) {
    console.warn('Directus fetch failed for hero_slides, using fallback:', e);
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
    const texts: PageTexts = {};
    items.forEach((t) => {
      texts[t.section] = t.content;
    });
    return texts;
  } catch (e) {
    console.warn(`Directus fetch failed for page_texts (${page}), using empty:`, e);
    return {};
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

export async function getI18nStrings(): Promise<Record<Lang, Record<string, string>>> {
  try {
    const items = await directus.request(
      readItems('i18n_strings', {
        limit: -1,
      })
    );
    const result: Record<Lang, Record<string, string>> = { en: {}, sk: {} };
    items.forEach((s) => {
      result.en[s.key] = s.en;
      result.sk[s.key] = s.sk;
    });
    return result;
  } catch (e) {
    console.warn('Directus fetch failed for i18n_strings, using fallback:', e);
    return FALLBACK_I18N;
  }
}
