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
    language: number | CMSLanguage | null;
    name: string;
    business: string;
    description: string;
}

export interface CMSActivityFile {
    id: number;
    activities_id: number;
    directus_files_id: string;
    sort: number | null;
}

export interface CMSHeroSlide {
    id: number;
    hero_id: number;
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
    translations: CMSTravelRouteMapTranslation[];
}

export interface CMSTravelRouteMapTranslation {
    id: number;
    travel_route_map_id: number;
    language: number | CMSLanguage | { code: string } | null;
    name: string;
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
    hero: CMSHero;
    hero_translations: CMSHeroTranslation[];
    hero_slides: CMSHeroSlide[];
    home_marquee: CMSHomeMarquee[];
    travel_route_map: CMSTravelRouteMap[];
    travel_route_map_translations: CMSTravelRouteMapTranslation[];
    quote: CMSQuote;
    quote_translations: CMSQuoteTranslation[];
    globe: CMSGlobe;
    globe_translations: CMSGlobeTranslation[];
    home_about: CMSHomeAbout;
    home_about_translations: CMSHomeAboutTranslation[];
    about_header: CMSAboutHeader;
    about_header_translations: CMSAboutHeaderTranslation[];
    about_body: CMSAboutBody;
    about_body_translations: CMSAboutBodyTranslation[];
    closing_quote: CMSClosingQuote;
    closing_quote_translations: CMSClosingQuoteTranslation[];
    contact_header: CMSContactHeader;
    contact_header_translations: CMSContactHeaderTranslation[];
    contact: CMSContact;
    contact_translations: CMSPageTranslation[];
    contact_files: CMSContactFile[];
    cv: CMSPageSingleton;
    cv_translations: CMSPageTranslation[];
    header: CMSPageSingleton;
    header_translations: CMSPageTranslation[];
    footer: CMSPageSingleton;
    footer_translations: CMSPageTranslation[];
    languages: CMSLanguage[];
    site_settings: CMSSiteSettings;
}

export interface CMSHero {
    id: number;
    title: string;
    body: string;
    sort: number | null;
    translations: CMSHeroTranslation[];
    slides: CMSHeroSlide[];
}

export interface CMSQuote {
    id: number;
    title_accent: string;
    title_rest: string;
    primary: string;
    image: string | null;
    sort: number | null;
    translations: CMSQuoteTranslation[];
}

export interface CMSQuoteTranslation {
    id: number;
    quote_id: number;
    language: number | CMSLanguage | { code: string } | null;
    title_accent: string;
    title_rest: string;
    primary: string;
}

interface CMSGlobeFields {
    intro_heading: string;
    intro_body: string;
    intro_cta: string;
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

export interface CMSGlobe extends CMSGlobeFields {
    id: number;
    sort: number | null;
    translations: CMSGlobeTranslation[];
}

export interface CMSGlobeTranslation extends CMSGlobeFields {
    id: number;
    globe_id: number;
    language: number | CMSLanguage | { code: string } | null;
}

interface CMSHomeAboutFields {
    eyebrow: string;
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
    language: number | CMSLanguage | { code: string } | null;
}

interface CMSAboutHeaderFields {
    title: string;
    heading: string;
    name: string;
    body: string;
    cv_button_label: string;
    motto_translation: string;
}

export interface CMSAboutHeader extends CMSAboutHeaderFields {
    id: number;
    image: string | null;
    motto_latin: string;
    motto_author: string;
    sort: number | null;
    translations: CMSAboutHeaderTranslation[];
}

export interface CMSAboutHeaderTranslation extends CMSAboutHeaderFields {
    id: number;
    about_header_id: number;
    language: number | CMSLanguage | { code: string } | null;
}

interface CMSAboutBodyTranslationFields {
    body: string;
    experience_video_url: string;
    experience_video_title: string;
    philanthropy_story_1_video_url: string;
    philanthropy_story_1_title: string;
    philanthropy_story_2_video_url: string;
    philanthropy_story_2_title: string;
    travel_routes_heading: string;
    travel_routes_body: string;
}

export interface CMSAboutBody {
    id: number;
    image_1: string | null;
    image_2: string | null;
    image_3: string | null;
    sort: number | null;
    translations: CMSAboutBodyTranslation[];
}

export interface CMSAboutBodyTranslation extends CMSAboutBodyTranslationFields {
    id: number;
    about_body_id: number;
    language: number | CMSLanguage | { code: string } | null;
}

interface CMSClosingQuoteTranslationFields {
    quote: string;
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
    language: number | CMSLanguage | { code: string } | null;
}

interface CMSContactHeaderTranslationFields {
    heading_title: string;
    subheading: string;
}

export interface CMSContactHeader {
    id: number;
    sort: number | null;
    translations: CMSContactHeaderTranslation[];
}

export interface CMSContactHeaderTranslation extends CMSContactHeaderTranslationFields {
    id: number;
    contact_header_id: number;
    language: number | CMSLanguage | { code: string } | null;
}

export interface CMSHeroTranslation {
    id: number;
    hero_id: number;
    language: number | CMSLanguage | { code: string } | null;
    title: string;
    body: string;
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
