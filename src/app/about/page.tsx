import { getAboutTexts, getTravelRouteMaps } from '@/lib/directus';
import AboutContent from './AboutContent';

export default async function AboutPage() {
  const [texts, travelRouteMaps] = await Promise.all([
    getAboutTexts(),
    getTravelRouteMaps(),
  ]);
  const heroImage = texts.en?.portrait_image || '/tibor_image.png';
  return <AboutContent texts={texts} heroImage={heroImage} travelRouteMaps={travelRouteMaps} />;
}
