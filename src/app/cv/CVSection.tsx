'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/app/hook/useI18n';
import {
  pickEntry,
  pickSectionTitle,
  type CvEducationEntry,
  type CvExperienceEntry,
  type CvSection as CvSectionData,
} from '@/lib/directus';
import Section from '@/components/ui/Section';
import Button from '@/components/ui/Button';
import EntryRow from '@/app/home/EntryRow';
import LanguageBar from '@/app/home/LanguageBar';
import RequestCvModal from './RequestCvModal';
import ContactInfoCard from '../contact/ContactInfoCard';

const VISIBLE_EXPERIENCE = 4;
const BLUR_PREVIEW_COUNT = 1;

const BLUR_CHINA = [
  { text: 'Foreign trade missions and partnerships across multiple Chinese provinces.', years: '2010 – present' },
];
const BLUR_LANGUAGES = [
  { name: 'English', level: 'C1', descriptor: 'Professional working proficiency', bars: 5 },
];
const BLUR_SKILLS = ['Cross-cultural negotiation and stakeholder management.'];

interface Props {
  backHref?: string;
  education: CvSectionData<CvEducationEntry>;
  experience: CvSectionData<CvExperienceEntry>;
}

export default function CVSection({ backHref, education, experience }: Props) {
  const { lang, t } = useI18n();
  const [requestOpen, setRequestOpen] = useState(false);

  const educationTitle = pickSectionTitle(education, lang, t('cv.section.education'));
  const experienceTitle = pickSectionTitle(experience, lang, t('cv.section.experience'));

  const visibleExperience = experience.entries.slice(0, VISIBLE_EXPERIENCE);
  const hiddenExperience = experience.entries.slice(
    VISIBLE_EXPERIENCE,
    VISIBLE_EXPERIENCE + BLUR_PREVIEW_COUNT,
  );

  const renderExperience = (entry: CvExperienceEntry, i: number) => {
    const v = pickEntry(entry, lang);
    if (!v) return null;
    return (
      <li key={i}>
        <EntryRow title={v.title} org={v.org} date={v.date} desc={v.desc || undefined} />
      </li>
    );
  };

  return (
    <>
      <div className="w-[80%] mx-auto pt-14 flex flex-col gap-14">
        <Section title={educationTitle}>
          <ul className="flex flex-col gap-6">
            {education.entries.map((entry, i) => {
              const v = pickEntry(entry, lang);
              if (!v) return null;
              return (
                <li key={i}>
                  <EntryRow title={v.title} org={v.org} date={v.date} />
                </li>
              );
            })}
          </ul>
        </Section>

        <Section title={experienceTitle}>
          <ul className="flex flex-col gap-7">
            {visibleExperience.map(renderExperience)}
          </ul>

          <div className="relative mt-10 mb-2 flex items-center justify-center">
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" aria-hidden />
            {backHref && (
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-x-0 top-1/2 h-px bg-border" aria-hidden />
                <Button
                  as={Link}
                  href={backHref}
                  variant="primary"
                  size="md"
                  shape="pill"
                  iconLeft="←"
                  className="relative z-10 text-sm font-semibold !text-white shadow-[0_8px_24px_rgba(178,34,34,0.25)]"
                >
                  {t('btn.goBack')}
                </Button>
              </div>
            )}
            <Button
              variant="primary"
              size="md"
              shape="pill"
              icon="→"
              onClick={() => setRequestOpen(true)}
              className="relative z-10 ml-2 text-sm font-semibold shadow-[0_8px_24px_rgba(178,34,34,0.25)]"
            >
              {t('cv.cta.viewFull')}
            </Button>
          </div>

          <div className="relative mt-2 select-none" aria-hidden="true">
            <ul className="flex flex-col gap-7 blur-md opacity-70 pointer-events-none">
              {hiddenExperience.map(renderExperience)}
            </ul>
          </div>
        </Section>

        {/* Blur preview: china / languages / skills. Static placeholders — */}
        {/* the user can't read these under blur so they don't need CMS data. */}
        <div className="relative select-none" aria-hidden="true">
          <div className="flex flex-col gap-14 blur-md opacity-70 pointer-events-none">
            <Section title="Activities in China">
              <ul className="flex flex-col gap-3">
                {BLUR_CHINA.map((row, i) => (
                  <li key={i} className="grid grid-cols-[auto_1fr_auto] gap-x-4 items-baseline max-md:grid-cols-[auto_1fr]">
                    <span className="text-brand text-xs leading-relaxed mt-1.5" aria-hidden>●</span>
                    <span className="text-base text-text leading-relaxed">{row.text}</span>
                    <span className="text-sm italic text-muted whitespace-nowrap max-md:col-start-2 max-md:mt-0.5">{row.years}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Languages">
              <div className="grid grid-cols-2 gap-x-12 gap-y-6 max-md:grid-cols-1">
                {BLUR_LANGUAGES.map((meta, i) => (
                  <LanguageBar
                    key={i}
                    name={meta.name}
                    level={meta.level}
                    descriptor={meta.descriptor}
                    bars={meta.bars}
                  />
                ))}
              </div>
            </Section>

            <Section title="Personal skills">
              <ul className="flex flex-col gap-3">
                {BLUR_SKILLS.map((skill, i) => (
                  <li key={i} className="flex gap-3 text-base text-text leading-relaxed">
                    <span className="text-brand text-xs mt-1.5 shrink-0" aria-hidden>●</span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <ContactInfoCard className="pointer-events-auto" />
          </div>
        </div>
      </div>

      <RequestCvModal open={requestOpen} onClose={() => setRequestOpen(false)} />
    </>
  );
}
