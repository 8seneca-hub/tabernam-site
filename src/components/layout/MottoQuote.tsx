'use client';

import { useI18n } from '@/app/hook/useI18n';

const DEFAULT_LATIN = 'Honeste lucra, nobiliter dona';
const DEFAULT_AUTHOR = 'Tibor Buček';
const TRANSLATION_FALLBACK = 'Earn honestly, give generously';

interface Props {
  className?: string;
  /** Latin motto. Falls back to the hardcoded constant. */
  latin?: string;
  /** Translated motto. Overrides the `quote.motto.translation` dictionary lookup. */
  translation?: string;
  /** Author line. Falls back to the hardcoded constant. */
  author?: string;
}

export default function MottoQuote({ className = '', latin, translation, author }: Props) {
  const { t } = useI18n();
  const resolvedLatin = latin || DEFAULT_LATIN;
  const resolvedAuthor = author || DEFAULT_AUTHOR;
  let resolvedTranslation = translation || '';
  if (!resolvedTranslation) {
    const dict = t('quote.motto.translation');
    resolvedTranslation = dict && dict !== 'quote.motto.translation' ? dict : TRANSLATION_FALLBACK;
  }

  return (
    <figure className={`mt-8 w-fit mx-auto text-center ${className}`}>
      <blockquote className="text-[24px] font-medium text-text leading-snug">
        {resolvedLatin}
      </blockquote>
      <figcaption className="mt-2 text-text">({resolvedTranslation})</figcaption>
      <p className="mt-2 text-[24px] max-md:text-[18px] font-semibold italic text-text text-right">{resolvedAuthor}</p>
    </figure>
  );
}
