import { readItems } from '@directus/sdk';
import directus from '../client';

export interface GlobeText {
  introHeading: string;
  introBody: string;
  introCta: string;
}

export type GlobeTextBundle = Record<string, GlobeText>;

interface RawGlobeTranslation {
  intro_heading?: unknown;
  intro_body?: unknown;
  intro_cta?: unknown;
  language_code?: unknown;
}

function asStr(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

export async function getGlobeText(): Promise<GlobeTextBundle> {
  try {
    const items = (await directus.request(
      readItems('globe_translations', {
        limit: -1,
        fields: ['intro_heading', 'intro_body', 'intro_cta', 'language_code'],
      }),
    )) as RawGlobeTranslation[];

    const byLang: GlobeTextBundle = {};
    for (const t of items) {
      const code = typeof t.language_code === 'string' ? t.language_code : null;
      if (!code) continue;
      byLang[code] = {
        introHeading: asStr(t.intro_heading),
        introBody: asStr(t.intro_body),
        introCta: asStr(t.intro_cta),
      };
    }
    return byLang;
  } catch (e) {
    console.warn('Directus fetch failed for globe_translations, using fallback:', e);
    return {};
  }
}
