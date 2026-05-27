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

export interface CMSPageTextKey {
    id: number;
    page: string;
    section: string;
    translations: CMSPageTextTranslation[];
}

export interface CMSPageTextTranslation {
    id: number;
    page_text_keys_id: number;
    language: number | CMSLanguage | null;
    content: string;
}

export interface CMSContactOffice {
    id: number;
    sort: number;
    slug: string;
    region: string;
    label: string;
    icon: 'pin' | 'globe' | 'group' | string;
    org_name: string;
    zone: string;
    role_label: string;
    role_name: string;
    address: string;            // newline-separated lines
    corporate_ids: string;      // "Label: Value" per line
    phone: string;
    website_url: string;
    work_email: string;
    personal_email: string;
    bank_credentials: string;   // "Label: Value" per line
    map: CMSContactOfficeFile[];
}

export interface CMSContactOfficeFile {
    id: number;
    contact_offices_id: number;
    directus_files_id: string;
}

export interface CMSTranslationKey {
    id: number;
    key: string;
    translations: CMSTranslationRow[];
}

export interface CMSTranslationRow {
    id: number;
    translation_keys_id: number;
    language: number | CMSLanguage | null;
    value: string;
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
    hero_slides: CMSHeroSlide[];
    page_text_keys: CMSPageTextKey[];
    page_text_translations: CMSPageTextTranslation[];
    contact_offices: CMSContactOffice;
    translation_keys: CMSTranslationKey[];
    translation_table: CMSTranslationRow[];
    languages: CMSLanguage[];
    site_settings: CMSSiteSettings;
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
