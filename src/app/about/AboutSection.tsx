'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useI18n } from '@/lib/i18n-context';
import type { PageTexts } from '@/lib/directus';
import FadeIn from '@/animations/FadeIn';

interface Props {
  texts: PageTexts;
}

export default function AboutSection({ texts }: Props) {
  const { t } = useI18n();
  const eyebrow = texts.about_eyebrow;
  const bodies = [texts.about_body_1, texts.about_body_2].filter(Boolean) as string[];
  const [bodyIndex, setBodyIndex] = useState(0);

  useEffect(() => {
    if (bodies.length < 2) return;
    const interval = setInterval(() => {
      setBodyIndex((i) => (i + 1) % bodies.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [bodies.length]);

  return (
    <>
      <section className="w-full min-h-[80vh] flex flex-col items-center justify-center px-[var(--side-padding)] py-10 gap-10">
        <FadeIn delay={0.05} className="flex flex-col gap-4 items-center text-center">
          {eyebrow && (
            <span className="block text-xs font-semibold text-brand uppercase tracking-[0.2em]">
              {eyebrow}
            </span>
          )}
          <h1 className="text-5xl md:text-6xl font-bold text-text tracking-tight leading-tight max-md:text-4xl">
            {t('heading.aboutMe')}
          </h1>
        </FadeIn>
        <FadeIn delay={0.1} className="w-full max-w-[50vw] mx-auto max-[1100px]:max-w-none">
          <div className="relative min-h-[12rem] overflow-hidden text-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={bodyIndex}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
                className="text-xl font-normal text-brand italic leading-snug max-[1100px]:text-[22px]"
              >
                {`"${bodies[bodyIndex] || ''}"`}
              </motion.p>
            </AnimatePresence>
          </div>
        </FadeIn>
      </section>

      {(texts.about_body_3 || texts.about_body_4) && (
        <section className="bg-gray-70 py-20">
          <div className="w-[80%] mx-auto flex flex-col gap-8">
            <div className="w-[50%] md:w-[20%] h-1 bg-brand" aria-hidden="true" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
              {texts.about_body_3 && (
                <FadeIn delay={0.05}>
                  <p className="text-lg font-normal text-text leading-relaxed">
                    {texts.about_body_3}
                  </p>
                </FadeIn>
              )}
              {texts.about_body_4 && (
                <FadeIn delay={0.1}>
                  <p className="text-lg font-normal text-muted leading-relaxed">
                    {texts.about_body_4}
                  </p>
                </FadeIn>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
