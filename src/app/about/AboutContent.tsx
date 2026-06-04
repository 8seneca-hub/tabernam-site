'use client';

import Link from 'next/link';
import { pickPageTexts, type PageTextsBundle } from '@/lib/directus';
import AboutParagraph from './AboutParagraph';
import ClosingQuote from './ClosingQuote';
import SubpageHero from '@/components/SubpageHero';
import ContentBlocks, { type ContentBlock } from './ContentBlocks';
import Button from '@/components/ui/Button';
import { useI18n } from '@/app/hook/useI18n';

interface Props {
  texts: PageTextsBundle;
  heroImage: string;
}

export default function AboutContent({ texts: bundle, heroImage }: Props) {
  const { lang, t } = useI18n();
  const texts = pickPageTexts(bundle, lang);

  // Content blocks for the section below the hero. Paragraph indices map to the
  // blank-line-separated paragraphs of `about_paragraph_body`; `splitAfterSentence`
  // breaks a single CMS paragraph into two visual paragraphs.
  // TODO: replace with CMS-authored blocks (schema documented in ContentBlocks.tsx).
  const blocks: ContentBlock[] = [
    // Sub-section 1: the Ministry of Economy intro paragraph now lives in the hero
    // (AboutParagraph end={3}). This section opens with the "trade missions" para
    // (CMS para 3, split out of para 2), followed by the two photos.
    { type: 'paragraph', start: 3, end: 4 },                          // trade missions intro
    { type: 'two_images', images: ['/carousel/photo-03.jpg', '/carousel/photo-07.jpg'] },
    { type: 'paragraph', start: 4, end: 5, splitAfterSentence: 4 },   // diplomatic service (split into 2)
    { type: 'one_image', image: '/carousel/photo-11.jpg' },
    { type: 'paragraph', start: 5, end: 7 },                          // China projects + return
    // 2024–25 shop — text on top, "Innovation in Foreign Trade" video below.
    // The paragraph links "this one" to the shop video; suppressVideos keeps the
    // raw YouTube URL from embedding inline (the named link renders regardless).
    { type: 'paragraph', start: 7, end: 8, suppressVideos: true },
    { type: 'video', video: texts.experience_video_url, title: texts.experience_video_title },
    // "My Travel Routes" — interactive section right after the experience video.
    { type: 'travel_routes' },
    // Charity intro/orgs/hospital text (developing+charity merged, then Knights, hospital).
    { type: 'paragraph', start: 8, end: 11, suppressVideos: true },
    { type: 'video', video: texts.philanthropy_story_1_video_url, title: texts.philanthropy_story_1_title }, // Hospital Construction in Kenya
    // GMT + Lourdes text, then the Lourdes video as a full-width block (matches the hospital layout
    // above — instead of the URL embedding inline at a smaller width inside the paragraph).
    { type: 'paragraph', start: 11, end: 13, suppressVideos: true },
    { type: 'video', video: texts.philanthropy_story_2_video_url, title: texts.philanthropy_story_2_title }, // The Trip to Lourdes
    { type: 'paragraph', start: 13 },                                 // Hong Kong, slogan, closing
  ];

  return (
    <main className="cv-page pt-[var(--header-height)]">
      <SubpageHero
        heading={t('heading.aboutMe')}
        image={heroImage}
        imageAlt="Portrait photograph"
      >
        <AboutParagraph texts={texts} end={3} cvAsText />
        <Button as={Link} href="/cv" variant="primary" shape="pill" className="self-start !text-[18px] font-medium !text-white !bg-brand !px-[28px] !py-[16px] !gap-[10px]">
          {t('btn.viewCV')}
        </Button>
      </SubpageHero>

      {/* Content section below the hero — CMS-selectable layout blocks
          (paragraph / 2-images / 1-image / horizontal). */}
      <ContentBlocks texts={texts} blocks={blocks} />

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
      </SubpageHero>
      <ContentBlocks texts={texts} blocks={blocks} />

      <ClosingQuote texts={texts} />
    </main>
  );
}
