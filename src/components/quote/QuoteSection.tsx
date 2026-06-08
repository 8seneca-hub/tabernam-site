'use client';

import { motion } from 'motion/react';
import Image from '@/components/ui/Image';
import MottoQuote from '@/components/MottoQuote';
import { useI18n } from '@/app/hook/useI18n';

const FALLBACK_EN = 'Trade is not a transaction. It is a relationship — built across decades, sustained through trust, and measured by what endures long after the contract is signed.';
const FALLBACK_TITLE_ACCENT = 'Build on trust,';
const FALLBACK_TITLE_REST = ' not transactions';

function resolve(key: string, value: string, fallback: string): string {
  return value && value.trim() && value !== key ? value : fallback;
}

interface Props {
  imageUrl?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.7, ease: [0.22, 0.61, 0.36, 1] as const },
  }),
};

export default function QuoteSection({ imageUrl }: Props) {
  const { t } = useI18n();

  const body = resolve('quote.primary', t('quote.primary'), FALLBACK_EN);
  const titleAccent = resolve('quote.titleAccent', t('quote.titleAccent'), FALLBACK_TITLE_ACCENT);
  const titleRest = resolve('quote.titleRest', t('quote.titleRest'), FALLBACK_TITLE_REST);

  return (
    <section className="quote w-full px-[60px] py-[150px] max-md:px-[16px] max-md:py-[80px]">
      <div className="max-w-[1320px] mx-auto flex flex-col gap-[100px] lg:flex-row lg:items-start max-md:gap-[40px]">
        {/* Left column — title + body, fills the remaining width, top-aligned, text left-aligned. */}
        <motion.div
          className="w-full lg:flex-1 flex flex-col items-start gap-[30px] pt-[40px]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            className="text-[52px] leading-[56px] tracking-[-0.02em] font-bold text-left max-md:text-[36px] max-md:leading-[40px]"
            custom={0}
            variants={fadeUp}
          >
            <span className="text-accent">{titleAccent}</span>
            <span>{titleRest}</span>
          </motion.h2>
          <motion.p
            className="text-[24px] leading-[30px] tracking-[-0.01em] font-medium text-text text-left"
            custom={0.15}
            variants={fadeUp}
          >
            {body}
          </motion.p>
        </motion.div>

        {/* Right column — square portrait image + motto, fixed 45% of the frame. */}
        <motion.div
          className="w-full lg:w-[45%] max-lg:max-w-[440px] max-lg:mx-auto"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div className="feathered-image relative aspect-square rounded-6 overflow-hidden bg-surface">
            <Image
              src={imageUrl || '/tibor_image.png'}
              alt="Portrait photograph"
              fill
              className="object-cover"
            />
          </div>
          <MottoQuote />
        </motion.div>
      </div>
    </section>
  );
}
