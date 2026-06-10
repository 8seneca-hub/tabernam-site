import { readSingleton } from '@directus/sdk';
import directus, { assetUrl } from './client';

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
  language?: { code?: string } | null;
}

interface RawRow {
  title?: unknown;
  heading?: unknown;
  name?: unknown;
  body?: unknown;
  cv_button_label?: unknown;
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

function projectTranslation(src: RawTranslation | RawRow): AboutHeaderText {
  return {
    title: asStr(src.title),
    heading: asStr(src.heading),
    name: asStr(src.name),
    body: asStr(src.body),
    cvButtonLabel: asStr(src.cv_button_label),
    mottoTranslation: asStr(src.motto_translation),
  };
}

// /about page header content. English canonical lives on the `about_header`
// parent; non-English in `about_header_translations`.
export async function getAboutHeader(): Promise<AboutHeaderBundle> {
  try {
    const row = (await directus.request(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readSingleton('about_header', {
        fields: [
          'title',
          'heading',
          'name',
          'body',
          'cv_button_label',
          'motto_translation',
          'motto_latin',
          'motto_author',
          'image',
          {
            translations: [
              'title', 'heading', 'name', 'body', 'cv_button_label', 'motto_translation',
              { language: ['code'] },
            ],
          },
        ],
      } as any),
    )) as RawRow | null;

    const byLang: Record<string, AboutHeaderText> = {};
    let image = '';
    let mottoLatin = '';
    let mottoAuthor = '';
    if (row) {
      byLang[PRIMARY_LANG] = projectTranslation(row);
      for (const t of row.translations ?? []) {
        const code = t.language && typeof t.language === 'object' ? t.language.code : null;
        if (!code || code === PRIMARY_LANG) continue;
        byLang[code] = projectTranslation(t);
      }
      image = typeof row.image === 'string' ? assetUrl(row.image) : '';
      mottoLatin = asStr(row.motto_latin);
      mottoAuthor = asStr(row.motto_author);
    }
    return { byLang, image, mottoLatin, mottoAuthor };
  } catch (e) {
    console.warn('Directus fetch failed for about_header, using fallback:', e);
    return { byLang: {}, image: '', mottoLatin: '', mottoAuthor: '' };
  }
}
