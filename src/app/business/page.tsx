import { getPageTexts } from '@/lib/directus';
import BusinessContent from './BusinessContent';

export default async function BusinessPage() {
  const texts = await getPageTexts('business');
  return <BusinessContent texts={texts} />;
}
