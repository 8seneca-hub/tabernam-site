'use client';

import { useEffect } from 'react';
import { useI18n } from '@/lib/i18n-context';
import type { PageTexts, ContactAddress } from '@/lib/directus';

interface Props {
  texts: PageTexts;
  addresses: ContactAddress[];
}

const PORTRAIT_IMAGES = [
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1040&h=990&q=80',
  'https://images.unsplash.com/photo-1496564203457-11bb12075d90?auto=format&fit=crop&w=1040&h=990&q=80',
  'https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=1040&h=990&q=80',
];

export default function ContactContent({ texts, addresses }: Props) {
  const { t, lang } = useI18n();

  const contactBody = texts.contact_body || 'If you are entering, scaling or repositioning your business in Asia — or simply want a candid second opinion before you take the next step — I welcome the conversation. Reach out through any of the offices below and we will arrange a time to talk.';

  useEffect(() => {
    const cards = document.querySelectorAll<HTMLDetailsElement>('.info-card');
    const imgs = document.querySelectorAll<HTMLImageElement>('.portrait-img');

    const handlers: Array<[HTMLDetailsElement, () => void]> = [];
    cards.forEach((card) => {
      const handler = () => {
        if (!card.open) return;
        cards.forEach((c) => { if (c !== card) c.open = false; });
        const target = card.dataset.portrait;
        imgs.forEach((img) => {
          img.classList.toggle('is-active', img.dataset.portrait === target);
        });
      };
      card.addEventListener('toggle', handler);
      handlers.push([card, handler]);
    });

    return () => {
      handlers.forEach(([card, handler]) => card.removeEventListener('toggle', handler));
    };
  }, []);

  return (
    <main className="contact-page grid grid-cols-2 gap-x-15 gap-y-15 items-start px-[var(--side-padding)] pt-[calc(var(--header-height)+80px)] pb-20 max-w-[var(--max-width)] mx-auto min-h-screen max-[900px]:grid-cols-1">
      <section className="contact-intro col-span-full flex flex-col gap-5 max-w-[760px]">
        <h1 className="text-5xl font-semibold text-black leading-tight">{t('heading.contact')}</h1>
        <p className="text-base font-normal text-[#191919] leading-normal">{contactBody}</p>
      </section>

      <section className="contact-portrait col-start-1 max-[900px]:col-auto">
        <div className="portrait-stack relative w-full aspect-[519/495] bg-[#ededed] rounded-xl overflow-hidden" aria-hidden="true">
          {addresses.map((addr, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              className={`portrait-img${i === 0 ? ' is-active' : ''}`}
              data-portrait={String(addr.portrait_index)}
              src={PORTRAIT_IMAGES[i] || PORTRAIT_IMAGES[0]}
              alt=""
            />
          ))}
        </div>
      </section>

      <aside className="contact-details col-start-2 flex flex-col gap-2.5 max-[900px]:col-auto">
        {addresses.map((addr, i) => (
          <details key={i} className="info-card border border-[#dcdcdc] rounded-xl p-[19px]" data-portrait={String(addr.portrait_index)} open={i === 0}>
            <summary className="flex items-center gap-2.5 p-2.5">
              <span className="info-card-title flex-1 text-2xl font-medium text-black">
                {lang === 'sk' ? addr.title_sk : addr.title_en}
              </span>
              <span className="info-card-toggle" aria-hidden="true"></span>
            </summary>
            <div className="info-card-body px-2.5 pt-5 pb-2.5 flex flex-col gap-3">
              {addr.lines.map((line, j) => (
                <p key={j} className="text-base font-normal text-[#191919] leading-normal">{line}</p>
              ))}
            </div>
          </details>
        ))}
      </aside>
    </main>
  );
}
