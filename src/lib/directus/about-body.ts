import { readSingleton } from '@directus/sdk';
import directus, { assetUrl } from './client';

export interface AboutBodyText {
  body: string;
  experienceVideoUrl: string;
  experienceVideoTitle: string;
  philanthropyStory1VideoUrl: string;
  philanthropyStory1Title: string;
  philanthropyStory2VideoUrl: string;
  philanthropyStory2Title: string;
  travelRoutesHeading: string;
  travelRoutesBody: string;
}

export interface AboutBodyBundle {
  byLang: Record<string, AboutBodyText>;
  image1: string;
  image2: string;
  image3: string;
}

interface RawTranslation {
  body?: unknown;
  experience_video_url?: unknown;
  experience_video_title?: unknown;
  philanthropy_story_1_video_url?: unknown;
  philanthropy_story_1_title?: unknown;
  philanthropy_story_2_video_url?: unknown;
  philanthropy_story_2_title?: unknown;
  travel_routes_heading?: unknown;
  travel_routes_body?: unknown;
  language?: { code?: string } | null;
}

interface RawRow extends RawTranslation {
  image_1?: unknown;
  image_2?: unknown;
  image_3?: unknown;
  translations?: RawTranslation[];
}

const PRIMARY_LANG = 'en';

function asStr(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function projectTranslation(src: RawTranslation | RawRow): AboutBodyText {
  return {
    body: asStr(src.body),
    experienceVideoUrl: asStr(src.experience_video_url),
    experienceVideoTitle: asStr(src.experience_video_title),
    philanthropyStory1VideoUrl: asStr(src.philanthropy_story_1_video_url),
    philanthropyStory1Title: asStr(src.philanthropy_story_1_title),
    philanthropyStory2VideoUrl: asStr(src.philanthropy_story_2_video_url),
    philanthropyStory2Title: asStr(src.philanthropy_story_2_title),
    travelRoutesHeading: asStr(src.travel_routes_heading),
    travelRoutesBody: asStr(src.travel_routes_body),
  };
}

// /about page body content. English canonical lives on the `about_body`
// parent (English row of translations is folded in for read convenience);
// non-English on `about_body_translations`.
export async function getAboutBody(): Promise<AboutBodyBundle> {
  try {
    const row = (await directus.request(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readSingleton('about_body', {
        fields: [
          'image_1', 'image_2', 'image_3',
          {
            translations: [
              'body',
              'experience_video_url', 'experience_video_title',
              'philanthropy_story_1_video_url', 'philanthropy_story_1_title',
              'philanthropy_story_2_video_url', 'philanthropy_story_2_title',
              'travel_routes_heading', 'travel_routes_body',
              { language: ['code'] },
            ],
          },
        ],
      } as any),
    )) as RawRow | null;

    const byLang: Record<string, AboutBodyText> = {};
    let image1 = '';
    let image2 = '';
    let image3 = '';
    if (row) {
      for (const t of row.translations ?? []) {
        const code = t.language && typeof t.language === 'object' ? t.language.code : null;
        if (!code) continue;
        byLang[code] = projectTranslation(t);
      }
      image1 = typeof row.image_1 === 'string' ? assetUrl(row.image_1) : '';
      image2 = typeof row.image_2 === 'string' ? assetUrl(row.image_2) : '';
      image3 = typeof row.image_3 === 'string' ? assetUrl(row.image_3) : '';
    }
    // Guarantee an `en` entry exists so the fallback chain has something
    // to land on even if the user has only filled in non-English rows.
    if (!byLang[PRIMARY_LANG]) {
      byLang[PRIMARY_LANG] = {
        body: '',
        experienceVideoUrl: '',
        experienceVideoTitle: '',
        philanthropyStory1VideoUrl: '',
        philanthropyStory1Title: '',
        philanthropyStory2VideoUrl: '',
        philanthropyStory2Title: '',
        travelRoutesHeading: '',
        travelRoutesBody: '',
      };
    }
    return { byLang, image1, image2, image3 };
  } catch (e) {
    console.warn('Directus fetch failed for about_body, using fallback:', e);
    return {
      byLang: {},
      image1: '',
      image2: '',
      image3: '',
    };
  }
}
