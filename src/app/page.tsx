import Script from 'next/script';
import { getBusinesses, getHeroSlides, getPageTexts } from '@/lib/directus';
import HeroSection from '@/components/HeroSection';
import QuoteSection from '@/components/QuoteSection';
import ActivitySection from '@/components/ActivitySection';

export default async function HomePage() {
  const [businesses, heroSlides, texts] = await Promise.all([
    getBusinesses(),
    getHeroSlides(),
    getPageTexts('home'),
  ]);

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/globe.gl@2"
        strategy="beforeInteractive"
      />
      <main>
        <HeroSection texts={texts} />
        <QuoteSection texts={texts} />
        <ActivitySection businesses={businesses} />
      </main>
    </>
  );
}
