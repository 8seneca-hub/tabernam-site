import { readItems } from '@directus/sdk';
import directus from './client';

// All 16 fields, camelCase for JS convention.
export interface GlobeText {
  introHeading: string;
  introBody: string;
  introCta: string;
  hintDrag: string;
  hintZoom: string;
  hintClickCity: string;
  zoomMaxToast: string;
  zoomMinToast: string;
  regionWorld: string;
  regionEurope: string;
  regionAsia: string;
  regionAfrica: string;
  regionAmericas: string;
  regionOceania: string;
  panelGoToLocation: string;
  btnExploreNow: string;
}

export interface GlobeBundle {
  byLang: Record<string, GlobeText>;
}

// Directus snake_case key → JS camelCase key, used to project both the parent
// row and translation rows onto the same TS shape.
const FIELD_TO_TS: Array<[keyof GlobeText, string]> = [
  ['introHeading',      'intro_heading'],
  ['introBody',         'intro_body'],
  ['introCta',          'intro_cta'],
  ['hintDrag',          'hint_drag'],
  ['hintZoom',          'hint_zoom'],
  ['hintClickCity',     'hint_click_city'],
  ['zoomMaxToast',      'zoom_max_toast'],
  ['zoomMinToast',      'zoom_min_toast'],
  ['regionWorld',       'region_world'],
  ['regionEurope',      'region_europe'],
  ['regionAsia',        'region_asia'],
  ['regionAfrica',      'region_africa'],
  ['regionAmericas',    'region_americas'],
  ['regionOceania',     'region_oceania'],
  ['panelGoToLocation', 'panel_go_to_location'],
  ['btnExploreNow',     'btn_explore_now'],
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
    const rows = (await directus.request(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readItems('globe', { limit: 1, fields: queryFields } as any),
    )) as RawGlobeRow[];

    const row = rows[0];
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
