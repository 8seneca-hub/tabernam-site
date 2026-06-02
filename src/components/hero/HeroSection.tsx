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
    <section
      className="hero px-[40px]"
      style={{
        paddingTop: '200px',
        paddingBottom: '60px',
      }}
    >
      {/* Inner frame: text + image stack, full-width respecting the section's
          40px side padding. */}
      <div className="w-full flex flex-col items-center gap-[120px]">
        {/* Title + description block.
            Title:       64px / leading 52px / -3% tracking / bold per spec.
            Description: 28px / leading 36px / -3% tracking / light per spec. */}
        <div className="flex flex-col items-center gap-[30px] w-full text-center">
          <motion.h1
            className="text-[45px] font-bold tracking-[-0.04em] leading-[72px] text-white max-[1100px]:text-[40px] max-md:text-[32px] max-sm:text-[30px]"
            custom={0.1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            For decades of foreign trade
          </motion.h1>
          <motion.p
            className="text-[28px] leading-[36px] tracking-[-0.03em] font-light text-text w-full max-w-[700px] max-md:text-[20px] max-md:leading-[28px]"
            custom={0.2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            A trusted bridge between Slovakia and China, Vietnam, Germany, US, France, Laos, Singapore, Russia, Ukraine, Kazakhstan, Kenya and other countries
          </motion.p>
        </div>

        {/* Image / slideshow — 16:9 aspect, full-width, rounded corners.
            All slides are stacked; the active one cross-fades in via opacity. */}
        <div className="feathered-image relative w-full aspect-[16/9] rounded-[50px] overflow-hidden bg-surface">
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

          {items.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-1 rounded-full bg-white transition-all duration-300 ${idx === activeIndex ? 'w-10 opacity-100' : 'w-5 opacity-60'
                    }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
