'use client';

import { useState } from 'react';
import Image from '@/components/ui/Image';
import type { TravelRouteMap } from '@/lib/data';
import { useI18n } from '@/app/hook/useI18n';

interface Props {
  maps?: TravelRouteMap[];
  heading?: string;
  body?: string;
}

interface Place {
  id: string;
  name: string;
  image: string;
}

// Used only when Directus is unreachable and `maps` comes back empty, so the
// About page still renders something recognisable.
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
const FALLBACK_BODY =
  'My work and curiosity have carried me across continents — from long chapters in Asia to projects spanning Europe. Every destination left something behind: a partner, a lesson, a story worth telling. Explore where I’ve been, and reach out if any of these places speak to you.';

export default function TravelRoutes({ maps = [], heading: headingProp, body: bodyProp }: Props) {
  const { lang } = useI18n();

  const places: Place[] =
    maps.length > 0
      ? maps.map((m) => ({ id: m.slug, name: resolveName(m, lang), image: m.image }))
      : FALLBACK_PLACES;

  const heading = headingProp || FALLBACK_HEADING;
  const body = bodyProp || FALLBACK_BODY;

  const [active, setActive] = useState(places[0].id);
  const current = places.find((p) => p.id === active) ?? places[0];

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 bg-gray-20 px-[60px] py-[80px] max-md:px-[16px] max-md:py-[56px]">
      <div className="mx-auto max-w-[1320px]">
        <div className="flex flex-col items-center gap-[20px] text-center">
          <h2 className="text-accent">{heading}</h2>
          <p className="max-w-[640px] text-[18px] leading-[26px] font-medium text-dark">
            {body}
          </p>
        </div>

        <div className="mt-[32px] flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full bg-white p-1.5">
            {places.map((p) => {
              const isActive = p.id === active;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActive(p.id)}
                  aria-pressed={isActive}
                  className={`rounded-full px-7 py-1.5 text-[16px] font-medium transition-colors ${isActive ? 'bg-brand text-white' : 'text-gray-80 hover:text-dark'
                    }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-[32px]">
          <div className="relative w-full aspect-[2/1] overflow-hidden rounded-4 bg-gray-40">
            <Image src={current.image} alt={current.name} fill className="object-cover" />
          </div>
          {/* Mobile + tablet (<lg): full-screen-width, complete map. */}
          <div className="relative left-1/2 w-screen -translate-x-1/2 bg-gray-40 lg:hidden">
            <Image src={current.image} alt={current.name} className="block w-full h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
