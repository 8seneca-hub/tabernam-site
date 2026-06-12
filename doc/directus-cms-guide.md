# Tabernam — Directus CMS User Guide

This guide explains how to edit every part of the Tabernam website through the
Directus admin panel. It is written for the content owner — no coding required.

Everything on the live site (text, images, videos, colors, translations) is
stored in Directus collections. When you save in Directus, the site picks up
the change on the next page load. If something is missing or Directus is
unreachable, the site falls back to its built-in defaults so it never breaks.

---

## Table of contents

1. [Accessing Directus](#1-accessing-directus)
2. [Understanding the structure](#2-understanding-the-structure)
3. [Uploading images and videos](#3-uploading-images-and-videos)
4. [Translations & languages](#4-translations--languages)
5. [Home page](#5-home-page)
6. [About page](#6-about-page)
7. [Activities page (globe)](#7-activities-page-globe)
8. [Contact page](#8-contact-page)
9. [CV page](#9-cv-page)
10. [Header & footer (site-wide)](#10-header--footer-site-wide)
11. [Site settings (theme, colors, logo)](#11-site-settings-theme-colors-logo)
12. [Common tasks (cheat-sheet)](#12-common-tasks-cheat-sheet)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Accessing Directus

**Local URL:** `http://localhost:8055`
**Admin email:** the address configured in `docker-compose.yml` (`ADMIN_EMAIL`)
**Admin password:** the value of `ADMIN_PASSWORD` (default in dev: `tabernam-admin`)

After login you'll see the left sidebar. The two icons you'll use most:

- **Content** (box icon) — every collection (Hero, Quote, About header, etc.).
- **File Library** (folder icon) — all uploaded images and videos.

Most page sections are stored as **singletons** (one row per collection — e.g.
`Hero`, `About header`). A few are **regular collections** with many rows
(e.g. `Activities`, `Home marquee`, `Languages`).

---

## 2. Understanding the structure

Each visible part of the website maps to one Directus collection. Inside each
collection you'll typically see three kinds of content:

| Type            | Purpose                                                   |
|-----------------|-----------------------------------------------------------|
| **Text fields**  | Headings, paragraphs, button labels, captions             |
| **Asset fields** | Images, videos, logo (linked to the File Library)         |
| **Translations** | Same text in another language (`en`, `sk`, `zh`, …)       |

For most singletons, English content lives directly on the singleton, and other
languages live in a child `..._translations` block under the row. The site
falls back to English if a translation is missing — so you can add a new
language one section at a time.

---

## 3. Uploading images and videos

### Upload an image

1. Open the collection that should hold the image (e.g. `Hero` for hero slides).
2. Click the image / file field. A picker opens.
3. Click **Upload File** and either drag-and-drop or browse.
4. After upload, the image is selected automatically. Click **Save** at the
   top-right.

You can also upload directly into the **File Library** first (left sidebar →
File Library → "+"). The file becomes available everywhere afterwards.

### Image guidelines

- **Hero / large banners:** at least 1920 × 1080 px, JPG or WebP, under 1 MB if
  possible.
- **Portraits / cards:** square or 4:5 aspect, ~1000 × 1000 px, JPG.
- **Marquee thumbnails:** ~600 × 400 px is enough — they're displayed small.
- **Maps (Travel routes):** PNG with transparent background works best.
- **Alt text:** every image field that has a sibling `alt` field — fill it in
  for accessibility.

### Upload a video

Two options exist; pick whichever fits.

**Option A — Upload the file (recommended for short clips up to ~50 MB):**
1. Open the relevant collection (e.g. `About body` → Videos block).
2. In the video row, click the **File** field and upload a `.mp4`.
3. Leave the `url` field empty — the file takes priority.
4. Save. The site auto-detects file changes and busts the browser cache for
   you.

**Option B — Link to an external URL (YouTube/Vimeo direct file, CDN, etc.):**
1. Leave the **File** field empty.
2. Paste the direct URL into the `url` field (must end in `.mp4`, `.webm`, or
   be a hosted streaming URL the browser can play).
3. Save.

> The frontend prefers the uploaded file if both are present.

### Replacing an existing image/video

Click the existing thumbnail, then **Replace** in the picker. The URL stays
the same, so all pages referencing it update automatically.

---

## 4. Translations & languages

### How language works

- The site reads the **active language** from the URL / language switcher.
- Each translatable section has a `translations` block — one row per language.
- If the active language has no row for a section, the site falls back to
  English (`en`). If English is also missing, the site shows its built-in
  fallback string.

### Adding a new translation to an existing section

Example: adding Slovak (`sk`) to the Hero title.

1. Open `Content → Hero`.
2. Scroll to **Translations**.
3. Click **Create New** in the translations table.
4. Pick `sk` from the language dropdown.
5. Fill in the translated fields (title, body, etc.).
6. Click **Save**.

### Adding a new language to the whole site

1. Open `Content → Languages`.
2. Click **Create Item**.
3. Fill in:
   - `code` — ISO code (`fr`, `de`, `vi`, …)
   - `name` — display name (`Français`, `Deutsch`, `Tiếng Việt`)
   - `flag` — optional flag URL or emoji
   - `is_default` — leave `false` unless you want it to be the default
   - `sort` — order in the switcher
4. Save. The language appears in the site language switcher.
5. Go through each section's translations and add a row for the new code.
   Anything you skip falls back to English — you can fill it in gradually.

---

## 5. Home page

URL: `/`

The home page is composed of five sections, top to bottom:

```
1. Hero            ← Hero singleton
2. Quote           ← Quote singleton
3. Home About      ← Home About singleton
4. Marquee strip   ← Home Marquee collection
5. Globe + cities  ← Globe singleton + Activities collection
```

### 5.1 Hero section

**Where:** `Content → Hero` (singleton)

| Field                  | Translatable | Purpose                             |
|------------------------|--------------|-------------------------------------|
| `title`                | yes          | Main hero headline                  |
| `body`                 | yes          | Hero sub-paragraph                  |
| `slides` (related)     | no           | Image carousel at the bottom        |

**To change the slideshow:**
1. Open `Hero`.
2. Scroll to **Slides**.
3. Click **Create New** → upload the image into `image` and write the `alt`.
4. Reorder by drag-and-drop in the slides table.

### 5.2 Quote section

**Where:** `Content → Quote` (singleton)

| Field                | Translatable | Purpose                                       |
|----------------------|--------------|-----------------------------------------------|
| `title_accent`       | yes          | Coloured leading part of the heading          |
| `title_rest`         | yes          | Rest of the heading (after the accent)        |
| `primary`            | yes          | Main quote paragraph                          |
| `motto_translation`  | yes          | Translation of the Latin motto                |
| `motto_latin`        | no           | The Latin motto itself (shared all languages) |
| `motto_author`       | no           | Author shown under the motto                  |
| `image`              | no           | Portrait image displayed on the right         |

### 5.3 Home about section

**Where:** `Content → Home About` (singleton)

| Field                  | Translatable | Purpose                              |
|------------------------|--------------|--------------------------------------|
| `eyebrow`              | yes          | Small label above the heading        |
| `heading`              | yes          | Section heading                      |
| `body_1`               | yes          | First paragraph                      |
| `body_2`               | yes          | Second paragraph                     |
| `btn_get_to_know_more` | yes          | CTA button label                     |

### 5.4 Marquee (image strip)

**Where:** `Content → Home Marquee` (collection — many rows)

| Field   | Purpose                                                  |
|---------|----------------------------------------------------------|
| `image` | Image asset                                              |
| `alt`   | Alt text                                                 |
| `row`   | Which scrolling row (1, 2, or 3)                         |
| `sort`  | Order within that row                                    |

To add more images, click **Create Item** for each one and pick a row.

### 5.5 Globe overlay text

**Where:** `Content → Globe` (singleton)

This singleton stores all the on-screen text shown over the interactive globe
(hints, region labels, the "Explore now" button, etc.). 16 fields total, all
translatable. Common ones:

| Field                  | Where it appears                                  |
|------------------------|---------------------------------------------------|
| `intro_heading`        | Heading before any city is clicked                |
| `intro_body`           | Paragraph below the intro heading                 |
| `intro_cta`            | "Explore now" call-to-action                      |
| `hint_drag`            | "Drag to rotate" hint                             |
| `hint_zoom`            | "Scroll to zoom" hint                             |
| `hint_click_city`      | "Click a city" hint                               |
| `zoom_max_toast`       | Toast when user reaches max zoom                  |
| `zoom_min_toast`       | Toast when user reaches min zoom                  |
| `region_world` … `region_oceania` | Region filter buttons                  |
| `panel_go_to_location` | Button inside the city panel                      |
| `btn_explore_now`      | Bottom CTA button                                 |

The cities themselves are managed in the **Activities** collection — see
§ 7 below.

---

## 6. About page

URL: `/about`

```
1. About header (hero + portrait + intro)        ← About Header singleton
2. About body (paragraphs + images + videos)     ← About Body singleton
3. Travel routes (regional maps)                 ← Travel Routes singleton
4. Closing quote (full-width banner)             ← Closing Quote singleton
```

### 6.1 About header

**Where:** `Content → About Header` (singleton)

| Field               | Translatable | Purpose                                  |
|---------------------|--------------|------------------------------------------|
| `title`             | yes          | Small eyebrow above the heading          |
| `heading`           | yes          | Big page heading ("About me")            |
| `name`              | yes          | Subheading (your name)                   |
| `body`              | yes          | Intro paragraph                          |
| `cv_button_label`   | yes          | "View my CV" button text                 |
| `motto_translation` | yes          | Translated motto                         |
| `motto_latin`       | no           | Latin motto                              |
| `motto_author`      | no           | Motto author                             |
| `image`             | no           | Portrait shown beside the hero text      |

### 6.2 About body

**Where:** `Content → About Body` (singleton)

The body is built from numbered "paragraph slots". Each slot can have a text
paragraph **and / or** images **and / or** videos attached to it. Slot order
on screen = numeric order.

**Text paragraphs (per language)**

In the singleton's translations, you'll see fields named
`paragraph_1`, `paragraph_2`, `paragraph_3`, … Fill in whichever you need
in whichever languages you need. Empty fields are skipped.

> Want a new paragraph 7? An admin needs to add `paragraph_7` to the
> `about_body_translations` collection schema first. After that, the site
> picks it up automatically.

**Attaching an image to a paragraph**

1. Scroll to the **Images** block on the singleton.
2. **Create New**:
   - `paragraph_number` — the slot the image belongs to (1, 2, …)
   - `sort` — order within that slot (multiple images per slot allowed)
   - `image` — upload the file

**Attaching a video to a paragraph**

1. Scroll to the **Videos** block.
2. **Create New**:
   - `paragraph_number` — slot number
   - `sort` — order
3. Open the video row, scroll to **Translations**, and add one per language:
   - `title` — caption shown with the video
   - `file` — upload the `.mp4` (preferred), OR
   - `url` — external URL fallback
4. Save.

**Travel routes anchor:** the Travel Routes section is inserted between
paragraphs 6 and 7. So if you have content in slots 1–6, Travel Routes appears
after them; otherwise it falls to the bottom.

### 6.3 Travel routes

**Where:** `Content → Travel Routes` (singleton)

| Field           | Translatable | Purpose                                  |
|-----------------|--------------|------------------------------------------|
| `heading`       | yes          | Section heading                          |
| `body`          | yes          | Intro paragraph                          |
| `maps` (rel.)   | mixed        | Region maps (see below)                  |

**Adding a region map:**

1. Open Travel Routes → Maps → **Create New**.
2. Fill in:
   - `slug` — internal id (`europe`, `asia`, …)
   - `sort` — display order
   - `image` — upload the map graphic (PNG with transparency works best)
3. Open the new map row → **Translations** → add one row per language with
   the localised `name` (e.g. "Europe", "Európa", "欧洲").
4. Save.

### 6.4 Closing quote

**Where:** `Content → Closing Quote` (singleton)

| Field               | Translatable | Purpose                              |
|---------------------|--------------|--------------------------------------|
| `quote`             | yes          | Long quote text                      |
| `motto_translation` | yes          | Translated motto under the quote     |
| `cta`               | yes          | Call-to-action button text           |
| `motto_latin`       | no           | Latin motto                          |
| `motto_author`      | no           | Motto author                         |
| `background`        | no           | Full-width background image          |

---

## 7. Activities page (globe)

URL: `/activities`

The interactive globe (on both `/` and `/activities`) reads its city pins from
the `Activities` collection.

**Where:** `Content → Activities` (collection — one row per pin)

| Field        | Purpose                                                        |
|--------------|----------------------------------------------------------------|
| `slug`       | Unique id (`beijing`, `hong-kong`)                             |
| `lat`        | Latitude                                                       |
| `lng`        | Longitude                                                      |
| `altitude`   | Camera altitude when focused (smaller = closer; default `1.7`) |
| `sort`       | Order in any list                                              |
| `photos`     | Images for the city's photo carousel                           |
| `translations` | Localised text per language                                  |

**Per language (translations):**

| Field        | Purpose                                            |
|--------------|----------------------------------------------------|
| `name`       | City label shown on the pin and panel              |
| `business`   | Office title (big text in the side panel)         |
| `description`| Card body paragraph                                |

**Adding a new city:**

1. Open `Activities` → **Create Item**.
2. Fill in `slug`, `lat`, `lng`, optional `altitude`.
3. Save.
4. Back in the row, open **Translations** → **Create New** → pick `en` →
   write `name`, `business`, `description`.
5. Repeat **Translations** for any other languages you support.
6. Open **Photos** → upload the city's photos. Drag to reorder.

**To remove a city:** open it, click **Delete** (top right). The pin
disappears from the globe immediately.

> Tip: use https://www.latlong.net/ to find lat/lng for an address.

---

## 8. Contact page

URL: `/contact`

```
1. Contact header (heading + intro + motto)   ← Contact Header singleton
2. Contact details (channels, address, map)   ← Contact singleton
3. Portrait + motto                           ← Contact singleton (portrait_image)
```

### 8.1 Contact header

**Where:** `Content → Contact Header` (singleton)

| Field               | Translatable | Purpose                                |
|---------------------|--------------|----------------------------------------|
| `heading_title`     | yes          | Big "Get in touch" heading             |
| `subheading`        | yes          | Intro paragraph                        |
| `motto_translation` | yes          | Translated motto                       |
| `motto_latin`       | no           | Latin motto                            |
| `motto_author`      | no           | Motto author                           |

### 8.2 Contact details

**Where:** `Content → Contact` (singleton)

These are the operational details shown as a list of channels. None of them
are translatable (they're literal addresses, numbers, etc.).

| Field              | Purpose                                                     |
|--------------------|-------------------------------------------------------------|
| `org_name`         | Legal organisation name                                     |
| `role_label`       | Label above the role line                                   |
| `role_name`        | Job title                                                   |
| `address`          | Address — **one line per row**, separated by newlines       |
| `corporate_ids`    | "Label: value" lines (e.g. `IČO: 123456`), one per row      |
| `phone`            | Phone number, used in the `tel:` link                       |
| `website_url`      | Website URL                                                 |
| `whatsapp`         | WhatsApp number                                             |
| `wechat`           | WeChat ID                                                   |
| `work_email`       | Work email                                                  |
| `personal_email`   | Personal email                                              |
| `bank_credentials` | "Label: value" lines, one per row                           |
| `maps`             | Map images displayed beside the details                     |
| `portrait_image`   | Portrait shown in the right column                          |

**Channel icons** (optional override — defaults are Material Icons):

| Field          | Purpose                                       |
|----------------|-----------------------------------------------|
| `icon_email`   | Material Icons name (e.g. `mail`, `email`)    |
| `icon_phone`   | Material Icons name (e.g. `phone`)            |
| `icon_website` | Material Icons name (e.g. `language`)         |
| `icon_address` | Material Icons name (e.g. `place`)            |

> Browse icon names at https://fonts.google.com/icons. Just paste the name
> (no quotes). Leave blank to use the default icon.

**Address formatting:** put each address line on its own line in the editor.
Example:

```
Tabernam s.r.o.
Hlavná 12
811 01 Bratislava
Slovakia
```

The site renders each line on its own row automatically.

### 8.3 Contact labels (translatable)

The labels next to each channel ("Email", "Phone", etc.) are translatable.

**Where:** `Content → Contact` (singleton) → Translations

| Field                   | Purpose                       |
|-------------------------|-------------------------------|
| `heading_contact`       | "Contact" heading             |
| `contact_addressLabel`  | "Address" label               |
| `contact_emailLabel`    | "Email" label                 |
| `contact_phoneLabel`    | "Phone" label                 |
| `contact_websiteLabel`  | "Website" label               |
| `contact_wechatLabel`   | "WeChat" label                |

---

## 9. CV page

URL: `/cv`

**Where:** `Content → CV` (singleton)

Most CV content lives directly on the singleton's translations. The collection
has many fields because the CV is highly structured — but the editor UI groups
them logically.

### 9.1 Page basics (translatable)

| Field                  | Purpose                            |
|------------------------|------------------------------------|
| `hero_name`            | Big name shown at the top          |
| `section_education`    | "Education" section title          |
| `section_experience`   | "Experience" section title         |
| `section_china`        | "China" section title              |
| `section_languages`    | "Languages" section title          |
| `section_skills`       | "Skills" section title             |
| `btn_goBack`           | Back-button label                  |
| `cta_view_full`        | "View full CV" button              |

### 9.2 Asset

| Field            | Purpose             |
|------------------|---------------------|
| `portrait_image` | CV portrait image   |

### 9.3 Repeating items (per language)

The CV has fixed numbered slots. Fill in only the ones you need; leave the
rest blank.

**Education (up to 6 entries):**
`edu_0_title`, `edu_0_org`, `edu_0_date` … `edu_5_title`, `edu_5_org`, `edu_5_date`

**Experience (up to 9 entries):**
`exp_0_title`, `exp_0_org`, `exp_0_date`, `exp_0_desc` … `exp_8_*`

**China experience (up to 9 entries):**
`china_0_text`, `china_0_years` … `china_8_*`

**Languages (up to 5):**
`lang_0_name`, `lang_0_descriptor` … `lang_4_*`

**Skills (up to 5):**
`skill_0` … `skill_4`

### 9.4 "Request CV" modal (translatable)

| Field                       | Purpose                                  |
|-----------------------------|------------------------------------------|
| `contact_intro`             | Intro above the contact block            |
| `contact_title`             | Title of the contact block               |
| `contact_cta`               | CTA button label                         |
| `modal_title`               | Modal heading                            |
| `modal_intro`               | Intro paragraph                          |
| `modal_default_body`        | Default body of the prefilled email      |
| `modal_subject`             | Subject line of the prefilled email      |
| `modal_field_name`          | "Name" field label                       |
| `modal_field_email`         | "Email" field label                      |
| `modal_field_company`       | "Company" field label                    |
| `modal_field_message`       | "Message" field label                    |
| `modal_message_placeholder` | Placeholder inside the message textarea  |
| `modal_submit`              | Submit button label                      |
| `modal_cancel`              | Cancel button label                      |
| `modal_close`               | Close button accessible label            |

---

## 10. Header & footer (site-wide)

### 10.1 Header (navigation)

**Where:** `Content → Header` (singleton) → Translations

| Field     | Purpose                  |
|-----------|--------------------------|
| `home`    | "Home" nav link label    |
| `about`   | "About" nav link label   |
| `contact` | "Contact" nav link label |

### 10.2 Footer

**Where:** `Content → Footer` (singleton) → Translations

| Field                     | Purpose                                |
|---------------------------|----------------------------------------|
| `footer_copyright`        | Copyright line at the bottom           |
| `footer_exploreHeading`   | "Explore" column heading               |
| `footer_location`         | Location text in the footer            |
| `footer_quote`            | Quote shown in the footer              |
| `footer_quote_author`     | Author of the footer quote             |

---

## 11. Site settings (theme, colors, logo)

**Where:** `Content → Site Settings` (singleton)

Controls the look and layout of the entire site. All fields are optional —
leave blank to use the built-in defaults.

### 11.1 Colors

| Field                | Default     | Used for                              |
|----------------------|-------------|----------------------------------------|
| `color_bg`           | `#FFFFFF`   | Page background                       |
| `color_brand`        | `#1759B0`   | Brand-coloured headlines              |
| `color_accent`       | `#FF8A35`   | Accent (titleAccent, highlights)      |
| `color_text`         | `#101823`   | Main text color                       |
| `color_muted`        | `#5A6B83`   | Muted / secondary text                |
| `color_surface`      | `#C2CBD7`   | Card / surface background             |
| `color_button`       | `#E9EDF1`   | Default button background             |
| `color_button_text`  | `#101823`   | Button text                           |
| `color_button_hover` | `#C2CBD7`   | Button hover background               |
| `color_header`       | `#FFFFFF`   | Site header background                |
| `color_border`       | `#C2CBD7`   | Border / divider lines                |
| `color_footer_bg`    | `#E9EDF1`   | Footer background                     |

Type colors as `#RRGGBB`. After saving, refresh the site to see the change.

### 11.2 Branding

| Field        | Purpose                                                    |
|--------------|------------------------------------------------------------|
| `logo_image` | Logo image shown in the header/footer (upload an asset)    |
| `logo_text`  | Logo text (fallback when no logo image is set)             |
| `font_family`| Optional custom font family override                       |

### 11.3 Layout

| Field           | Default    | Purpose                          |
|-----------------|------------|----------------------------------|
| `max_width`     | `1512px`   | Maximum content width            |
| `side_padding`  | `40px`     | Horizontal padding around content|
| `header_height` | `60px`     | Header bar height                |

---

## 12. Common tasks (cheat-sheet)

| You want to…                              | Go to                                                  |
|-------------------------------------------|--------------------------------------------------------|
| Change the hero headline                  | Content → Hero → `title` / `body`                      |
| Swap a hero slide                         | Content → Hero → Slides → click image → Replace        |
| Update the quote on the home page         | Content → Quote → `primary`                            |
| Edit the home "About" intro               | Content → Home About                                   |
| Add a marquee image                       | Content → Home Marquee → Create Item                   |
| Add a city pin to the globe               | Content → Activities → Create Item (+ Translations + Photos) |
| Change a city's description               | Activities → city row → Translations → edit `description` |
| Edit the About page paragraphs            | Content → About Body → Translations → `paragraph_N`    |
| Add an image to an About paragraph        | About Body → Images → Create New (set `paragraph_number`) |
| Add a video to an About paragraph         | About Body → Videos → Create New, then upload file in Translations |
| Add a new region map                      | Content → Travel Routes → Maps → Create New            |
| Change the closing quote                  | Content → Closing Quote                                |
| Update contact phone / email / address    | Content → Contact                                      |
| Change a contact channel icon             | Content → Contact → `icon_email` (etc.)                |
| Edit nav labels                           | Content → Header → Translations                        |
| Edit footer text                          | Content → Footer → Translations                        |
| Change the brand color                    | Content → Site Settings → `color_brand`                |
| Replace the logo                          | Content → Site Settings → `logo_image`                 |
| Add a new language                        | Content → Languages → Create Item, then translate each section |

---

## 13. Troubleshooting

**A field I edited isn't showing on the site.**
- Did you click **Save** (top right)?
- Hard-refresh the page (Cmd+Shift+R / Ctrl+Shift+R) to bypass the browser
  cache.
- For uploaded images/videos, double-check the file was selected in the field
  (not just uploaded into the library).

**The site shows English even though I'm on the Slovak version.**
- Open the relevant section → Translations → confirm a row exists for `sk`.
- Confirm the translated field is non-empty. Empty fields fall back to English.

**My uploaded image is huge and slow to load.**
- Resize/compress before upload (TinyPNG, Squoosh, etc.).
- Aim for under 500 KB for hero images, under 200 KB for everything else.

**The globe doesn't show my new city.**
- Confirm the row has `lat` and `lng` (not empty).
- Confirm at least one translation row exists (English).
- Confirm `sort` is set so the row isn't filtered out.

**I deleted a field by mistake.**
- Open the trash icon in the collection settings — Directus keeps deleted
  items briefly. If gone, restore from the latest seed (`directus/data.db.seed`)
  — ask a developer.

**Directus is unreachable / I see fallback content.**
- The site keeps working with built-in defaults, so visitors won't see a
  broken page.
- Restart Directus locally: `docker compose restart directus`.
- Check `.env` — `DIRECTUS_URL` and `DIRECTUS_TOKEN` must match the running
  instance.

---

*For schema-level changes (adding/removing fields), see
`DIRECTUS_SCHEMA.md` at the project root and ask a developer — those require
running a migration, not just editing content.*
