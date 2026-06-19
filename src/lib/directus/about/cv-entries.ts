import { readItems } from '@directus/sdk';
import directus from '../client';

// Education + Experience are now standalone translation tables
// (cv_education_translations, cv_experience_translations) — one row per
// language. Each row carries indexed fields (edu_0_title, edu_0_org, …).
// Adding a new edu_<n>/exp_<n> field set in Directus is picked up
// automatically — the fetcher queries `*`, discovers indices via regex, and
// builds entries in numeric order. Same idea as about-body's paragraph_N
// discovery.

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

interface RawRow extends Record<string, unknown> {
  language_code?: unknown;
}

function asStr(src: Record<string, unknown>, key: string): string {
  const v = src[key];
  return typeof v === 'string' ? v : '';
}

// Walk every key on every translation row to find the set of indices that
// exist for the given prefix. Returns the indices sorted ascending so the
// rendered order matches the Directus field ordering.
function discoverIndices(rows: RawRow[], prefix: 'edu' | 'exp'): number[] {
  const indices = new Set<number>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      const m = key.match(ENTRY_KEY_RE);
      if (m && m[1] === prefix) indices.add(Number(m[2]));
    }
  }
  return [...indices].sort((a, b) => a - b);
}

async function fetchTranslations(
  name: 'cv_education_translations' | 'cv_experience_translations',
) {
  return directus.request(
    readItems(name, { limit: -1, fields: ['*'] }),
  ) as Promise<RawRow[]>;
}

function buildEntries<T>(
  rows: RawRow[],
  prefix: 'edu' | 'exp',
  fields: readonly string[],
): T[] {
  const out: T[] = [];
  for (const i of discoverIndices(rows, prefix)) {
    const byLang: Record<string, Record<string, string>> = {};
    for (const row of rows) {
      const code = typeof row.language_code === 'string' ? row.language_code : null;
      if (!code) continue;
      const tr: Record<string, string> = {};
      for (const f of fields) tr[f] = asStr(row, `${prefix}_${i}_${f}`);
      byLang[code] = tr;
    }
    if (Object.values(byLang).every((entry) => Object.values(entry).every((v) => !v))) continue;
    out.push({ byLang } as T);
  }
  return out;
}

function buildSectionTitles(rows: RawRow[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const row of rows) {
    const code = typeof row.language_code === 'string' ? row.language_code : null;
    if (!code) continue;
    out[code] = asStr(row, 'section_title');
  }
  return out;
}

export async function getCvEducation(): Promise<CvSection<CvEducationEntry>> {
  try {
    const rows = await fetchTranslations('cv_education_translations');
    if (!rows || rows.length === 0) return { sectionTitle: { en: 'Education' }, entries: [] };
    return {
      sectionTitle: buildSectionTitles(rows),
      entries: buildEntries<CvEducationEntry>(rows, 'edu', EDU_FIELDS),
    };
  } catch (e) {
    console.warn('Directus fetch failed for cv_education_translations:', e);
    return { sectionTitle: { en: 'Education' }, entries: [] };
  }
}

export async function getCvExperience(): Promise<CvSection<CvExperienceEntry>> {
  try {
    const rows = await fetchTranslations('cv_experience_translations');
    if (!rows || rows.length === 0) return { sectionTitle: { en: 'Work experience' }, entries: [] };
    return {
      sectionTitle: buildSectionTitles(rows),
      entries: buildEntries<CvExperienceEntry>(rows, 'exp', EXP_FIELDS),
    };
  } catch (e) {
    console.warn('Directus fetch failed for cv_experience_translations:', e);
    return { sectionTitle: { en: 'Work experience' }, entries: [] };
  }
}

export function pickEntry<T>(entry: { byLang: Record<string, T> }, lang: string): T | undefined {
  return entry.byLang[lang] ?? entry.byLang[PRIMARY];
}

export function pickSectionTitle(section: CvSection<unknown>, lang: string, fallback: string): string {
  return section.sectionTitle[lang] || section.sectionTitle[PRIMARY] || fallback;
}
