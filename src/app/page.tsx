import { getActivities, getGlobe, getHero, getHomeAbout, getHomeMarquee, getQuote } from '@/lib/directus';
import HeroSection from '@/app/home/HeroSection';
import QuoteSection from '@/app/home/QuoteSection';
import HomeMarquee from '@/app/home/HomeMarquee';
import GlobeSection from '@/app/home/globe/GlobeSection';
import HomeAbout from './home/HomeAbout';

export default async function HomePage() {

  const [activities, marqueeImages, hero, quote, globe, homeAbout] = await Promise.all([
    getActivities(),
    getHomeMarquee(),
    getHero(),
    getQuote(),
    getGlobe(),
    getHomeAbout(),
  ]);

  return (
    <main className="home-page">
      <HeroSection hero={hero} />
      <QuoteSection quote={quote} />
      <HomeAbout homeAbout={homeAbout} />
      <HomeMarquee images={marqueeImages} />
      <GlobeSection cities={activities} globe={globe} />
    </main>
  );
}
