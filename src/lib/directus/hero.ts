import { readItems } from '@directus/sdk';
import directus, { assetUrl } from './client';
import type { HeroSlide } from '../data';

export interface HeroText {
  title: string;
  body: string;
}

export interface HeroBundle {
  byLang: Record<string, HeroText>;
  slides: HeroSlide[];
}

interface RawTranslation {
  title?: unknown;
  body?: unknown;
  language?: { code?: string } | null;
}

interface RawSlide {
  image?: unknown;
  alt?: unknown;
}

interface RawHeroRow {
  title?: unknown;
  body?: unknown;
  translations?: RawTranslation[];
  slides?: RawSlide[];
}

// Parent row carries the canonical (English) title + body, plus its slides.
// Non-English text lives in `hero_translations`.
const PRIMARY_LANG = 'en';

export async function getHero(): Promise<HeroBundle> {
  try {
    const rows = (await directus.request(
      readItems('hero', {
        limit: 1,
        fields: [
          'title',
          'body',
          { translations: ['title', 'body', { language: ['code'] }] },
          { slides: ['image', 'alt'] },
        ],
      }),
    )) as RawHeroRow[];

    const row = rows[0];
    const byLang: Record<string, HeroText> = {};
    let slides: HeroSlide[] = [];
    if (row) {
      byLang[PRIMARY_LANG] = {
        title: typeof row.title === 'string' ? row.title : '',
        body: typeof row.body === 'string' ? row.body : '',
      };
      for (const t of row.translations ?? []) {
        const code = t.language && typeof t.language === 'object' ? t.language.code : null;
        if (!code || code === PRIMARY_LANG) continue;
        byLang[code] = {
          title: typeof t.title === 'string' ? t.title : '',
          body: typeof t.body === 'string' ? t.body : '',
        };
      }
      slides = (row.slides ?? [])
        .filter((s) => typeof s.image === 'string' && s.image)
        .map((s) => ({
          image: assetUrl(s.image as string),
          alt: typeof s.alt === 'string' ? s.alt : '',
        }));
    }
    return { byLang, slides };
  } catch (e) {
    console.warn('Directus fetch failed for hero, using fallback:', e);
    return { byLang: {}, slides: [] };
  }
}
