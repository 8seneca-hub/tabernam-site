import { readSingleton } from '@directus/sdk';
import directus, { assetUrl } from '../client';

export interface AboutBodyText {
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  paragraph4: string;
  paragraph5: string;
  paragraph6: string;
  travelRoutesHeading: string;
  travelRoutesBody: string;
}

export interface AboutBodyVideo {
  /** Per-language { url, title }. */
  byLang: Record<string, { url: string; title: string }>;
}

export interface AboutBodyBundle {
  byLang: Record<string, AboutBodyText>;
  /** Image URLs grouped by paragraph_number (1..4). */
  imagesByParagraph: Record<number, string[]>;
  /** Video entries grouped by paragraph_number (1..4). */
  videosByParagraph: Record<number, AboutBodyVideo[]>;
}

interface RawTranslation {
  paragraph_1?: unknown;
  paragraph_2?: unknown;
  paragraph_3?: unknown;
  paragraph_4?: unknown;
  paragraph_5?: unknown;
  paragraph_6?: unknown;
  travel_routes_heading?: unknown;
  travel_routes_body?: unknown;
  language?: { code?: string } | null;
}

interface RawImage {
  paragraph_number?: unknown;
  sort?: unknown;
  image?: unknown;
}

interface RawVideoTranslation {
  url?: unknown;
  title?: unknown;
  language?: { code?: string } | null;
}

interface RawVideo {
  paragraph_number?: unknown;
  sort?: unknown;
  translations?: RawVideoTranslation[];
}

interface RawRow {
  translations?: RawTranslation[];
  images?: RawImage[];
  videos?: RawVideo[];
}

const PRIMARY_LANG = 'en';

function asStr(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function projectTranslation(src: RawTranslation): AboutBodyText {
  return {
    paragraph1: asStr(src.paragraph_1),
    paragraph2: asStr(src.paragraph_2),
    paragraph3: asStr(src.paragraph_3),
    paragraph4: asStr(src.paragraph_4),
    paragraph5: asStr(src.paragraph_5),
    paragraph6: asStr(src.paragraph_6),
    travelRoutesHeading: asStr(src.travel_routes_heading),
    travelRoutesBody: asStr(src.travel_routes_body),
  };
}

const EMPTY_TEXT: AboutBodyText = {
  paragraph1: '', paragraph2: '', paragraph3: '', paragraph4: '', paragraph5: '', paragraph6: '',
  travelRoutesHeading: '', travelRoutesBody: '',
};

// /about page body. Four paragraph slots; each slot may have any number of
// images (parent `about_body_images`, tagged by paragraph_number) and any
// number of videos (parent `about_body_videos` + `_translations`).
export async function getAboutBody(): Promise<AboutBodyBundle> {
  try {
    const row = (await directus.request(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readSingleton('about_body', {
        fields: [
          {
            translations: [
              'paragraph_1', 'paragraph_2', 'paragraph_3', 'paragraph_4', 'paragraph_5', 'paragraph_6',
              'travel_routes_heading', 'travel_routes_body',
              { language: ['code'] },
            ],
          },
          { images: ['paragraph_number', 'sort', 'image'] },
          {
            videos: [
              'paragraph_number', 'sort',
              { translations: ['url', 'title', { language: ['code'] }] },
            ],
          },
        ],
      } as any),
    )) as RawRow | null;

    const byLang: Record<string, AboutBodyText> = {};
    const imagesByParagraph: Record<number, string[]> = {};
    const videosByParagraph: Record<number, AboutBodyVideo[]> = {};

    if (row) {
      for (const t of row.translations ?? []) {
        const code = t.language && typeof t.language === 'object' ? t.language.code : null;
        if (!code) continue;
        byLang[code] = projectTranslation(t);
      }
      // Group images by paragraph_number, preserving sort order.
      const sortedImgs = [...(row.images ?? [])].sort((a, b) => {
        const sa = typeof a.sort === 'number' ? a.sort : 0;
        const sb = typeof b.sort === 'number' ? b.sort : 0;
        return sa - sb;
      });
      for (const img of sortedImgs) {
        const n = typeof img.paragraph_number === 'number' ? img.paragraph_number : null;
        const id = typeof img.image === 'string' ? img.image : null;
        if (!n || !id) continue;
        (imagesByParagraph[n] ||= []).push(assetUrl(id));
      }
      // Group videos by paragraph_number, build per-language {url, title}.
      const sortedVids = [...(row.videos ?? [])].sort((a, b) => {
        const sa = typeof a.sort === 'number' ? a.sort : 0;
        const sb = typeof b.sort === 'number' ? b.sort : 0;
        return sa - sb;
      });
      for (const vid of sortedVids) {
        const n = typeof vid.paragraph_number === 'number' ? vid.paragraph_number : null;
        if (!n) continue;
        const videoByLang: Record<string, { url: string; title: string }> = {};
        for (const t of vid.translations ?? []) {
          const code = t.language && typeof t.language === 'object' ? t.language.code : null;
          if (!code) continue;
          videoByLang[code] = { url: asStr(t.url), title: asStr(t.title) };
        }
        (videosByParagraph[n] ||= []).push({ byLang: videoByLang });
      }
    }
    if (!byLang[PRIMARY_LANG]) byLang[PRIMARY_LANG] = { ...EMPTY_TEXT };
    return { byLang, imagesByParagraph, videosByParagraph };
  } catch (e) {
    console.warn('Directus fetch failed for about_body, using fallback:', e);
    return { byLang: {}, imagesByParagraph: {}, videosByParagraph: {} };
  }
}
