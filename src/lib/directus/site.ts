import { readItems, readSingleton } from '@directus/sdk';
import directus, { assetUrl } from './client';
import { DICT_BY_PAGE, readPageSingleton } from './pages';
import { DEFAULT_SETTINGS, type SiteSettings } from '../data';
import { FALLBACK_DICTIONARIES, FALLBACK_LANGS, type LangInfo } from '../i18n';

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
    const pages = ['home', 'about', 'contact', 'cv', 'nav', 'footer'] as const;
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
