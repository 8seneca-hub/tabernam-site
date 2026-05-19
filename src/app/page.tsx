import Script from 'next/script';
import { getActivities, getHeroSlides, getPageTexts, getFeatures } from '@/lib/directus';
import HeroSection from '@/components/hero/HeroSection';
import QuoteSection from '@/components/quote/QuoteSection';
import ActivitySection from '@/components/activity/ActivitySection';

export default async function HomePage() {
  const [activities, heroSlides, texts, features] = await Promise.all([
    getActivities(),
    getHeroSlides(),
    getPageTexts('home'),
    getFeatures(),
  ]);

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/globe.gl@2"
        strategy="beforeInteractive"
      />
      <main>
        <HeroSection texts={texts} />
        <QuoteSection texts={texts} features={features} />
        <ActivitySection activities={activities} />
      </main>
    </>
  );
}
