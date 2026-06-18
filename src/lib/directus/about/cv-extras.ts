import { readSingleton } from '@directus/sdk';
import directus from '../client';

// cv_extras is a singleton holding three additional CV sections that aren't
// part of the main education/experience flow: Activities in China, Languages,
// and Personal skills. EN values live on the row directly; other languages on
// cv_extras_translations. Indices are discovered the same way cv-entries does
// it — scanning keys with a prefix-aware regex so adding new entries in
// Directus is picked up without code changes.

export interface CvChinaEntry {
  byLang: Record<string, { text: string; years: string }>;
}

export interface CvLanguageEntry {
  // Bars is non-translatable (same number across languages), stored on the
  // main row only — but we treat it as part of the entry shape so the UI
  // doesn't have to special-case it.
  bars: number;
  byLang: Record<string, { name: string; level: string; descriptor: string }>;
}

export interface CvSkillEntry {
  byLang: Record<string, { text: string }>;
}

export interface CvExtras {
  sectionTitles: {
    china: Record<string, string>;
    languages: Record<string, string>;
    skills: Record<string, string>;
  };
  languagesNativeLabel: Record<string, string>;
  china: CvChinaEntry[];
  languages: CvLanguageEntry[];
  skills: CvSkillEntry[];
}

const PRIMARY = 'en';
const ENTRY_KEY_RE = /^(china|lang|skill)_(\d+)_([a-z_]+)$/;

const CHINA_FIELDS = ['text', 'years'] as const;
const LANG_FIELDS = ['name', 'level', 'descriptor'] as const;
const SKILL_FIELDS = ['text'] as const;

interface RawTranslation extends Record<string, unknown> {
  language?: { code?: string } | null;
}
interface RawRow extends Record<string, unknown> {
  translations?: RawTranslation[];
}

function asStr(src: Record<string, unknown>, key: string): string {
  const v = src[key];
  return typeof v === 'string' ? v : '';
}

function asNum(src: Record<string, unknown>, key: string, fallback: number): number {
  const v = src[key];
  return typeof v === 'number' ? v : fallback;
}

function discoverIndices(row: RawRow, prefix: 'china' | 'lang' | 'skill'): number[] {
  const indices = new Set<number>();
  const scan = (obj: Record<string, unknown> | undefined | null) => {
    if (!obj) return;
    for (const key of Object.keys(obj)) {
      const m = key.match(ENTRY_KEY_RE);
      if (m && m[1] === prefix) indices.add(Number(m[2]));
    }
  };
  scan(row);
  for (const t of row.translations ?? []) scan(t);
  return [...indices].sort((a, b) => a - b);
}

function buildByLang<T extends Record<string, string>>(
  row: RawRow,
  fields: readonly string[],
  keyFor: (field: string) => string,
): Record<string, T> {
  const byLang: Record<string, T> = {};
  const primary = {} as T;
  for (const f of fields) (primary as Record<string, string>)[f] = asStr(row, keyFor(f));
  byLang[PRIMARY] = primary;
  for (const t of row.translations ?? []) {
    const code = t.language && typeof t.language === 'object' ? t.language.code : null;
    if (!code || code === PRIMARY) continue;
    const tr = {} as T;
    for (const f of fields) (tr as Record<string, string>)[f] = asStr(t, keyFor(f));
    byLang[code] = tr;
  }
  return byLang;
}

function buildSectionTitleMap(row: RawRow, field: string): Record<string, string> {
  const out: Record<string, string> = {};
  out[PRIMARY] = asStr(row, field);
  for (const t of row.translations ?? []) {
    const code = t.language && typeof t.language === 'object' ? t.language.code : null;
    if (!code || code === PRIMARY) continue;
    out[code] = asStr(t, field);
  }
  return out;
}

function isEntryEmpty(byLang: Record<string, Record<string, string>>): boolean {
  return Object.values(byLang).every((entry) => Object.values(entry).every((v) => !v));
}

const EMPTY: CvExtras = {
  sectionTitles: { china: { en: 'Activities in China' }, languages: { en: 'Languages' }, skills: { en: 'Personal skills' } },
  languagesNativeLabel: { en: '' },
  china: [],
  languages: [],
  skills: [],
};

export async function getCvExtras(): Promise<CvExtras> {
  try {
    const row = (await directus.request(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readSingleton('cv_extras', {
        fields: ['*', { translations: ['*', { language: ['code'] }] }],
      } as any),
    )) as RawRow | null;
    if (!row) return EMPTY;

    const china: CvChinaEntry[] = [];
    for (const i of discoverIndices(row, 'china')) {
      const byLang = buildByLang<{ text: string; years: string }>(row, CHINA_FIELDS, (f) => `china_${i}_${f}`);
      if (isEntryEmpty(byLang)) continue;
      china.push({ byLang });
    }

    const languages: CvLanguageEntry[] = [];
    for (const i of discoverIndices(row, 'lang')) {
      const byLang = buildByLang<{ name: string; level: string; descriptor: string }>(
        row,
        LANG_FIELDS,
        (f) => `lang_${i}_${f}`,
      );
      if (isEntryEmpty(byLang)) continue;
      languages.push({ bars: asNum(row, `lang_${i}_bars`, 0), byLang });
    }

    const skills: CvSkillEntry[] = [];
    for (const i of discoverIndices(row, 'skill')) {
      const byLang = buildByLang<{ text: string }>(row, SKILL_FIELDS, (f) => `skill_${i}_${f}`);
      if (isEntryEmpty(byLang)) continue;
      skills.push({ byLang });
    }

    return {
      sectionTitles: {
        china: buildSectionTitleMap(row, 'china_section_title'),
        languages: buildSectionTitleMap(row, 'languages_section_title'),
        skills: buildSectionTitleMap(row, 'skills_section_title'),
      },
      languagesNativeLabel: buildSectionTitleMap(row, 'languages_native_label'),
      china,
      languages,
      skills,
    };
  } catch (e) {
    console.warn('Directus fetch failed for cv_extras:', e);
    return EMPTY;
  }
}

export function pickExtrasText(map: Record<string, string>, lang: string, fallback = ''): string {
  return map[lang] || map[PRIMARY] || fallback;
}
