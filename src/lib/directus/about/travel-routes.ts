import { readSingleton } from '@directus/sdk';
import directus, { assetUrl } from '../client';
import type { TravelRouteMap, TravelRouteMapTranslation } from '../../data';

export interface TravelRoutesText {
  heading: string;
  body: string;
}

export interface TravelRoutesBundle {
  byLang: Record<string, TravelRoutesText>;
  maps: TravelRouteMap[];
}

interface RawFile {
  id?: unknown;
  modified_on?: unknown;
}

interface RawTranslation {
  heading?: unknown;
  body?: unknown;
  language?: { code?: string } | null;
}

interface RawMapTranslation {
  name?: unknown;
  language?: { code?: string } | null;
}

interface RawMap {
  slug?: unknown;
  sort?: unknown;
  image?: unknown;
  translations?: RawMapTranslation[];
}

interface RawRow {
  translations?: RawTranslation[];
  maps?: RawMap[];
}

const PRIMARY_LANG = 'en';

function asStr(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function fileUrl(file: unknown): string {
  if (!file) return '';
  if (typeof file === 'string') return assetUrl(file);
  if (typeof file === 'object') {
    const f = file as RawFile;
    const id = typeof f.id === 'string' ? f.id : '';
    if (!id) return '';
    const base = assetUrl(id);
    const v = typeof f.modified_on === 'string' ? f.modified_on : '';
    return v ? `${base}?v=${encodeURIComponent(v)}` : base;
  }
  return '';
}

// Mirror of the Hero pattern: one `travel_routes` singleton owns both the
// section text (heading/body per language) and the list of region maps.
export async function getTravelRoutes(): Promise<TravelRoutesBundle> {
  try {
    const row = (await directus.request(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readSingleton('travel_routes', {
        fields: [
          { translations: ['heading', 'body', { language: ['code'] }] },
          {
            maps: [
              'slug', 'sort',
              { image: ['id', 'modified_on'] },
              { translations: ['name', { language: ['code'] }] },
            ],
          },
        ],
      } as any),
    )) as RawRow | null;

    const byLang: Record<string, TravelRoutesText> = {};
    if (row) {
      for (const t of row.translations ?? []) {
        const code = t.language && typeof t.language === 'object' ? t.language.code : null;
        if (!code) continue;
        byLang[code] = { heading: asStr(t.heading), body: asStr(t.body) };
      }
    }
    if (!byLang[PRIMARY_LANG]) byLang[PRIMARY_LANG] = { heading: '', body: '' };

    const rawMaps = [...(row?.maps ?? [])].sort((a, b) => {
      const sa = typeof a.sort === 'number' ? a.sort : 0;
      const sb = typeof b.sort === 'number' ? b.sort : 0;
      return sa - sb;
    });
    const maps: TravelRouteMap[] = rawMaps
      .filter((m): m is RawMap & { slug: string } => typeof m.slug === 'string' && !!m.slug)
      .map((m) => ({
        slug: m.slug,
        image: fileUrl(m.image),
        translations: (m.translations || [])
          .map((t) => {
            const code = t.language && typeof t.language === 'object' ? t.language.code : null;
            const name = asStr(t.name);
            if (!code || !name) return null;
            return { language: code, name, heading: '', body: '' };
          })
          .filter((t): t is TravelRouteMapTranslation => t !== null),
      }));

    return { byLang, maps };
  } catch (e) {
    console.warn('Directus fetch failed for travel_routes, using fallback:', e);
    return { byLang: {}, maps: [] };
  }
}
