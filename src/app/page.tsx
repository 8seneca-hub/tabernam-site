import { getHeroSlides, getPageTexts, getFeatures } from '@/lib/directus';
import HeroSection from '@/components/hero/HeroSection';
import QuoteSection from '@/components/quote/QuoteSection';
import HomeMarquee from '@/components/HomeMarquee';

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
      <section className="globe-section relative w-full h-[140vh] bg-black">
        <iframe
          src="/globe-v2.html"
          title="Explore destinations"
          className="absolute inset-x-0 top-0 w-full h-screen border-0 block"
        />
      </section>
    </main>
  );
}
