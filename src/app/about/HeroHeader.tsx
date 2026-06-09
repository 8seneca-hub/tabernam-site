'use client';

import { useI18n } from '@/app/hook/useI18n';
import type { PageTexts } from '@/lib/directus';
import FadeIn from '@/animations/FadeIn';
import Image from '@/components/ui/Image';

interface Props {
  texts: PageTexts;
}

export default function HeroHeader({ texts }: Props) {
  const { t } = useI18n();
  const heroName = texts.hero_name;

  return (
    <section className="bg-brand text-white">
      <div className="w-[80%] mx-auto py-16 flex flex-col md:flex-row gap-12 md:gap-20 items-center">
        <FadeIn delay={0.05} className="flex-1">
          {heroName && (
            <h1 className="text-6xl font-bold uppercase tracking-tight leading-none max-md:text-5xl max-[480px]:text-4xl">
              {heroName}
            </h1>
          )}
        </FadeIn>
        <FadeIn delay={0.1} className="flex-none w-full max-w-[280px] max-md:mx-auto">
          <div className="feathered-image relative overflow-hidden shadow-2xl bg-white/10">
            <Image
              src={texts.portrait_image || '/tibor_image.png'}
              alt="Portrait photograph"
              priority
              className="w-full h-auto"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
