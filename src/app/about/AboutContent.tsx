'use client';

import { motion } from 'motion/react';
import { useI18n } from '@/lib/i18n-context';
import type { PageTexts } from '@/lib/directus';
import FadeIn from '@/animations/FadeIn';

interface Props {
  texts: PageTexts;
}

export default function AboutContent({ texts }: Props) {
  const { t } = useI18n();

  const aboutBody = texts.about_body || 'I have spent more than four decades in foreign trade, working primarily with partners and enterprises in China. Along the way, the work has taken me to Vietnam, Mongolia, Japan, the United States, Kenya, Germany, Austria, Sweden, Laos, Cambodia, Singapore — and dozens of other markets. What I offer today is not a service catalogue. It is the accumulated judgement of a long career: how to read a counterparty, how to structure a relationship, and how to make business in unfamiliar places feel familiar.';

  return (
    <main className="split-page grid grid-cols-5 gap-15 items-start px-[var(--side-padding)] pt-[calc(var(--header-height)+80px)] pb-20 max-w-[var(--max-width)] mx-auto min-h-screen max-[900px]:grid-cols-1 max-[900px]:gap-10">
      <section className="split-intro col-span-2 flex flex-col gap-15 items-start max-[900px]:col-span-full">
        <FadeIn className="flex flex-col gap-5" delay={0.05}>
          <h1 className="text-5xl font-semibold text-text leading-tight">{t('heading.aboutMe')}</h1>
          <p className="text-base font-normal text-text leading-normal">{aboutBody}</p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <a href="/cv" className="btn inline-flex items-center justify-center bg-button text-button-text text-base font-medium px-5 py-3 rounded-lg border-0 w-max cursor-pointer font-[inherit] transition-[background,transform] duration-200 hover:bg-button-hover hover:-translate-y-px">{t('btn.viewCV')}</a>
        </FadeIn>
      </section>

      <section className="col-start-3 col-span-3 flex justify-center max-[900px]:col-span-full">
        <FadeIn delay={0.2}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-[519px] max-w-full aspect-[519/524] bg-gray-70 rounded-xl object-cover block"
            src={texts.portrait_image || 'https://images.unsplash.com/photo-1664575600796-ffa828c5cb6e?auto=format&fit=crop&w=1040&h=1048&q=80'}
            alt="Portrait photograph"
          />
        </FadeIn>
      </section>
    </main>
  );
}
