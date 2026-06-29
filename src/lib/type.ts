export interface CMSActivity {
    id: number;
    sort: number;
    slug: string;
    lat: number;
    lng: number;
    altitude: number;
    translations: CMSActivityTranslation[];
    photos: CMSActivityFile[];
}

export interface CMSActivityTranslation {
    id: number;
    activities_id: number;
    language_code: string | null;
    name: string;
    business: string;
    description: string;
    slug: string | null;
}

export interface CMSActivityFile {
    id: number;
    activities_id: number;
    directus_files_id: string;
    sort: number | null;
}

export interface CMSHeroSlide {
    id: number;
    image: string;
    alt: string;
    sort: number;
}

export interface CMSHomeMarquee {
    id: number;
    image: string;
    alt: string;
    row: 1 | 2 | 3;
    sort: number;
}

export interface CMSTravelRouteMap {
    id: number;
    slug: string;
    image: string | null;
    sort: number | null;
    travel_routes_id: number | null;
    translations: CMSTravelRouteMapTranslation[];
}

export interface CMSTravelRoutes {
    id: number;
    translations: CMSTravelRoutesTranslation[];
    maps: CMSTravelRouteMap[];
}

export interface CMSTravelRoutesTranslation {
    id: number;
    travel_routes_id: number;
    language_code: string | null;
    heading: string;
    body: string;
}

export interface CMSTravelRouteMapTranslation {
    id: number;
    travel_route_map_id: number;
    language_code: string | null;
    slug: string | null;
    name: string;
    /** Section-level heading. Read only from the first sorted map row. */
    heading: string;
    /** Section-level body. Read only from the first sorted map row. */
    body: string;
}

export interface CMSPageSingleton {
    id: number;
    translations: CMSPageTranslation[];
    [key: string]: unknown;
}

export interface CMSPageTranslation {
    id: number;
    language: number | CMSLanguage | { code: string } | null;
    [key: string]: unknown;
}

// `contact` extends the basic shape with the operational fields formerly
// stored on `contact_offices` plus the `maps` M2M alias to `contact_files`.
export interface CMSContact extends CMSPageSingleton {
    slug: string;
    region: string;
    label: string;
    icon: 'pin' | 'globe' | 'group' | string;
    org_name: string;
    zone: string;
    role_label: string;
    role_name: string;
    address: string;
    corporate_ids: string;
    phone: string;
    website_url: string;
    work_email: string;
    personal_email: string;
    bank_credentials: string;
    portrait_image: string | null;
    // Material Icons names picked via Directus's select-icon interface.
    icon_email: string | null;
    icon_phone: string | null;
    icon_website: string | null;
    icon_address: string | null;
    maps?: CMSContactFile[];
}

export interface CMSContactFile {
    id: number;
    contact_id: number;
    directus_files_id: string;
    sort?: number;
}

export interface CMSLanguage {
    id: number;
    code: string;
    name: string;
    flag: string | null;
    is_default: boolean;
    sort: number | null;
}

export interface CMSSchema {
    activities: CMSActivity[];
    activities_translations: CMSActivityTranslation[];
    activities_files: CMSActivityFile[];
    // The following are Directus singletons (one row each, queried via
    // readSingleton). Schema-wise we type them as the row object directly so
    // SDK type narrowing picks the singleton overloads.
    hero_slides: CMSHeroSlide[];
    hero_translations: CMSHeroTranslation[];
    globe_translations: CMSGlobeTranslation[];
    home_marquee: CMSHomeMarquee[];
    travel_route_map: CMSTravelRouteMap[];
    travel_route_map_translations: CMSTravelRouteMapTranslation[];
    travel_routes: CMSTravelRoutes;
    travel_routes_translations: CMSTravelRoutesTranslation[];
    quote: CMSQuote;
    quote_translations: CMSQuoteTranslation[];
    map: CMSMap;
    map_translations: CMSMapTranslation[];
    home_about: CMSHomeAbout;
    home_about_translations: CMSHomeAboutTranslation[];
    about_header: CMSAboutHeader;
    about_header_translations: CMSAboutHeaderTranslation[];
    about_body: CMSAboutBody;
    about_body_translations: CMSAboutBodyTranslation[];
    about_body_images: CMSAboutBodyImage[];
    about_body_videos: CMSAboutBodyVideo[];
    about_body_videos_translations: CMSAboutBodyVideoTranslation[];
    closing_quote: CMSClosingQuote;
    closing_quote_translations: CMSClosingQuoteTranslation[];
    contact_header_translations: CMSContactHeaderTranslation[];
    contact: CMSContact;
    contact_translations: CMSPageTranslation[];
    contact_files: CMSContactFile[];
    cv: CMSPageSingleton;
    cv_education_translations: CMSPageTranslation[];
    cv_experience_translations: CMSPageTranslation[];
    cv_extras: CMSPageSingleton;
    cv_extras_translations: CMSPageTranslation[];
    cv_translations: CMSPageTranslation[];
    header_translations: CMSPageTranslation[];
    footer_translations: CMSPageTranslation[];
    languages: CMSLanguage[];
    site_settings: CMSSiteSettings;
}

export interface CMSQuote {
    id: number;
    motto_latin: string;
    motto_author: string;
    motto_translation: string;
    image: string | null;
    sort: number | null;
    translations: CMSQuoteTranslation[];
}

