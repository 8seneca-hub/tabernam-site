# CMS guide — Tabernam site

A practical, task-oriented guide to editing site content through Directus. For
the underlying schema (column types, FKs, etc.) see `DIRECTUS_SCHEMA.md`.

## Where the CMS lives

| Environment | URL | Notes |
|---|---|---|
| Local | http://localhost:8055/admin | Started via `docker compose up -d`. Data lives in `src/database/data.db` (SQLite). |
| Production | https://directus-production-3a8d.up.railway.app/admin | Railway-hosted. |

**Admin login** (both): `[EMAIL_ADDRESS]` / `tabernam-admin`.

Edits in **production** are live on the deployed site as soon as the page is
re-rendered (server components fetch with `cache: 'no-store'`, so changes
appear on the next request — no rebuild needed).

## How content is structured

Every page on the site reads from a small set of Directus collections. Two
patterns repeat:

1. **Singletons + translations.** A page's language-agnostic data (images,
   slugs) lives on a singleton row (`home`, `about`, `contact`, `cv`, `nav`,
   `footer`); the translatable text lives on a sibling table with one row per
   language (`home_translations`, etc.).
2. **Standalone collections.** Repeating data has its own collection
   (`activities`, `hero_slides`, `home_marquee`, `travel_route_map`).

