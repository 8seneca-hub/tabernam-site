export { default } from './client';
export { assetUrl } from './client';

export { pickTranslation, getActivities } from './home/activities';
export { getHomeMarquee } from './home/home-marquee';
export { getHero, type HeroBundle, type HeroText } from './home/hero';
export { getQuote, type QuoteBundle, type QuoteText } from './home/quote';
export { getGlobe, type GlobeBundle, type GlobeText } from './home/globe';
export { getHomeAbout, type HomeAboutBundle, type HomeAboutText } from './home/home-about';
export { getTravelRouteMaps } from './travel-routes-map';
export { getAboutHeader, type AboutHeaderBundle, type AboutHeaderText } from './about/about-header';
export { getAboutBody, type AboutBodyBundle, type AboutBodyText } from './about/about-body';
export { getClosingQuote, type ClosingQuoteBundle, type ClosingQuoteText } from './about/closing-quote';
export { getContactOffice, getContactTexts } from './contact/contact';
export { getContactHeader, type ContactHeaderBundle, type ContactHeaderText } from './contact/contact-header';
export { getCvTexts } from './about/cv';
export { pickPageTexts, type PageTextsBundle } from './pages';
export { getSiteSettings, getLanguages, getDictionaries } from './site';

export type {
  HeroSlide, MarqueeImage, TravelRouteMap, ContactOffice, LabeledRow, PageTexts, SiteSettings,
} from '../data';
export type { GlobeCity, GlobeCityTranslation } from '../type';
export type { LangInfo } from '../i18n';
