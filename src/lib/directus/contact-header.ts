import { readSingleton } from '@directus/sdk';
import directus from './client';

export interface ContactHeaderText {
  headingTitle: string;
  subheading: string;
}

export interface ContactHeaderBundle {
  byLang: Record<string, ContactHeaderText>;
}

interface RawTranslation {
  heading_title?: unknown;
  subheading?: unknown;
  language?: { code?: string } | null;
}

interface RawRow {
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
          { translations: ['heading_title', 'subheading', { language: ['code'] }] },
        ],
      } as any),
    )) as RawRow | null;

    const byLang: Record<string, ContactHeaderText> = {};
    if (row) {
      for (const t of row.translations ?? []) {
        const code = t.language && typeof t.language === 'object' ? t.language.code : null;
        if (!code) continue;
        byLang[code] = {
          headingTitle: asStr(t.heading_title),
          subheading: asStr(t.subheading),
        };
      }
    }
    if (!byLang[PRIMARY_LANG]) {
      byLang[PRIMARY_LANG] = { headingTitle: '', subheading: '' };
    }
    return { byLang };
  } catch (e) {
    console.warn('Directus fetch failed for contact_header, using fallback:', e);
    return { byLang: {} };
  }
}
