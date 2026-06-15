'use client';

import { useI18n } from '@/app/hook/useI18n';

const DEFAULT_LATIN = 'Honeste lucra, nobiliter dona';
const DEFAULT_AUTHOR = 'Tibor Buček';
const TRANSLATION_FALLBACK = 'Earn honestly, give generously';

const DEFAULT_FIGURE_CN = 'mt-8 w-fit mx-auto text-center';
const DEFAULT_LATIN_CN = 'text-[24px] font-medium text-text leading-snug';
const DEFAULT_TRANSLATION_CN = 'mt-2 text-text';
const DEFAULT_AUTHOR_CN = 'mt-2 text-[32px] max-md:text-[24px] text-text text-right leading-none';

interface Props {
  /** figure className. Replaces the default when provided. */
  className?: string;
  /** blockquote className for the Latin line. Replaces the default when provided. */
  latinClassName?: string;
  /** figcaption className for the translation line. Replaces the default when provided. */
  translationClassName?: string;
  /** p className for the author line. Replaces the default when provided. */
  authorClassName?: string;
  /** Latin motto. Falls back to the hardcoded constant. */
  latin?: string;
  /** Translated motto. Overrides the `quote.motto.translation` dictionary lookup. */
  translation?: string;
  /** Author line. Falls back to the hardcoded constant. */
  author?: string;
}

export default function MottoQuote({
  className,
  latinClassName,
  translationClassName,
  authorClassName,
  latin,
  translation,
  author,
}: Props) {
  const { t } = useI18n();
  const resolvedLatin = latin || DEFAULT_LATIN;
  const resolvedAuthor = author || DEFAULT_AUTHOR;
  let resolvedTranslation = translation || '';
  if (!resolvedTranslation) {
    const dict = t('quote.motto.translation');
    resolvedTranslation = dict && dict !== 'quote.motto.translation' ? dict : TRANSLATION_FALLBACK;
  }

  return (
    <figure className={className ?? DEFAULT_FIGURE_CN}>
      <blockquote
        className={latinClassName ?? DEFAULT_LATIN_CN}
        style={{ fontFamily: 'var(--font-crimson-text)' }}
      >
        {resolvedLatin}
      </blockquote>
      <figcaption
        className={translationClassName ?? DEFAULT_TRANSLATION_CN}
        style={{ fontFamily: 'var(--font-crimson-text)' }}
      >
        ({resolvedTranslation})
      </figcaption>
      <p
        className={authorClassName ?? DEFAULT_AUTHOR_CN}
        style={{ fontFamily: 'var(--font-pinyon-script)' }}
      >
        {resolvedAuthor}
      </p>
    </figure>
  );
}
