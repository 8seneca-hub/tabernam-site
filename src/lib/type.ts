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
    hero: CMSHero;
    hero_translations: CMSHeroTranslation[];
    hero_slides: CMSHeroSlide[];
    home_marquee: CMSHomeMarquee[];
    travel_route_map: CMSTravelRouteMap[];
    home: CMSPageSingleton;
    home_translations: CMSPageTranslation[];
    about: CMSPageSingleton;
    about_translations: CMSPageTranslation[];
    contact: CMSContact;
    contact_translations: CMSPageTranslation[];
    contact_files: CMSContactFile[];
    cv: CMSPageSingleton;
    cv_translations: CMSPageTranslation[];
    nav: CMSPageSingleton;
    nav_translations: CMSPageTranslation[];
    footer: CMSPageSingleton;
    footer_translations: CMSPageTranslation[];
    languages: CMSLanguage[];
    site_settings: CMSSiteSettings;
}

export interface CMSHero {
    id: number;
    translations: CMSHeroTranslation[];
}

export interface CMSHeroTranslation {
    id: number;
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
