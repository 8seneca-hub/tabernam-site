import { getAboutBody, getAboutHeader, getClosingQuote, getTravelRoutes } from '@/lib/directus';
import { isChinaVisitor } from '@/lib/geo';
import AboutContent from './AboutContent';

export default async function AboutPage() {
  const [travelRoutes, aboutHeader, aboutBody, closingQuote, isChina] = await Promise.all([
    getTravelRoutes(),
    getAboutHeader(),
    getAboutBody(),
    getClosingQuote(),
    isChinaVisitor(),
  ]);
  return (
    <AboutContent
      aboutHeader={aboutHeader}
      aboutBody={aboutBody}
      closingQuote={closingQuote}
      travelRoutes={travelRoutes}
      isChina={isChina}
    />
  );
}
