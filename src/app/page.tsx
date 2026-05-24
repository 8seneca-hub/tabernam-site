import { getActivities, getHeroSlides } from '@/lib/directus';
import HeroSection from '@/components/hero/HeroSection';
import QuoteSection from '@/components/quote/QuoteSection';
import HomeMarquee from '@/components/HomeMarquee';
import GlobeActivitySection from '@/components/activity/globe';

export default async function HomePage() {
  const [activities, heroSlides] = await Promise.all([
    getActivities(),
    getHeroSlides(),
  ]);

  return (
    <main>
      <HeroSection slides={heroSlides} />
      <QuoteSection />
      <HomeMarquee />
      <GlobeActivitySection cities={activities} />
    </main>
  );
}
