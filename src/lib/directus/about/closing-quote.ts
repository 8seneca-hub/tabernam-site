import { readSingleton } from '@directus/sdk';
import directus, { assetUrl } from '../client';

export interface ClosingQuoteText {
  mottoTranslation: string;
  cta: string;
}

export interface ClosingQuoteBundle {
  byLang: Record<string, ClosingQuoteText>;
  background: string;
  mottoLatin: string;
  mottoAuthor: string;
}

interface RawTranslation {
  motto_translation?: unknown;
  cta?: unknown;
  language_code?: unknown;
}

interface RawRow {
  background?: unknown;
  motto_latin?: unknown;
  motto_author?: unknown;
  translations?: RawTranslation[];
}

const PRIMARY_LANG = 'en';

function asStr(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function projectTranslation(src: RawTranslation): ClosingQuoteText {
  return {
    mottoTranslation: asStr(src.motto_translation),
    cta: asStr(src.cta),
  };
}

// /about page closing-quote content. Latin motto + author + background live
// on the `closing_quote` parent; per-language motto translation and CTA live
// on `closing_quote_translations`.
export async function getClosingQuote(): Promise<ClosingQuoteBundle> {
  try {
    const row = (await directus.request(
      readSingleton('closing_quote', {
        fields: [
          'background', 'motto_latin', 'motto_author',
          { translations: ['motto_translation', 'cta', 'language_code'] },
        ],
      }),
    )) as RawRow | null;

    const byLang: Record<string, ClosingQuoteText> = {};
    let background = '';
    let mottoLatin = '';
    let mottoAuthor = '';
    if (row) {
      for (const t of row.translations ?? []) {
        const code = typeof t.language_code === 'string' ? t.language_code : null;
        if (!code) continue;
        byLang[code] = projectTranslation(t);
      }
      background = typeof row.background === 'string' ? assetUrl(row.background) : '';
      mottoLatin = asStr(row.motto_latin);
      mottoAuthor = asStr(row.motto_author);
    }
    if (!byLang[PRIMARY_LANG]) {
      byLang[PRIMARY_LANG] = { mottoTranslation: '', cta: '' };
    }
    return { byLang, background, mottoLatin, mottoAuthor };
  } catch (e) {
    console.warn('Directus fetch failed for closing_quote, using fallback:', e);
    return { byLang: {}, background: '', mottoLatin: '', mottoAuthor: '' };
  }
}
