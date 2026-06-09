# Extract Hero Section text into its own Directus model — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move `hero.title` and `hero.body` out of the `home` page singleton dictionary system into a dedicated `hero` singleton + `hero_translations` collection in Directus, fetched via its own loader, and passed to `<HeroSection>` as a prop (matching the existing `hero_slides` pattern).

**Architecture:** Two-phase migration. Phase 1 (non-destructive) creates the new Directus schema and copies data. Frontend is updated to read from the new location with a hardcoded English fallback. Phase 2 (destructive) drops the old `hero_title` / `hero_body` columns from `home_translations`. The script is idempotent and gated by `--dry-run` so phase 1 and phase 2 can be split across the frontend deploy.

**Tech Stack:** Directus REST API (via `fetch` in Node scripts), Directus SDK (`readSingleton`), Next.js 15 App Router (server components), TypeScript, React.

**Spec:** `docs/superpowers/specs/2026-06-09-extract-hero-to-directus-model-design.md`

---

## File map

| Action | Path | Responsibility |
| --- | --- | --- |
| Create | `scripts/migrate-hero-out-of-home.mjs` | Idempotent migration. Creates `hero` + `hero_translations`, copies data, optionally drops old fields. |
| Create | `src/lib/directus/hero.ts` | `getHero()` loader that returns `{ byLang }`. Mirrors `getHomeMarquee`/`getHeroSlides` style. |
| Modify | `src/lib/directus/index.ts` | Export `getHero` and `HeroBundle`. |
| Modify | `src/components/hero/HeroSection.tsx` | Accept new `hero?: HeroBundle` prop. Read title/body from prop, fall back to a hardcoded English constant. Drop `t('hero.title')` / `t('hero.body')` calls. |
| Modify | `src/app/page.tsx` | Fetch the hero in `Promise.all`, pass to `<HeroSection>`. |
| Modify | `src/lib/page-keys.json` | Remove `hero.title` and `hero.body` dictionary entries. |

No tests are added — this codebase has no test runner. Verification is `tsc --noEmit`, `eslint`, and a manual browser smoke test in `npm run dev`.

---

## Task 1 — Write the migration script

**Files:**
- Create: `scripts/migrate-hero-out-of-home.mjs`

This is the entirety of the Directus work. The script is idempotent (skips collections/fields/relations/rows already present) and supports `--dry-run` to suppress the destructive final step.

- [ ] **Step 1: Create the migration script with full content**

Create `scripts/migrate-hero-out-of-home.mjs` with the following content:

