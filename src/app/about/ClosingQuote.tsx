'use client';

import { useRef, useState } from 'react';
import FadeIn from '@/animations/FadeIn';
import { useI18n } from '@/app/hook/useI18n';
import type { PageTexts } from '@/lib/directus';

// Fixed Latin slogan — never changes with the selected language.
const LATIN = 'Honeste lucra, nobiliter dona';
const TRANSLATION_FALLBACK = 'Earn honestly, give generously';

const QuoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-14 h-14 opacity-40">
    <path d="M7 7h4v4H8c0 2 1 3 3 3v3c-3 0-5-2-5-5V7zm9 0h4v4h-3c0 2 1 3 3 3v3c-3 0-5-2-5-5V7z" />
  </svg>
);

interface Props {
  texts: PageTexts;
}

export default function ClosingQuote({ texts }: Props) {
  const { t } = useI18n();
  const author = texts.closing_quote_author;
  const backgroundImage = texts.closing_background || '/carousel/photo-12.jpg';

  const translated = t('quote.motto.translation');
  const translation =
    translated && translated !== 'quote.motto.translation' ? translated : TRANSLATION_FALLBACK;

  const sectionRef = useRef<HTMLElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });

  return (
    <section
      ref={sectionRef}
      onMouseMove={(e) => {
        const rect = sectionRef.current?.getBoundingClientRect();
        if (!rect) return;
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseLeave={() => setPos({ x: -1000, y: -1000 })}
      className="relative text-white overflow-hidden py-32 md:py-44 bg-fit bg-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle 280px at ${pos.x}px ${pos.y}px, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.92) 80%)`,
        }}
        aria-hidden="true"
      />

      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-brand/15 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-4xl mx-auto px-[var(--side-padding)] text-center flex flex-col items-center gap-10">
        <FadeIn delay={0.05} className="text-brand/80">
          <QuoteIcon />
        </FadeIn>
        <FadeIn delay={0.1} className="w-full max-w-3xl flex flex-col items-center gap-6 text-center">
          <h2 className="text-2xl md:text-4xl font-semibold italic leading-snug">
            &ldquo;{LATIN}&rdquo;
          </h2>
          <p className="text-[24px] italic leading-snug text-white/90">
            ({translation})
          </p>
          {author && (
            <p className="text-sm md:text-base font-medium italic tracking-wide text-white/80">
              — {author}
            </p>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
