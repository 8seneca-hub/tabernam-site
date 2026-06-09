'use client';

import Link from 'next/link';
import { pickPageTexts, type PageTextsBundle } from '@/lib/directus';
import AboutParagraph from './AboutParagraph';
import ClosingQuote from './ClosingQuote';
import SubpageHero from '@/components/SubpageHero';
import ContentBlocks, { type ContentBlock } from './ContentBlocks';
import Button from '@/components/ui/Button';
import { useI18n } from '@/app/hook/useI18n';
import { TravelRouteMap } from '@/lib/directus/index';

interface Props {
  texts: PageTextsBundle;
  heroImage: string;
  travelRouteMaps: TravelRouteMap[];
}

export default function AboutContent({ texts: bundle, heroImage, travelRouteMaps }: Props) {
  const { lang, t } = useI18n();
  const texts = pickPageTexts(bundle, lang);

  const bodyImage1 = texts.body_image_1 || '/carousel/photo-03.jpg';
  const bodyImage2 = texts.body_image_2 || '/carousel/photo-07.jpg';
  const bodyImage3 = texts.body_image_3 || '/carousel/photo-11.jpg';

  const blocks: ContentBlock[] = [
    { type: 'paragraph', start: 3, end: 4 },
    { type: 'two_images', images: [bodyImage1, bodyImage2] },
    { type: 'paragraph', start: 4, end: 5, splitAfterSentence: 4 },
    { type: 'one_image', image: bodyImage3 },
    { type: 'paragraph', start: 5, end: 7 },
    { type: 'paragraph', start: 7, end: 8, suppressVideos: true },
    { type: 'video', video: texts.experience_video_url, title: texts.experience_video_title },
    { type: 'travel_routes' },
    { type: 'paragraph', start: 8, end: 11, suppressVideos: true },
    { type: 'video', video: texts.philanthropy_story_1_video_url, title: texts.philanthropy_story_1_title },
    { type: 'paragraph', start: 11, end: 13, suppressVideos: true },
    { type: 'video', video: texts.philanthropy_story_2_video_url, title: texts.philanthropy_story_2_title },
    { type: 'paragraph', start: 13 },
  ];

  return (
    <main className="cv-page pt-[var(--header-height)]">
      <SubpageHero
        heading={t('heading.aboutMe')}
        eyebrow={texts.about_eyebrow}
        subheading={texts.hero_name}
        image={heroImage}
        imageAlt="Portrait photograph"
      >
        <AboutParagraph texts={texts} end={3} cvAsText />
        <Button as={Link} href="/cv" variant="primary" shape="pill" className="self-start !text-[18px] font-medium !text-white !bg-brand !px-[28px] !py-[16px] !gap-[10px]">
          {t('btn.viewCV')}
        </Button>
      </SubpageHero>
      <ContentBlocks texts={texts} blocks={blocks} travelRouteMaps={travelRouteMaps} />
      <ClosingQuote texts={texts} />
    </main>
  );
}
