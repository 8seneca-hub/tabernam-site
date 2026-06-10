import { getAboutBody, getAboutHeader, getClosingQuote, getTravelRouteMaps } from '@/lib/directus';
import AboutContent from './AboutContent';

export default async function AboutPage() {
  const [travelRouteMaps, aboutHeader, aboutBody, closingQuote] = await Promise.all([
    getTravelRouteMaps(),
    getAboutHeader(),
    getAboutBody(),
    getClosingQuote(),
  ]);
  return (
    <AboutContent
      aboutHeader={aboutHeader}
      aboutBody={aboutBody}
      closingQuote={closingQuote}
      travelRouteMaps={travelRouteMaps}
    />
  );
}
