import { getCvTexts } from '@/lib/directus';
import CVContent from './CVContent';

export default async function CVPage() {
  const texts = await getCvTexts();
  return <CVContent texts={texts} />;
}
