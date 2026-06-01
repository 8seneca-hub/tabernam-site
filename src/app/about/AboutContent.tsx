'use client';

import Link from 'next/link';
import { pickPageTexts, type PageTextsBundle } from '@/lib/directus';
import AboutParagraph from './AboutParagraph';
import ExperienceStoriesSection from './ExperienceStoriesSection';
import PhilanthropySection from './PhilanthropySection';
import LeadershipSection from './LeadershipSection';
import ClosingQuote from './ClosingQuote';
import HeroHeader from './HeroHeader';
import Button from '@/components/ui/Button';
import { useI18n } from '@/app/hook/useI18n';

interface Props {
  texts: PageTextsBundle;
}

export default function AboutContent({ texts: bundle }: Props) {
  const { lang, t } = useI18n();
  const texts = pickPageTexts(bundle, lang);

  return (
    <main className="cv-page pt-[var(--header-height)]">
      <HeroHeader texts={texts} />
      <AboutParagraph texts={texts} />
      <LeadershipSection texts={texts} />
      <ExperienceStoriesSection texts={texts} />
      <PhilanthropySection texts={texts} />
      <ClosingQuote texts={texts} />
      {/* <div className="w-[80%] mx-auto py-12 md:py-16 flex justify-center">
        <Button
          as={Link}
          href="/cv"
          variant="primary"
          size="lg"
          shape="pill"
          icon="→"
          className="text-sm font-semibold !text-white uppercase tracking-[0.2em] shadow-xl"
        >
          {t('btn.viewCV')}
        </Button>
      </div> */}
    </main>
  );
}
