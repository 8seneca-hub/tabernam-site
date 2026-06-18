'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/app/hook/useI18n';
import {
  pickEntry,
  pickExtrasText,
  pickSectionTitle,
  type CvEducationEntry,
  type CvExperienceEntry,
  type CvExtras,
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

interface Props {
  backHref?: string;
  education: CvSectionData<CvEducationEntry>;
  experience: CvSectionData<CvExperienceEntry>;
  extras: CvExtras;
}

export default function CVSection({ backHref, education, experience, extras }: Props) {
  const { lang, t } = useI18n();
  const [requestOpen, setRequestOpen] = useState(false);
  // Chinese visitors see the full CV inline (no blur, no contact gate) to
  // match the printed CN handout. Other languages keep the teaser flow with
  // the three extra sections rendered behind blur as a contact prompt.
  const isFullView = lang === 'cn';

  const educationTitle = pickSectionTitle(education, lang, t('cv.section.education'));
  const experienceTitle = pickSectionTitle(experience, lang, t('cv.section.experience'));

  const visibleExperience = isFullView
    ? experience.entries
    : experience.entries.slice(0, VISIBLE_EXPERIENCE);
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

  const chinaTitle = pickExtrasText(extras.sectionTitles.china, lang, 'Activities in China');
  const languagesTitle = pickExtrasText(extras.sectionTitles.languages, lang, 'Languages');
  const skillsTitle = pickExtrasText(extras.sectionTitles.skills, lang, 'Personal skills');
  const nativeLabel = pickExtrasText(extras.languagesNativeLabel, lang, '');

  const chinaRows = extras.china
    .map((e) => e.byLang[lang] || e.byLang.en)
    .filter((v): v is { text: string; years: string } => Boolean(v && v.text));
  const languageRows = extras.languages
    .map((e) => {
      const v = e.byLang[lang] || e.byLang.en;
      return v && v.name ? { ...v, bars: e.bars } : null;
    })
    .filter((v): v is { name: string; level: string; descriptor: string; bars: number } => Boolean(v));
  const skillRows = extras.skills
    .map((e) => e.byLang[lang] || e.byLang.en)
    .filter((v): v is { text: string } => Boolean(v && v.text));

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

          {!isFullView && (
            <>
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
            </>
          )}
        </Section>

        {isFullView ? (
          <>
            {chinaRows.length > 0 && (
              <Section title={chinaTitle}>
                <ul className="flex flex-col gap-3">
                  {chinaRows.map((row, i) => (
                    <li key={i} className="grid grid-cols-[auto_1fr_auto] gap-x-4 items-baseline max-md:grid-cols-[auto_1fr]">
                      <span className="text-brand text-xs leading-relaxed mt-1.5" aria-hidden>●</span>
                      <span className="text-base text-text leading-relaxed">{row.text}</span>
                      <span className="text-sm italic text-muted whitespace-nowrap max-md:col-start-2 max-md:mt-0.5">{row.years}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {languageRows.length > 0 && (
              <Section title={languagesTitle}>
                {nativeLabel && <p className="text-base text-text mb-6">{nativeLabel}</p>}
                <div className="grid grid-cols-2 gap-x-12 gap-y-6 max-md:grid-cols-1">
                  {languageRows.map((meta, i) => (
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
            )}

            {skillRows.length > 0 && (
              <Section title={skillsTitle}>
                <ul className="flex flex-col gap-3">
                  {skillRows.map((skill, i) => (
                    <li key={i} className="flex gap-3 text-base text-text leading-relaxed">
                      <span className="text-brand text-xs mt-1.5 shrink-0" aria-hidden>●</span>
                      <span>{skill.text}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {backHref && (
              <div className="relative mt-6 flex items-center justify-center">
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
          </>
        ) : (
          /* Blur preview: china / languages / skills behind the contact gate. */
          /* We render the real (translated) content under blur so the layout */
          /* sized correctly — the user can't actually read it. */
          <div className="relative select-none" aria-hidden="true">
            <div className="flex flex-col gap-14 blur-md opacity-70 pointer-events-none">
              {chinaRows.length > 0 && (
                <Section title={chinaTitle}>
                  <ul className="flex flex-col gap-3">
                    {chinaRows.slice(0, 1).map((row, i) => (
                      <li key={i} className="grid grid-cols-[auto_1fr_auto] gap-x-4 items-baseline max-md:grid-cols-[auto_1fr]">
                        <span className="text-brand text-xs leading-relaxed mt-1.5" aria-hidden>●</span>
                        <span className="text-base text-text leading-relaxed">{row.text}</span>
                        <span className="text-sm italic text-muted whitespace-nowrap max-md:col-start-2 max-md:mt-0.5">{row.years}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {languageRows.length > 0 && (
                <Section title={languagesTitle}>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6 max-md:grid-cols-1">
                    {languageRows.slice(0, 1).map((meta, i) => (
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
              )}

              {skillRows.length > 0 && (
                <Section title={skillsTitle}>
                  <ul className="flex flex-col gap-3">
                    {skillRows.slice(0, 1).map((skill, i) => (
                      <li key={i} className="flex gap-3 text-base text-text leading-relaxed">
                        <span className="text-brand text-xs mt-1.5 shrink-0" aria-hidden>●</span>
                        <span>{skill.text}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <ContactInfoCard className="pointer-events-auto" />
            </div>
          </div>
        )}
      </div>

      <RequestCvModal open={requestOpen} onClose={() => setRequestOpen(false)} />
    </>
  );
}
