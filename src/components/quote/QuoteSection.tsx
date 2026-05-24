'use client';

import { useI18n } from '@/app/hook/useI18n';

export default function QuoteSection() {
  const { t } = useI18n();
  return (
    <section className="quote w-full min-h-[80vh] flex items-center justify-center px-[var(--side-padding)] py-20">
      <div className="flex flex-col gap-[30px] w-full max-w-[50vw] mx-auto text-center max-[1100px]:max-w-none">
        <p className="text-2xl font-normal text-text leading-snug max-[1100px]:text-[22px]">
          {t('quote.primary')}
        </p>
        <p className="font-[var(--font-dm-sans),var(--font-noto-sc),sans-serif] text-2xl font-normal text-muted leading-relaxed max-[1100px]:text-[22px]">
          {t('quote.secondary')}
        </p>
      </div>
    </section>
  );
}
