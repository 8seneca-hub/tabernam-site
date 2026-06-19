import { readItems } from '@directus/sdk';
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
  language_code?: unknown;
}

const PRIMARY_LANG = 'en';
const MOTTO_LATIN = 'Honeste lucra, nobiliter dona';
const MOTTO_AUTHOR = 'Tibor Buček';

function asStr(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

export async function getContactHeader(): Promise<ContactHeaderBundle> {
  try {
    const rows = (await directus.request(
      readItems('contact_header_translations', {
        limit: -1,
        fields: ['heading_title', 'subheading', 'motto_translation', 'language_code'],
      }),
    )) as RawTranslation[];

    const byLang: Record<string, ContactHeaderText> = {};
    for (const t of rows) {
      const code = typeof t.language_code === 'string' ? t.language_code : null;
      if (!code) continue;
      byLang[code] = {
        headingTitle: asStr(t.heading_title),
        subheading: asStr(t.subheading),
        mottoTranslation: asStr(t.motto_translation),
      };
    }
    if (!byLang[PRIMARY_LANG]) {
      byLang[PRIMARY_LANG] = { headingTitle: '', subheading: '', mottoTranslation: '' };
    }
    return { byLang, mottoLatin: MOTTO_LATIN, mottoAuthor: MOTTO_AUTHOR };
  } catch (e) {
    console.warn('Directus fetch failed for contact_header_translations, using fallback:', e);
    return { byLang: {}, mottoLatin: MOTTO_LATIN, mottoAuthor: MOTTO_AUTHOR };
  }
}