When you edit a translation row, pick the right language tab inside the
Directus item editor (the row's `language` field is `en` or `sk`).

## Home page (`/`)

| Section on the site | Where to edit |
|---|---|
| Hero heading + body text | **Home → Translations**: `hero_title`, `hero_body` |
| Hero background slideshow | **Hero Slides** — list of images with sort order |
| Quote section image | **Home → Translations** (en row): `quote_image` |
| 3-row marquee | **Home Marquee** — one row per image, pick which track (1/2/3) and order |
| Globe intro heading/body/CTA | **Home → Translations**: `globe_intro_heading`, `globe_intro_body`, `globe_intro_cta` |
| Globe panel buttons & toasts | **Home → Translations**: `panel_goToLocation`, `btn_exploreNow`, `globe_hint_*`, `globe_zoom_*` |
| Region tabs (World/Europe/Asia/…) | **Home → Translations**: `region_world`, `region_europe`, `region_asia`, `region_africa`, `region_americas`, `region_oceania` |
| Cities on the globe | **Activities** (see below) |

## About page (`/about`)

| Section | Where to edit |
|---|---|
| Eyebrow + heading + name | **About → Translations**: `about_eyebrow`, `hero_name` (the big heading text comes from the `heading.aboutMe` dictionary entry — see *Site-wide labels*) |
| Portrait photo | **About** singleton: `portrait_image` |
| Body paragraphs (the long bio) | **About → Translations**: `about_paragraph_body` — one big text field; blank lines separate paragraphs; tokens like `[name](url)` become links, `..BUTTON..` becomes the inline CV button |
| Three inline body images | **About** singleton: `body_image_1`, `body_image_2`, `body_image_3` |
| Experience video block | **About → Translations**: `experience_video_url`, `experience_video_title`, `experience_eyebrow`, `experience_title`, `experience_body` |
| Philanthropy story videos | **About → Translations**: `philanthropy_story_1_title`, `philanthropy_story_1_video_url`, `philanthropy_story_2_title`, `philanthropy_story_2_video_url` |
| **Travel Routes** heading/body | **About → Translations**: `travel_routes_heading`, `travel_routes_body` |
| **Travel Routes** tab labels | **About → Translations**: `travel_routes_china_name`, `travel_routes_america_name`, `travel_routes_europe_name` |
| **Travel Routes** map images | **Travel Route Map** — one row per slug (`china`, `america`, `europe`); upload to the `image` field |
| Closing quote | **About → Translations**: `closing_quote`, `closing_quote_author` |
| Closing CTA button text | **About → Translations**: `closing_cta` (links to /contact) |
| Closing background image | **About** singleton: `closing_background` |

## Contact page (`/contact`)

| Section | Where to edit |
|---|---|
| Heading + subheading | **Contact → Translations**: `heading_title`, `subheading` |
| Address / phone / email / WeChat values | **Contact** singleton (language-agnostic fields directly on the row): `address`, `phone`, `work_email`, `wechat`, `website_url`, etc. Newline-separated for multi-line address |
| Field labels ("Address", "Phone", …) | **Contact → Translations**: `contact_addressLabel`, `contact_phoneLabel`, `contact_emailLabel`, `contact_wechatLabel`, `contact_websiteLabel`, `contact_phoneLabel` |
| Map images | **Contact** singleton: `maps` (M2M to files) |

## CV page (`/cv`)

CV is heavy on repeatable items. Each (education, experience, China activity,
language, skill) entry is a numbered set of fields on `cv_translations`:

- Education: `edu_0_title/org/date` … `edu_5_*` (6 slots)
- Experience: `exp_0_title/org/date/desc` … `exp_8_*` (9 slots)
- China activities: `china_0_text/years` … `china_8_*` (9 slots)
- Languages: `lang_0_name/descriptor` … `lang_4_*` (5 slots)
- Skills: `skill_0` … `skill_4` (5 slots)

Leave a slot's fields blank to hide it from the rendered list.

Section headings, the CV-request modal, and call-to-action text are also on
`cv_translations` (`section_*`, `cta_view_full`, `modal_*`, etc.).

## Site-wide labels

Navigation labels (`nav.contact`, `nav.about`, …) live on `nav_translations`.
Footer labels live on `footer_translations`. The "About me" / "Contact"
section headings used across the site live there too (`heading_aboutMe`,
`heading_contact` on about/contact translations respectively).

These are loaded into a single dictionary at runtime — you change a value
once per language and it updates everywhere.

## Activities (cities on the globe + /activities pages)

Each city has its own item with:

- **Coordinates** — `lat`, `lng`, `altitude` (smaller altitude = camera closer)
- **Slug** — used in the URL (`/activities?id=beijing`)
- **Translations** (one row per language): `name` (city label), `business`
  (office title), `description` (card body)
- **Photos** — M2M to files; the first photo is used as the marker thumb,
  the rest as a slideshow

Drag to reorder via the `sort` column.

## Hero Slides

The fading background images at the top of `/`. Each row: an image, optional
alt text, sort order. Add more rows to lengthen the carousel.

## Home Marquee

The three scrolling image strips on the home page. Each row has:

- `image` — the picture
- `alt` — accessibility text (can be empty for decorative imagery)
- `row` — which track to put it on: **Row 1** scrolls right, **Row 2**
  scrolls left, **Row 3** scrolls right
- `sort` — order within the row

## Travel Route Map

Three rows pre-seeded with slugs `china`, `america`, `europe`. Upload an
image to each `image` field; the matching tab label comes from About →
Translations (`travel_routes_<slug>_name`).

If you want a different set of tabs (e.g. add "Asia"), seeding a new slug
isn't enough — the frontend currently hardcodes the three slugs. Tell me
and I'll wire it up properly.

## Site Settings

`Settings` singleton controls global appearance:

- Colors: `color_brand`, `color_text`, `color_bg`, `color_button`,
  `color_button_hover`, `color_header`, `color_border`, `color_footer_bg`
- Typography: `font_family`
- Branding: `logo_image`, `logo_text`
- Layout: `max_width`, `side_padding`, `header_height`

Changing any of these is page-wide and applies immediately.

## Languages

The `languages` collection drives the language switcher. Each row:

- `code` — language code (`en`, `sk`, …) — matches the `language` FK on the
  `*_translations` tables
- `name` — display name
- `flag` — flag emoji
- `is_default` — which language is the user's default before they switch
- `sort` — order in the switcher

**Adding a new language:** add a row here, then add a matching translation
row to *each* `*_translations` table you want covered. The frontend falls
back to English for any missing fields, so partial coverage is OK.

## Common workflows

### Change the hero title

1. Open **Home → Translations**
2. Click the `en` row, edit `hero_title`, save
3. Repeat for the `sk` row
4. Reload the home page — the new title is live

### Swap a hero slide

1. Open **Hero Slides**
2. Edit a row, click the `image` field, **Upload** the new file, save
3. Old slide entry can be deleted if no longer used

### Add a new city to the globe

1. Open **Activities**
2. Click **Create Item**
3. Fill `slug`, `lat`, `lng`, `altitude` (~`1.7` is a good default)
4. In **Translations**, add an `en` row and an `sk` row with the city's
   `name`, `business`, `description`
5. Add photos via the **Photos** field (first photo becomes the marker thumb)
6. Save — the pin appears on the globe on next page load

### Add a new image to the home marquee

1. Open **Home Marquee** → **Create Item**
2. Upload the image, pick a row (1/2/3), set sort order, save

### Update the About bio

1. Open **About → Translations**
2. Edit `about_paragraph_body` on the language's row — blank lines separate
   paragraphs; use `[link text](https://url)` for links and `..BUTTON..` to
   inline the CV-request button

### Add an image to a Travel Route Map tab

1. Open **Travel Route Map**
2. Click the `china` / `america` / `europe` row
3. Upload an image to the `image` field, save

### Change theme colors

1. Open **Site Settings**
2. Edit the relevant `color_*` field (use a hex like `#0a1d3a`), save

## Caveats

- **Deleting a field column is irreversible.** All values in that column are
  dropped permanently across every translation row.
- **Removing a row** in a `*_translations` table for a given language makes
  the site fall back to English for that row's fields. Re-adding requires
  filling in the values again.
- **Image URLs** must be uploaded through Directus or be absolute (`https://…`)
  or root-relative (`/file.jpg` served from `public/`). Bare filenames don't
  work.
- **Don't delete `id`, `sort`, `language`, or FK columns** like
  `home_id`, `activities_id`. These are structural.
- **`cache: 'no-store'`** means there's no CDN cache to bust — changes go
  live on the next page request. Hard-refresh in case the browser cached
  the page itself.

## Adding a new field

If you find yourself needing a new editable string or image:

1. Tell Claude what you need ("add a 'sub-tagline' field under hero on the
   home page")
2. I'll write an idempotent migration script under `scripts/`, apply it to
   local and (with your approval) production, register the field in
   `src/lib/page-keys.json`, and update the matching component.

Don't add fields by hand in the Directus UI — keep the schema in version
control via migration scripts so local and production stay in sync.
