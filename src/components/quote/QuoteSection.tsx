'use client';

import type { PageTexts, Feature } from '@/lib/directus';

interface Props {
  texts?: PageTexts;
  features?: Feature[];
}

const QUOTE_EN = 'Trade is not a transaction. It is a relationship — built across decades, sustained through trust, and measured by what endures long after the contract is signed.';
const QUOTE_ZH = '贸易不是一笔交易。它是一种关系——跨越数十年建立，通过信任维持，并以合同签署后仍然持续的事物来衡量。';

export default function QuoteSection(_props: Props) {
  return (
    <section className="quote w-full min-h-[80vh] flex items-center justify-center px-[var(--side-padding)] py-20">
      <div className="flex flex-col gap-[30px] w-full max-w-[50vw] mx-auto text-center max-[1100px]:max-w-none">
        <p className="text-2xl font-normal text-text leading-snug max-[1100px]:text-[22px]">
          {QUOTE_EN}
        </p>
        <p className="font-[var(--font-dm-sans),var(--font-noto-sc),sans-serif] text-2xl font-normal text-muted leading-relaxed max-[1100px]:text-[22px]">
          {QUOTE_ZH}
        </p>
      </div>
    </section>
  );
}
