import { readSingleton } from '@directus/sdk';
import directus, { assetUrl } from '../client';

export interface AboutBodyText {
  /** Paragraph N (1-based) → text. Sparse: only includes keys with content. */
  paragraphs: Record<number, string>;
}

export interface AboutBodyVideo {
  /** Per-language { url, title }. */
  byLang: Record<string, { url: string; title: string }>;
}

export interface AboutBodyBundle {
  byLang: Record<string, AboutBodyText>;
  /** Image URLs grouped by paragraph_number. */
  imagesByParagraph: Record<number, string[]>;
  /** Video entries grouped by paragraph_number. */
  videosByParagraph: Record<number, AboutBodyVideo[]>;
}

interface RawTranslation extends Record<string, unknown> {
  language?: { code?: string } | null;
}

interface RawImage {
  paragraph_number?: unknown;
  sort?: unknown;
  image?: unknown;
}

interface RawFile {
  id?: unknown;
  modified_on?: unknown;
}

interface RawVideoTranslation {
  url?: unknown;
  title?: unknown;
  file?: unknown;
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
const PARAGRAPH_KEY_RE = /^paragraph_(\d+)$/;

function asStr(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function projectTranslation(src: RawTranslation): AboutBodyText {
  // Discover every paragraph_N key on the row dynamically — adding a new
  // field in Directus (e.g. paragraph_8) automatically flows through.
  const paragraphs: Record<number, string> = {};
  for (const key of Object.keys(src)) {
    const m = key.match(PARAGRAPH_KEY_RE);
    if (!m) continue;
    const n = Number(m[1]);
    const value = asStr(src[key]);
    if (value) paragraphs[n] = value;
  }
  return { paragraphs };
}

const EMPTY_TEXT: AboutBodyText = {
  paragraphs: {},
};

// /about page body. Any number of paragraph_N fields (1..N) on
// about_body_translations are picked up automatically; the frontend renders
// them in numeric order. Images and videos attach to a paragraph by its
// numeric paragraph_number.
export async function getAboutBody(): Promise<AboutBodyBundle> {
  try {
    const row = (await directus.request(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readSingleton('about_body', {
        fields: [
          // `*` pulls every scalar field on the translation row, including
          // any newly-added paragraph_N. The nested `language` is appended
          // explicitly because `*` alone doesn't follow relations. (Note:
          // travel-routes heading/body have moved to travel_route_map; no
          // need to project them here anymore.)
          { translations: ['*', { language: ['code'] }] },
          { images: ['paragraph_number', 'sort', 'image'] },
          {
            videos: [
              'paragraph_number', 'sort',
              {
                translations: [
                  'url', 'title',
                  { file: ['id', 'modified_on'] },
                  { language: ['code'] },
                ],
              },
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
          // Prefer the uploaded file when set — gives the user a way to host
          // the video directly. Cache-bust via modified_on so file replaces
          // bust the browser's 30-day asset cache.
          let url = '';
          if (t.file && typeof t.file === 'object') {
            const f = t.file as RawFile;
            const id = typeof f.id === 'string' ? f.id : '';
            if (id) {
              const v = typeof f.modified_on === 'string' ? f.modified_on : '';
              url = v ? `${assetUrl(id)}?v=${encodeURIComponent(v)}` : assetUrl(id);
            }
          }
          if (!url) url = asStr(t.url);
          videoByLang[code] = { url, title: asStr(t.title) };
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
