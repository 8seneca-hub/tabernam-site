'use client';

import type { ReactNode } from 'react';
import Image from '@/components/ui/Image';
import MottoQuote from '@/components/MottoQuote';

interface Props {
  heading: string;
  image: string;
  imageAlt?: string;
  children: ReactNode;
}

/**
 * Shared hero layout for sub-pages (About, Contact). Distinct from the homepage
 * hero, but reuses its gray-20 → white gradient fill.
 *
 * - Content capped at 1320px (site-wide max width), 60px left/right padding.
 * - Two columns: text takes 55% of the frame, the image fills the rest.
 * - 40px spacing between content (column gap + the left-column stack).
 * - Image is a 3:4 portrait that fills its frame, with the brand feather edge.
 */
export default function SubpageHero({ heading, image, imageAlt = '', children }: Props) {
  return (
    <section className="px-[60px] py-20 max-md:px-[40px]">
      <div className="max-w-[1320px] mx-auto flex flex-col gap-[80px] lg:flex-row lg:items-start">
        {/* Text column — fills the remaining width on large screens. */}
        <div className="w-full lg:flex-1 flex flex-col gap-[30px] pt-[20px]">
          <h1 className="text-5xl md:text-6xl font-bold text-brand tracking-tight leading-tight max-md:text-4xl">
            {heading}
          </h1>
          {children}
        </div>

        {/* Image column — fixed 45% of the frame; square portrait + motto. */}
        <div className="w-full lg:w-[45%] max-lg:max-w-[440px] max-lg:mx-auto">
          <div className="feathered-image relative aspect-square rounded-4 overflow-hidden bg-surface">
            <Image src={image} alt={imageAlt} fill priority className="object-cover" />
          </div>
          <MottoQuote />
        </div>
      </div>
    </section>
  );
}
