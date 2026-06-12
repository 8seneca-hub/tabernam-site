'use client';

import { pickPageTexts, type PageTextsBundle, type CvSection, type CvEducationEntry, type CvExperienceEntry } from '@/lib/directus';
import { useI18n } from '@/app/hook/useI18n';
import HeroHeader from '../about/HeroHeader';
import CVSection from './CVSection';

interface Props {
  texts: PageTextsBundle;
  education: CvSection<CvEducationEntry>;
  experience: CvSection<CvExperienceEntry>;
}

export default function CVContent({ texts: bundle, education, experience }: Props) {
  const { lang } = useI18n();
  const texts = pickPageTexts(bundle, lang);
  return (
    <main className="cv-page pt-[var(--header-height)] pb-24">
      <HeroHeader texts={texts} />
      <CVSection backHref="/about" education={education} experience={experience} />
    </main>
  );
}
