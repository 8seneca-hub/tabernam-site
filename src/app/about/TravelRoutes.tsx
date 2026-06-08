'use client';

import { useState } from 'react';
import Image from '@/components/ui/Image';
import type { PageTexts, TravelRouteMap } from '@/lib/data';

interface Props {
  texts: PageTexts;
  maps?: TravelRouteMap[];
}

interface Place {
  id: string;
  name: string;
  image: string;
}

const FALLBACK_IMAGES: Record<string, string> = {
  china: '/china-map.jpeg',
  america: '/america-map.jpeg',
  europe: '/europe-map.jpeg',
};

const FALLBACK_NAMES: Record<string, string> = {
  china: 'China',
  america: 'America',
  europe: 'Europe',
};

export default function TravelRoutes({ texts, maps = [] }: Props) {
  const imageBySlug = new Map(maps.map((m) => [m.slug, m.image]));

  const places: Place[] = ['china', 'america', 'europe'].map((slug) => ({
    id: slug,
    name: texts[`travel_routes_${slug}_name`] || FALLBACK_NAMES[slug],
    image: imageBySlug.get(slug) || FALLBACK_IMAGES[slug],
  }));

  const heading = texts.travel_routes_heading || 'My Travel Routes';
  const body =
    texts.travel_routes_body ||
    'My work and curiosity have carried me across continents — from long chapters in Asia to projects spanning Europe. Every destination left something behind: a partner, a lesson, a story worth telling. Explore where I’ve been, and reach out if any of these places speak to you.';

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
                  className={`rounded-full px-7 py-2.5 text-[16px] font-medium transition-colors ${
                    isActive ? 'bg-brand text-white' : 'text-gray-80 hover:text-dark'
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
        </div>
      </div>
    </div>
  );
}
