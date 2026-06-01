import { getActivities, getHeroSlides, getPageTexts } from '@/lib/directus';
import HeroSection from '@/components/hero/HeroSection';
import QuoteSection from '@/components/quote/QuoteSection';
import HomeMarquee from '@/components/HomeMarquee';
import GlobeSection from '@/components/activity/GlobeSection';
import AboutSection from '../components/activity/AboutSection';

export default async function HomePage() {

  const [activities, heroSlides, texts] = await Promise.all([
    getActivities(),
    getHeroSlides(),
    getPageTexts('home'),
  ]);

  const quoteImage = texts.en?.quote_image ?? '';

  return (
    <main>
      <HeroSection slides={heroSlides} />
      <QuoteSection imageUrl={quoteImage} />
      <AboutSection texts={texts} />
      <HomeMarquee />
      <GlobeSection cities={activities} />
    </main>
  );
}
