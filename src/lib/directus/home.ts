import { readItems } from '@directus/sdk';
import directus, { assetUrl } from './client';
import { composePageBundle, type PageTextsBundle } from './pages';
import type { HeroSlide, MarqueeImage } from '../data';

export function getHomeTexts(): Promise<PageTextsBundle> {
  return composePageBundle('home');
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const items = await directus.request(
      readItems('hero_slides', {
        sort: ['sort'],
        limit: -1,
      })
    );
    return items.map((s) => ({
      image: assetUrl(s.image),
      alt: s.alt,
    }));
  } catch (e) {
    console.warn('Directus fetch failed for hero_slides, using fallback:', e);
    return [];
  }
}

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
