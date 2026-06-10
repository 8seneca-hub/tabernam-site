'use client';

import Link from 'next/link';
import type { AboutBodyBundle, AboutBodyText, AboutHeaderBundle, AboutHeaderText, ClosingQuoteBundle, PageTexts } from '@/lib/directus';
import AboutParagraph from './AboutParagraph';
import ClosingQuote from './ClosingQuote';
import SubpageHero from '@/app/about/SubpageHero';
import ContentBlocks, { type ContentBlock } from './ContentBlocks';
import Button from '@/components/ui/Button';
import { useI18n } from '@/app/hook/useI18n';
import { TravelRouteMap } from '@/lib/directus/index';

interface Props {
  aboutHeader: AboutHeaderBundle;
  aboutBody: AboutBodyBundle;
  closingQuote: ClosingQuoteBundle;
  travelRouteMaps: TravelRouteMap[];
}

const EMPTY_HEADER: AboutHeaderText = {
  title: '',
  heading: 'About me',
  name: '',
  body: '',
  cvButtonLabel: 'View my CV',
  mottoTranslation: '',
};

const EMPTY_BODY: AboutBodyText = {
  body: '',
  experienceVideoUrl: '',
  experienceVideoTitle: '',
  philanthropyStory1VideoUrl: '',
  philanthropyStory1Title: '',
  philanthropyStory2VideoUrl: '',
  philanthropyStory2Title: '',
  travelRoutesHeading: '',
  travelRoutesBody: '',
};

export default function AboutContent({ aboutHeader, aboutBody, closingQuote, travelRouteMaps }: Props) {
  const { lang } = useI18n();

  // Header: active language → English → hardcoded fallback.
  const langHeader = aboutHeader.byLang[lang];
  const enHeader = aboutHeader.byLang['en'];
  const header =
    (langHeader && langHeader.heading ? langHeader : null) ??
    (enHeader && enHeader.heading ? enHeader : null) ??
    EMPTY_HEADER;
  const heroImage = aboutHeader.image || '/tibor_image.png';

  // Body: same fallback chain.
  const langBody = aboutBody.byLang[lang];
  const enBody = aboutBody.byLang['en'];
  const body =
    (langBody && langBody.body ? langBody : null) ??
    (enBody && enBody.body ? enBody : null) ??
    EMPTY_BODY;

  const bodyImage1 = aboutBody.image1 || '/carousel/photo-03.jpg';
  const bodyImage2 = aboutBody.image2 || '/carousel/photo-07.jpg';
  const bodyImage3 = aboutBody.image3 || '/carousel/photo-11.jpg';

  // Reusable map for AboutParagraph's inline-YouTube → title lookup.
  // Built from about_body so the legacy `texts` bundle is no longer needed.
  const paragraphTexts: PageTexts = {
    experience_video_url: body.experienceVideoUrl,
    experience_video_title: body.experienceVideoTitle,
    philanthropy_story_1_video_url: body.philanthropyStory1VideoUrl,
    philanthropy_story_1_title: body.philanthropyStory1Title,
    philanthropy_story_2_video_url: body.philanthropyStory2VideoUrl,
    philanthropy_story_2_title: body.philanthropyStory2Title,
  };

  // Content-block paragraphs index into `about_body.body` (the content-block
  // portion only — the intro paragraphs live separately on about_header.body).
  const blocks: ContentBlock[] = [
    { type: 'paragraph', start: 0, end: 1 },
    { type: 'two_images', images: [bodyImage1, bodyImage2] },
    { type: 'paragraph', start: 1, end: 2, splitAfterSentence: 4 },
    { type: 'one_image', image: bodyImage3 },
    { type: 'paragraph', start: 2, end: 4 },
    { type: 'paragraph', start: 4, end: 5, suppressVideos: true },
    { type: 'video', video: body.experienceVideoUrl, title: body.experienceVideoTitle },
    { type: 'travel_routes' },
    { type: 'paragraph', start: 5, end: 8, suppressVideos: true },
    { type: 'video', video: body.philanthropyStory1VideoUrl, title: body.philanthropyStory1Title },
    { type: 'paragraph', start: 8, end: 10, suppressVideos: true },
    { type: 'video', video: body.philanthropyStory2VideoUrl, title: body.philanthropyStory2Title },
    { type: 'paragraph', start: 10 },
  ];

  return (
    <main className="cv-page pt-[var(--header-height)]">
      <SubpageHero
        heading={header.heading}
        eyebrow={header.title}
        subheading={header.name}
        image={heroImage}
        imageAlt="Portrait photograph"
        mottoLatin={aboutHeader.mottoLatin}
        mottoTranslation={header.mottoTranslation}
        mottoAuthor={aboutHeader.mottoAuthor}
      >
        <AboutParagraph texts={paragraphTexts} text={header.body} cvAsText />
        <Button as={Link} href="/cv" variant="primary" shape="pill" className="self-start !text-[18px] font-medium !text-white !bg-brand !px-[28px] !py-[16px] !gap-[10px]">
          {header.cvButtonLabel}
        </Button>
      </SubpageHero>
      <ContentBlocks
        texts={paragraphTexts}
        blocks={blocks}
        travelRouteMaps={travelRouteMaps}
        body={body.body}
        travelRoutesHeading={body.travelRoutesHeading}
        travelRoutesBody={body.travelRoutesBody}
      />
      <ClosingQuote closingQuote={closingQuote} />
    </main>
  );
}
