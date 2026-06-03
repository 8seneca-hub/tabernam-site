'use client';

import { useSearchParams } from 'next/navigation';
import { useI18n } from '@/app/hook/useI18n';
import { pickTranslation } from '@/lib/directus';
import type { GlobeCity } from '@/lib/type';

interface Props {
  cities: GlobeCity[];
}

export default function ActivityContent({ cities }: Props) {
  const { lang } = useI18n();
  const params = useSearchParams();
  const id = params?.get('id') ?? '';
  const city = cities.find((c) => c.slug === id);

  if (!city) {
    return (
      <main className="w-[706px] max-w-[calc(100%-80px)] mx-auto pt-[109px] pb-[120px] flex flex-col gap-10">
        <h1 className="text-5xl font-medium text-text">City not found</h1>
        <p className="text-base leading-normal text-text">
          We couldn&apos;t find a city for <code>?id={id || '(empty)'}</code>. Try selecting one from the globe.
        </p>
      </main>
    );
  }

  const tr = pickTranslation(city, lang);
  const name = tr.name || city.slug;
  const desc = tr.description || '';
  const photos = city.photos ?? [];
  const secondary = photos[0];
  const gallery = photos.slice(1);

  return (
    <main className="pt-[109px] pb-[120px] flex flex-col gap-10">
      {secondary && (
        <div className="w-full max-w-[1200px] mx-auto px-[var(--side-padding)]">
          <div className="feathered-image w-full aspect-[16/9] rounded-3 overflow-hidden bg-gray-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-full h-full object-cover" src={secondary} alt={name} />
          </div>
        </div>
      )}

      <article className="w-[706px] max-w-[calc(100%-80px)] mx-auto flex flex-col gap-4">
        <h1 className="text-5xl font-medium text-text">{name}</h1>
        <p className="text-base leading-normal text-text">{desc}</p>

        {gallery.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-4 max-md:grid-cols-1">
            {gallery.map((src) => (
              <div key={src} className="feathered-image-sm w-full aspect-[16/9] rounded-t-2 rounded-b-none overflow-hidden bg-gray-40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-full h-full object-cover" src={src} alt={name} />
              </div>
            ))}
          </div>
        )}
      </article>
    </main>
  );
}
