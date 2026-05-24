'use client';

import FadeIn from '@/animations/FadeIn';
import Video from '@/components/ui/Video';
import type { PageTexts } from '@/lib/directus';

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-7 h-7 ml-0.5">
    <path d="M8 5v14l11-7z" />
  </svg>
);

interface Props {
  texts: PageTexts;
}

const STORY_INDICES = [1, 2] as const;

export default function PhilanthropySection({ texts }: Props) {
  const stories = STORY_INDICES
    .map((i) => ({
      title: texts[`philanthropy_story_${i}_title`],
      desc: texts[`philanthropy_story_${i}_desc`],
      videoUrl: texts[`philanthropy_story_${i}_video_url`],
    }))
    .filter((s) => s.title || s.desc);

  if (!texts.philanthropy_title && stories.length === 0) return null;

  return (
    <section className="py-20 md:py-24">
      <div className="w-[80%] mx-auto">
        <FadeIn delay={0.05} className="mb-12 md:mb-16 flex flex-col gap-6 max-w-2xl">
          {texts.philanthropy_title && (
            <h2 className="text-3xl font-bold text-text tracking-tight leading-tight">
              {texts.philanthropy_title}
            </h2>
          )}
          {texts.philanthropy_body && (
            <p className="text-lg font-normal text-muted leading-relaxed">
              {texts.philanthropy_body}
            </p>
          )}
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {stories.map((story, i) => (
            <FadeIn key={story.title || i} delay={0.1 + i * 0.1} className="flex flex-col gap-6">
              <Video
                videoUrl={story.videoUrl}
                title={story.title}
                className="aspect-video rounded-xl border border-border bg-gray-80 shadow-md"
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center text-brand shadow-lg transition-transform group-hover:scale-110">
                    <PlayIcon />
                  </div>
                </div>
              </Video>
              <div className="flex flex-col gap-2">
                {story.title && (
                  <h3 className="text-2xl md:text-3xl font-semibold text-text leading-tight">
                    {story.title}
                  </h3>
                )}
                {story.desc && (
                  <p className="text-base font-normal text-muted leading-relaxed">
                    {story.desc}
                  </p>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
