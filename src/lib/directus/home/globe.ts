import { readSingleton } from '@directus/sdk';
import directus from '../client';

export interface GlobeText {
  introHeading: string;
  introBody: string;
  introCta: string;
}

export interface GlobeBundle {
  byLang: Record<string, GlobeText>;
}

const FIELD_TO_TS: Array<[keyof GlobeText, string]> = [
  ['introHeading', 'intro_heading'],
  ['introBody',    'intro_body'],
  ['introCta',     'intro_cta'],
];

const PRIMARY_LANG = 'en';

function project(src: Record<string, unknown>): GlobeText {
  const out = {} as GlobeText;
  for (const [tsKey, apiKey] of FIELD_TO_TS) {
    const v = src[apiKey];
    out[tsKey] = typeof v === 'string' ? v : '';
  }
  return out;
}

interface RawTranslation extends Record<string, unknown> {
  language?: { code?: string } | null;
}

interface RawGlobeRow extends Record<string, unknown> {
  translations?: RawTranslation[];
}

export async function getGlobe(): Promise<GlobeBundle> {
  try {
    const apiFields = FIELD_TO_TS.map(([, apiKey]) => apiKey);
    const queryFields = [
      ...apiFields,
      { translations: [...apiFields, { language: ['code'] }] },
    ];
    const row = (await directus.request(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readSingleton('globe', { fields: queryFields } as any),
    )) as RawGlobeRow | null;

    const byLang: Record<string, GlobeText> = {};
    if (row) {
      byLang[PRIMARY_LANG] = project(row);
      for (const t of (row.translations as RawTranslation[] | undefined) ?? []) {
        const code = t.language && typeof t.language === 'object' ? t.language.code : null;
        if (!code || code === PRIMARY_LANG) continue;
        byLang[code] = project(t);
      }
    }
    return { byLang };
  } catch (e) {
    console.warn('Directus fetch failed for globe, using fallback:', e);
    return { byLang: {} };
  }
}
