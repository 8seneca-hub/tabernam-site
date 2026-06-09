import { readSingleton } from '@directus/sdk';
import directus from './client';

export interface HeroText {
  title: string;
  body: string;
}

export interface HeroBundle {
  byLang: Record<string, HeroText>;
}

interface RawTranslation {
  title?: unknown;
  body?: unknown;
  language?: { code?: string } | null;
}

export async function getHero(): Promise<HeroBundle> {
  try {
    const row = (await directus.request(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readSingleton('hero', {
        fields: [{ translations: ['title', 'body', { language: ['code'] }] }],
      } as any),
    )) as { translations?: RawTranslation[] };

    const byLang: Record<string, HeroText> = {};
    for (const t of row.translations ?? []) {
      const code = t.language && typeof t.language === 'object' ? t.language.code : null;
      if (!code) continue;
      byLang[code] = {
        title: typeof t.title === 'string' ? t.title : '',
        body: typeof t.body === 'string' ? t.body : '',
      };
    }
    return { byLang };
  } catch (e) {
    console.warn('Directus fetch failed for hero, using fallback:', e);
    return { byLang: {} };
  }
}
