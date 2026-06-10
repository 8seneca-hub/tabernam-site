import { readSingleton } from '@directus/sdk';
import directus from '../client';

export interface ContactHeaderText {
  headingTitle: string;
  subheading: string;
  mottoTranslation: string;
}

export interface ContactHeaderBundle {
  byLang: Record<string, ContactHeaderText>;
  mottoLatin: string;
  mottoAuthor: string;
}

interface RawTranslation {
  heading_title?: unknown;
  subheading?: unknown;
  motto_translation?: unknown;
  language?: { code?: string } | null;
}

interface RawRow {
  motto_latin?: unknown;
  motto_author?: unknown;
  translations?: RawTranslation[];
}

const PRIMARY_LANG = 'en';

function asStr(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

export async function getContactHeader(): Promise<ContactHeaderBundle> {
  try {
    const row = (await directus.request(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readSingleton('contact_header', {
        fields: [
          'motto_latin', 'motto_author',
          {
            translations: [
              'heading_title', 'subheading', 'motto_translation',
              { language: ['code'] },
            ],
          },
        ],
      } as any),
    )) as RawRow | null;

    const byLang: Record<string, ContactHeaderText> = {};
    let mottoLatin = '';
    let mottoAuthor = '';
    if (row) {
      for (const t of row.translations ?? []) {
        const code = t.language && typeof t.language === 'object' ? t.language.code : null;
        if (!code) continue;
        byLang[code] = {
          headingTitle: asStr(t.heading_title),
          subheading: asStr(t.subheading),
          mottoTranslation: asStr(t.motto_translation),
        };
      }
      mottoLatin = asStr(row.motto_latin);
      mottoAuthor = asStr(row.motto_author);
    }
    if (!byLang[PRIMARY_LANG]) {
      byLang[PRIMARY_LANG] = { headingTitle: '', subheading: '', mottoTranslation: '' };
    }
    return { byLang, mottoLatin, mottoAuthor };
  } catch (e) {
    console.warn('Directus fetch failed for contact_header, using fallback:', e);
    return { byLang: {}, mottoLatin: '', mottoAuthor: '' };
  }
}
