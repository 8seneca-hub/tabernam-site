import { CV_TRANSLATIONS } from './translations-cv';

export interface LangInfo {
  code: string;
  name: string;
  flag: string;
  isDefault: boolean;
}

export const FALLBACK_LANGS: LangInfo[] = [
  { code: 'en', name: 'English', flag: '\u{1F1FA}\u{1F1F8}', isDefault: true },
  { code: 'sk', name: 'Slovakia', flag: '\u{1F1F8}\u{1F1F0}', isDefault: false },
];

const COMMON_DICTIONARIES: Record<string, Record<string, string>> = {
  en: {
    'nav.contact': 'Contact',
    'nav.about': 'About me',
    'nav.activity': 'Activity',
    'nav.home': 'Home',
    'btn.goBack': 'Go back',
    'btn.viewCV': 'View my CV',
    'heading.aboutMe': 'About me',
    'heading.contact': 'Contact',
    'quote.titleAccent': 'Build on trust,',
    'quote.titleRest': ' not transactions',
    'quote.motto.translation': 'Earn honestly, give generously',
    'footer.copyright': '\u00a9 2026 Tabernam. All rights reserved.',
    'panel.goToLocation': 'Go to location',
    'btn.exploreNow': 'Explore now',
    'globeHint.drag': 'Drag to move the\nglobe around',
    'globeHint.zoom': 'Zoom in & out\nto view',
    'globeHint.clickCity': 'Click on city to view\ndetails',
    'globeZoom.maxToast': "Maximum zoom — you can't zoom in any closer.",
    'globeZoom.minToast': "Minimum zoom — you can't zoom out any further.",
    'region.world': 'World',
    'region.europe': 'Europe',
    'region.asia': 'Asia',
    'region.africa': 'Africa',
    'region.americas': 'Americas',
    'region.oceania': 'Oceania',
  },
  sk: {
    'nav.contact': 'Kontakt',
    'nav.about': 'O mne',
    'nav.activity': 'Aktivita',
    'nav.home': 'Domov',
    'btn.goBack': 'Sp\u00e4\u0165',
    'btn.viewCV': 'Zobrazi\u0165 \u017eivotopis',
    'heading.aboutMe': 'O mne',
    'heading.contact': 'Kontakt',
    'quote.titleAccent': 'Postavené na dôvere,',
    'quote.titleRest': ' nie na transakciách',
    'quote.motto.translation': 'Zarábaj čestne, rozdávaj štedro',
    'footer.copyright': '\u00a9 2026 Tabernam. V\u0161etky pr\u00e1va vyhraden\u00e9.',
    'panel.goToLocation': 'Prejsť na miesto',
    'btn.exploreNow': 'Preskúmať',
    'globeHint.drag': 'Ťahaj pre pohyb\npo zemeguli',
    'globeHint.zoom': 'Priblíž a oddiaľ\npre prehliadanie',
    'globeHint.clickCity': 'Klikni na mesto\npre detaily',
    'globeZoom.maxToast': 'Maximálne priblíženie — bližšie sa už nedostaneš.',
    'globeZoom.minToast': 'Minimálne priblíženie — ďalej už oddialiť nemôžeš.',
    'region.world': 'Svet',
    'region.europe': 'Európa',
    'region.asia': 'Ázia',
    'region.africa': 'Afrika',
    'region.americas': 'Amerika',
    'region.oceania': 'Oceánia',
  },
};

export const FALLBACK_DICTIONARIES: Record<string, Record<string, string>> = Object.fromEntries(
  Object.keys(COMMON_DICTIONARIES).map((lang) => [
    lang,
    { ...COMMON_DICTIONARIES[lang], ...(CV_TRANSLATIONS[lang] ?? {}) },
  ]),
);

export function getLang(supportedCodes: string[], defaultLang = 'en'): string {
  const fallback = supportedCodes.includes(defaultLang)
    ? defaultLang
    : supportedCodes[0] || 'en';
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem('lang');
    if (saved && supportedCodes.includes(saved)) return saved;
  } catch {
    // private mode
  }
  return fallback;
}

export function setLang(lang: string): void {
  try {
    localStorage.setItem('lang', lang);
  } catch {
    // private mode
  }
}
