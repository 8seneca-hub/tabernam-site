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
  language_code?: unknown;
}

interface RawQuoteRow {
  motto_translation?: unknown;
  motto_latin?: unknown;
  motto_author?: unknown;
  image?: unknown;
  translations?: RawTranslation[];
}

function asStr(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

export async function getQuote(): Promise<QuoteBundle> {
  try {
    const row = (await directus.request(
      readSingleton('quote', {
        fields: [
          'motto_translation',
          'motto_latin',
          'motto_author',
          'image',
          {
            translations: [
              'title_accent',
              'title_rest',
              'primary',
              'motto_translation',
              'language_code',
            ],
          },
        ],
      }),
    )) as RawQuoteRow | null;

    const byLang: Record<string, QuoteText> = {};
    let image = '';
    let mottoLatin = '';
    let mottoAuthor = '';
    if (row) {
      for (const t of row.translations ?? []) {
        const code = typeof t.language_code === 'string' ? t.language_code : null;
        if (!code) continue;
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
