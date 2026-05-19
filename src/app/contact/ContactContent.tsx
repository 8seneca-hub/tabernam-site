'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useI18n } from '@/lib/i18n-context';
import type { PageTexts, ContactAddress } from '@/lib/directus';
import FadeIn from '@/animations/FadeIn';

interface Props {
  texts: PageTexts;
  addresses: ContactAddress[];
}

export default function ContactContent({ texts, addresses }: Props) {
  const { t } = useI18n();

  const contactBody = texts.contact_body || 'Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec id elit non mi porta gravida at eget metus. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Morbi leo risus, porta ac consectetur ac.';

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
        <FadeIn delay={0.05} as="h1">
          <h1 className="text-5xl font-semibold text-black leading-tight">{t('heading.contact')}</h1>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="text-base font-normal text-[#191919] leading-normal">{contactBody}</p>
        </FadeIn>
      </section>

      <section className="contact-portrait col-start-1 max-[900px]:col-auto">
        <FadeIn delay={0.2}>
          <div className="portrait-stack relative w-full aspect-[519/495] bg-[#ededed] rounded-xl overflow-hidden" aria-hidden="true">
            {addresses.map((addr, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                className={`portrait-img${i === 0 ? ' is-active' : ''}`}
                data-portrait={String(addr.portrait_index)}
                src={addr.image}
                alt=""
              />
            ))}
          </div>
        </FadeIn>
      </section>

      <aside className="contact-details col-start-2 flex flex-col gap-2.5 max-[900px]:col-auto">
        {addresses.map((addr, i) => (
          <motion.details
            key={i}
            className="info-card border border-[#dcdcdc] rounded-xl p-[19px]"
            data-portrait={String(addr.portrait_index)}
            open={i === 0}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.7, ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number] }}
          >
            <summary className="flex items-center gap-2.5 p-2.5">
              <span className="info-card-title flex-1 text-2xl font-medium text-black">
                {t(`contact.address${i + 1}`) || addr.title_en}
              </span>
              <span className="info-card-toggle" aria-hidden="true"></span>
            </summary>
            <div className="info-card-body px-2.5 pt-5 pb-2.5 flex flex-col gap-3">
              {addr.lines.map((line, j) => (
                <p key={j} className="text-base font-normal text-[#191919] leading-normal">{line}</p>
              ))}
            </div>
          </motion.details>
        ))}
      </aside>
    </main>
  );
}
