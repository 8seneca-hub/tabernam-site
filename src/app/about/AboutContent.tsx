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

  const blocks: ContentBlock[] = [
    { type: 'paragraph', start: 2, end: 3, splitAfterSentence: 2 },   // Ministry of Economy (split into 2)
    { type: 'two_images', images: ['/carousel/photo-03.jpg', '/carousel/photo-07.jpg'] },
    { type: 'paragraph', start: 3, end: 4, splitAfterSentence: 4 },   // diplomatic service (split into 2)
    { type: 'one_image', image: '/carousel/photo-11.jpg' },
    { type: 'paragraph', start: 4, end: 6 },                          // China projects + return
    { type: 'horizontal', start: 6, end: 7, video: texts.experience_video_url, videoTitle: texts.experience_video_title },
    { type: 'paragraph', start: 7, end: 12, suppressVideos: true },
    { type: 'video', video: texts.philanthropy_story_1_video_url, title: texts.philanthropy_story_1_title }, // Hospital Construction in Kenya
    { type: 'paragraph', start: 12 },                                 // GMT, Lourdes, closing
  ];

  return (
    <main className="cv-page pt-[var(--header-height)]">
      <SubpageHero
        heading={t('heading.aboutMe')}
        image={heroImage}
        imageAlt="Portrait photograph"
      >
        <AboutParagraph texts={texts} end={2} cvAsText />
        <Button as={Link} href="/cv" variant="primary" shape="pill" className="self-start !text-[18px] font-medium !text-white !bg-brand !px-[28px] !py-[16px] !gap-[10px]">
          {t('btn.viewCV')}
        </Button>
      </SubpageHero>
      <ContentBlocks texts={texts} blocks={blocks} />

      <ClosingQuote texts={texts} />
    </main>
  );
}
