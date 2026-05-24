'use client';

import Link from 'next/link';
import FadeIn from '@/animations/FadeIn';
import Button from '@/components/ui/Button';
import type { PageTexts } from '@/lib/directus';

const QuoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-14 h-14 opacity-40">
    <path d="M7 7h4v4H8c0 2 1 3 3 3v3c-3 0-5-2-5-5V7zm9 0h4v4h-3c0 2 1 3 3 3v3c-3 0-5-2-5-5V7z" />
  </svg>
);

interface Props {
  texts: PageTexts;
}

export default function ClosingQuote({ texts }: Props) {
  const quote = texts.closing_quote;
  const author = texts.closing_quote_author;
  const cta = texts.closing_cta;

  if (!quote && !cta) return null;

  return (
    <section className="relative bg-dark text-white overflow-hidden py-24 md:py-32">
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-brand/15 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-4xl mx-auto px-[var(--side-padding)] text-center flex flex-col items-center gap-10">
        <FadeIn delay={0.05} className="text-brand/80">
          <QuoteIcon />
        </FadeIn>
        {quote && (
          <FadeIn delay={0.1} className="w-full max-w-3xl flex flex-col gap-6">
            <h2 className="text-2xl md:text-4xl font-semibold italic leading-snug">
              &ldquo;{quote}&rdquo;
            </h2>
            {author && (
              <p className="self-end text-sm md:text-base font-medium italic tracking-wide text-white/80">
                — {author}
              </p>
            )}
          </FadeIn>
        )}
        <FadeIn delay={0.15}>
          <div className="w-24 h-px bg-white/20" aria-hidden="true" />
        </FadeIn>
      </div>
    </section>
  );
}
