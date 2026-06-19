export { default } from './client';
export { assetUrl } from './client';

export { pickTranslation, getActivities } from './home/activities';
export { getHomeMarquee } from './home/home-marquee';
export { getHeroSlides, getHeroText, type HeroText, type HeroTextBundle } from './home/hero';
export { getQuote, type QuoteBundle, type QuoteText } from './home/quote';
export { getGlobeText, type GlobeText, type GlobeTextBundle } from './home/globe';
export { getMap, type MapBundle, type MapText } from './home/map';
export { getHomeAbout, type HomeAboutBundle, type HomeAboutText } from './home/home-about';
export { getTravelRoutes, type TravelRoutesBundle, type TravelRoutesText } from './about/travel-routes';
export { getAboutHeader, type AboutHeaderBundle, type AboutHeaderText } from './about/about-header';
export { getAboutBody, type AboutBodyBundle, type AboutBodyText, type AboutBodyVideo } from './about/about-body';
export { getClosingQuote, type ClosingQuoteBundle, type ClosingQuoteText } from './about/closing-quote';
export { getContactOffice, getContactTexts } from './contact/contact';
export { getContactHeader, type ContactHeaderBundle, type ContactHeaderText } from './contact/contact-header';
export { getCvTexts } from './about/cv';
export {
  getCvEducation,
  getCvExperience,
  pickEntry,
  pickSectionTitle,
  type CvEducationEntry,
  type CvExperienceEntry,
  type CvSection,
} from './about/cv-entries';
export {
  getCvExtras,
  pickExtrasText,
  type CvExtras,
  type CvChinaEntry,
  type CvLanguageEntry,
  type CvSkillEntry,
} from './about/cv-extras';
export { pickPageTexts, type PageTextsBundle } from './pages';
export { getSiteSettings, getLanguages, getDictionaries } from './site';

export type {
  HeroSlide, MarqueeImage, TravelRouteMap, ContactOffice, LabeledRow, PageTexts, SiteSettings,
} from '../data';
export type { GlobeCity, GlobeCityTranslation } from '../type';
export type { LangInfo } from '../i18n';
