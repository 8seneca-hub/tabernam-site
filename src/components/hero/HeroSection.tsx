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

export default function HeroSection(_props: Props) {
  const { t } = useI18n();

  return (
    <section className="hero h-screen px-10 pt-[var(--header-height)] pb-10 max-sm:px-0 max-sm:pb-0">
      <div className="hero-inner bg-gray-70 rounded-3xl h-full flex flex-col items-center justify-center text-center gap-10 px-10 max-sm:rounded-none max-sm:gap-8 max-sm:py-16">
        <div className="hero-headline flex flex-col gap-[30px] max-w-[65vw] w-full mx-auto max-[1100px]:max-w-[80vw] max-[1100px]:gap-5 max-sm:max-w-none max-sm:gap-4">
          <motion.h1
            className="text-[48px] font-extrabold tracking-[-0.04em] leading-tight text-text max-[1100px]:text-[40px] max-md:text-[32px] max-sm:text-[30px]"
            custom={0.1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            Four decades of foreign trade. A trusted bridge between{' '}
            <span className="text-accent">Slovakia and China.</span>
          </motion.h1>
          <motion.p
            className="text-xl font-medium leading-snug text-text max-w-[50vw] w-full mx-auto max-[1100px]:text-lg max-[1100px]:max-w-[70vw] max-md:text-base max-sm:text-base max-sm:max-w-none"
            custom={0.2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            Helping Slovakia leaders enter, scale and reposition in China and beyond, guided by the kind of judgement that only comes from doing the work, year after year.
          </motion.p>
        </div>
        <motion.button
          type="button"
          className="btn inline-flex items-center justify-center bg-brand text-white text-base font-medium px-6 py-3 rounded-lg border-0 w-max cursor-pointer font-[inherit] transition-[background,transform] duration-200 hover:bg-dark hover:-translate-y-px"
          custom={0.35}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          {t('btn.getStarted')}
        </motion.button>
      </div>
    </section>
  );
}