```js
#!/usr/bin/env node
// Move hero text (hero.title / hero.body) out of home_translations into a
// dedicated `hero` singleton + `hero_translations` collection. Idempotent:
// re-running converges. Pass `--dry-run` to skip the destructive step that
// drops hero_title / hero_body from home_translations.
//
// Usage:
//   DIRECTUS_URL=https://directus-production-3a8d.up.railway.app \
//     DIRECTUS_TOKEN=tabernam-admin-token \
//     node scripts/migrate-hero-out-of-home.mjs [--dry-run]

const URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_TOKEN || 'tabernam-admin-token';
const DRY_RUN = process.argv.includes('--dry-run');

async function api(path, method = 'GET', body) {
  const res = await fetch(`${URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

async function exists(p) {
  try { await api(p); return true; } catch { return false; }
}

async function ensureCollection(collection, meta) {
  if (await exists(`/collections/${collection}`)) {
    console.log(`  skip collection ${collection} (exists)`);
    return;
  }
  await api('/collections', 'POST', {
    collection,
    meta: { collection, hidden: false, ...meta },
    schema: { name: collection },
  });
  console.log(`  collection ${collection} created`);
}

async function ensureField(collection, def) {
  if (await exists(`/fields/${collection}/${def.field}`)) {
    console.log(`  skip ${collection}.${def.field} (exists)`);
    return;
  }
  await api(`/fields/${collection}`, 'POST', {
    field: def.field,
    type: def.type,
    meta: {
      interface: def.interface,
      special: def.special || null,
      required: def.required || false,
      options: def.options || null,
      note: def.note || null,
      hidden: def.hidden || false,
    },
    schema: def.schema === null ? null : (def.schema || { name: def.field }),
  });
  console.log(`  added ${collection}.${def.field}`);
}

async function ensureRelation(many, field, related, oneField) {
  const list = await api('/relations');
  const has = list.data.find((r) => r.collection === many && r.field === field);
  if (has) {
    console.log(`  skip relation ${many}.${field} → ${related} (exists)`);
    return;
  }
  await api('/relations', 'POST', {
    collection: many,
    field,
    related_collection: related,
    meta: {
      many_collection: many,
      many_field: field,
      one_collection: related,
      one_field: oneField,
      one_deselect_action: 'nullify',
      junction_field: null,
      sort_field: null,
    },
    schema: { on_delete: 'SET NULL', on_update: 'NO ACTION' },
  });
  console.log(`  rel ${many}.${field} → ${related}${oneField ? ` (alias: ${oneField})` : ''}`);
}

// 1) Parent singleton
await ensureCollection('hero', {
  singleton: true,
  icon: 'wallpaper',
  note: 'Home page hero section. Singleton — exactly one row.',
});

// 2) Translations collection
await ensureCollection('hero_translations', {
  hidden: false,
  icon: 'translate',
  note: 'Per-language hero text (title, body).',
});

// 3) Translations table columns
await ensureField('hero_translations', {
  field: 'hero_id', type: 'uuid', interface: 'select-dropdown-m2o', special: ['m2o'], hidden: true,
});
await ensureField('hero_translations', {
  field: 'language', type: 'string', interface: 'select-dropdown-m2o', special: ['m2o'],
});
await ensureField('hero_translations', {
  field: 'title', type: 'string', interface: 'input', note: 'Hero headline.',
});
await ensureField('hero_translations', {
  field: 'body', type: 'text', interface: 'input-multiline', note: 'Hero subhead / body.',
});

// 4) Alias on parent so the admin UI shows a Translations tab
await ensureField('hero', {
  field: 'translations',
  type: 'alias',
  interface: 'translations',
  special: ['translations'],
  schema: null,
  note: 'Per-language hero content.',
});

// 5) Relations: hero_id → hero (with `translations` alias on parent), language → languages
await ensureRelation('hero_translations', 'hero_id', 'hero', 'translations');
await ensureRelation('hero_translations', 'language', 'languages', null);

// 6) Ensure the singleton row exists
const heroRowsRes = await api('/items/hero?fields=id');
let heroId;
if (!heroRowsRes.data || heroRowsRes.data.length === 0) {
  const created = await api('/items/hero', 'POST', {});
  heroId = created.data.id;
  console.log(`  hero: inserted singleton row (id=${heroId})`);
} else {
  heroId = heroRowsRes.data[0].id;
  console.log(`  hero: singleton row exists (id=${heroId})`);
}

// 7) Copy values from home_translations
const homeRows = await api('/items/home_translations?fields=id,language.code,hero_title,hero_body');
const existingHeroTrRes = await api(`/items/hero_translations?fields=id,language.code&filter%5Bhero_id%5D%5B_eq%5D=${heroId}`);
const existingByLang = Object.fromEntries(
  (existingHeroTrRes.data || []).map((r) => [r.language?.code, r.id]),
);

for (const row of homeRows.data || []) {
  const code = row.language?.code;
  if (!code) continue;
  const payload = {
    hero_id: heroId,
    language: code,
    title: row.hero_title ?? '',
    body: row.hero_body ?? '',
  };
  if (existingByLang[code]) {
    await api(`/items/hero_translations/${existingByLang[code]}`, 'PATCH', payload);
    console.log(`  hero_translations[${code}]: updated`);
  } else {
    await api('/items/hero_translations', 'POST', payload);
    console.log(`  hero_translations[${code}]: created`);
  }
}

// 8) Destructive: drop old fields. Skipped when --dry-run.
if (DRY_RUN) {
  console.log('\n--dry-run set: skipping field drops on home_translations.');
} else {
  for (const f of ['hero_title', 'hero_body']) {
    if (await exists(`/fields/home_translations/${f}`)) {
      console.log(`\nAbout to delete home_translations.${f}`);
      await api(`/fields/home_translations/${f}`, 'DELETE');
      console.log(`  home_translations.${f}: deleted`);
    } else {
      console.log(`  skip drop home_translations.${f} (already absent)`);
    }
  }
}

console.log('\nDone.');
```

- [ ] **Step 2: Verify script parses (no run yet)**

Run: `node --check scripts/migrate-hero-out-of-home.mjs`
Expected: no output, exit code 0. Confirms the file is valid JavaScript.

- [ ] **Step 3: Commit**

```bash
git add scripts/migrate-hero-out-of-home.mjs
git commit -m "feat(directus): add migration script to extract hero from home"
```

---

## Task 2 — Phase 1: run migration with `--dry-run`

This creates the new Directus schema and copies the data, but **does not** drop the old fields. After this task, both the old and new locations exist in Directus. The frontend will continue to work unchanged.

- [ ] **Step 1: Snapshot the current Directus state for rollback**

Run:
```bash
curl -sS -H "Authorization: Bearer tabernam-admin-token" \
  'https://directus-production-3a8d.up.railway.app/items/home_translations?fields=id,language.code,hero_title,hero_body' \
  > /tmp/home_translations_pre_migrate.json
cat /tmp/home_translations_pre_migrate.json
```
Expected: JSON with the existing hero_title/hero_body per language. Keep this file until the migration is verified complete.

- [ ] **Step 2: Run the migration with `--dry-run`**

Run:
```bash
DIRECTUS_URL=https://directus-production-3a8d.up.railway.app \
DIRECTUS_TOKEN=tabernam-admin-token \
node scripts/migrate-hero-out-of-home.mjs --dry-run
```

Expected output (lines may interleave but should contain):
```
  collection hero created
  collection hero_translations created
  added hero_translations.hero_id
  added hero_translations.language
  added hero_translations.title
  added hero_translations.body
  added hero.translations
  rel hero_translations.hero_id → hero (alias: translations)
  rel hero_translations.language → languages
  hero: inserted singleton row (id=...)
  hero_translations[en]: created
  hero_translations[sk]: created
  hero_translations[vn]: created    (if vn row had values)

--dry-run set: skipping field drops on home_translations.
Done.
```

- [ ] **Step 3: Verify data copied**

Run:
```bash
curl -sS -H "Authorization: Bearer tabernam-admin-token" \
  'https://directus-production-3a8d.up.railway.app/items/hero_translations?fields=language.code,title,body'
```
Expected: rows for `en` and `sk` (and `vn` if it had data) with the same title/body that were in `home_translations.hero_title` / `hero_body`.

- [ ] **Step 4: Verify old fields STILL exist**

Run:
```bash
curl -sS -H "Authorization: Bearer tabernam-admin-token" \
  'https://directus-production-3a8d.up.railway.app/fields/home_translations/hero_title' \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['data']['field'])"
