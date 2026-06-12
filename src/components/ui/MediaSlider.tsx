'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from './Image';
import VideoCard from './VideoCard';

export type MediaSlide =
  | { type: 'image'; src: string; alt?: string }
  | { type: 'video'; url: string; title?: string };

interface Props {
  slides: MediaSlide[];
  className?: string;
  /** Tailwind aspect utility applied to each slide. Default `aspect-[16/9]`. */
  aspect?: string;
}

export default function MediaSlider({ slides, className = '', aspect = 'aspect-[16/9]' }: Props) {
  const [index, setIndex] = useState(0);
  if (slides.length === 0) return null;
  const last = slides.length - 1;

  return (
    <div className={`relative ${className}`.trim()}>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => {
            const isImage = slide.type === 'image';
            const isActive = i === index;
            return (
              <div
                key={i}
                className={`relative w-full shrink-0 ${aspect} overflow-hidden bg-surface${isImage ? ' feathered-image' : ''}`}
              >
                {isImage ? (
                  <Image className="w-full h-full object-cover" src={slide.src} alt={slide.alt ?? ''} />
                ) : (
                  <VideoCard
                    key={isActive ? 'active' : 'idle'}
                    videoUrl={slide.url}
                    title={slide.title}
                    className="w-full h-full"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            aria-label="Previous"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.18)] flex items-center justify-center text-text hover:text-brand transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(last, i + 1))}
            disabled={index === last}
            aria-label="Next"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.18)] flex items-center justify-center text-text hover:text-brand transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={22} />
          </button>

          <div className="mt-6 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-brand' : 'w-2 bg-gray-60'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
