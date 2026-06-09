export { default } from './client';
export { assetUrl } from './client';

export { pickTranslation, getActivities } from './activities';
export { getHeroSlides, getHomeMarquee, getHomeTexts } from './home';
export { getHero, type HeroBundle, type HeroText } from './hero';
export { getTravelRouteMaps, getAboutTexts } from './about';
export { getContactOffice, getContactTexts } from './contact';
export { getCvTexts } from './cv';
export { pickPageTexts, type PageTextsBundle } from './pages';
export { getSiteSettings, getLanguages, getDictionaries } from './site';

export type {
  HeroSlide, MarqueeImage, TravelRouteMap, ContactOffice, LabeledRow, PageTexts, SiteSettings,
} from '../data';
export type { GlobeCity, GlobeCityTranslation } from '../type';
export type { LangInfo } from '../i18n';
