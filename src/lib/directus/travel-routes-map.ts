import { readItems } from '@directus/sdk';
import directus, { assetUrl } from './client';
import type { TravelRouteMap, TravelRouteMapTranslation } from '../data';

export async function getTravelRouteMaps(): Promise<TravelRouteMap[]> {
  try {
    const items = await directus.request(
      readItems('travel_route_map', {
        sort: ['sort'],
        limit: -1,
        fields: [
          'slug',
          'image',
          { translations: ['name', { language: ['code'] }] },
        ],
      })
    );
    return items
      .filter((m) => m.slug)
      .map((m) => ({
        slug: m.slug,
        image: m.image ? assetUrl(m.image) : '',
        translations: (m.translations || [])
          .map((t) => {
            const code = typeof t.language === 'object' && t.language ? t.language.code : null;
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
