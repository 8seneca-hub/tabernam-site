import { getPageTexts } from '@/lib/directus';
import AboutContent from './AboutContent';

export default async function AboutPage() {
  const texts = await getPageTexts('about');
  return <AboutContent texts={texts} />;
}
