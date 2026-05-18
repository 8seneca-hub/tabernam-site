'use client';

import { useI18n } from '@/lib/i18n-context';
import ActivityLink from '@/components/ActivityLink';
import type { PageTexts } from '@/lib/data';

interface Props {
  texts: PageTexts;
}

export default function BusinessContent({ texts }: Props) {
  const { t } = useI18n();

  const title = texts.business_title || 'Lorem ipsum dolor';
  const body1 = texts.business_body_1 || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';
  const body2 = texts.business_body_2 || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
  const body3 = texts.business_body_3 || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';

  return (
    <main className="w-[706px] max-w-[calc(100%-80px)] mx-auto pt-[109px] pb-[120px] flex flex-col gap-10">
      <ActivityLink className="self-start no-underline inline-flex items-center bg-transparent border-0 px-5 py-3 text-base font-medium text-black cursor-pointer font-[inherit] rounded-lg transition-colors duration-200 hover:bg-black/5">
        {t('btn.goBack')}
      </ActivityLink>

      <div className="w-full h-[374px] rounded-xl overflow-hidden bg-[#e3e3e3]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="w-full h-full object-cover" src={texts.hero_image_1 || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80'} alt="" />
      </div>

      <article className="flex flex-col gap-4">
        <h1 className="text-5xl font-medium text-text">{title}</h1>
        <p className="text-base leading-normal text-text">{body1}</p>
        <p className="text-base leading-normal text-text">{body2}</p>
        <div className="w-full h-[377px] rounded-xl overflow-hidden bg-[#e3e3e3]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="w-full h-full object-cover" src={texts.hero_image_2 || 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=1600&q=80'} alt="" />
        </div>
        <p className="text-base leading-normal text-text">{body3}</p>
      </article>
    </main>
  );
}
