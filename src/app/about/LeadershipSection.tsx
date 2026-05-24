'use client';

import Image from '@/components/ui/Image';
import FadeIn from '@/animations/FadeIn';
import type { PageTexts } from '@/lib/directus';
import { Globe } from 'lucide-react';

interface Props {
  texts: PageTexts;
}

const MAX_BODIES = 6;

export default function LeadershipSection({ texts }: Props) {
  const title = texts.leadership_title;
  const description = texts.leadership_description;
  const items = Array.from({ length: MAX_BODIES }, (_, i) => ({
    body: texts[`leadership_body_${i + 1}`],
    image: texts[`leadership_body_${i + 1}_image`],
  })).filter((item) => Boolean(item.body));

  if (!title && items.length === 0) return null;

  return (
    <section className="relative py-10">
      <div className="w-[80%] mx-auto flex flex-col gap-8 relative z-10">
        {title && (
          <FadeIn delay={0.05}>
            <h2 className="text-3xl font-bold text-text tracking-tight leading-tight">
              {title}
            </h2>
          </FadeIn>
        )}
        {description && (
          <p className="text-lg font-normal text-muted leading-relaxed">
            {description}
          </p>
        )}
        {items.length > 0 && (
          <div className="flex flex-col gap-6">
            {items.map((item, i) => (
              <FadeIn key={i} delay={0.1 + i * 0.05} className="flex gap-6 items-center">
                <div className="w-16 h-16 shrink-0 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
                  <Globe className='h-8 w-8' />
                </div>
                <p className="max-w-lg text-lg font-normal text-text leading-relaxed">
                  {item.body}
                </p>
                {item.image && (
                  <div className="hidden md:block ml-auto w-30 h-30 relative shrink-0">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="120px"
                      className="object-contain"
                    />
                  </div>
                )}
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