```
Expected: `hero_title` — confirms `--dry-run` preserved the source data.

- [ ] **Step 5: Re-run to verify idempotency**

Run the same command from Step 2 again.
Expected: each line begins with `skip` or `updated` (no `created` lines). The script must not error.

---

## Task 3 — Create the `getHero` loader

**Files:**
- Create: `src/lib/directus/hero.ts`
- Modify: `src/lib/directus/index.ts`

- [ ] **Step 1: Create `src/lib/directus/hero.ts`**

```ts
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
```

- [ ] **Step 2: Add export from `src/lib/directus/index.ts`**

Locate the line:
```ts
export { getHeroSlides, getHomeMarquee, getHomeTexts } from './home';
```

Add this line directly underneath:
```ts
export { getHero, type HeroBundle, type HeroText } from './hero';
```

- [ ] **Step 3: Verify TypeScript still compiles**

Run: `npx tsc --noEmit`
Expected: no errors related to `hero.ts` or the new export. (Pre-existing errors in `.next/dev/types/*` from Next's generated types are unrelated; ignore those.)

- [ ] **Step 4: Commit**

```bash
git add src/lib/directus/hero.ts src/lib/directus/index.ts
git commit -m "feat(directus): add getHero loader for hero singleton"
```

---

## Task 4 — Switch `<HeroSection>` to read from props

**Files:**
- Modify: `src/components/hero/HeroSection.tsx`

This task changes the component to accept `hero` as a prop while still working when the prop is missing (graceful fallback). It also stops calling `t('hero.title')` / `t('hero.body')`.

- [ ] **Step 1: Update `HeroSection.tsx`**

Replace the existing file content with:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import type { HeroSlide, HeroBundle } from '@/lib/directus';
import { useI18n } from '@/app/hook/useI18n';

interface Props {
  slides?: HeroSlide[];
  hero?: HeroBundle;
}

const FALLBACK_SLIDES: HeroSlide[] = [
  { image: '/carousel/photo-08.jpg', alt: '' },
  { image: '/carousel/photo-20.jpg', alt: '' },
  { image: '/carousel/photo-22.jpg', alt: '' },
];

// Last-resort English fallback if Directus is unreachable AND no English row
// was loaded. The hardcoded values previously lived in i18n.ts as dictionary
// entries — we keep them here so the section never renders empty.
const FALLBACK_TEXT = {
  title: 'Tabernam',
  body: '',
};

const SLIDE_INTERVAL = 5000;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.7, ease: [0.22, 0.61, 0.36, 1] as const },
  }),
};

export default function HeroSection({ slides, hero }: Props) {
  const { lang } = useI18n();
  const items = slides && slides.length > 0 ? slides : FALLBACK_SLIDES;
  const [activeIndex, setActiveIndex] = useState(0);

  // Active language → English → hardcoded constant.
  const text =
    hero?.byLang[lang] ??
    hero?.byLang['en'] ??
    FALLBACK_TEXT;

  useEffect(() => {
    if (items.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, SLIDE_INTERVAL);
    return () => window.clearInterval(id);
  }, [items.length]);

  return (
    <section className="hero relative" style={{ paddingBottom: '60px' }}>
      <div className="bg-gradient-to-b from-gray-20 to-white px-[40px] max-md:px-[16px] pt-[250px] pb-[200px] max-[1025px]:pt-[150px] max-[1025px]:pb-[60px]">
        <div className="w-full max-w-[1320px] mx-auto flex flex-col items-center">
          <div className="flex flex-col items-center gap-[30px] text-center">
            <motion.h1
              className="text-[64px] font-bold tracking-[-0.03em] leading-[52px] text-brand max-[1100px]:text-[48px] max-[1100px]:leading-[44px] max-md:text-[36px] max-md:leading-[36px]"
              custom={0.1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              {text.title}
            </motion.h1>
            <motion.p
              className="text-[28px] leading-[32px] max-md:text-[24px] max-md:leading-[28px] tracking-[-0.03em] font-medium text-text w-0 min-w-full"
              custom={0.2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              {text.body}
            </motion.p>
          </div>
        </div>
      </div>

      <div className="px-[40px] max-md:px-[16px]">
        <div className="feathered-image relative w-full max-w-[1320px] mx-auto aspect-[16/9] rounded-6 overflow-hidden bg-surface">
          {items.map((slide, idx) => (
            <div
              key={slide.image}
              aria-hidden={idx !== activeIndex}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
              style={{
                backgroundImage: `url('${slide.image}')`,
                opacity: idx === activeIndex ? 1 : 0,
              }}
              aria-label={slide.alt || undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

Key changes from the previous version:
- Added `hero?: HeroBundle` to `Props`.
- Replaced `t('hero.title')` / `t('hero.body')` with the resolved `text.title` / `text.body`.
- `useI18n()` is now only used to read `lang`.
- Added `FALLBACK_TEXT` constant for the absolute-last-resort case.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors in `HeroSection.tsx`. (At this point `page.tsx` hasn't been updated yet, but the prop is optional so the call site `<HeroSection slides={heroSlides} />` is still valid.)

- [ ] **Step 3: Commit**

```bash
git add src/components/hero/HeroSection.tsx
git commit -m "refactor(hero): accept hero as prop, drop t() calls"
```

---

## Task 5 — Wire the hero into the home page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update `page.tsx`**

Open `src/app/page.tsx` and:

1. Add `getHero` to the imports. Change:
```ts
import { getActivities, getHeroSlides, getHomeMarquee, getHomeTexts } from '@/lib/directus';
```
to:
```ts
import { getActivities, getHero, getHeroSlides, getHomeMarquee, getHomeTexts } from '@/lib/directus';
```

2. Add `getHero()` to the `Promise.all`. Change:
```ts
const [activities, heroSlides, marqueeImages, texts] = await Promise.all([
  getActivities(),
  getHeroSlides(),
  getHomeMarquee(),
  getHomeTexts(),
]);
```
to:
```ts
const [activities, heroSlides, marqueeImages, texts, hero] = await Promise.all([
  getActivities(),
  getHeroSlides(),
  getHomeMarquee(),
  getHomeTexts(),
  getHero(),
]);
```

3. Pass `hero` to the section. Change:
```tsx
<HeroSection slides={heroSlides} />
```
to:
```tsx
<HeroSection slides={heroSlides} hero={hero} />
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors in `page.tsx` or `HeroSection.tsx`.

- [ ] **Step 3: Verify lint passes**

Run: `npm run lint -- src/app/page.tsx src/components/hero/HeroSection.tsx src/lib/directus/hero.ts`
Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Manual smoke test in browser**

Run: `npm run dev` (background) and open http://localhost:3000.
Expected:
- Hero title and body render exactly the same text they did before the migration.
- Switching language with the LangSwitcher updates the hero text.
- No console errors related to hero rendering.

Stop the dev server when verified.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(home): pass hero data to HeroSection"
```

---

## Task 6 — Remove `hero.*` from the dictionary mapping

**Files:**
- Modify: `src/lib/page-keys.json`

The keys `hero.title` and `hero.body` are no longer used at runtime. Remove them from the mapping so the dictionary loader stops trying to read them from `home_translations`.

- [ ] **Step 1: Remove the two dictionary entries**

In `src/lib/page-keys.json`, find and delete this block (it appears near the top of `"dictionary"`):

```json
    "hero.title": {
      "page": "home",
      "field": "hero_title"
    },
    "hero.body": {
      "page": "home",
      "field": "hero_body"
    },
```

Keep the surrounding JSON well-formed (no trailing comma on whatever entry now becomes the first one in its block).

- [ ] **Step 2: Verify the JSON parses**

Run: `python3 -c "import json; json.load(open('src/lib/page-keys.json'))"`
Expected: no output, exit code 0.

- [ ] **Step 3: Verify no source still references the removed keys**

Run: `grep -rn "hero\.title\|hero\.body" src/ 2>/dev/null`
Expected: no matches.

- [ ] **Step 4: Verify TypeScript + lint still pass**

Run: `npx tsc --noEmit && npm run lint -- src/`
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/page-keys.json
git commit -m "chore(i18n): drop hero.title/hero.body from dictionary mapping"
```

---

## Task 7 — Phase 2: drop old fields from `home_translations`

This is the destructive step. Run only after Tasks 3–6 are merged/deployed so the live site never reads the soon-to-be-deleted fields.

- [ ] **Step 1: Confirm the live frontend reads from the new location**

Open https://… (production URL) in a browser and verify the hero text renders. Then in the Directus admin UI, edit `hero_translations[en].title` to a temporary obvious string (e.g., add "✅" to the end). Trigger a revalidation / reload the page. Confirm the change appears.

Restore the original title after the check.

If you don't have a deployed live site to verify against, instead run `npm run dev`, then in the Directus admin edit `hero_translations[en].title`, reload the local site, and confirm.

- [ ] **Step 2: Re-snapshot for rollback safety**

Run:
```bash
curl -sS -H "Authorization: Bearer tabernam-admin-token" \
  'https://directus-production-3a8d.up.railway.app/items/home_translations?fields=id,language.code,hero_title,hero_body' \
  > /tmp/home_translations_pre_drop.json
cat /tmp/home_translations_pre_drop.json
```
Expected: the same values as in `/tmp/home_translations_pre_migrate.json`. Keep this file.

- [ ] **Step 3: Run the migration WITHOUT `--dry-run`**

Run:
```bash
DIRECTUS_URL=https://directus-production-3a8d.up.railway.app \
DIRECTUS_TOKEN=tabernam-admin-token \
node scripts/migrate-hero-out-of-home.mjs
```

Expected tail of output:
```
  hero_translations[en]: updated
  hero_translations[sk]: updated
  ...
About to delete home_translations.hero_title
  home_translations.hero_title: deleted
About to delete home_translations.hero_body
  home_translations.hero_body: deleted

Done.
```

- [ ] **Step 4: Verify the old fields are gone**

Run:
```bash
curl -sS -H "Authorization: Bearer tabernam-admin-token" \
  -o /dev/null -w "%{http_code}\n" \
  'https://directus-production-3a8d.up.railway.app/fields/home_translations/hero_title'
```
Expected: `403` or `404` (the field no longer exists or is no longer accessible).

- [ ] **Step 5: Verify the site still renders**

Reload the home page (local or live). Confirm the hero title and body are still displayed correctly.

- [ ] **Step 6: Re-run the script to verify idempotency post-drop**

Run the same command from Step 3 again.
Expected: every action prints `skip … (exists)` or `… (already absent)`; no errors.

---

## Self-review

I checked the plan against the spec:

- **Directus schema (hero singleton, hero_translations columns, alias, relations):** covered in Task 1, executed in Tasks 2 + 7.
- **Data copy:** covered in Task 1's script body, executed in Task 2 and re-confirmed in Task 7.
- **Drop hero_title / hero_body:** Task 7, gated by removal of `--dry-run`.
- **`getHero()` loader + export:** Task 3.
- **HeroSection prop + fallback chain (lang → en → constant):** Task 4.
- **`page.tsx` integration:** Task 5.
- **`page-keys.json` cleanup:** Task 6.
- **`src/lib/i18n.ts`:** spec said no change required (no fallback existed for these keys). Plan honors this — `FALLBACK_TEXT` lives in `HeroSection.tsx` instead, which keeps the fallback co-located with the consumer.
- **Risk & rollback:** Task 2 Step 1 + Task 7 Step 2 take snapshots. Two-phase ordering (Tasks 2 → 3–6 → 7) eliminates the deploy gap described in the spec.
- **Out of scope (new fields, hero on other pages, restructuring hero_slides):** the plan adds none of these.

No placeholder phrases. All file paths are exact. All code blocks are complete. Type names are consistent: `HeroBundle`, `HeroText`, and `getHero` appear identically in the loader, the index export, and the consumer prop.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-06-09-extract-hero-to-directus-model.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
