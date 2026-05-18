# Directus Collections Schema

Create these collections in your Directus instance at `http://localhost:8055`.

## 1. `businesses`

Globe city/office entries shown in the Activity section.

| Field         | Type    | Notes                                      |
|---------------|---------|--------------------------------------------|
| `id`          | integer | Auto-increment (primary key)               |
| `slug`        | string  | Unique identifier (e.g. `beijing-cbd`)     |
| `name`        | string  | Display name (e.g. `Business`)             |
| `label`       | string  | City name (e.g. `Beijing`)                 |
| `lat`         | float   | Latitude                                   |
| `lng`         | float   | Longitude                                  |
| `altitude`    | float   | Globe camera altitude (default `1.55`)     |
| `dot_x`       | float   | SVG dot X position                         |
| `dot_y`       | float   | SVG dot Y position                         |
| `focus_x`     | float   | Focus offset X (default `0`)               |
| `focus_y`     | float   | Focus offset Y (default `0`)               |
| `focus_scale`  | float   | Focus scale (default `1.2`)                |
| `image`       | string  | Image URL for the detail card              |
| `title`       | string  | Card title                                 |
| `body`        | text    | Card body text                             |
| `sort`        | integer | Sort order                                 |

## 2. `hero_slides`

Images for the hero carousel on the home page.

| Field   | Type    | Notes                          |
|---------|---------|--------------------------------|
| `id`    | integer | Auto-increment (primary key)   |
| `image` | string  | Image URL                      |
| `alt`   | string  | Alt text                       |
| `sort`  | integer | Sort order                     |

## 3. `page_texts`

Per-page text content. Each row is a section of text on a page.

| Field     | Type    | Notes                                          |
|-----------|---------|-------------------------------------------------|
| `id`      | integer | Auto-increment (primary key)                   |
| `page`    | string  | Page identifier: `home`, `about`, `business`, `contact` |
| `section` | string  | Section key (see below)                        |
| `content` | text    | The text content                               |

### Section keys by page

**home:**
- `hero_title` — Hero heading
- `hero_body` — Hero paragraph
- `quote_en` — English quote text
- `quote_zh` — Chinese quote text

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

UI translation strings (buttons, nav items, labels).

| Field | Type    | Notes                                    |
|-------|---------|------------------------------------------|
| `id`  | integer | Auto-increment (primary key)             |
| `key` | string  | Translation key (e.g. `nav.contact`)     |
| `en`  | string  | English value                            |
| `sk`  | string  | Slovak value                             |

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
