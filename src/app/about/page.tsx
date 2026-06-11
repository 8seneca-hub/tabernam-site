import { getAboutBody, getAboutHeader, getClosingQuote, getTravelRoutes } from '@/lib/directus';
import AboutContent from './AboutContent';

export default async function AboutPage() {
  const [travelRoutes, aboutHeader, aboutBody, closingQuote] = await Promise.all([
    getTravelRoutes(),
    getAboutHeader(),
    getAboutBody(),
    getClosingQuote(),
  ]);
  return (
    <AboutContent
      aboutHeader={aboutHeader}
      aboutBody={aboutBody}
      closingQuote={closingQuote}
      travelRoutes={travelRoutes}
    />
  );
}
