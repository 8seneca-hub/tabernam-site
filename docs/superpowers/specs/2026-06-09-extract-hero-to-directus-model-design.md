# Extract Hero Section text into its own Directus model

**Date:** 2026-06-09
**Status:** Approved (design)
**Scope:** Tabernam site, home page Hero Section

## Intent

Move Hero Section text (`hero.title`, `hero.body`) out of the shared `home_translations` table and the `t()` dictionary system, into a dedicated `hero` singleton + `hero_translations` collection in Directus. The hero becomes a self-contained CMS model, edited in one place, fetched via its own loader, and passed to `<HeroSection>` as props — the same pattern `hero_slides` already uses.

## Decisions

| Question                            | Decision                                                                            |
| ----------------------------------- | ----------------------------------------------------------------------------------- |
| Cardinality                         | Singleton — one hero, home only                                                     |
| Relationship with `hero_slides`     | Untouched. Slides continue to live in their own collection, fetched independently.  |
| Fate of `home_translations.hero_*`  | Dropped after data is migrated. Clean break, no parallel storage.                   |
| i18n integration                    | Removed from the `t()` dictionary system. Title/body become props (like slides).    |
| Language fallback                   | English in `HeroSection.tsx` when the active language has no hero row.              |

## Directus schema

### New collection: `hero`

- Singleton.
- Fields: `id` (auto, hidden). No translatable fields directly on the parent — all translatable content lives on the `translations` relation, matching the existing page-singleton pattern.
- One O2M relation alias: `translations` → `hero_translations.hero_id`.

### New collection: `hero_translations`

- Per-language rows for the hero singleton.
- Fields:
  - `id` (auto)
  - `hero_id` — M2O → `hero`
  - `language` — M2O → `languages` (matches existing `*_translations` collections)
  - `title` (string)
  - `body` (text)
- One row per language, populated by the migration from `home_translations.hero_title` / `hero_body`.

### Modified collection: `home_translations`

- Drop fields `hero_title`, `hero_body` after values are copied to `hero_translations`.

### Unchanged

- `hero_slides` — keeps its existing shape (image + alt, sortable).
- `languages`, `site_settings`, all other page singletons.

## Code changes

### New file: `src/lib/directus/hero.ts`

```ts
import { readSingleton } from '@directus/sdk';
import directus from './client';

export interface HeroText { title: string; body: string }
export interface HeroBundle { byLang: Record<string, HeroText> }

export async function getHero(): Promise<HeroBundle> {
  try {
    const row = await directus.request(
      readSingleton('hero', {
        fields: [{ translations: ['title', 'body', { language: ['code'] }] }],
      }) as unknown as Parameters<typeof directus.request>[0],
    );
    const byLang: Record<string, HeroText> = {};
    const translations = (row as { translations?: Array<Record<string, unknown>> }).translations ?? [];
    for (const t of translations) {
      const lang = t.language as { code?: string } | null;
      const code = lang && typeof lang === 'object' ? lang.code : null;
      if (!code) continue;
      byLang[code] = { title: String(t.title ?? ''), body: String(t.body ?? '') };
    }
    return { byLang };
  } catch (e) {
    console.warn('Directus fetch failed for hero, using fallback:', e);
    return { byLang: {} };
  }
}
```

Exported from `src/lib/directus/index.ts`.

### Modified: `src/app/page.tsx`

Add `getHero()` to the `Promise.all` and pass `hero` to `<HeroSection>`:

```ts
const [activities, heroSlides, marqueeImages, texts, hero] = await Promise.all([
  getActivities(),
  getHeroSlides(),
  getHomeMarquee(),
  getHomeTexts(),
  getHero(),
]);
// ...
<HeroSection slides={heroSlides} hero={hero} />
```

### Modified: `src/components/hero/HeroSection.tsx`

- New prop `hero?: HeroBundle`.
- Picks the entry by the current language from `useI18n().lang`, falling back to `en`, then to a hardcoded `FALLBACK_TEXT` constant for offline/local dev resilience.
- Removes `t('hero.title')` and `t('hero.body')`. `useI18n` is still imported only to read `lang`.

### Modified: `src/lib/page-keys.json`

Remove entries:

```json
"hero.title": { "page": "home", "field": "hero_title" },
"hero.body":  { "page": "home", "field": "hero_body" },
```

### Unchanged: `src/lib/i18n.ts`

`hero.title` / `hero.body` were never in `COMMON_DICTIONARIES`, so no edits required.

## Migration script: `scripts/migrate-hero-out-of-home.mjs`

Idempotent. Re-running after a partial failure must converge.

### Steps

1. **Ensure `hero` collection exists.** If not, create it as a singleton with a hidden default behavior in admin nav (configurable). Insert the single row if the collection is empty.
2. **Ensure `hero_translations` collection exists** with fields `id`, `hero_id` (M2O→hero), `language` (M2O→languages), `title` (string), `body` (text). Each `ensureField` call skips if already present.
3. **Set up the `translations` O2M alias on `hero`** pointing to `hero_translations.hero_id`. Skip if already configured.
4. **Copy data.** Read `home_translations` rows (`fields=id,language.code,hero_title,hero_body`). For each row, upsert a matching `hero_translations` row (matched by `hero_id` + `language`) with `title = hero_title`, `body = hero_body`.
5. **Drop fields.** Delete `hero_title` and `hero_body` from `home_translations`.

### Failure semantics

- Steps 1–4 are non-destructive. If any of them fails, no source data is lost; the script can be re-run.
- Step 5 is the only destructive step. The script logs a clear "About to delete fields" line before each delete. If the operator wants a dry run, the script accepts `--dry-run` and skips step 5.

### Usage

```bash
DIRECTUS_URL=https://directus-production-3a8d.up.railway.app \
DIRECTUS_TOKEN=tabernam-admin-token \
node scripts/migrate-hero-out-of-home.mjs
```

Add `--dry-run` to skip step 5.

## Out of scope

- New hero fields (CTA, eyebrow, subtitle, alignment). This migration is strict extraction — same content, new home.
- Hero on other pages (about/contact/cv). The collection is a singleton; if heroes on other pages are needed later, that's a follow-up migration to a multi-row pattern.
- Restructuring `hero_slides` (e.g. making it an O2M on `hero`). Decided to leave as-is.

## Risk & rollback

- **Backup before running.** Take a Directus DB snapshot. The migration deletes columns at step 5.
- **Manual rollback** (if needed): re-add `hero_title` and `hero_body` to `home_translations`, copy values back from `hero_translations.title` / `body`. Both tables are keyed by `language.code`, so the join is direct.
- **Frontend deploy ordering:** Run the migration first (Directus is updated), then deploy the frontend. During the brief gap, the old frontend reads `home_translations.hero_title` which still exists until step 5 — so if step 5 runs before frontend is deployed, the live site falls back to the `FALLBACK_TEXT` constant. To eliminate the gap, run steps 1–4, deploy the frontend, then run step 5 separately (the script supports this via `--dry-run` followed by a second run without).

## Acceptance

- Home page renders the same hero title and body it did before.
- Editing `hero_translations.title` in Directus admin (any language) updates the rendered title after page revalidation.
- `home_translations` no longer has `hero_title` or `hero_body` columns.
- `t('hero.title')` and `t('hero.body')` no longer appear anywhere in the source.
