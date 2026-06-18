'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import FadeIn from '@/animations/FadeIn';
import Button from '@/components/ui/Button';
import { useI18n } from '@/app/hook/useI18n';
import type { ClosingQuoteBundle, ClosingQuoteText } from '@/lib/directus';

const FALLBACK_LATIN = 'Honeste lucra, nobiliter dona';
const FALLBACK_AUTHOR = 'Tibor Buček';
const FALLBACK_TRANSLATION = 'Earn honestly, give generously';
const FALLBACK_BACKGROUND = '/carousel/photo-12.jpg';

const EMPTY_TEXT: ClosingQuoteText = { quote: '', mottoTranslation: '', cta: '' };

const QuoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-14 h-14 opacity-40">
    <path d="M7 7h4v4H8c0 2 1 3 3 3v3c-3 0-5-2-5-5V7zm9 0h4v4h-3c0 2 1 3 3 3v3c-3 0-5-2-5-5V7z" />
  </svg>
);

interface Props {
  closingQuote: ClosingQuoteBundle;
}

export default function ClosingQuote({ closingQuote }: Props) {
  const { lang } = useI18n();

  const langText = closingQuote.byLang[lang];
  const enText = closingQuote.byLang['en'];
  const text =
    (langText && (langText.mottoTranslation || langText.cta) ? langText : null) ??
    (enText && (enText.mottoTranslation || enText.cta) ? enText : null) ??
    EMPTY_TEXT;

  const latin = closingQuote.mottoLatin || FALLBACK_LATIN;
  const author = closingQuote.mottoAuthor || FALLBACK_AUTHOR;
  const translation = text.mottoTranslation || FALLBACK_TRANSLATION;
  const cta = text.cta;
  const backgroundImage = closingQuote.background || FALLBACK_BACKGROUND;

  const sectionRef = useRef<HTMLElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (!isTouch) return;
    const center = () => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPos({ x: rect.width / 2, y: rect.height / 2 });
    };
    center();
    window.addEventListener('resize', center);
    return () => window.removeEventListener('resize', center);
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={(e) => {
        const rect = sectionRef.current?.getBoundingClientRect();
        if (!rect) return;
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseLeave={() => setPos({ x: -1000, y: -1000 })}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        if (!touch) return;
        const rect = sectionRef.current?.getBoundingClientRect();
        if (!rect) return;
        setPos({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
      }}
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

      <div className="relative z-10 max-w-4xl mx-auto px-[var(--side-padding)] max-md:px-[16px] text-center flex flex-col items-center gap-10">
        <FadeIn delay={0.05} className="text-brand/80">
          <QuoteIcon />
        </FadeIn>
        <FadeIn delay={0.1} className="w-full max-w-3xl flex flex-col items-center gap-6 text-center">
          <h2
            className="text-2xl md:text-4xl font-semibold leading-snug"
            style={{ fontFamily: 'var(--font-crimson-text)' }}
          >
            &ldquo;{latin}&rdquo;
          </h2>
          <p
            className="text-[24px] leading-snug text-white/90"
            style={{ fontFamily: 'var(--font-crimson-text)' }}
          >
            ({translation})
          </p>
          {author && (
            <p
              className="text-2xl md:text-3xl tracking-wide text-white/90 leading-none"
              style={{ fontFamily: 'var(--font-pinyon-script)' }}
            >
              — {author}
            </p>
          )}
          {cta && (
            <Button as={Link} href="/contact" variant="primary" shape="pill" className="mt-2 !text-[18px] font-medium !text-white !bg-brand !px-[28px] !py-[16px] !gap-[10px]">
              {cta}
            </Button>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
