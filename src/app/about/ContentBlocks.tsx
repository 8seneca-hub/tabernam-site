'use client';

import type { ReactNode } from 'react';
import Image from '@/components/ui/Image';
import AboutParagraph from './AboutParagraph';
import VideoCard from '@/components/ui/VideoCard';
import TravelRoutes from './TravelRoutes';
import type { TravelRouteMap } from '@/lib/data';

type BlockSpacing = { spacingTop?: string };

export type ContentBlock = BlockSpacing & (
  | { type: 'paragraph'; start?: number; end?: number; text?: string; paragraphGap?: string }
  | { type: 'two_images'; images: [string, string] }
  | { type: 'one_image'; image: string }
  | { type: 'video'; video?: string; title?: string }
  | { type: 'travel_routes' }
  | { type: 'horizontal'; start: number; end?: number; text?: string; image?: string; video?: string; videoTitle?: string }
  /** Variable-length array of images. 1 → single full-width frame, 2+ → 2-column grid. */
  | { type: 'images_grid'; images: string[] }
  /** Variable-length array of videos. 1 → single full-width card, 2+ → 2-column grid. */
  | { type: 'videos_grid'; videos: Array<{ url: string; title?: string }> }
);

const BODY_CLASS = 'text-[18px] leading-[26px] font-medium tracking-[-0.02rem] text-dark';

function ImageFrame({ src, aspect }: { src: string; aspect: string }) {
  return (
    <div className="py-[20px]">
      <div className={`feathered-image relative w-full ${aspect} overflow-hidden rounded-3 bg-gray-40`}>
        <Image src={src} alt="" fill className="object-cover" />
      </div>
    </div>
  );
}

interface Props {
  blocks: ContentBlock[];
  travelRouteMaps?: TravelRouteMap[];
  body: string;
  travelRoutesHeading?: string;
  travelRoutesBody?: string;
}

const DEFAULT_SPACING = 'mt-[40px]';

function sliceBody(body: string, start = 0, end?: number): string {
  const paragraphs = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return paragraphs.slice(start, end).join('\n\n');
}

function renderBlock(block: ContentBlock, travelRouteMaps: TravelRouteMap[], body: string, travelRoutesHeading: string | undefined, travelRoutesBody: string | undefined): ReactNode {
  switch (block.type) {
    case 'paragraph': {
      const text = block.text ?? sliceBody(body, block.start, block.end);
      return (
        <div className="max-w-[640px] mx-auto">
          <AboutParagraph
            text={text}
            paragraphClassName={BODY_CLASS}
            paragraphGap={block.paragraphGap}
          />
        </div>
      );
    }

    case 'two_images':
      return (
        <div className="grid grid-cols-2 gap-[40px] max-md:grid-cols-1 max-md:gap-[20px]">
          <ImageFrame src={block.images[0]} aspect="aspect-[16/9]" />
          <ImageFrame src={block.images[1]} aspect="aspect-[16/9]" />
        </div>
      );

    case 'one_image':
      return <ImageFrame src={block.image} aspect="aspect-[16/9]" />;

    case 'video':
      if (!block.video) return null;
      return (
        <div className="py-[20px]">
          <VideoCard videoUrl={block.video} title={block.title} />
        </div>
      );

    case 'travel_routes':
      return <TravelRoutes maps={travelRouteMaps} heading={travelRoutesHeading} body={travelRoutesBody} />;

    case 'images_grid': {
      const imgs = block.images.filter(Boolean);
      if (imgs.length === 0) return null;
      const cols = imgs.length === 1 ? 'grid-cols-1' : 'grid-cols-2 max-md:grid-cols-1';
      return (
        <div className={`grid ${cols} gap-[40px] max-md:gap-[20px]`}>
          {imgs.map((src, i) => (
            <ImageFrame key={i} src={src} aspect="aspect-[16/9]" />
          ))}
        </div>
      );
    }

    case 'videos_grid': {
      const vids = block.videos.filter((v) => v.url);
      if (vids.length === 0) return null;
      const cols = vids.length === 1 ? 'grid-cols-1' : 'grid-cols-2 max-md:grid-cols-1';
      return (
        <div className={`py-[20px] grid ${cols} gap-[40px] max-md:gap-[20px]`}>
          {vids.map((v, i) => (
            <VideoCard key={i} videoUrl={v.url} title={v.title} />
          ))}
        </div>
      );
    }

    case 'horizontal': {
      const text = block.text ?? sliceBody(body, block.start, block.end);
      return (
        <div className="grid grid-cols-2 gap-[40px] items-start max-md:grid-cols-1 max-md:gap-[24px]">
          <AboutParagraph
            text={text}
            paragraphClassName={BODY_CLASS}
          />
          {block.video ? (
            <VideoCard videoUrl={block.video} title={block.videoTitle} />
          ) : block.image ? (
            <ImageFrame src={block.image} aspect="aspect-[4/3]" />
          ) : null}
        </div>
      );
    }

    default:
      return null;
  }
}

export default function ContentBlocks({ blocks, travelRouteMaps = [], body, travelRoutesHeading, travelRoutesBody }: Props) {
  return (
    <section className="px-[60px] pt-[100px] pb-[100px] max-md:px-[16px] max-md:pt-[60px] max-md:pb-[60px]">
      <div className="max-w-[1320px] mx-auto flex flex-col">
        {blocks.map((block, i) => {
          const content = renderBlock(block, travelRouteMaps, body, travelRoutesHeading, travelRoutesBody);
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
