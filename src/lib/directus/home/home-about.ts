import { readSingleton } from '@directus/sdk';
import directus from '../client';

export interface HomeAboutText {
  eyebrow: string;
  heading: string;
  body1: string;
  body2: string;
  btnGetToKnowMore: string;
}

export interface HomeAboutBundle {
  byLang: Record<string, HomeAboutText>;
}

interface RawTranslation {
  eyebrow?: unknown;
  heading?: unknown;
  body_1?: unknown;
  body_2?: unknown;
  btn_get_to_know_more?: unknown;
  language_code?: unknown;
}

interface RawRow {
  eyebrow?: unknown;
  heading?: unknown;
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
// `home_about` singleton; non-English on `home_about_translations`.
export async function getHomeAbout(): Promise<HomeAboutBundle> {
  try {
    const row = (await directus.request(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readSingleton('home_about', {
        fields: [
          'eyebrow',
          'heading',
          'body_1',
          'body_2',
          'btn_get_to_know_more',
          { translations: ['eyebrow', 'heading', 'body_1', 'body_2', 'btn_get_to_know_more', 'language_code'] },
        ],
      } as any),
    )) as RawRow | null;

    const byLang: Record<string, HomeAboutText> = {};
    if (row) {
      byLang[PRIMARY_LANG] = {
        eyebrow: asStr(row.eyebrow),
        heading: asStr(row.heading),
        body1: asStr(row.body_1),
        body2: asStr(row.body_2),
        btnGetToKnowMore: asStr(row.btn_get_to_know_more),
      };
      for (const t of row.translations ?? []) {
        const code = typeof t.language_code === 'string' ? t.language_code : null;
        if (!code || code === PRIMARY_LANG) continue;
        byLang[code] = {
          eyebrow: asStr(t.eyebrow),
          heading: asStr(t.heading),
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
