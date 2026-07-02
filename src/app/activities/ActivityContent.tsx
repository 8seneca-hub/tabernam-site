'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { useI18n } from '@/app/hook/useI18n';
import { pickTranslation } from '@/lib/directus';
import MediaSlider, { type MediaSlide } from '@/components/ui/MediaSlider';
import type { GlobeCity } from '@/lib/type';

interface Props {
  cities: GlobeCity[];
}

export default function ActivityContent({ cities }: Props) {
  const { lang } = useI18n();
  const params = useSearchParams();
  const id = params?.get('id') ?? '';
  const city = cities.find((c) => c.slug === id);
  const citySlug = city?.slug;

  useEffect(() => {
    if (!citySlug) return;
    posthog.capture('activity_page_viewed', {
      city_slug: citySlug,
      language: lang,
    });
  }, [citySlug, lang]);

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
  const slides: MediaSlide[] = photos.map((src, i) => ({
    type: 'image' as const,
    src,
    alt: `${name} — ${i + 1}`,
  }));

  return (
    <main className="pt-[var(--header-height)] pb-[120px]">
      {/* Hero — heading + description, same treatment as the About / Contact heroes. */}
      <section className="px-[60px] py-20 max-md:px-[16px] max-[1025px]:pb-0">
        <div className="max-w-[1320px] mx-auto w-full flex flex-col gap-[30px] pt-[20px]">
          <h1 className="text-5xl md:text-6xl font-bold text-brand tracking-tight leading-tight max-md:text-4xl">{name}</h1>
          {desc && (
            <p className="text-[20px] font-medium tracking-[-0.02rem] text-dark leading-relaxed max-w-[760px]">
              {desc}
            </p>
          )}
        </div>
      </section>

      {slides.length > 0 && (
        <section className="px-[60px] max-md:px-[16px]">
          <MediaSlider slides={slides} className="max-w-[1320px] mx-auto" />
        </section>
      )}
    </main>
  );
}
