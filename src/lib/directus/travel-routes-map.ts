import { readItems } from '@directus/sdk';
import directus, { assetUrl } from './client';
import type { TravelRouteMap, TravelRouteMapTranslation } from '../data';

interface RawFile {
  id?: unknown;
  modified_on?: unknown;
}

function fileUrl(file: unknown): string {
  if (!file) return '';
  if (typeof file === 'string') return assetUrl(file);
  if (typeof file === 'object') {
    const f = file as RawFile;
    const id = typeof f.id === 'string' ? f.id : '';
    if (!id) return '';
    const base = assetUrl(id);
    // Append the file's modified_on as a cache-buster — Directus serves
    // /assets with `cache-control: max-age=2592000`, so without this the
    // browser keeps showing the old image when a file is replaced under
    // the same Directus record (same UUID).
    const v = typeof f.modified_on === 'string' ? f.modified_on : '';
    return v ? `${base}?v=${encodeURIComponent(v)}` : base;
  }
  return '';
}

export async function getTravelRouteMaps(): Promise<TravelRouteMap[]> {
  try {
    interface RawMap {
      slug?: string;
      image?: unknown;
      translations?: Array<{
        name?: string;
        language?: { code?: string } | null;
      }>;
    }
    const items = (await directus.request(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readItems('travel_route_map', {
        sort: ['sort'],
        limit: -1,
        fields: [
          'slug',
          { image: ['id', 'modified_on'] },
          { translations: ['name', { language: ['code'] }] },
        ],
      } as any),
    )) as RawMap[];
    return items
      .filter((m): m is RawMap & { slug: string } => !!m.slug)
      .map((m) => ({
        slug: m.slug,
        image: fileUrl(m.image),
        translations: (m.translations || [])
          .map((t) => {
            const code = t.language && typeof t.language === 'object' ? t.language.code : null;
            if (!code || !t.name) return null;
            return { language: code, name: t.name };
          })
          .filter((t): t is TravelRouteMapTranslation => t !== null),
      }));
  } catch (e) {
    console.warn('Directus fetch failed for travel_route_map, using fallback:', e);
    return [];
  }
}
