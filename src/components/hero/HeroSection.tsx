'use client';

import { motion } from 'motion/react';
import { useI18n } from '@/lib/i18n-context';
import type { PageTexts } from '@/lib/directus';

interface Props {
  texts?: PageTexts;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.7, ease: [0.22, 0.61, 0.36, 1] as const },
  }),
};

export default function HeroSection({ texts = {} }: Props) {
  const { t } = useI18n();

  const heroTitle = texts.hero_title || 'Lorem ipsum dolor sit consectetur adipiscing elit';
  const heroBody = texts.hero_body || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

  return (
    <section className="hero flex items-start gap-10 px-[var(--side-padding)] pt-[146px] pb-[100px] h-screen min-h-[760px] max-[1100px]:flex-col max-[1100px]:pt-[120px] max-[1100px]:pb-20 max-[1100px]:gap-12 max-md:overflow-x-clip max-md:gap-14 max-sm:pt-[100px] max-sm:pb-16 max-sm:gap-8">
      <div className="flex-[3_1_0] min-w-0 flex flex-col gap-15 items-start text-left text-text max-[1100px]:w-full max-[1100px]:gap-10 max-sm:gap-8">
        <div className="hero-headline flex flex-col gap-[30px] w-full max-[1100px]:gap-5 max-sm:gap-4">
          <motion.h1
            className="text-5xl font-bold leading-tight text-text max-[1100px]:text-[40px] max-md:text-[32px] max-sm:text-[30px]"
            custom={0.1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            {heroTitle}
          </motion.h1>
          <motion.p
            className="text-xl font-normal leading-snug text-text max-[1100px]:text-lg max-md:text-base max-sm:text-base"
            custom={0.2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            {heroBody}
          </motion.p>
        </div>
        <motion.button
          type="button"
          className="btn inline-flex items-center justify-center bg-button text-button-text text-base font-medium px-5 py-3 rounded-lg border-0 w-max cursor-pointer font-[inherit] transition-[background,transform] duration-200 hover:bg-button-hover hover:-translate-y-px"
          custom={0.35}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          {t('btn.getStarted')}
        </motion.button>
      </div>
      <motion.div
        className="hero-grid flex-[4_1_0] min-w-0 flex flex-col gap-5 max-[1100px]:w-full"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number] }}
      >
        <div className="hero-row hero-row-1 grid gap-5">
          <div className="hero-cell bg-[#f5f5f5] rounded-lg overflow-hidden relative">
            <video className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline preload="metadata"
                   poster="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80">
              <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="hero-cell bg-[#f5f5f5] rounded-lg overflow-hidden relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="absolute inset-0 w-full h-full object-cover" src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&h=900&q=80" alt="" />
          </div>
        </div>
        <div className="hero-row hero-row-2 grid gap-5">
          <div className="hero-cell bg-[#f5f5f5] rounded-lg overflow-hidden relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="absolute inset-0 w-full h-full object-cover" src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&h=600&q=80" alt="" />
          </div>
          <div className="hero-cell bg-[#f5f5f5] rounded-lg overflow-hidden relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="absolute inset-0 w-full h-full object-cover" src="https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=900&h=520&q=80" alt="" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
