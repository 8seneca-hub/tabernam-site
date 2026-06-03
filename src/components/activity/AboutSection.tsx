'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useI18n } from '@/app/hook/useI18n';
import FadeIn from '@/animations/FadeIn';
import { pickPageTexts, type PageTextsBundle } from '@/lib/directus';
import Button from '../ui/Button';
import Link from 'next/link';

interface Props {
  texts: PageTextsBundle;
}

export default function AboutSection({ texts: bundle }: Props) {
  const { lang, t } = useI18n();
  const texts = pickPageTexts(bundle, lang);
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
      <section className="w-full bg-brand px-[60px] py-[120px] max-md:px-[40px]">
        <div className="max-w-[1320px] mx-auto flex flex-col items-center justify-center gap-10">
          <FadeIn delay={0.05} className="flex flex-col gap-4 items-center text-center">
            {eyebrow && (
              <span className="block text-[20px] leading-[24px] font-medium text-white tracking-[-0.01em]">
                {eyebrow}
              </span>
            )}
            <h1 className="text-5xl md:text-6xl font-bold text-accent tracking-tight leading-tight max-md:text-4xl">
              {t('heading.aboutMe')}
            </h1>
          </FadeIn>
          <FadeIn delay={0.1} className="w-full max-w-[50vw] mx-auto max-[1100px]:max-w-none">
            <div className="relative min-h-[12rem] text-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={bodyIndex}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
                  className="text-[24px] font-medium text-white italic leading-[30px] max-[1100px]:text-[22px]"
                >
                  {`"${bodies[bodyIndex] || ''}"`}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="mt-6 flex justify-center">
              <Button
                as={Link}
                href="/about"
                variant="primary"
                size="md"
                shape="pill"
                className="!text-[20px] font-semibold !bg-white !text-brand hover:!bg-white/90 px-8 py-4"
              >
                {t('btn.getToKnowMore')}
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {(texts.about_body_3 || texts.about_body_4) && (
        <section className="bg-gray-40 py-20">
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
