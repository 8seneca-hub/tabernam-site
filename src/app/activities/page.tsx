import { getPageTexts } from '@/lib/directus';
import ActivityContent from './ActivityContent';

export default async function ActivitiesPage() {
  const texts = await getPageTexts('activity');
  return <ActivityContent texts={texts} />;
}
