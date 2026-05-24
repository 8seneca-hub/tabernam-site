'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useI18n } from '@/lib/i18n-context';
import type { PageTexts } from '@/lib/directus';
import Button from '@/components/ui/Button';

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
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const sidePadding = useTransform(scrollYProgress, [0, 0.2], ['30px', '0px']);
  const blockPadding = useTransform(scrollYProgress, [0, 0.2], ['30px', '0px']);

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
      <div className="hero-inner bg-gray-70 w-full h-full flex flex-col items-center justify-center text-center gap-10 px-10 max-sm:gap-8 max-sm:py-16">
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
        <motion.div
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
