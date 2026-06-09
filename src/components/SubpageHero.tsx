'use client';

import type { ReactNode } from 'react';
import Image from '@/components/ui/Image';
import MottoQuote from '@/components/MottoQuote';

interface Props {
  heading: string;
  /** Small label rendered above the heading. */
  eyebrow?: string;
  /** Secondary line rendered below the heading (e.g. a person's name). */
  subheading?: string;
  image: string;
  imageAlt?: string;
  children: ReactNode;
}

export default function SubpageHero({ heading, eyebrow, subheading, image, imageAlt = '', children }: Props) {
  return (
    <section className="px-[60px] py-20 max-md:px-[16px] max-[1025px]:pb-0">
      <div className="max-w-[1320px] mx-auto flex flex-col gap-[80px] lg:flex-row lg:items-start">
        <div className="w-full lg:flex-1 flex flex-col gap-[30px] pt-[20px]">
          <div className="flex flex-col gap-[12px]">
            {eyebrow && (
              <span className="text-sm font-semibold text-brand uppercase tracking-[0.2em]">
                {eyebrow}
              </span>
            )}
            <h1 className="text-5xl md:text-6xl font-bold text-brand tracking-tight leading-tight max-md:text-4xl">
              {heading}
            </h1>
            {subheading && (
              <span className="text-2xl md:text-3xl font-medium text-text">
                {subheading}
              </span>
            )}
          </div>
          {children}
        </div>

        {/* Image column — fixed 45% of the frame; square portrait + motto. */}
        <div className="w-full lg:w-[45%] max-lg:max-w-[440px] max-lg:mx-auto">
          <div className="feathered-image relative rounded-6 overflow-hidden bg-surface">
            <Image src={image} alt={imageAlt} priority className="w-full h-auto" />
          </div>
          <MottoQuote />
        </div>
      </div>
    </section>
  );
}
