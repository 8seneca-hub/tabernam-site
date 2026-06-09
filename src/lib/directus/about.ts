import { readItems, readFiles } from '@directus/sdk';
import directus, { assetUrl } from './client';
import { composePageBundle, type PageTextsBundle } from './pages';
import type { TravelRouteMap } from '../data';

export function getAboutTexts(): Promise<PageTextsBundle> {
  return composePageBundle('about');
}

export async function getTravelRouteMaps(): Promise<TravelRouteMap[]> {
  try {
    const items = await directus.request(
      readItems('travel_route_map', {
        sort: ['sort'],
        limit: -1,
      })
    );

    // Look up each referenced file's modified_on so the asset URL can be
    // versioned (?v=…). Without this, "Replace File" reuses the same file id /
    // URL and caches keep serving the old image for up to 30 days.
    const ids = items.map((m) => m.image).filter((id): id is string => !!id);
    const versionById: Record<string, string> = {};
    if (ids.length) {
      const files = await directus.request(
        readFiles({ filter: { id: { _in: ids } }, fields: ['id', 'modified_on'], limit: -1 }),
      );
      for (const f of files) {
        if (f.modified_on) versionById[f.id] = f.modified_on;
      }
    }

    return items
      .filter((m) => m.slug)
      .map((m) => ({
        slug: m.slug,
        image: m.image ? assetUrl(m.image, versionById[m.image]) : '',
      }));
  } catch (e) {
    console.warn('Directus fetch failed for travel_route_map, using fallback:', e);
    return [];
  }
}
