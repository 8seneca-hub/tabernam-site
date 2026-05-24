'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useI18n } from '@/app/hook/useI18n';
import Button from '@/components/ui/Button';
import type { HeroSlide } from '@/lib/directus';

interface Props {
  slides?: HeroSlide[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.7, ease: [0.22, 0.61, 0.36, 1] as const },
  }),
};

const SLIDE_HOLD_MS = 5000;
const CROSSFADE_S = 1.4;

export default function HeroSection({ slides = [] }: Props) {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const sidePadding = useTransform(scrollYProgress, [0, 0.2], ['30px', '0px']);
  const blockPadding = useTransform(scrollYProgress, [0, 0.2], ['30px', '0px']);

  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      setActiveIdx((i) => (i + 1) % slides.length);
    }, SLIDE_HOLD_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  return (
    <motion.section
      ref={sectionRef}
      className="hero max-sm:!px-0"
      style={{
        height: '95vh',
        paddingLeft: sidePadding,
        paddingRight: sidePadding,
        paddingTop: blockPadding,
        paddingBottom: blockPadding,
      }}
    >
      <div className="hero-inner relative overflow-hidden w-full h-full flex flex-col items-center justify-center text-center gap-10 px-10 max-sm:gap-8 max-sm:py-16 bg-gray-70">
        <div className="absolute inset-0 z-0" aria-hidden="true">
          {slides.map((slide, i) => (
            <motion.img
              key={slide.image || i}
              src={slide.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              initial={false}
              animate={{ opacity: i === activeIdx ? 1 : 0 }}
              transition={{ duration: CROSSFADE_S, ease: 'easeInOut' }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/45 to-black/65" />
        </div>

        <div className="relative z-10 hero-headline flex flex-col gap-[30px] max-w-[65vw] w-full mx-auto max-[1100px]:max-w-[80vw] max-[1100px]:gap-5 max-sm:max-w-none max-sm:gap-4">
          <motion.h1
            className="text-[48px] font-extrabold tracking-[-0.04em] leading-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] max-[1100px]:text-[40px] max-md:text-[32px] max-sm:text-[30px]"
            custom={0.1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            {t('hero.title')} <span className="text-brand">{t('hero.titleAccent')}</span>
          </motion.h1>
          <motion.p
            className="text-xl font-medium leading-snug text-white/90 max-w-[50vw] w-full mx-auto drop-shadow-[0_1px_12px_rgba(0,0,0,0.4)] max-[1100px]:text-lg max-[1100px]:max-w-[70vw] max-md:text-base max-sm:text-base max-sm:max-w-none"
            custom={0.2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            {t('hero.body')}
          </motion.p>
        </div>
        <motion.div
          className="relative z-10"
          custom={0.35}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Button variant="primary" size="md" className="w-max hover:bg-dark hover:-translate-y-px transition-[background,transform]">
            {t('btn.getStarted')}
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}
