import { readItems } from '@directus/sdk';
import directus, { assetUrl } from '../client';
import type { GlobeCity, GlobeCityTranslation } from '../../type';

export function pickTranslation(city: GlobeCity, lang: string): GlobeCityTranslation {
  return (
    city.translations.find((t) => t.language === lang) ??
    city.translations.find((t) => t.language === 'en') ??
    city.translations[0] ?? {
      language: 'en',
      name: city.slug,
      business: city.slug,
      description: '',
    }
  );
}

export async function getActivities(): Promise<GlobeCity[]> {
  try {
    const items = await directus.request(
      readItems('activities', {
        sort: ['sort'],
        limit: -1,
        fields: [
          'slug',
          'lat',
          'lng',
          'altitude',
          { translations: ['name', 'business', 'description', { language: ['code'] }] },
          { photos: ['directus_files_id'] },
        ],
      }),
    );
    return items.map((a) => ({
      slug: a.slug,
      lat: a.lat,
      lng: a.lng,
      altitude: a.altitude,
      translations: (a.translations || [])
        .map((t) => {
          const code = typeof t.language === 'object' && t.language ? t.language.code : null;
          if (!code) return null;
          return {
            language: code,
            name: t.name,
            business: t.business,
            description: t.description,
          };
        })
        .filter((t): t is GlobeCityTranslation => t !== null),
      photos: (a.photos || [])
        .map((p) => p.directus_files_id)
        .filter((id): id is string => !!id)
        .map((id) => assetUrl(id)),
    }));
  } catch (e) {
    console.warn('Directus fetch failed for activities, using fallback:', e);
    return [];
  }
}
