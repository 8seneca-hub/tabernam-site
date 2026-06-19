import { readSingleton } from '@directus/sdk';
import directus from '../client';

// UI labels for the interactive globe map. Split out of the old `globe`
// collection so the Globe singleton stays focused on the intro hero copy.
export interface MapText {
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

export interface MapBundle {
  byLang: Record<string, MapText>;
}

const FIELD_TO_TS: Array<[keyof MapText, string]> = [
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

function project(src: Record<string, unknown>): MapText {
  const out = {} as MapText;
  for (const [tsKey, apiKey] of FIELD_TO_TS) {
    const v = src[apiKey];
    out[tsKey] = typeof v === 'string' ? v : '';
  }
  return out;
}

interface RawTranslation extends Record<string, unknown> {
  language_code?: unknown;
}

interface RawMapRow extends Record<string, unknown> {
  translations?: RawTranslation[];
}

export async function getMap(): Promise<MapBundle> {
  try {
    const apiFields = FIELD_TO_TS.map(([, apiKey]) => apiKey);
    const queryFields = [
      ...apiFields,
      { translations: [...apiFields, 'language_code'] },
    ];
    const row = (await directus.request(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readSingleton('map', { fields: queryFields } as any),
    )) as RawMapRow | null;

    const byLang: Record<string, MapText> = {};
    if (row) {
      byLang[PRIMARY_LANG] = project(row);
      for (const t of (row.translations as RawTranslation[] | undefined) ?? []) {
        const code = typeof t.language_code === 'string' ? t.language_code : null;
        if (!code || code === PRIMARY_LANG) continue;
        byLang[code] = project(t);
      }
    }
    return { byLang };
  } catch (e) {
    console.warn('Directus fetch failed for map, using fallback:', e);
    return { byLang: {} };
  }
}
