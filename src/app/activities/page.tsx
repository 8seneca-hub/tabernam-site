import { Suspense } from 'react';
import { getActivities } from '@/lib/directus';
import ActivityContent from './ActivityContent';

export default async function ActivitiesPage() {
  const cities = await getActivities();
  return (
    <Suspense fallback={null}>
      <ActivityContent cities={cities} />
    </Suspense>
  );
}
