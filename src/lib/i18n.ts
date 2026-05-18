export const SUPPORTED_LANGS = ['en', 'sk'] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

export const I18N: Record<Lang, Record<string, string>> = {
  en: {
    'page.title.home': 'TABERNAM',
    'page.title.about': 'About me — TABERNAM',
    'page.title.business': 'Business — TABERNAM',
    'page.title.contact': 'Contact — TABERNAM',
    'nav.contact': 'Contact',
    'nav.about': 'About me',
    'nav.activity': 'Activity',
    'nav.home': 'Home',
    'btn.getStarted': 'Get started',
    'btn.viewCities': 'View cities',
    'btn.goBack': 'Go back',
    'btn.learnMore': 'Learn more',
    'btn.viewCV': 'View my CV',
    'heading.aboutMe': 'About me',
    'heading.contact': 'Contact',
    'footer.navigation': 'Navigation',
    'footer.contact': 'Contact',
    'footer.copyright': '\u00a9 2026 Tabernam. All rights reserved.',
    'contact.address1': 'Address 1',
    'contact.address2': 'Address 2',
    'contact.address3': 'Address 3',
    'aria.prevCity': 'Previous city',
    'aria.nextCity': 'Next city',
    'aria.cities': 'Cities',
    'aria.footerNav': 'Footer navigation',
  },
  sk: {
    'page.title.home': 'TABERNAM',
    'page.title.about': 'O mne — TABERNAM',
    'page.title.business': 'Biznis — TABERNAM',
    'page.title.contact': 'Kontakt — TABERNAM',
    'nav.contact': 'Kontakt',
    'nav.about': 'O mne',
    'nav.activity': 'Aktivita',
    'nav.home': 'Domov',
    'btn.getStarted': 'Za\u010da\u0165',
    'btn.viewCities': 'Zobrazi\u0165 mest\u00e1',
    'btn.goBack': 'Sp\u00e4\u0165',
    'btn.learnMore': 'Zisti\u0165 viac',
    'btn.viewCV': 'Zobrazi\u0165 \u017eivotopis',
    'heading.aboutMe': 'O mne',
    'heading.contact': 'Kontakt',
    'footer.navigation': 'Navig\u00e1cia',
    'footer.contact': 'Kontakt',
    'footer.copyright': '\u00a9 2026 Tabernam. V\u0161etky pr\u00e1va vyhraden\u00e9.',
    'contact.address1': 'Adresa 1',
    'contact.address2': 'Adresa 2',
    'contact.address3': 'Adresa 3',
    'aria.prevCity': 'Predch\u00e1dzaj\u00face mesto',
    'aria.nextCity': '\u010eal\u0161ie mesto',
    'aria.cities': 'Mest\u00e1',
    'aria.footerNav': 'Navig\u00e1cia v p\u00e4te str\u00e1nky',
  },
};

export function getLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem('lang');
    if (saved && SUPPORTED_LANGS.includes(saved as Lang)) return saved as Lang;
  } catch {
  }
  return 'en';
}

export function setLang(lang: Lang): void {
  try {
    localStorage.setItem('lang', lang);
  } catch {
  }
}

export function t(key: string, lang: Lang): string {
  return I18N[lang]?.[key] ?? I18N.en[key] ?? key;
}
