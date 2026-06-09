import { getActivities, getHeroSlides, getHomeMarquee, getHomeTexts } from '@/lib/directus';
import HeroSection from '@/components/hero/HeroSection';
import QuoteSection from '@/components/quote/QuoteSection';
import HomeMarquee from '@/components/home/component/HomeMarquee';
import GlobeSection from '@/components/home/globe/GlobeSection';
import AboutSection from '../components/home/AboutSection';

export default async function HomePage() {

  const [activities, heroSlides, marqueeImages, texts] = await Promise.all([
    getActivities(),
    getHeroSlides(),
    getHomeMarquee(),
    getHomeTexts(),
  ]);

  const quoteImage = texts.en?.quote_image ?? '';

  return (
    <main className="home-page">
      <HeroSection slides={heroSlides} />
      <QuoteSection imageUrl={quoteImage} />
      <AboutSection texts={texts} />
      <HomeMarquee images={marqueeImages} />
      <GlobeSection cities={activities} />
    </main>
  );
}
