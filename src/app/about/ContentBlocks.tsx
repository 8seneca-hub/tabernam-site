'use client';

import type { ReactNode } from 'react';
import Image from '@/components/ui/Image';
import AboutParagraph from './AboutParagraph';
import VideoCard from '@/components/ui/VideoCard';
import TravelRoutes from './TravelRoutes';
import type { PageTexts } from '@/lib/data';

/**
 * Content-section block model. These are the layout "options" authored in the
 * CMS. Each block is one of four types:
 *
 *  - paragraph  → text only, max-width 640px, 24px paragraph spacing
 *  - two_images → two 16:9 images, full width, 40px gap, border-3 radius
 *  - one_image  → a single full-width image
 *  - video      → a single full-width video card
 *  - horizontal → text on the left, image OR video on the right (40px gap)
 *
 * NOTE ON CMS WIRING
 * ------------------
 * To make this CMS-authored, create a Directus collection (e.g. `about_blocks`)
 * with an O2M relation from the `about` singleton and these fields:
 *   - type    (dropdown: paragraph | two_images | one_image | horizontal)
 *   - text    (textarea — used by paragraph / horizontal)
 *   - image   (file — used by one_image / horizontal)
 *   - image_2 (file — second image for two_images; image used as the first)
 *   - sort    (manual sort)
 * Then map rows → ContentBlock[] in directus.ts (assetUrl() for files) and pass
 * the array here. Until then, the About page feeds a sample array that slices
 * `about_paragraph_body` for text and uses static images.
 */
/** Optional Tailwind margin-top utility overriding the default spacing above a block. */
type BlockSpacing = { spacingTop?: string };

export type ContentBlock = BlockSpacing & (
  | { type: 'paragraph'; start?: number; end?: number; text?: string; splitAfterSentence?: number; suppressVideos?: boolean; paragraphGap?: string }
  | { type: 'two_images'; images: [string, string] }
  | { type: 'one_image'; image: string }
  | { type: 'video'; video?: string; title?: string }
  | { type: 'travel_routes' }
  | { type: 'horizontal'; start: number; end?: number; text?: string; splitAfterSentence?: number; image?: string; video?: string; videoTitle?: string }
);

const BODY_CLASS = 'text-[18px] leading-[26px] font-medium tracking-[-0.02rem] text-dark';

/** A rounded, clipped image frame with a sample/placeholder background. */
function ImageFrame({ src, aspect }: { src: string; aspect: string }) {
  // 20px top/bottom padding wraps the visual frame (the fill image covers the
  // frame's own box, so the breathing room lives on this outer wrapper).
  return (
    <div className="py-[20px]">
      <div className={`feathered-image relative w-full ${aspect} overflow-hidden rounded-3 bg-gray-40`}>
        <Image src={src} alt="" fill className="object-cover" />
      </div>
    </div>
  );
}

interface Props {
  texts: PageTexts;
  blocks: ContentBlock[];
}

// Default vertical spacing above a block. The first block gets none; any block
// may override via `spacingTop`.
const DEFAULT_SPACING = 'mt-[40px]';

function renderBlock(block: ContentBlock, texts: PageTexts): ReactNode {
  switch (block.type) {
    // Text only — capped at 640px, centered horizontally in the parent frame
    // (the text itself stays left-aligned).
    case 'paragraph':
      return (
        <div className="max-w-[640px] mx-auto">
          <AboutParagraph
            texts={texts}
            text={block.text}
            start={block.start}
            end={block.end}
            splitAfterSentence={block.splitAfterSentence}
            suppressVideos={block.suppressVideos}
            paragraphClassName={BODY_CLASS}
            paragraphGap={block.paragraphGap}
          />
        </div>
      );

    // Two 16:9 images, full width, 40px gap.
    case 'two_images':
      return (
        <div className="grid grid-cols-2 gap-[40px]">
          <ImageFrame src={block.images[0]} aspect="aspect-[16/9]" />
          <ImageFrame src={block.images[1]} aspect="aspect-[16/9]" />
        </div>
      );

    // Single full-width image.
    case 'one_image':
      return <ImageFrame src={block.image} aspect="aspect-[16/9]" />;

    // Single full-width video card — same 20px top/bottom breathing room as images.
    case 'video':
      return (
        <div className="py-[20px]">
          <VideoCard videoUrl={block.video} title={block.title} />
        </div>
      );

    // "My Travel Routes" — interactive place tabs + picture of the selected area.
    case 'travel_routes':
      return <TravelRoutes />;

    // Text left, image or video right — both fill their half, 40px gap.
    case 'horizontal':
      return (
        <div className="grid grid-cols-2 gap-[40px] items-start">
          <AboutParagraph
            texts={texts}
            text={block.text}
            start={block.start}
            end={block.end}
            splitAfterSentence={block.splitAfterSentence}
            // The right side already shows the video — don't repeat it inline.
            suppressVideos={!!block.video}
            paragraphClassName={BODY_CLASS}
          />
          {block.video ? (
            <VideoCard videoUrl={block.video} title={block.videoTitle} />
          ) : block.image ? (
            <ImageFrame src={block.image} aspect="aspect-[4/3]" />
          ) : null}
        </div>
      );

    default:
      return null;
  }
}

export default function ContentBlocks({ texts, blocks }: Props) {
  return (
    <section className="px-[60px] pt-[100px] pb-[100px]">
      <div className="max-w-[1320px] mx-auto flex flex-col">
        {blocks.map((block, i) => {
          const content = renderBlock(block, texts);
          if (!content) return null;
          return (
            <div key={i} className={i === 0 ? undefined : (block.spacingTop ?? DEFAULT_SPACING)}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
