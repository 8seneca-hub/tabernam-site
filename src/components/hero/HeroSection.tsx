'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import type { HeroSlide } from '@/lib/directus';

interface Props {
  slides?: HeroSlide[];
}

const FALLBACK_SLIDES: HeroSlide[] = [
  { image: '/carousel/photo-08.jpg', alt: '' },
  { image: '/carousel/photo-20.jpg', alt: '' },
  { image: '/carousel/photo-22.jpg', alt: '' },
];

const SLIDE_INTERVAL = 5000;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.7, ease: [0.22, 0.61, 0.36, 1] as const },
  }),
};

export default function HeroSection({ slides }: Props) {
  const items = slides && slides.length > 0 ? slides : FALLBACK_SLIDES;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, SLIDE_INTERVAL);
    return () => window.clearInterval(id);
  }, [items.length]);

  const current = items[activeIndex] ?? items[0];

  return (
    <section className="hero relative" style={{ paddingBottom: '60px' }}>
      {/* Top region — full-bleed gradient backdrop. It contains the header-clearance
          padding (pt), the hero text, and the gap (pb), so it auto-sizes to its own
          content; its bottom edge therefore always lands exactly at the top of the
          image regardless of how the text wraps at different screen sizes. The
          gradient fades from a soft brand tint at the page top down to the page
          background where the image begins. */}
      <div className="bg-gradient-to-b from-gray-20 to-white px-[40px] max-md:px-[16px] pt-[250px] pb-[200px] max-[1025px]:pt-[150px] max-[1025px]:pb-[60px]">
        {/* Centering frame, capped at 1320px to align with the other sections. */}
        <div className="w-full max-w-[1320px] mx-auto flex flex-col items-center">
          {/* Title + description block — hugs content so the body wraps to the
              title's width.
              Title:       64px / leading 52px / -3% tracking / bold per spec.
              Description: 28px / leading 32px / -3% tracking / medium per spec. */}
          <div className="flex flex-col items-center gap-[30px] text-center">
            <motion.h1
              className="text-[64px] font-bold tracking-[-0.03em] leading-[52px] text-brand max-[1100px]:text-[48px] max-[1100px]:leading-[44px] max-md:text-[36px] max-md:leading-[36px]"
              custom={0.1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              For decades of foreign trade
            </motion.h1>
            <motion.p
              className="text-[28px] leading-[32px] max-md:text-[24px] max-md:leading-[28px] tracking-[-0.03em] font-medium text-text w-0 min-w-full"
              custom={0.2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              A trusted bridge between Slovakia and China, Vietnam, Germany, US, France, Laos, Singapore, Russia, Ukraine, Kazakhstan, Kenya and other countries
            </motion.p>
          </div>
        </div>
      </div>

      {/* Image / slideshow — 16:9 aspect, full-width, rounded corners.
          All slides are stacked; the active one cross-fades in via opacity. */}
      <div className="px-[40px] max-md:px-[16px]">
        <div className="feathered-image relative w-full max-w-[1320px] mx-auto aspect-[16/9] rounded-6 overflow-hidden bg-surface">
          {items.map((slide, idx) => (
            <div
              key={slide.image}
              aria-hidden={idx !== activeIndex}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
              style={{
                backgroundImage: `url('${slide.image}')`,
                opacity: idx === activeIndex ? 1 : 0,
              }}
              aria-label={slide.alt || undefined}
            />
          ))}

        </div>
      </div>
    </section>
  );
}
