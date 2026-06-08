'use client';

import { useI18n } from '@/app/hook/useI18n';

/** Fixed Latin motto — never translated. */
const LATIN = 'Honeste lucra, nobiliter dona';
const TRANSLATION_FALLBACK = 'Earn honestly, give generously';

interface Props {
  className?: string;
}

export default function MottoQuote({ className = '' }: Props) {
  const { t } = useI18n();
  const translated = t('quote.motto.translation');
  const translation =
    translated && translated !== 'quote.motto.translation' ? translated : TRANSLATION_FALLBACK;

  return (
    <figure className={`mt-8 text-center ${className}`}>
      <blockquote className="text-[24px] font-medium text-text leading-snug">
        {LATIN} <span className="font-normal italic">— Tibor Buček</span>
      </blockquote>
      <figcaption className="mt-2 text-text">({translation})</figcaption>
    </figure>
  );
}
