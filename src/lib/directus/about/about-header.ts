import { readSingleton } from '@directus/sdk';
import directus, { assetUrl } from '../client';

export interface AboutHeaderText {
  title: string;
  heading: string;
  name: string;
  body: string;
  cvButtonLabel: string;
  mottoTranslation: string;
}

export interface AboutHeaderBundle {
  byLang: Record<string, AboutHeaderText>;
  image: string;
  mottoLatin: string;
  mottoAuthor: string;
}

interface RawTranslation {
  title?: unknown;
  heading?: unknown;
  name?: unknown;
  body?: unknown;
  cv_button_label?: unknown;
  motto_translation?: unknown;
  language_code?: unknown;
}

interface RawRow {
  image?: unknown;
  translations?: RawTranslation[];
}

const MOTTO_LATIN = 'Honeste lucra, nobiliter dona';
const MOTTO_AUTHOR = 'Tibor Buček';

function asStr(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

export async function getAboutHeader(): Promise<AboutHeaderBundle> {
  try {
    const row = (await directus.request(
      readSingleton('about_header', {
        fields: [
          'image',
          {
            translations: [
              'title',
              'heading',
              'name',
              'body',
              'cv_button_label',
              'motto_translation',
              'language_code',
            ],
          },
        ],
      }),
    )) as RawRow | null;

    const byLang: Record<string, AboutHeaderText> = {};
    let image = '';
    if (row) {
      for (const t of row.translations ?? []) {
        const code = typeof t.language_code === 'string' ? t.language_code : null;
        if (!code) continue;
        byLang[code] = {
          title: asStr(t.title),
          heading: asStr(t.heading),
          name: asStr(t.name),
          body: asStr(t.body),
          cvButtonLabel: asStr(t.cv_button_label),
          mottoTranslation: asStr(t.motto_translation),
        };
      }
      image = typeof row.image === 'string' ? assetUrl(row.image) : '';
    }
    return { byLang, image, mottoLatin: MOTTO_LATIN, mottoAuthor: MOTTO_AUTHOR };
  } catch (e) {
    console.warn('Directus fetch failed for about_header, using fallback:', e);
    return { byLang: {}, image: '', mottoLatin: MOTTO_LATIN, mottoAuthor: MOTTO_AUTHOR };
  }
}
