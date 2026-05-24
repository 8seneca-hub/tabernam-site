# Directus Collections Schema

Create these collections in your Directus instance at `http://localhost:8055`.

## 1. `activities` (+ `activities_translations`, `activities_files`)

City/office pins shown on the globe. Each city owns its own photo set and has
one row per language in the translations table.

### `activities`

| Field      | Type    | Notes                                            |
|------------|---------|--------------------------------------------------|
| `id`       | integer | Auto-increment (primary key)                     |
| `sort`     | integer | Sort order                                       |
| `slug`     | string  | Unique identifier (e.g. `beijing`, `hong-kong`)  |
| `lat`      | float   | Latitude                                         |
| `lng`      | float   | Longitude                                        |
| `altitude` | float   | Camera altitude when focused (smaller = closer; default `1.7`) |

Two alias fields are exposed in the UI:
- `translations` — O2M into `activities_translations`
- `photos` — M2M into `directus_files` via `activities_files`

### `activities_translations`

One row per (activity × language).

| Field           | Type    | Notes                                  |
|-----------------|---------|----------------------------------------|
| `id`            | integer | Auto-increment (primary key)           |
| `activities_id` | integer | FK → `activities.id` (cascade delete)  |
| `language`      | string  | Language code (`en`, `sk`, `zh`, …)    |
| `name`          | string  | City / region label (e.g. `Beijing`)   |
| `business`      | string  | Office title shown big in the panel    |
| `description`   | text    | Card body paragraph                    |

### `activities_files` (junction)

| Field               | Type    | Notes                                    |
|---------------------|---------|------------------------------------------|
| `id`                | integer | Auto-increment (primary key)             |
| `activities_id`     | integer | FK → `activities.id` (cascade delete)    |
| `directus_files_id` | uuid    | FK → `directus_files.id`                 |
| `sort`              | integer | Order within the city's photo carousel   |

## 2. `hero_slides`

Images for the hero carousel on the home page.

| Field   | Type    | Notes                          |
|---------|---------|--------------------------------|
| `id`    | integer | Auto-increment (primary key)   |
| `image` | string  | Image URL                      |
| `alt`   | string  | Alt text                       |
| `sort`  | integer | Sort order                     |

## 3. `page_texts`

Per-page text content. One row per (page × section × language).

| Field     | Type    | Notes                                          |
|-----------|---------|-------------------------------------------------|
| `id`      | integer | Auto-increment (primary key)                   |
| `page`    | string  | Page identifier: `home`, `about`, `activity`, `contact`, … |
| `section` | string  | Section key (see below)                        |
| `lang`    | string  | Language code (`en`, `sk`, …). Default `en`.    |
| `content` | text    | The text/asset content                         |

**Language fallback:** The fetcher returns all languages bundled; the client
picks the active language and falls back to `en` for sections that have no
translation yet. That means **asset rows** (file UUIDs, video URLs, email,
phone, proper names) only need a single `en` row — they're shared across all
languages automatically.

### Section keys by page

**home:**
- _(none — all HomePage text lives in `i18n_strings` so it translates via the language switcher; see the section below for the key list.)_

**about:**
- `about_body` — About page intro paragraph
- `portrait_image` — Portrait image URL (optional)

**business:**
- `business_title` — Article heading
- `business_body_1` — First paragraph
- `business_body_2` — Second paragraph
- `business_body_3` — Third paragraph
- `hero_image_1` — Top hero image URL (optional)
- `hero_image_2` — Inline hero image URL (optional)

**contact:**
- `contact_body` — Contact intro paragraph

## 4. `contact_addresses`

Address cards on the contact page.

| Field            | Type    | Notes                          |
|------------------|---------|--------------------------------|
| `id`             | integer | Auto-increment (primary key)   |
| `title_en`       | string  | English title (e.g. `Address 1`) |
| `title_sk`       | string  | Slovak title (e.g. `Adresa 1`)   |
| `lines`          | text    | Address lines, separated by newlines |
| `portrait_index` | integer | Which portrait image to show (1, 2, or 3) |
| `sort`           | integer | Sort order                     |

## 5. `i18n_strings`

UI + per-page translation strings. One row per (key × language) — adding a
new language is just inserting more rows, no schema change.

| Field   | Type    | Notes                                            |
|---------|---------|--------------------------------------------------|
| `id`    | integer | Auto-increment (primary key)                     |
| `key`   | string  | Translation key (e.g. `nav.contact`, `hero.title`) |
| `lang`  | string  | Language code (`en`, `sk`, `zh`, …)              |
| `value` | text    | Translated string                                |

### HomePage keys

| Key                  | Where it appears                                    |
|----------------------|-----------------------------------------------------|
| `hero.title`         | Hero heading (main portion)                         |
| `hero.titleAccent`   | Hero heading (trailing accent-coloured portion)     |
| `hero.body`          | Hero paragraph                                      |
| `quote.primary`      | Top line of the QuoteSection                        |
| `quote.secondary`    | Bottom line of the QuoteSection (Chinese by default)|
| `globeIntro.heading` | Heading shown over the globe before the panel opens |
| `globeIntro.body`    | Paragraph shown over the globe before opening       |
| `panel.viewDetails`  | "View Details" button inside the city detail panel  |
| `aria.close`         | aria-label for the close (×) button on the panel    |

### Keys to populate

See `src/lib/i18n.ts` for the full list. Key examples:
- `nav.contact`, `nav.about`, `nav.activity`, `nav.home`
- `btn.getStarted`, `btn.viewCities`, `btn.goBack`, `btn.learnMore`, `btn.viewCV`
- `heading.aboutMe`, `heading.contact`
- `footer.navigation`, `footer.contact`, `footer.copyright`
- `contact.address1`, `contact.address2`, `contact.address3`

## 6. `site_settings` (Singleton)

Create this as a **singleton** collection in Directus (toggle "Treat as single object" when creating). Controls the site theme, colors, and branding.

| Field               | Type   | Notes                                        |
|---------------------|--------|----------------------------------------------|
| `id`                | integer| Primary key                                  |
| `color_bg`          | string | Page background color (default: `#ffffff`)   |
| `color_text`        | string | Main text color (default: `#2e2e2e`)         |
| `color_muted`       | string | Muted/secondary text (default: `#646464`)    |
| `color_surface`     | string | Surface/card color (default: `#c7c7c7`)      |
| `color_button`      | string | Button background (default: `#e8e8e8`)       |
| `color_button_text`  | string | Button text color (default: `#000000`)       |
| `color_button_hover` | string | Button hover background (default: `#d9d9d9`) |
| `color_header`      | string | Header background (default: `#ffffff`)       |
| `color_border`      | string | Border color (default: `#c7c7c7`)            |
| `color_footer_bg`   | string | Footer background (default: `#f6f6f6`)       |
| `font_family`       | string | Custom font override (optional)              |
| `logo_text`         | string | Logo text in header/footer (default: `Tabernam`) |
| `max_width`         | string | Max content width (default: `1512px`)        |
| `side_padding`      | string | Side padding (default: `40px`)               |
| `header_height`     | string | Header height (default: `60px`)              |

All fields are optional — leave blank to use defaults.

## Setup

1. Create the collections above in Directus Admin
2. Generate a static token: Settings → Users → your user → Token
3. Set the token in `.env.local`:
   ```
   DIRECTUS_URL=http://localhost:8055
   DIRECTUS_TOKEN=your-token-here
   ```
4. Set read permissions on all 5 collections for the token's role
5. Run `npm run dev` — pages will fetch from Directus, falling back to hardcoded data on failure
