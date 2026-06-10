import { readItems } from '@directus/sdk';
import directus from './client';

export interface HomeAboutText {
  eyebrow: string;
  body1: string;
  body2: string;
  btnGetToKnowMore: string;
}

export interface HomeAboutBundle {
  byLang: Record<string, HomeAboutText>;
}

interface RawTranslation {
  eyebrow?: unknown;
  body_1?: unknown;
  body_2?: unknown;
  btn_get_to_know_more?: unknown;
  language?: { code?: string } | null;
}

interface RawRow {
  eyebrow?: unknown;
  body_1?: unknown;
  body_2?: unknown;
  btn_get_to_know_more?: unknown;
  translations?: RawTranslation[];
}

const PRIMARY_LANG = 'en';

function asStr(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

// Home page's "About" section content. English canonical lives on the
// `home_about` parent; non-English on `home_about_translations`.
export async function getHomeAbout(): Promise<HomeAboutBundle> {
  try {
    const rows = (await directus.request(
      readItems('home_about', {
        limit: 1,
        fields: [
          'eyebrow',
          'body_1',
          'body_2',
          'btn_get_to_know_more',
          { translations: ['eyebrow', 'body_1', 'body_2', 'btn_get_to_know_more', { language: ['code'] }] },
        ],
      }),
    )) as RawRow[];

    const row = rows[0];
    const byLang: Record<string, HomeAboutText> = {};
    if (row) {
      byLang[PRIMARY_LANG] = {
        eyebrow: asStr(row.eyebrow),
        body1: asStr(row.body_1),
        body2: asStr(row.body_2),
        btnGetToKnowMore: asStr(row.btn_get_to_know_more),
      };
      for (const t of row.translations ?? []) {
        const code = t.language && typeof t.language === 'object' ? t.language.code : null;
        if (!code || code === PRIMARY_LANG) continue;
        byLang[code] = {
          eyebrow: asStr(t.eyebrow),
          body1: asStr(t.body_1),
          body2: asStr(t.body_2),
          btnGetToKnowMore: asStr(t.btn_get_to_know_more),
        };
      }
    }
    return { byLang };
  } catch (e) {
    console.warn('Directus fetch failed for home_about, using fallback:', e);
    return { byLang: {} };
  }
}
