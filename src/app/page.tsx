import { getActivities, getGlobeText, getHeroSlides, getHeroText, getHomeAbout, getHomeMarquee, getMap, getQuote } from '@/lib/directus';
import HeroSection from '@/app/home/HeroSection';
import QuoteSection from '@/app/home/QuoteSection';
import HomeMarquee from '@/app/home/HomeMarquee';
import GlobeSection from '@/app/home/globe/GlobeSection';
import HomeAbout from './home/HomeAbout';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tabernam.at';

const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Tabernam',
  url: SITE_URL,
  logo: `${SITE_URL}/tabernam-logo.png`,
  founder: {
    '@type': 'Person',
    name: 'Tibor Buček',
    jobTitle: 'Founder & Director',
  },
  description:
    'Foreign-trade consulting and project work focused on Asia–Europe relations.',
  sameAs: [] as string[],
};

const PERSON_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Tibor Buček',
  jobTitle: 'Director & Owner, Tabernam s.r.o.',
  url: SITE_URL,
  worksFor: { '@type': 'Organization', name: 'Tabernam' },
  description:
    'Four decades of foreign-trade work between Slovakia, China and the wider world.',
};

export default async function HomePage() {

  const [activities, marqueeImages, heroSlides, heroText, quote, globeText, map, homeAbout] = await Promise.all([
    getActivities(),
    getHomeMarquee(),
    getHeroSlides(),
    getHeroText(),
    getQuote(),
    getGlobeText(),
    getMap(),
    getHomeAbout(),
  ]);

  return (
    <main className="home-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSONLD) }}
      />
      <HeroSection slides={heroSlides} text={heroText} />
      <QuoteSection quote={quote} />
      <HomeAbout homeAbout={homeAbout} />
      <HomeMarquee images={marqueeImages} />
      <GlobeSection cities={activities} globeText={globeText} map={map} />
    </main>
  );
}
