'use client';

import Image from '@/components/ui/Image';
import SlideTabs from '@/components/ui/SlideTabs';
import type { TravelRoutesBundle } from '@/lib/directus';
import type { TravelRouteMap } from '@/lib/data';
import { useI18n } from '@/app/hook/useI18n';

interface Props {
  travelRoutes?: TravelRoutesBundle;
}

interface Place {
  id: string;
  name: string;
  image: string;
}

// Used only when Directus is unreachable and the bundle's `maps` is empty,
// so the About page still renders something recognisable.
const FALLBACK_PLACES: Place[] = [
  { id: 'china', name: 'China', image: '/china-map.jpeg' },
  { id: 'america', name: 'America', image: '/america-map.jpeg' },
  { id: 'europe', name: 'Europe', image: '/europe-map.jpeg' },
];

function resolveName(map: TravelRouteMap, lang: string): string {
  const byLang = map.translations.find((t) => t.language === lang);
  if (byLang?.name) return byLang.name;
  const en = map.translations.find((t) => t.language === 'en');
  if (en?.name) return en.name;
  return map.translations[0]?.name || map.slug;
}

const FALLBACK_HEADING = 'My Travel Routes';
const FALLBACK_BODY = 'My work and curiosity have carried me across continents — from long chapters in Asia to projects spanning Europe. Every destination left something behind: a partner, a lesson, a story worth telling. Explore where I’ve been, and reach out if any of these places speak to you.';

export default function TravelRoutes({ travelRoutes }: Props) {
  const { lang } = useI18n();
  const maps = travelRoutes?.maps ?? [];
  const byLang = travelRoutes?.byLang ?? {};

  const places: Place[] =
    maps.length > 0
      ? maps.map((m) => ({ id: m.slug, name: resolveName(m, lang), image: m.image }))
      : FALLBACK_PLACES;

  const text = byLang[lang] ?? byLang['en'] ?? { heading: '', body: '' };
  const heading = text.heading || FALLBACK_HEADING;
  const body = text.body || FALLBACK_BODY;

  const slideItems = places.map((p) => ({
    id: p.id,
    label: p.name,
    content: (
      <>
        <div className="relative w-full aspect-[2/1] overflow-hidden rounded-4 bg-gray-40">
          <Image src={p.image} alt={p.name} fill className="object-cover" />
        </div>
      </>
    ),
  }));

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 bg-gray-20 px-[60px] py-[80px] max-md:px-[16px] max-md:py-[56px]">
      <div className="mx-auto max-w-[1320px]">
        <div className="flex flex-col items-center gap-[20px] text-center">
          <h2 className="text-accent">{heading}</h2>
          <p className="max-w-[640px] text-[18px] leading-[26px] font-medium text-dark">
            {body}
          </p>
        </div>
        <SlideTabs items={slideItems} className="mt-[32px]" alwaysShowTabs />
      </div>
    </div>
  );
}
