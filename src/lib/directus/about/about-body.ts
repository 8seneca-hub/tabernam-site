import { readSingleton } from '@directus/sdk';
import directus, { assetUrl } from '../client';

export interface AboutBodyText {
  /** Paragraph N (1-based) → text. Sparse: only includes keys with content. */
  paragraphs: Record<number, string>;
}

export interface AboutBodyVideo {
  /** Per-language { url, title, chinaUrl? }. chinaUrl is shared across languages. */
  byLang: Record<string, { url: string; title: string; chinaUrl?: string }>;
}

export interface AboutBodyBundle {
  byLang: Record<string, AboutBodyText>;
  /** Image URLs grouped by paragraph_number. */
  imagesByParagraph: Record<number, string[]>;
  /** Video entries grouped by paragraph_number. */
  videosByParagraph: Record<number, AboutBodyVideo[]>;
}

interface RawTranslation extends Record<string, unknown> {
  language_code?: unknown;
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
  title?: unknown;
  language_code?: unknown;
}

interface RawVideo {
  paragraph_number?: unknown;
  sort?: unknown;
  url?: unknown;
  china_url?: unknown;
  file?: unknown;
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
    // `*` pulls every scalar field on the translation row, including
    // any newly-added paragraph_N field. `language_code` is included in
    // the wildcard since it's a regular column on the translation row.
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const fields = [
      { translations: ['*'] },
      { images: ['paragraph_number', 'sort', 'image'] },
      {
        videos: [
          'paragraph_number', 'sort', 'url', 'china_url',
          { file: ['id', 'modified_on'] },
          { translations: ['title', 'language_code'] },
        ],
      },
    ] as any;
    /* eslint-enable @typescript-eslint/no-explicit-any */
    const row = (await directus.request(
      readSingleton('about_body', { fields }),
    )) as RawRow | null;

    const byLang: Record<string, AboutBodyText> = {};
    const imagesByParagraph: Record<number, string[]> = {};
    const videosByParagraph: Record<number, AboutBodyVideo[]> = {};

    if (row) {
      for (const t of row.translations ?? []) {
        const code = typeof t.language_code === 'string' ? t.language_code : null;
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
        // URL/file are on the parent video — shared across all languages. Prefer
        // the uploaded file when set; cache-bust via modified_on so file
        // replaces bust the browser's 30-day asset cache.
        let url = '';
        if (vid.file && typeof vid.file === 'object') {
          const f = vid.file as RawFile;
          const id = typeof f.id === 'string' ? f.id : '';
          if (id) {
            const v = typeof f.modified_on === 'string' ? f.modified_on : '';
            url = v ? `${assetUrl(id)}?v=${encodeURIComponent(v)}` : assetUrl(id);
          }
        }
        if (!url) url = asStr(vid.url);
        const chinaUrl = asStr(vid.china_url) || undefined;
        const videoByLang: Record<string, { url: string; title: string; chinaUrl?: string }> = {};
        for (const t of vid.translations ?? []) {
          const code = typeof t.language_code === 'string' ? t.language_code : null;
          if (!code) continue;
          videoByLang[code] = { url, title: asStr(t.title), chinaUrl };
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
