'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import type { HeroSlide } from '@/lib/data';
import type { HeroTextBundle } from '@/lib/directus';
import { useI18n } from '@/app/hook/useI18n';

interface Props {
  slides?: HeroSlide[];
  text?: HeroTextBundle;
}

const FALLBACK_SLIDES: HeroSlide[] = [
  { image: '/carousel/photo-08.jpg', alt: '' },
  { image: '/carousel/photo-20.jpg', alt: '' },
  { image: '/carousel/photo-22.jpg', alt: '' },
];

const FALLBACK_TEXT = {
  title: 'Tabernam',
  body: '',
};

const SLIDE_INTERVAL = 5000;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.7, ease: [0.22, 0.61, 0.36, 1] as const },
  }),
};

export default function HeroSection({ slides, text }: Props) {
  const { lang } = useI18n();
  const items = slides && slides.length > 0 ? slides : FALLBACK_SLIDES;
  const [activeIndex, setActiveIndex] = useState(0);

  const langText = text?.[lang];
  const enText = text?.['en'];
  const resolved =
    (langText && langText.title ? langText : null) ??
    (enText && enText.title ? enText : null) ??
    FALLBACK_TEXT;

  useEffect(() => {
    if (items.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, SLIDE_INTERVAL);
    return () => window.clearInterval(id);
  }, [items.length]);

  return (
    <section className="hero relative" style={{ paddingBottom: '60px' }}>
      <div className="bg-bg px-[40px] max-md:px-[16px] pt-[250px] pb-[200px] max-[1025px]:pt-[150px] max-[1025px]:pb-[60px]">
        <div className="w-full max-w-[1320px] mx-auto flex flex-col items-center">
          <div className="flex flex-col items-center gap-[30px] text-center">
            <motion.h1
              className="text-[64px] font-bold tracking-[-0.03em] leading-[52px] text-brand max-[1100px]:text-[48px] max-[1100px]:leading-[44px] max-md:text-[36px] max-md:leading-[36px]"
              custom={0.1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              {resolved.title}
            </motion.h1>
            <motion.p
              className="text-[28px] leading-[32px] max-md:text-[24px] max-md:leading-[28px] tracking-[-0.03em] font-medium text-text w-0 min-w-full"
              custom={0.2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              {resolved.body}
            </motion.p>
          </div>
        </div>
      </div>

      <div className="px-[40px] max-md:px-[16px]">
        <div className="feathered-image relative w-full max-w-[1320px] mx-auto aspect-[16/9] rounded-6 overflow-hidden bg-surface">
          {items.map((slide, idx) => (
            <div
              key={slide.image}
              aria-hidden={idx !== activeIndex}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-[600ms] ease-in-out"
              style={{
                backgroundImage: `url('${slide.image}')`,
                opacity: idx === activeIndex ? 1 : 0,
              }}
              aria-label={slide.alt || undefined}
            />
          ))}
          {items.length > 1 && (
            <div
              className="absolute bottom-[14px] left-1/2 -translate-x-1/2 z-[3] flex gap-1 pointer-events-none"
              aria-hidden="true"
            >
              {items.map((slide, idx) => (
                <span
                  key={slide.image}
                  className="w-[30px] h-[2px] rounded-full transition-[background] duration-300"
                  style={{
                    background:
                      idx === activeIndex
                        ? 'rgba(255,255,255,0.85)'
                        : 'rgba(255,255,255,0.28)',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
