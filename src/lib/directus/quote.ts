import { readItems } from '@directus/sdk';
import directus, { assetUrl } from './client';

export interface QuoteText {
  titleAccent: string;
  titleRest: string;
  primary: string;
}

export interface QuoteBundle {
  byLang: Record<string, QuoteText>;
  image: string;
}

interface RawTranslation {
  title_accent?: unknown;
  title_rest?: unknown;
  primary?: unknown;
  language?: { code?: string } | null;
}

interface RawQuoteRow {
  title_accent?: unknown;
  title_rest?: unknown;
  primary?: unknown;
  image?: unknown;
  translations?: RawTranslation[];
}

const PRIMARY_LANG = 'en';

function asStr(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

// Quote section content. English canonical lives on the `quote` parent;
// non-English translations live on `quote_translations`.
export async function getQuote(): Promise<QuoteBundle> {
  try {
    const rows = (await directus.request(
      readItems('quote', {
        limit: 1,
        fields: [
          'title_accent',
          'title_rest',
          'primary',
          'image',
          { translations: ['title_accent', 'title_rest', 'primary', { language: ['code'] }] },
        ],
      }),
    )) as RawQuoteRow[];

    const row = rows[0];
    const byLang: Record<string, QuoteText> = {};
    let image = '';
    if (row) {
      byLang[PRIMARY_LANG] = {
        titleAccent: asStr(row.title_accent),
        titleRest: asStr(row.title_rest),
        primary: asStr(row.primary),
      };
      for (const t of row.translations ?? []) {
        const code = t.language && typeof t.language === 'object' ? t.language.code : null;
        if (!code || code === PRIMARY_LANG) continue;
        byLang[code] = {
          titleAccent: asStr(t.title_accent),
          titleRest: asStr(t.title_rest),
          primary: asStr(t.primary),
        };
      }
      image = typeof row.image === 'string' ? assetUrl(row.image) : '';
    }
    return { byLang, image };
  } catch (e) {
    console.warn('Directus fetch failed for quote, using fallback:', e);
    return { byLang: {}, image: '' };
  }
}
