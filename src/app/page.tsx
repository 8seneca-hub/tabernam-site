import { getActivities, getHeroSlides, getDictionaries } from '@/lib/directus';
import HeroSection from '@/components/hero/HeroSection';
import QuoteSection from '@/components/quote/QuoteSection';
import HomeMarquee from '@/components/HomeMarquee';
import GlobeActivitySection from '@/components/activity/GlobeActivitySection';

export default async function HomePage() {
  const [activities, heroSlides, dicts] = await Promise.all([
    getActivities(),
    getHeroSlides(),
    getDictionaries(),
  ]);

  const quoteEn = dicts.en?.['quote.primary'] ?? '';
  // quote.secondary stores the Chinese line; prod has no zh language, so it
  // lives in the en row (matches schema's "Chinese by default" convention).
  const quoteZh = dicts.en?.['quote.secondary'] ?? '';

  return (
    <main>
      <HeroSection slides={heroSlides} />
      <QuoteSection en={quoteEn} zh={quoteZh} />
      <HomeMarquee />
      <GlobeActivitySection cities={activities} />
    </main>
  );
}
