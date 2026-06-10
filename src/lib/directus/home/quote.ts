import { readSingleton } from '@directus/sdk';
import directus, { assetUrl } from '../client';

export interface QuoteText {
  titleAccent: string;
  titleRest: string;
  primary: string;
  mottoTranslation: string;
}

export interface QuoteBundle {
  byLang: Record<string, QuoteText>;
  image: string;
  mottoLatin: string;
  mottoAuthor: string;
}

interface RawTranslation {
  title_accent?: unknown;
  title_rest?: unknown;
  primary?: unknown;
  motto_translation?: unknown;
  language?: { code?: string } | null;
}

interface RawQuoteRow {
  title_accent?: unknown;
  title_rest?: unknown;
  primary?: unknown;
  motto_translation?: unknown;
  motto_latin?: unknown;
  motto_author?: unknown;
  image?: unknown;
  translations?: RawTranslation[];
}

const PRIMARY_LANG = 'en';

function asStr(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

// Quote section content (home page). English canonical lives on the `quote`
// singleton; non-English translations live on `quote_translations`. Motto
// fields (latin, author, per-language translation) are independent from any
// other section's motto.
export async function getQuote(): Promise<QuoteBundle> {
  try {
    const row = (await directus.request(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readSingleton('quote', {
        fields: [
          'title_accent',
          'title_rest',
          'primary',
          'motto_translation',
          'motto_latin',
          'motto_author',
          'image',
          {
            translations: [
              'title_accent', 'title_rest', 'primary', 'motto_translation',
              { language: ['code'] },
            ],
          },
        ],
      } as any),
    )) as RawQuoteRow | null;

    const byLang: Record<string, QuoteText> = {};
    let image = '';
    let mottoLatin = '';
    let mottoAuthor = '';
    if (row) {
      byLang[PRIMARY_LANG] = {
        titleAccent: asStr(row.title_accent),
        titleRest: asStr(row.title_rest),
        primary: asStr(row.primary),
        mottoTranslation: asStr(row.motto_translation),
      };
      for (const t of row.translations ?? []) {
        const code = t.language && typeof t.language === 'object' ? t.language.code : null;
        if (!code || code === PRIMARY_LANG) continue;
        byLang[code] = {
          titleAccent: asStr(t.title_accent),
          titleRest: asStr(t.title_rest),
          primary: asStr(t.primary),
          mottoTranslation: asStr(t.motto_translation),
        };
      }
      image = typeof row.image === 'string' ? assetUrl(row.image) : '';
      mottoLatin = asStr(row.motto_latin);
      mottoAuthor = asStr(row.motto_author);
    }
    return { byLang, image, mottoLatin, mottoAuthor };
  } catch (e) {
    console.warn('Directus fetch failed for quote, using fallback:', e);
    return { byLang: {}, image: '', mottoLatin: '', mottoAuthor: '' };
  }
}
