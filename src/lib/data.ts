export interface HeroSlide {
  image: string;
  alt: string;
}

export interface ContactAddress {
  title_en: string;
  title_sk: string;
  lines: string[];
  portrait_index: number;
}

export interface BusinessCoords {
  lat: number;
  lng: number;
}

export interface BusinessDot {
  x: number;
  y: number;
}

export interface BusinessFocus {
  x: number;
  y: number;
  scale: number;
}

export interface Business {
  id: string;
  name: string;
  label: string;
  coords: BusinessCoords;
  altitude: number;
  dot: BusinessDot;
  focus: BusinessFocus;
  image: string;
  title: string;
  body: string;
}

export interface SiteSettings {
  colorBg: string;
  colorText: string;
  colorMuted: string;
  colorSurface: string;
  colorButton: string;
  colorButtonText: string;
  colorButtonHover: string;
  colorHeader: string;
  colorBorder: string;
  colorFooterBg: string;
  fontFamily: string;
  logoText: string;
  maxWidth: string;
  sidePadding: string;
  headerHeight: string;
}

export interface PageTexts {
  [section: string]: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  { image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=480&q=80', alt: 'Business meeting' },
  { image: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=480&q=80', alt: 'Shanghai by night' },
  { image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=480&q=80', alt: 'Beijing skyline' },
  { image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=480&q=80', alt: 'Hong Kong harbour' },
  { image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=480&q=80', alt: 'Singapore Marina Bay' },
  { image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=480&q=80', alt: 'Dubai skyline' },
  { image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=480&q=80', alt: 'Diplomatic handshake' },
  { image: 'https://images.unsplash.com/photo-1496564203457-11bb12075d90?auto=format&fit=crop&w=480&q=80', alt: 'Bratislava' },
  { image: 'https://images.unsplash.com/photo-1543059080-f9b1272213d5?auto=format&fit=crop&w=480&q=80', alt: 'São Paulo aerial' },
  { image: 'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=480&q=80', alt: 'New York City' },
  { image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=480&q=80', alt: 'Boardroom table' },
  { image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=480&q=80', alt: 'Mountain landscape' },
];

export const SLOVAKIA = { x: 305, y: 215 };
export const SLOVAKIA_COORDS = { lat: 48.1486, lng: 17.1077 };

export const AUTO_ADVANCE_MS = 3000;
export const RING_FADE_MS = 2000;

export const BUSINESSES: Business[] = [
  {
    id: 'beijing-cbd',
    name: 'Business',
    label: 'Beijing',
    coords: { lat: 39.9087, lng: 116.4581 },
    altitude: 2.1,
    dot: { x: 470, y: 230 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1542223616-740d5dff7f56?auto=format&fit=crop&w=900&q=80',
    title: 'Beijing CBD Office',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'beijing-wangjing',
    name: 'Business',
    label: 'Beijing',
    coords: { lat: 41.8, lng: 118.6 },
    altitude: 1.9,
    dot: { x: 472, y: 226 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=900&q=80',
    title: 'Beijing Wangjing Hub',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'beijing-zhongguancun',
    name: 'Business',
    label: 'Beijing',
    coords: { lat: 37.6, lng: 113.7 },
    altitude: 2.4,
    dot: { x: 467, y: 228 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
    title: 'Beijing Zhongguancun Tech Centre',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'shanghai-pudong',
    name: 'Business',
    label: 'Shanghai',
    coords: { lat: 31.2304, lng: 121.5435 },
    altitude: 1.6,
    dot: { x: 497, y: 265 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=900&q=80',
    title: 'Shanghai Pudong Tower',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'shanghai-jingan',
    name: 'Business',
    label: 'Shanghai',
    coords: { lat: 29.5, lng: 119.4 },
    altitude: 1.8,
    dot: { x: 493, y: 265 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=900&q=80',
    title: "Shanghai Jing'an Plaza",
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'shenzhen-futian',
    name: 'Business',
    label: 'Shenzhen',
    coords: { lat: 22.5431, lng: 114.0579 },
    altitude: 1.4,
    dot: { x: 478, y: 302 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=900&q=80',
    title: 'Shenzhen Futian Studio',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'guangzhou-tianhe',
    name: 'Business',
    label: 'Guangzhou',
    coords: { lat: 23.13, lng: 113.26 },
    altitude: 1.45,
    dot: { x: 476, y: 300 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=900&q=80',
    title: 'Guangzhou Tianhe Loft',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'chengdu',
    name: 'Business',
    label: 'Chengdu',
    coords: { lat: 30.57, lng: 104.07 },
    altitude: 1.5,
    dot: { x: 446, y: 268 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1605101100278-5d1deb2b6498?auto=format&fit=crop&w=900&q=80',
    title: 'Chengdu Riverside Atelier',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'hangzhou',
    name: 'Business',
    label: 'Hangzhou',
    coords: { lat: 30.27, lng: 120.15 },
    altitude: 1.55,
    dot: { x: 491, y: 269 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1605101100278-5d1deb2b6498?auto=format&fit=crop&w=900&q=80',
    title: 'Hangzhou West Lake Studio',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'xian',
    name: 'Business',
    label: "Xi'an",
    coords: { lat: 34.34, lng: 108.94 },
    altitude: 1.35,
    dot: { x: 460, y: 250 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=900&q=80',
    title: "Xi'an Heritage Office",
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
];

export const CHINA_DESTINATIONS = [
  { lat: 39.9042, lng: 116.4074 }, { lat: 31.2304, lng: 121.4737 },
  { lat: 23.1291, lng: 113.2644 }, { lat: 22.5429, lng: 114.0596 },
  { lat: 30.5728, lng: 104.0668 }, { lat: 29.5630, lng: 106.5516 },
  { lat: 34.3416, lng: 108.9398 }, { lat: 30.5928, lng: 114.3055 },
  { lat: 30.2741, lng: 120.1551 }, { lat: 39.3434, lng: 117.3616 },
  { lat: 32.0603, lng: 118.7969 }, { lat: 45.8038, lng: 126.5340 },
  { lat: 41.8057, lng: 123.4315 }, { lat: 25.0389, lng: 102.7183 },
  { lat: 29.6520, lng: 91.1721 }, { lat: 43.8256, lng: 87.6168 },
  { lat: 36.0611, lng: 103.8343 }, { lat: 36.0671, lng: 120.3826 },
  { lat: 22.3193, lng: 114.1694 }, { lat: 24.4798, lng: 118.0894 },
];

export const CONTACT_ADDRESSES: ContactAddress[] = [
  { title_en: 'Address 1', title_sk: 'Adresa 1', lines: ['Quam adipiscing vestibulum id tristique.', 'Penatibus lacus luctus magna laoreet torquent curae integer ultricies.', 'Sagittis vehicula aenean nascetur augue e inceptos.', 'Blandit faucibus interdum'], portrait_index: 1 },
  { title_en: 'Address 2', title_sk: 'Adresa 2', lines: ['Quam adipiscing vestibulum id tristique.', 'Penatibus lacus luctus magna laoreet torquent curae integer ultricies.', 'Sagittis vehicula aenean nascetur augue e inceptos.', 'Blandit faucibus interdum'], portrait_index: 2 },
  { title_en: 'Address 3', title_sk: 'Adresa 3', lines: ['Quam adipiscing vestibulum id tristique.', 'Penatibus lacus luctus magna laoreet torquent curae integer ultricies.', 'Sagittis vehicula aenean nascetur augue e inceptos.', 'Blandit faucibus interdum'], portrait_index: 3 },
]

export const DEFAULT_SETTINGS: SiteSettings = {
  colorBg: '#ffffff',
  colorText: '#2e2e2e',
  colorMuted: '#646464',
  colorSurface: '#c7c7c7',
  colorButton: '#e8e8e8',
  colorButtonText: '#000000',
  colorButtonHover: '#d9d9d9',
  colorHeader: '#ffffff',
  colorBorder: '#c7c7c7',
  colorFooterBg: '#f6f6f6',
  fontFamily: '',
  logoText: 'Tabernam',
  maxWidth: '1512px',
  sidePadding: '40px',
  headerHeight: '60px',
};
