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
  const heroEmail = texts.hero_email;
  const heroPhone = texts.hero_phone;
  const heroWechat = texts.hero_wechat;
  const phoneHref = heroPhone ? `tel:${heroPhone.replace(/\s+/g, '')}` : undefined;

  return (
    <section className="bg-brand text-white">
      <div className="w-[80%] mx-auto py-16 flex flex-col md:flex-row gap-12 md:gap-20 items-center">
        <FadeIn delay={0.05} className="flex-1">
          {heroName && (
            <h1 className="text-6xl font-bold uppercase tracking-tight leading-none max-md:text-5xl max-[480px]:text-4xl">
              {heroName}
            </h1>
          )}
          <div className="mt-7 space-y-1.5 text-base leading-relaxed text-white/95">
            <p>{t('cv.hero.address')}</p>
            {(heroEmail || heroPhone) && (
              <p>
                {heroEmail && (
                  <a href={`mailto:${heroEmail}`} className="underline-offset-2 hover:underline">{heroEmail}</a>
                )}
                {heroEmail && heroPhone && <span className="mx-2 opacity-60">·</span>}
                {heroPhone && (
                  <a href={phoneHref} className="underline-offset-2 hover:underline">{heroPhone}</a>
                )}
              </p>
            )}
            <p>
              <span className="font-semibold">{t('cv.hero.nationality.label')}:</span> {t('cv.hero.nationality.value')}
              {heroWechat && (
                <>
                  <span className="mx-2 opacity-60">·</span>
                  <span className="font-semibold">{t('cv.hero.wechat.label')}:</span> {heroWechat}
                </>
              )}
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.1} className="flex-none w-full max-w-[280px] max-md:mx-auto">
          <div className="relative aspect-[1/1] rounded-full overflow-hidden shadow-2xl bg-white/10">
            <Image
              src={texts.portrait_image || '/tibor_image.png'}
              alt="Portrait photograph"
              fill
              priority
              className="object-cover"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