export interface CMSQuoteTranslation {
    id: number;
    quote_id: number;
    language_code: string | null;
    title_accent: string;
    title_rest: string;
    primary: string;
    motto_translation: string;
}

interface CMSMapFields {
    hint_drag: string;
    hint_zoom: string;
    hint_click_city: string;
    zoom_max_toast: string;
    zoom_min_toast: string;
    region_world: string;
    region_europe: string;
    region_asia: string;
    region_africa: string;
    region_americas: string;
    region_oceania: string;
    panel_go_to_location: string;
    btn_explore_now: string;
}

export interface CMSMap extends CMSMapFields {
    id: number;
    sort: number | null;
    translations: CMSMapTranslation[];
}

export interface CMSMapTranslation extends CMSMapFields {
    id: number;
    map_id: number;
    language_code: string | null;
}

interface CMSHomeAboutFields {
    eyebrow: string;
    heading: string;
    body_1: string;
    body_2: string;
    btn_get_to_know_more: string;
}

export interface CMSHomeAbout extends CMSHomeAboutFields {
    id: number;
    sort: number | null;
    translations: CMSHomeAboutTranslation[];
}

export interface CMSHomeAboutTranslation extends CMSHomeAboutFields {
    id: number;
    home_about_id: number;
    language_code: string | null;
}

interface CMSAboutHeaderFields {
    title: string;
    heading: string;
    name: string;
    body: string;
    cv_button_label: string;
    motto_translation: string;
}

export interface CMSAboutHeader {
    id: number;
    image: string | null;
    translations: CMSAboutHeaderTranslation[];
}

export interface CMSAboutHeaderTranslation extends CMSAboutHeaderFields {
    id: number;
    about_header_id: number;
    language_code: string | null;
}

interface CMSAboutBodyTranslationFields {
    // Any number of paragraph_N fields (paragraph_1, paragraph_2, …) — the
    // runtime fetcher discovers whatever columns exist on the table.
    [paragraph: `paragraph_${number}`]: string;
}

export interface CMSAboutBody {
    id: number;
    images: CMSAboutBodyImage[];
    videos: CMSAboutBodyVideo[];
    sort: number | null;
    translations: CMSAboutBodyTranslation[];
}

export interface CMSAboutBodyTranslation extends CMSAboutBodyTranslationFields {
    id: number;
    about_body_id: number;
    language_code: string | null;
}

export interface CMSAboutBodyImage {
    id: number;
    about_body_id: number;
    paragraph_number: number;
    sort: number | null;
    image: string | null;
}

export interface CMSAboutBodyVideo {
    id: number;
    about_body_id: number;
    paragraph_number: number;
    sort: number | null;
    /** YouTube / external URL — shared across all languages. */
    url: string | null;
    /** Uploaded file UUID — shared across all languages (takes precedence over url). */
    file: string | null;
    translations: CMSAboutBodyVideoTranslation[];
}

export interface CMSAboutBodyVideoTranslation {
    id: number;
    about_body_videos_id: number;
    language_code: string | null;
    title: string;
}

interface CMSClosingQuoteTranslationFields {
    motto_translation: string;
    cta: string;
}

export interface CMSClosingQuote {
    id: number;
    background: string | null;
    motto_latin: string;
    motto_author: string;
    sort: number | null;
    translations: CMSClosingQuoteTranslation[];
}

export interface CMSClosingQuoteTranslation extends CMSClosingQuoteTranslationFields {
    id: number;
    closing_quote_id: number;
    language_code: string | null;
}

interface CMSContactHeaderTranslationFields {
    heading_title: string;
    subheading: string;
    motto_translation: string;
}

export interface CMSContactHeaderTranslation extends CMSContactHeaderTranslationFields {
    id: number;
    language_code: string | null;
}

export interface CMSHeroTranslation {
    id: number;
    language_code: string | null;
    title: string;
    body: string;
}

export interface CMSGlobeTranslation {
    id: number;
    language_code: string | null;
    intro_heading: string;
    intro_body: string;
    intro_cta: string;
}

export interface CMSSiteSettings {
    id: number;
    color_bg: string | null;
    color_text: string | null;
    color_muted: string | null;
    color_surface: string | null;
    color_button: string | null;
    color_button_text: string | null;
    color_button_hover: string | null;
    color_header: string | null;
    color_border: string | null;
    color_footer_bg: string | null;
    color_brand: string | null;
    color_accent: string | null;
    font_family: string | null;
    logo_image: string | null;
    logo_text: string | null;
    max_width: string | null;
    side_padding: string | null;
    header_height: string | null;
    home_marquee_speed: number | null;
    meta_title: string | null;
    meta_description: string | null;
    meta_keywords: string[] | null;
    /** Open Graph image (1200x630 recommended). UUID of a directus_files row,
     *  resolved to a full URL via `assetUrl` in the fetcher. */
    meta_og_image: string | null;
}

export interface GlobeCityTranslation {
    language: string;
    name: string;
    business: string;
    description: string;
}

export interface GlobeCity {
    slug: string;
    lat: number;
    lng: number;
    altitude: number;
    translations: GlobeCityTranslation[];
    photos: string[];
}
