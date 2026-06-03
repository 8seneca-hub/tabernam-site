import { getPageTexts } from '@/lib/directus';
import AboutContent from './AboutContent';

export default async function AboutPage() {
  const [texts, homeTexts] = await Promise.all([
    getPageTexts('about'),
    getPageTexts('home'),
  ]);
  // Use the same portrait as the homepage quote section (CMS `quote_image`).
  const heroImage = homeTexts.en?.quote_image || '/tibor_image.png';
  return <AboutContent texts={texts} heroImage={heroImage} />;
}
