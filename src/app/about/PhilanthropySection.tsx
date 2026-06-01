'use client';

import FadeIn from '@/animations/FadeIn';
import VideoCard from '@/components/ui/VideoCard';
import type { PageTexts } from '@/lib/directus';

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
              <VideoCard videoUrl={story.videoUrl} title={story.title} />
              {story.desc && (
                <p className="text-base font-normal text-muted leading-relaxed">
                  {story.desc}
                </p>
              )}
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
