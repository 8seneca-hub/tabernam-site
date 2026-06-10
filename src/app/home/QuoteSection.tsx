'use client';

import { motion } from 'motion/react';
import Image from '@/components/ui/Image';
import MottoQuote from '@/components/layout/MottoQuote';
import { useI18n } from '@/app/hook/useI18n';
import type { QuoteBundle } from '@/lib/directus';

const FALLBACK_EN = 'Trade is not a transaction. It is a relationship — built across decades, sustained through trust, and measured by what endures long after the contract is signed.';
const FALLBACK_TITLE_ACCENT = 'Build on trust,';
const FALLBACK_TITLE_REST = ' not transactions';

interface Props {
  quote?: QuoteBundle;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.7, ease: [0.22, 0.61, 0.36, 1] as const },
  }),
};

export default function QuoteSection({ quote }: Props) {
  const imageUrl = quote?.image;
  const { lang } = useI18n();

  // Active language → English → hardcoded constants.
  const langText = quote?.byLang[lang];
  const enText = quote?.byLang['en'];
  const text =
    (langText && langText.primary ? langText : null) ??
    (enText && enText.primary ? enText : null) ??
    { titleAccent: FALLBACK_TITLE_ACCENT, titleRest: FALLBACK_TITLE_REST, primary: FALLBACK_EN, mottoTranslation: '' };

  const body = text.primary;
  const titleAccent = text.titleAccent;
  const titleRest = text.titleRest;

  return (
    <section className="quote w-full px-[60px] py-[150px] max-md:px-[16px] max-[1025px]:py-[40px]">
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
            className="text-[24px] leading-[30px] max-md:text-[20px] max-md:leading-[26px] tracking-[-0.01em] font-medium text-text text-left"
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
          <div className="feathered-image relative rounded-6 overflow-hidden bg-surface">
            <Image
              src={imageUrl || '/tibor_image.png'}
              alt="Portrait photograph"
              className="w-full h-auto"
            />
          </div>
          <MottoQuote latin={quote?.mottoLatin} translation={text.mottoTranslation} author={quote?.mottoAuthor} />
        </motion.div>
      </div>
    </section>
  );
}
