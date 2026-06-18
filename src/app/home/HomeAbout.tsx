'use client';

import { useI18n } from '@/app/hook/useI18n';
import FadeIn from '@/animations/FadeIn';
import type { HomeAboutBundle, HomeAboutText } from '@/lib/directus';
import Button from '../../components/ui/Button';
import Link from 'next/link';

interface Props {
  homeAbout?: HomeAboutBundle;
}

const EMPTY: HomeAboutText = { eyebrow: '', heading: 'About me', body1: '', body2: '', btnGetToKnowMore: '' };

export default function HomeAbout({ homeAbout }: Props) {
  const { lang } = useI18n();

  // Active language → English → empty (section gracefully degrades).
  const langText = homeAbout?.byLang[lang];
  const enText = homeAbout?.byLang['en'];
  const text =
    (langText && langText.eyebrow ? langText : null) ??
    (enText && enText.eyebrow ? enText : null) ??
    EMPTY;

  const { eyebrow } = text;
  const bodies = [text.body1, text.body2].filter(Boolean);

  return (
    <section className="w-full bg-bg px-[60px] py-[120px] max-md:px-[16px] max-[1025px]:py-[60px]">
      <div className="max-w-[1320px] mx-auto flex flex-col items-center justify-center gap-10">
        <FadeIn delay={0.05} className="flex flex-col gap-4 items-center text-center">
          {eyebrow && (
            <span className="block text-[20px] max-md:text-[16px] leading-[24px] font-medium text-text tracking-[-0.01em]">
              {eyebrow}
            </span>
          )}
          <h1 className="text-5xl md:text-6xl font-bold text-accent tracking-tight leading-tight max-md:text-4xl">
            {text.heading || 'About me'}
          </h1>
        </FadeIn>
        <FadeIn delay={0.1} className="w-full max-w-[50vw] mx-auto max-[1100px]:max-w-none">
          <div className="flex flex-col gap-6 text-center">
            {bodies.map((body, i) => (
              <p
                key={i}
                className="text-[24px] font-medium text-text italic leading-[30px] md:max-[1100px]:text-[22px] max-md:text-[20px]"
              >
                {body}
              </p>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <Button
              as={Link}
              href="/about"
              variant="primary"
              size="md"
              shape="pill"
              className="!text-[18px] font-medium !text-white !bg-brand !px-[28px] !py-[16px] !gap-[10px]"
            >
              {text.btnGetToKnowMore || 'Get to know more'}
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
