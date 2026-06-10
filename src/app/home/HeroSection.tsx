'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import type { HeroSlide, HeroBundle } from '@/lib/directus';
import { useI18n } from '@/app/hook/useI18n';

interface Props {
  hero?: HeroBundle;
}

const FALLBACK_SLIDES: HeroSlide[] = [
  { image: '/carousel/photo-08.jpg', alt: '' },
  { image: '/carousel/photo-20.jpg', alt: '' },
  { image: '/carousel/photo-22.jpg', alt: '' },
];

// Last-resort English fallback if Directus is unreachable AND no English row
// was loaded. The hardcoded values previously lived in i18n.ts as dictionary
// entries — we keep them here so the section never renders empty.
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

export default function HeroSection({ hero }: Props) {
  const { lang } = useI18n();
  const items = hero?.slides && hero.slides.length > 0 ? hero.slides : FALLBACK_SLIDES;
  const [activeIndex, setActiveIndex] = useState(0);

  // Active language → English → hardcoded constant. A row exists but with an
  // empty title counts as "no translation" so we still fall through.
  const langText = hero?.byLang[lang];
  const enText = hero?.byLang['en'];
  const text =
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
      <div className="bg-gradient-to-b from-gray-20 to-white px-[40px] max-md:px-[16px] pt-[250px] pb-[200px] max-[1025px]:pt-[150px] max-[1025px]:pb-[60px]">
        <div className="w-full max-w-[1320px] mx-auto flex flex-col items-center">
          <div className="flex flex-col items-center gap-[30px] text-center">
            <motion.h1
              className="text-[64px] font-bold tracking-[-0.03em] leading-[52px] text-brand max-[1100px]:text-[48px] max-[1100px]:leading-[44px] max-md:text-[36px] max-md:leading-[36px]"
              custom={0.1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              {text.title}
            </motion.h1>
            <motion.p
              className="text-[28px] leading-[32px] max-md:text-[24px] max-md:leading-[28px] tracking-[-0.03em] font-medium text-text w-0 min-w-full"
              custom={0.2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              {text.body}
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
