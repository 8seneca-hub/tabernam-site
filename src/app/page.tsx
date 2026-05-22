import { getHeroSlides, getPageTexts, getFeatures } from '@/lib/directus';
import HeroSection from '@/components/hero/HeroSection';
import QuoteSection from '@/components/quote/QuoteSection';
import HomeMarquee from '@/components/HomeMarquee';
import GlobeActivitySection from '@/components/activity/GlobeActivitySection';

export default async function HomePage() {
  const [heroSlides, texts, features] = await Promise.all([
    getHeroSlides(),
    getPageTexts('home'),
    getFeatures(),
  ]);

  return (
    <main>
      <HeroSection texts={texts} />
      <QuoteSection texts={texts} features={features} />
      <HomeMarquee />
      <GlobeActivitySection />
    </main>
  );
}
