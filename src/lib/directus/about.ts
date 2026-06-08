import { readItems } from '@directus/sdk';
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
    return items
      .filter((m) => m.slug)
      .map((m) => ({
        slug: m.slug,
        image: m.image ? assetUrl(m.image) : '',
      }));
  } catch (e) {
    console.warn('Directus fetch failed for travel_route_map, using fallback:', e);
    return [];
  }
}
