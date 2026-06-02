'use client';

import FadeIn from '@/animations/FadeIn';
import Video from '@/components/ui/Video';
import type { PageTexts } from '@/lib/directus';

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-9 h-9 ml-1">
    <path d="M8 5v14l11-7z" />
  </svg>
);

interface Props {
  texts: PageTexts;
}

export default function ExperienceStoriesSection({ texts }: Props) {
  const title = texts.experience_title;
  const body = texts.experience_body;
  const eyebrow = texts.experience_eyebrow;
  const videoTitle = texts.experience_video_title;
  const videoUrl = texts.experience_video_url;

  if (!title && !body && !videoTitle && !videoUrl) return null;

  return (
    <section className="bg-gray-70 py-20 md:py-24">
      <div className="w-[80%] mx-auto">
        {(title || body) && (
          <FadeIn delay={0.05} className="mb-12 md:mb-16 flex flex-col gap-6 max-w-3xl">
            {title && (
              <h2 className="text-3xl font-bold text-text tracking-tight leading-tight">
                {title}
              </h2>
            )}
            {body && (
              <p className="text-lg font-normal text-muted leading-relaxed">
                {body}
              </p>
            )}
          </FadeIn>
        )}

        <FadeIn delay={0.1}>
          <Video
            videoUrl={videoUrl}
            title={videoTitle}
            className="feathered-image aspect-[21/9] rounded-xl border border-border bg-gray-70 shadow-lg"
          >
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-brand flex items-center justify-center text-white shadow-2xl transition-transform group-hover:scale-110">
                <PlayIcon />
              </div>
            </div>
            {(eyebrow || videoTitle) && (
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
                {eyebrow && (
                  <span className="block text-xs font-semibold text-white/90 uppercase tracking-[0.2em] mb-2">
                    {eyebrow}
                  </span>
                )}
                {videoTitle && (
                  <h3 className="text-2xl md:text-3xl font-semibold text-white leading-tight">
                    {videoTitle}
                  </h3>
                )}
              </div>
            )}
          </Video>
        </FadeIn>
      </div>
    </section>
  );
}
