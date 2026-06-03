'use client';

import FadeIn from '@/animations/FadeIn';
import VideoCard from '@/components/ui/VideoCard';
import type { PageTexts } from '@/lib/directus';

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
    <section className="bg-gray-40 py-20 md:py-24">
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
          <VideoCard
            videoUrl={videoUrl}
            title={videoTitle}
            eyebrow={eyebrow}
            aspect="cinema"
            playStyle="brand"
          />
        </FadeIn>
      </div>
    </section>
  );
}
