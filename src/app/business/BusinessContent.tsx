'use client';

import { useI18n } from '@/lib/i18n-context';
import ActivityLink from '@/components/ActivityLink';
import type { PageTexts } from '@/lib/data';

interface Props {
  texts: PageTexts;
}

export default function BusinessContent({ texts }: Props) {
  const { t } = useI18n();

  const title = texts.business_title || 'On the ground in China';
  const body1 = texts.business_body_1 || 'For more than forty years, my work has been rooted in the everyday rhythm of Chinese business — long days spent in factories on the Pearl River Delta, slow conversations over tea in Beijing, and quiet negotiations in Shanghai meeting rooms. The relationships I have built here are not the result of a single trip or a strategic memo. They are the product of showing up, again and again, across the decades.';
  const body2 = texts.business_body_2 || 'Each city on this map represents a chapter of that work: a partnership that took years to mature, a manufacturer who became a friend, a counterpart whose handshake meant more than any contract. China is not a single market. It is dozens of regional economies, each with its own pace, customs and unwritten rules — and the only way to learn them is to spend time inside them. That is the foundation everything I do today is built on.';
  const body3 = texts.business_body_3 || 'For European leaders considering their first move into Asia, or for those repositioning after years in the region, the goal is the same: turn experience into clarity. I work with a small number of clients each year, helping them see the picture as it actually is — not as it is described in a presentation — and decide, with both confidence and caution, what to do next.';

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
