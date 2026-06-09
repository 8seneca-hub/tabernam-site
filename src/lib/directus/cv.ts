import { composePageBundle, type PageTextsBundle } from './pages';

export function getCvTexts(): Promise<PageTextsBundle> {
  return composePageBundle('cv');
}
