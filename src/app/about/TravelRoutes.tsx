'use client';

import { useState } from 'react';
import Image from '@/components/ui/Image';

interface Place {
  id: string;
  name: string;
  /** Placeholder picture of the area — swap for real route imagery later. */
  image: string;
}

const PLACES: Place[] = [
  { id: 'china', name: 'China', image: '/china-map.jpeg' },
  { id: 'america', name: 'America', image: '/america-map.jpeg' },
  { id: 'europe', name: 'Europe', image: '/europe-map.jpeg' },
];

export default function TravelRoutes() {
  const [active, setActive] = useState(PLACES[0].id);
  const current = PLACES.find((p) => p.id === active) ?? PLACES[0];

  return (
    // Full-bleed gray band: escapes the parent's max-width to span the viewport.
    // Safe here because scrollbars are hidden site-wide (no 100vw scrollbar gap).
    <div className="relative left-1/2 w-screen -translate-x-1/2 bg-gray-20 px-[60px] py-[80px]">
      {/* Inner content capped at the site-wide 1320px and centered. */}
      <div className="mx-auto max-w-[1320px]">
        {/* Heading + copy — centered, 20px apart. */}
        <div className="flex flex-col items-center gap-[20px] text-center">
          <h2 className="text-accent">My Travel Routes</h2>
          <p className="max-w-[640px] text-[18px] leading-[26px] font-medium text-dark">
            My work and curiosity have carried me across continents — from long chapters in Asia
            to projects spanning Europe. Every destination left something behind: a partner, a
            lesson, a story worth telling. Explore where I&rsquo;ve been, and reach out if any of
            these places speak to you.
          </p>
        </div>

        {/* Place tabs. */}
        <div className="mt-[32px] flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full bg-white p-1.5">
            {PLACES.map((p) => {
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

        {/* Picture of the selected place. */}
        <div className="mt-[32px]">
          <div className="feathered-image-gray relative w-full aspect-[2/1] overflow-hidden rounded-4 bg-gray-40">
            <Image src={current.image} alt={current.name} fill className="object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
