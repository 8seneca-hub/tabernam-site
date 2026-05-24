'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/app/hook/useI18n';
import Section from '@/components/ui/Section';
import Button from '@/components/ui/Button';
import EntryRow from '@/components/activity/component/EntryRow';
import LanguageBar from '@/components/activity/component/LanguageBar';
import RequestCvModal from './RequestCvModal';
import ContactInfoCard from '../contact/ContactInfoCard';
import type { PageTexts } from '@/lib/directus';

const EDUCATION_COUNT = 6;
const EXPERIENCE_COUNT = 9;
const CHINA_COUNT = 9;
const SKILLS_COUNT = 5;
const VISIBLE_EXPERIENCE = 4;
const BLUR_PREVIEW_COUNT = 1;

const LANGUAGE_META: { level: string; bars: number }[] = [
  { level: '—', bars: 5 },
  { level: 'C1', bars: 5 },
  { level: 'C1', bars: 5 },
  { level: 'B1', bars: 3 },
  { level: 'B1', bars: 3 },
];

interface Props {
  backHref?: string;
  texts?: PageTexts;
}

export default function CVSection({ backHref, texts }: Props) {
  const { t } = useI18n();
  const [requestOpen, setRequestOpen] = useState(false);

  const contactEmail = texts?.hero_email;
  const contactPhone = texts?.hero_phone;
  const contactWechat = texts?.hero_wechat;
  const addressTranslation = t('cv.hero.address');
  const contactAddress = addressTranslation === 'cv.hero.address' ? undefined : addressTranslation;

  const optional = (key: string): string | undefined => {
    const value = t(key);
    return value === key ? undefined : value;
  };

  const visibleExperienceIndexes = Array.from({ length: VISIBLE_EXPERIENCE }, (_, i) => i);
  const hiddenExperienceIndexes = Array.from(
    { length: Math.min(BLUR_PREVIEW_COUNT, EXPERIENCE_COUNT - VISIBLE_EXPERIENCE) },
    (_, i) => i + VISIBLE_EXPERIENCE,
  );

  const renderExperienceItem = (i: number) => (
    <li key={i}>
      <EntryRow
        title={t(`cv.exp.${i}.title`)}
        org={t(`cv.exp.${i}.org`)}
        date={t(`cv.exp.${i}.date`)}
        desc={optional(`cv.exp.${i}.desc`)}
      />
    </li>
  );

  return (
    <>
      <div className="w-[80%] mx-auto pt-14 flex flex-col gap-14">
        <Section title={t('cv.section.education')}>
          <ul className="flex flex-col gap-6">
            {Array.from({ length: EDUCATION_COUNT }).map((_, i) => (
              <li key={i}>
                <EntryRow
                  title={t(`cv.edu.${i}.title`)}
                  org={t(`cv.edu.${i}.org`)}
                  date={t(`cv.edu.${i}.date`)}
                />
              </li>
            ))}
          </ul>
        </Section>

        <Section title={t('cv.section.experience')}>
          <ul className="flex flex-col gap-7">
            {visibleExperienceIndexes.map(renderExperienceItem)}
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
              {hiddenExperienceIndexes.map(renderExperienceItem)}
            </ul>
          </div>
        </Section>

        <div className="relative select-none" aria-hidden="true">
          <div className="flex flex-col gap-14 blur-md opacity-70 pointer-events-none">
            <Section title={t('cv.section.china')}>
              <ul className="flex flex-col gap-3">
                {Array.from({ length: Math.min(BLUR_PREVIEW_COUNT, CHINA_COUNT) }).map((_, i) => (
                  <li key={i} className="grid grid-cols-[auto_1fr_auto] gap-x-4 items-baseline max-md:grid-cols-[auto_1fr]">
                    <span className="text-brand text-xs leading-relaxed mt-1.5" aria-hidden>●</span>
                    <span className="text-base text-text leading-relaxed">{t(`cv.china.${i}.text`)}</span>
                    <span className="text-sm italic text-muted whitespace-nowrap max-md:col-start-2 max-md:mt-0.5">{t(`cv.china.${i}.years`)}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title={t('cv.section.languages')}>
              <div className="grid grid-cols-2 gap-x-12 gap-y-6 max-md:grid-cols-1">
                {LANGUAGE_META.slice(0, BLUR_PREVIEW_COUNT).map((meta, i) => (
                  <LanguageBar
                    key={i}
                    name={t(`cv.lang.${i}.name`)}
                    level={meta.level}
                    descriptor={t(`cv.lang.${i}.descriptor`)}
                    bars={meta.bars}
                  />
                ))}
              </div>
            </Section>

            <Section title={t('cv.section.skills')}>
              <ul className="flex flex-col gap-3">
                {Array.from({ length: Math.min(BLUR_PREVIEW_COUNT, SKILLS_COUNT) }).map((_, i) => (
                  <li key={i} className="flex gap-3 text-base text-text leading-relaxed">
                    <span className="text-brand text-xs mt-1.5 shrink-0" aria-hidden>●</span>
                    <span>{t(`cv.skill.${i}`)}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <ContactInfoCard
              className="pointer-events-auto"
              email={contactEmail}
              phone={contactPhone}
              wechat={contactWechat}
              address={contactAddress}
            />
          </div>
        </div>
      </div>

      <RequestCvModal open={requestOpen} onClose={() => setRequestOpen(false)} />
    </>
  );
}
