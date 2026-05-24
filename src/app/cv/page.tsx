import { getPageTexts } from '@/lib/directus';
import CVContent from './CVContent';

export default async function CVPage() {
  const texts = await getPageTexts('about');
  return <CVContent texts={texts} />;
}
