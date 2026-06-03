'use client';

import { motion } from 'motion/react';
import Image from '@/components/ui/Image';
import { useI18n } from '@/app/hook/useI18n';

const FALLBACK_EN = 'Trade is not a transaction. It is a relationship — built across decades, sustained through trust, and measured by what endures long after the contract is signed.';

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

  const translatedBody = t('quote.primary');
  const body =
    translatedBody && translatedBody.trim() && translatedBody !== 'quote.primary'
      ? translatedBody
      : FALLBACK_EN;

  return (
    <section className="quote w-full px-[60px] py-[150px]">
      <div className="max-w-[1320px] mx-auto grid grid-cols-[3fr_2fr] gap-[100px] items-start max-md:grid-cols-1 max-md:gap-[40px]">
        {/* Left column — title + body, top-aligned, text left-aligned. */}
        <motion.div
          className="flex flex-col items-start gap-[30px] pt-[40px]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* TODO: title is hardcoded — wire to a Directus i18n key (e.g. quote.title)
              once the page-keys migration is run. The two-tone coloring (accent + dark)
              splits the phrase at the comma. */}
          <motion.h2
            className="text-[52px] leading-[56px] tracking-[-0.02em] font-bold text-left max-md:text-[36px] max-md:leading-[40px]"
            custom={0}
            variants={fadeUp}
          >
            <span className="text-accent">Build on trust</span>
            <span>, not transactions</span>
          </motion.h2>
          <motion.p
            className="text-[24px] leading-[30px] tracking-[-0.01em] font-medium text-text text-left"
            custom={0.15}
            variants={fadeUp}
          >
            {body}
          </motion.p>
        </motion.div>

        {/* Right column — 3:4 portrait image, fills its 2-of-5 grid column. */}
        <motion.div
          className="feathered-image relative w-full aspect-[3/4] rounded-4 overflow-hidden bg-surface"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <Image
            src={imageUrl || '/tibor_image.png'}
            alt="Portrait photograph"
            fill
            className="object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
