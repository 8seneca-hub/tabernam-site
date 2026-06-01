'use client';

import { motion } from 'motion/react';
import { useI18n } from '@/app/hook/useI18n';

interface Props {
  isOpen: boolean;
  disabled: boolean;
  onOpen: () => void;
}

export default function IntroOverlay({ isOpen, disabled, onOpen }: Props) {
  const { t } = useI18n();
  return (
    <motion.div
      className="absolute top-[8vh] left-1/2 w-[90%] max-w-[720px] text-center text-text z-10 pointer-events-none"
      animate={{
        x: '-50%',
        y: isOpen ? '-140%' : '0%',
        opacity: isOpen ? 0 : 1,
      }}
      transition={{
        x: { duration: 0 },
        y: { duration: 1.1, ease: [0.65, 0.05, 0.36, 1] },
        opacity: { duration: 0.7, ease: 'easeOut' },
      }}
    >
      <h2 className="mb-4 text-[clamp(24px,2.6vw,34px)] font-bold tracking-[-0.01em] leading-[1.15]">
        {t('globe.intro.heading')}
      </h2>
      <button
        type="button"
        disabled={disabled}
        onClick={onOpen}
        className="pointer-events-auto inline-block mt-6 px-[26px] py-3 text-[13px] font-medium tracking-[0.04em] text-text bg-black/[0.03] border border-black/35 rounded-full cursor-pointer transition-all duration-200 hover:bg-black/[0.08] hover:border-black/70 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t('globe.intro.cta')}
      </button>
    </motion.div>
  );
}
