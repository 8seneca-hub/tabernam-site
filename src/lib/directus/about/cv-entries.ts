import { readSingleton } from '@directus/sdk';
import directus from '../client';

// Education + Experience live in singleton collections (cv_education,
// cv_experience) with indexed fields (edu_0_title, edu_0_org, …). Adding a
// new edu_<n> or exp_<n> field set in Directus is picked up automatically —
// the fetcher queries `*`, discovers indices via regex, and builds entries
// in numeric order. Same idea as about-body's paragraph_N discovery.

export interface CvEducationEntry {
  byLang: Record<string, { title: string; org: string; date: string }>;
}

export interface CvExperienceEntry {
  byLang: Record<string, { title: string; org: string; date: string; desc: string }>;
}

export interface CvSection<T> {
  sectionTitle: Record<string, string>;
  entries: T[];
}

const EDU_FIELDS = ['title', 'org', 'date'] as const;
const EXP_FIELDS = ['title', 'org', 'date', 'desc'] as const;
const PRIMARY = 'en';

// Captures `<prefix>_<index>_<field>`. The field group is open here; we
// validate against the prefix's known field set when projecting so a stray
// `edu_0_foo` would be ignored.
const ENTRY_KEY_RE = /^(edu|exp)_(\d+)_([a-z]+)$/;

interface RawTranslation extends Record<string, unknown> {
  language?: { code?: string } | null;
}

interface RawSingletonRow extends Record<string, unknown> {
  translations?: RawTranslation[];
}

function asStr(src: Record<string, unknown>, key: string): string {
  const v = src[key];
  return typeof v === 'string' ? v : '';
}

// Walk every key on the parent row and on each translation to find the set
// of indices that exist for the given prefix. Returns the indices sorted
// ascending so the rendered order matches the Directus field ordering.
function discoverIndices(row: RawSingletonRow, prefix: 'edu' | 'exp'): number[] {
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

async function fetchSingleton(name: 'cv_education' | 'cv_experience') {
  return directus.request(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readSingleton(name, {
      // `*` pulls every scalar field — including any newly-added edu_N_*
      // or exp_N_* — without needing to update this fetcher. `translations`
      // is expanded with `*` for the same reason; the nested `language` is
      // appended explicitly because `*` doesn't follow relations.
      fields: [
        '*',
        { translations: ['*', { language: ['code'] }] },
      ],
    } as any),
  ) as Promise<RawSingletonRow | null>;
}

function buildEntries<T>(
  row: RawSingletonRow,
  prefix: 'edu' | 'exp',
  fields: readonly string[],
): T[] {
  const out: T[] = [];
  for (const i of discoverIndices(row, prefix)) {
    const byLang: Record<string, Record<string, string>> = {};
    const en: Record<string, string> = {};
    for (const f of fields) en[f] = asStr(row, `${prefix}_${i}_${f}`);
    byLang[PRIMARY] = en;
    for (const t of row.translations ?? []) {
      const code = t.language && typeof t.language === 'object' ? t.language.code : null;
      if (!code || code === PRIMARY) continue;
      const tr: Record<string, string> = {};
      for (const f of fields) tr[f] = asStr(t, `${prefix}_${i}_${f}`);
      byLang[code] = tr;
    }
    if (Object.values(byLang).every((entry) => Object.values(entry).every((v) => !v))) continue;
    out.push({ byLang } as T);
  }
  return out;
}

function buildSectionTitles(row: RawSingletonRow): Record<string, string> {
  const out: Record<string, string> = {};
  out[PRIMARY] = asStr(row, 'section_title');
  for (const t of row.translations ?? []) {
    const code = t.language && typeof t.language === 'object' ? t.language.code : null;
    if (!code || code === PRIMARY) continue;
    out[code] = asStr(t, 'section_title');
  }
  return out;
}

export async function getCvEducation(): Promise<CvSection<CvEducationEntry>> {
  try {
    const row = await fetchSingleton('cv_education');
    if (!row) return { sectionTitle: { en: 'Education' }, entries: [] };
    return {
      sectionTitle: buildSectionTitles(row),
      entries: buildEntries<CvEducationEntry>(row, 'edu', EDU_FIELDS),
    };
  } catch (e) {
    console.warn('Directus fetch failed for cv_education:', e);
    return { sectionTitle: { en: 'Education' }, entries: [] };
  }
}

export async function getCvExperience(): Promise<CvSection<CvExperienceEntry>> {
  try {
    const row = await fetchSingleton('cv_experience');
    if (!row) return { sectionTitle: { en: 'Work experience' }, entries: [] };
    return {
      sectionTitle: buildSectionTitles(row),
      entries: buildEntries<CvExperienceEntry>(row, 'exp', EXP_FIELDS),
    };
  } catch (e) {
    console.warn('Directus fetch failed for cv_experience:', e);
    return { sectionTitle: { en: 'Work experience' }, entries: [] };
  }
}

export function pickEntry<T>(entry: { byLang: Record<string, T> }, lang: string): T | undefined {
  return entry.byLang[lang] ?? entry.byLang[PRIMARY];
}

export function pickSectionTitle(section: CvSection<unknown>, lang: string, fallback: string): string {
  return section.sectionTitle[lang] || section.sectionTitle[PRIMARY] || fallback;
}
