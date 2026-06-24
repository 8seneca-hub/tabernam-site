'use client';

import type { ReactNode } from 'react';
import Image from '@/components/ui/Image';
import AboutParagraph from './AboutParagraph';
import VideoCard from '@/components/ui/VideoCard';
import MediaSlider, { type MediaSlide } from '@/components/ui/MediaSlider';
import TravelRoutes from './TravelRoutes';
import type { TravelRoutesBundle } from '@/lib/directus';

type BlockSpacing = { spacingTop?: string };

export type ContentBlock = BlockSpacing & (
  | { type: 'paragraph'; start?: number; end?: number; text?: string; paragraphGap?: string }
  | { type: 'two_images'; images: [string, string] }
  | { type: 'one_image'; image: string }
  | { type: 'video'; video?: string; chinaUrl?: string; title?: string }
  | { type: 'travel_routes' }
  | { type: 'horizontal'; start: number; end?: number; text?: string; image?: string; video?: string; chinaUrl?: string; videoTitle?: string }
  | { type: 'images_grid'; images: string[] }
  | { type: 'videos_grid'; videos: Array<{ url: string; chinaUrl?: string; title?: string }> }
);

const BODY_CLASS = 'text-[18px] leading-[26px] font-medium tracking-[-0.02rem] text-dark';

function ImageFrame({ src, aspect }: { src: string; aspect: string }) {
  return (
    <div className="py-[20px]">
      <div className={`feathered-image relative w-full ${aspect} overflow-hidden rounded-3 bg-gray-40`}>
        <Image src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
      </div>
    </div>
  );
}

interface Props {
  blocks: ContentBlock[];
  travelRoutes?: TravelRoutesBundle;
  body: string;
  useChina?: boolean;
}

const DEFAULT_SPACING = 'mt-[40px]';

function sliceBody(body: string, start = 0, end?: number): string {
  const paragraphs = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return paragraphs.slice(start, end).join('\n\n');
}

function renderBlock(block: ContentBlock, travelRoutes: TravelRoutesBundle | undefined, body: string, useChina: boolean): ReactNode {
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
          <VideoCard videoUrl={block.video} chinaUrl={block.chinaUrl} useChina={useChina} title={block.title} />
        </div>
      );

    case 'travel_routes':
      return <TravelRoutes travelRoutes={travelRoutes} />;

    case 'images_grid': {
      const imgs = block.images.filter(Boolean);
      if (imgs.length === 0) return null;
      if (imgs.length === 1) {
        return <ImageFrame src={imgs[0]} aspect="aspect-[16/9]" />;
      }
      const slides: MediaSlide[] = imgs.map((src) => ({ type: 'image', src, alt: '' }));
      return <MediaSlider slides={slides} className="py-[20px]" />;
    }

    case 'videos_grid': {
      const vids = block.videos.filter((v) => v.url);
      if (vids.length === 0) return null;
      if (vids.length === 1) {
        return (
          <div className="py-[20px]">
            <VideoCard videoUrl={vids[0].url} chinaUrl={vids[0].chinaUrl} useChina={useChina} title={vids[0].title} />
          </div>
        );
      }
      const slides: MediaSlide[] = vids.map((v) => ({ type: 'video', url: v.url, chinaUrl: v.chinaUrl, title: v.title }));
      return <MediaSlider slides={slides} className="py-[20px]" useChina={useChina} />;
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
            <VideoCard videoUrl={block.video} chinaUrl={block.chinaUrl} useChina={useChina} title={block.videoTitle} />
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

export default function ContentBlocks({ blocks, travelRoutes, body, useChina = false }: Props) {
  return (
    <section className="px-[60px] pt-[100px] pb-[100px] max-md:px-[16px] max-md:pt-[60px] max-md:pb-[60px]">
      <div className="max-w-[1320px] mx-auto flex flex-col">
        {blocks.map((block, i) => {
          const content = renderBlock(block, travelRoutes, body, useChina);
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
