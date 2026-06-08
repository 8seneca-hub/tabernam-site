'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '@/app/hook/useI18n';
import { pickTranslation } from '@/lib/directus';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from '@/components/ui/Image';
import type { GlobeCity } from '@/lib/type';

interface Props {
  cities: GlobeCity[];
}

export default function ActivityContent({ cities }: Props) {
  const { lang } = useI18n();
  const params = useSearchParams();
  const id = params?.get('id') ?? '';
  const city = cities.find((c) => c.slug === id);
  const [index, setIndex] = useState(0);

  if (!city) {
    return (
      <main className="pt-[var(--header-height)] pb-[120px] px-[60px] max-md:px-[16px]">
        <div className="max-w-[1320px] mx-auto pt-10 flex flex-col gap-6">
          <h1 className="text-brand tracking-tight">City not found</h1>
          <p className="text-[18px] leading-[26px] font-medium text-dark">
            We couldn&apos;t find a city for <code>?id={id || '(empty)'}</code>. Try selecting one from the globe.
          </p>
        </div>
      </main>
    );
  }

  const tr = pickTranslation(city, lang);
  const name = tr.name || city.slug;
  const desc = tr.description || '';
  const photos = city.photos ?? [];
  const last = photos.length - 1;

  return (
    <main className="pt-[var(--header-height)] pb-[120px]">
      {/* Hero — heading + description, same treatment as the About / Contact heroes. */}
      <section className="px-[60px] py-20 max-md:px-[16px] min-h-[50vh] flex items-center">
        <div className="max-w-[1320px] mx-auto w-full flex flex-col gap-[30px]">
          <h1 className="text-brand tracking-tight">{name}</h1>
          {desc && (
            <p className="text-[20px] font-medium tracking-[-0.02rem] text-dark leading-relaxed max-w-[760px]">
              {desc}
            </p>
          )}
        </div>
      </section>

      {/* Image slider — one image per view, chevrons switch between them. */}
      {photos.length > 0 && (
        <section className="px-[60px] max-md:px-[16px]">
          <div className="max-w-[1320px] mx-auto relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${index * 100}%)` }}
              >
                {photos.map((src, i) => (
                  <div
                    key={i}
                    className="feathered-image relative w-full shrink-0 aspect-[16/9] rounded-6 overflow-hidden bg-surface"
                  >
                    <Image fill className="object-cover" src={src} alt={`${name} — ${i + 1}`} />
                  </div>
                ))}
              </div>
            </div>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  disabled={index === 0}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.18)] flex items-center justify-center text-text hover:text-brand transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={() => setIndex((i) => Math.min(last, i + 1))}
                  disabled={index === last}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.18)] flex items-center justify-center text-text hover:text-brand transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={22} />
                </button>

                {/* Dots */}
                <div className="mt-6 flex justify-center gap-2">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Go to image ${i + 1}`}
                      className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-brand' : 'w-2 bg-gray-60'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
