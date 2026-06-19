import { readItems } from '@directus/sdk';
import directus, { assetUrl } from '../client';
import type { HeroSlide } from '@/lib/data';

export interface HeroText {
  title: string;
  body: string;
}

export type HeroTextBundle = Record<string, HeroText>;

interface RawSlide {
  image?: unknown;
  alt?: unknown;
}

interface RawHeroTranslation {
  title?: unknown;
  body?: unknown;
  language_code?: unknown;
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const items = (await directus.request(
      readItems('hero_slides', {
        sort: ['sort'],
        limit: -1,
        fields: ['image', 'alt'],
      }),
    )) as RawSlide[];

    return items
      .filter((s) => typeof s.image === 'string' && s.image)
      .map((s) => ({
        image: assetUrl(s.image as string),
        alt: typeof s.alt === 'string' ? s.alt : '',
      }));
  } catch (e) {
    console.warn('Directus fetch failed for hero_slides, using fallback:', e);
    return [];
  }
}

export async function getHeroText(): Promise<HeroTextBundle> {
  try {
    const items = (await directus.request(
      readItems('hero_translations', {
        limit: -1,
        fields: ['title', 'body', 'language_code'],
      }),
    )) as RawHeroTranslation[];

    const byLang: HeroTextBundle = {};
    for (const t of items) {
      const code = typeof t.language_code === 'string' ? t.language_code : null;
      if (!code) continue;
      byLang[code] = {
        title: typeof t.title === 'string' ? t.title : '',
        body: typeof t.body === 'string' ? t.body : '',
      };
    }
    return byLang;
  } catch (e) {
    console.warn('Directus fetch failed for hero_translations, using fallback:', e);
    return {};
  }
}
