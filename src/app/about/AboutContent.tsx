'use client';

import Link from 'next/link';
import type { AboutBodyBundle, AboutBodyText, AboutHeaderBundle, AboutHeaderText, ClosingQuoteBundle } from '@/lib/directus';
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
  paragraphs: {},
  travelRoutesHeading: '', travelRoutesBody: '',
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

  // Body text: same fallback chain.
  const langBody = aboutBody.byLang[lang];
  const enBody = aboutBody.byLang['en'];
  const hasContent = (b: AboutBodyText | undefined) => !!(b && Object.keys(b.paragraphs).length > 0);
  const body: AboutBodyText =
    (hasContent(langBody) ? langBody! : null) ??
    (hasContent(enBody) ? enBody! : null) ??
    EMPTY_BODY;

  // Pull the videos for the current language (each video's `byLang` carries
  // its own per-language URL + title).
  function pickVideo(v: { byLang: Record<string, { url: string; title: string }> }) {
    return v.byLang[lang] ?? v.byLang['en'] ?? { url: '', title: '' };
  }
  const videosByParagraph: Record<number, Array<{ url: string; title: string }>> = {};
  for (const [k, vids] of Object.entries(aboutBody.videosByParagraph)) {
    videosByParagraph[Number(k)] = vids.map(pickVideo).filter((v) => v.url);
  }

  // Dynamic paragraph slots — walk every N that has *any* content (text,
  // image, or video) in numeric order. Add paragraph_8 (or paragraph_99)
  // on Directus and it renders here automatically. TravelRoutes is wedged
  // in after slot 3 (i.e. between paragraph 3 and paragraph 4).
  const slotNumbers = new Set<number>();
  for (const n of Object.keys(body.paragraphs)) slotNumbers.add(Number(n));
  for (const n of Object.keys(aboutBody.imagesByParagraph)) slotNumbers.add(Number(n));
  for (const n of Object.keys(videosByParagraph)) slotNumbers.add(Number(n));
  const sortedSlots = [...slotNumbers].filter((n) => Number.isFinite(n)).sort((a, b) => a - b);

  const blocks: ContentBlock[] = [];
  for (const n of sortedSlots) {
    const text = body.paragraphs[n];
    const images = aboutBody.imagesByParagraph[n] ?? [];
    const videos = videosByParagraph[n] ?? [];
    if (text) blocks.push({ type: 'paragraph', text });
    if (images.length > 0) blocks.push({ type: 'images_grid', images });
    if (videos.length > 0) blocks.push({ type: 'videos_grid', videos });
    if (n === 3) blocks.push({ type: 'travel_routes' });
  }
  // If there's no slot 3 at all, still surface TravelRoutes at the end.
  if (!sortedSlots.includes(3)) blocks.push({ type: 'travel_routes' });

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
        <AboutParagraph text={header.body} />
        <Button as={Link} href="/cv" variant="primary" shape="pill" className="self-start !text-[18px] font-medium !text-white !bg-brand !px-[28px] !py-[16px] !gap-[10px]">
          {header.cvButtonLabel}
        </Button>
      </SubpageHero>
      <ContentBlocks
        blocks={blocks}
        travelRouteMaps={travelRouteMaps}
        body={''}
        travelRoutesHeading={body.travelRoutesHeading}
        travelRoutesBody={body.travelRoutesBody}
      />
      <ClosingQuote closingQuote={closingQuote} />
    </main>
  );
}
