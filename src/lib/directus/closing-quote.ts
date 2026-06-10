import { readSingleton } from '@directus/sdk';
import directus, { assetUrl } from './client';

export interface ClosingQuoteText {
  quote: string;
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
  quote?: unknown;
  motto_translation?: unknown;
  cta?: unknown;
  language?: { code?: string } | null;
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
    quote: asStr(src.quote),
    mottoTranslation: asStr(src.motto_translation),
    cta: asStr(src.cta),
  };
}

// /about page closing-quote content. Latin motto + author + background live
// on the `closing_quote` parent; per-language motto translation, CTA, and
// long-form quote live on `closing_quote_translations`.
export async function getClosingQuote(): Promise<ClosingQuoteBundle> {
  try {
    const row = (await directus.request(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readSingleton('closing_quote', {
        fields: [
          'background', 'motto_latin', 'motto_author',
          { translations: ['quote', 'motto_translation', 'cta', { language: ['code'] }] },
        ],
      } as any),
    )) as RawRow | null;

    const byLang: Record<string, ClosingQuoteText> = {};
    let background = '';
    let mottoLatin = '';
    let mottoAuthor = '';
    if (row) {
      for (const t of row.translations ?? []) {
        const code = t.language && typeof t.language === 'object' ? t.language.code : null;
        if (!code) continue;
        byLang[code] = projectTranslation(t);
      }
      background = typeof row.background === 'string' ? assetUrl(row.background) : '';
      mottoLatin = asStr(row.motto_latin);
      mottoAuthor = asStr(row.motto_author);
    }
    if (!byLang[PRIMARY_LANG]) {
      byLang[PRIMARY_LANG] = { quote: '', mottoTranslation: '', cta: '' };
    }
    return { byLang, background, mottoLatin, mottoAuthor };
  } catch (e) {
    console.warn('Directus fetch failed for closing_quote, using fallback:', e);
    return { byLang: {}, background: '', mottoLatin: '', mottoAuthor: '' };
  }
}
