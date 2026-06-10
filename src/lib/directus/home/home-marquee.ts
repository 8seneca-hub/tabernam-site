import { readItems } from '@directus/sdk';
import directus, { assetUrl } from '../client';
import { MarqueeImage } from '@/lib/data';

export async function getHomeMarquee(): Promise<MarqueeImage[]> {
  try {
    const items = await directus.request(
      readItems('home_marquee', {
        sort: ['row', 'sort'],
        limit: -1,
      })
    );
    return items
      .filter((m) => m.image)
      .map((m) => ({
        image: assetUrl(m.image),
        alt: m.alt ?? '',
        row: (m.row === 2 || m.row === 3 ? m.row : 1) as 1 | 2 | 3,
      }));
  } catch (e) {
    console.warn('Directus fetch failed for home_marquee, using fallback:', e);
    return [];
  }
}
