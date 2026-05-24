'use client';

import Link from 'next/link';
import type { PageTexts } from '@/lib/directus';
import AboutSection from './AboutSection';
import ExperienceStoriesSection from './ExperienceStoriesSection';
import PhilanthropySection from './PhilanthropySection';
import LeadershipSection from './LeadershipSection';
import ClosingQuote from './ClosingQuote';
import HeroHeader from './HeroHeader';
import Button from '@/components/ui/Button';
import { useI18n } from '@/lib/i18n-context';

interface Props {
  texts: PageTexts;
}

export default function AboutContent({ texts }: Props) {
  const { t } = useI18n();

  return (
    <main className="cv-page pt-[var(--header-height)] pb-24">
      <HeroHeader texts={texts} />
      <AboutSection texts={texts} />
      <LeadershipSection texts={texts} />
      <ExperienceStoriesSection texts={texts} />
      <PhilanthropySection texts={texts} />
      <ClosingQuote texts={texts} />
      <div className="w-[80%] mx-auto py-12 md:py-16 flex justify-center">
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
      </div>
    </main>
  );
}
