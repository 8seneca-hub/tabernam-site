export { default } from './client';
export { assetUrl } from './client';

export { pickTranslation, getActivities } from './activities';
export { getHomeMarquee } from './home-marquee';
export { getHero, type HeroBundle, type HeroText } from './hero';
export { getQuote, type QuoteBundle, type QuoteText } from './quote';
export { getGlobe, type GlobeBundle, type GlobeText } from './globe';
export { getHomeAbout, type HomeAboutBundle, type HomeAboutText } from './home-about';
export { getTravelRouteMaps } from './travel-routes-map';
export { getAboutHeader, type AboutHeaderBundle, type AboutHeaderText } from './about-header';
export { getAboutBody, type AboutBodyBundle, type AboutBodyText } from './about-body';
export { getClosingQuote, type ClosingQuoteBundle, type ClosingQuoteText } from './closing-quote';
export { getContactOffice, getContactTexts } from './contact';
export { getContactHeader, type ContactHeaderBundle, type ContactHeaderText } from './contact-header';
export { getCvTexts } from './cv';
export { pickPageTexts, type PageTextsBundle } from './pages';
export { getSiteSettings, getLanguages, getDictionaries } from './site';

export type {
  HeroSlide, MarqueeImage, TravelRouteMap, ContactOffice, LabeledRow, PageTexts, SiteSettings,
} from '../data';
export type { GlobeCity, GlobeCityTranslation } from '../type';
export type { LangInfo } from '../i18n';
