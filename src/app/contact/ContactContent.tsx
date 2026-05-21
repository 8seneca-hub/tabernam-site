'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useI18n } from '@/lib/i18n-context';
import type { PageTexts, ContactAddress } from '@/lib/directus';
import FadeIn from '@/animations/FadeIn';

interface Props {
  texts?: PageTexts;
  addresses?: ContactAddress[];
}

const CONTACT_INTRO = 'If you are entering, scaling or repositioning your business between Europe and China — or simply want a candid second opinion before the next step — I welcome the conversation. Reach me through whichever channel below fits your context.';

interface ContactCard {
  title: string;
  lines: string[];
}

const CONTACT_CARDS: ContactCard[] = [
  {
    title: 'Tabernam s.r.o.',
    lines: [
      'Tibor Buček, CEO',
      'Mons. Vagnera 899/22, 949 11 Nitra, Slovakia',
      'Phone: +421 910 828 305',
      'Email: tiborbucek@tabernam.org',
      'Web: www.tabernam.org',
      'IČO: 54 011 230 · IČ DPH: SK2121 554 996',
      'IBAN: SK15 1100 0000 0029 4911 4126 · SWIFT: TATRSKBX',
    ],
  },
  {
    title: 'Personal & 中国联系方式',
    lines: [
      'Tibor Buček / 迪波尔。布切克',
      'Mons. Vagnera 22, 949 01 Nitra, Slovakia',
      'Cell: +421 910 828 305',
      'WeChat ID: liu-sario11',
    ],
  },
  {
    title: 'Lions Club Affiliation',
    lines: [
      'Past District Governor, D-122 (2006–2007)',
      'GMT-Leader, Oak Brook USA (2008–2009)',
      'Coordinating Lion for Georgia (2009–2010)',
      'Program creator, Lions Hospital st. Cyril and Method (2005–2015)',
      'Email: tiborbucek@gmail.com',
      'Web: tiborlions.eu · lionsclubs.org',
    ],
  },
];

export default function ContactContent({ addresses }: Props) {
  const { t } = useI18n();

  useEffect(() => {
    const cards = document.querySelectorAll<HTMLDetailsElement>('.info-card');
    cards.forEach((card) => {
      const handler = () => {
        if (!card.open) return;
        cards.forEach((c) => { if (c !== card) c.open = false; });
      };
      card.addEventListener('toggle', handler);
    });
  }, []);

  const portraitSrc = addresses?.[0]?.image || '/quote-2.jpg';

  return (
    <main className="contact-page grid grid-cols-2 gap-x-15 gap-y-15 items-start px-[var(--side-padding)] pt-[calc(var(--header-height)+80px)] pb-20 max-w-[var(--max-width)] mx-auto min-h-screen max-[900px]:grid-cols-1">
      <section className="contact-intro col-span-full flex flex-col gap-5 max-w-[760px]">
        <FadeIn delay={0.05} as="h1">
          <h1 className="text-5xl font-semibold text-text leading-tight">{t('heading.contact')}</h1>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="text-base font-normal text-text leading-normal">{CONTACT_INTRO}</p>
        </FadeIn>
      </section>

      <section className="contact-portrait col-start-1 max-[900px]:col-auto">
        <FadeIn delay={0.2}>
          <div className="portrait-stack relative w-full aspect-[519/495] bg-gray-70 rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="absolute inset-0 w-full h-full object-cover" src={portraitSrc} alt="Tibor Buček" />
          </div>
        </FadeIn>
      </section>

      <aside className="contact-details col-start-2 flex flex-col gap-2.5 max-[900px]:col-auto">
        {CONTACT_CARDS.map((card, i) => (
          <motion.details
            key={i}
            className="info-card border border-border rounded-xl p-[19px]"
            open={i === 0}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.7, ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number] }}
          >
            <summary className="flex items-center gap-2.5 p-2.5">
              <span className="info-card-title flex-1 text-2xl font-medium text-text">{card.title}</span>
              <span className="info-card-toggle" aria-hidden="true"></span>
            </summary>
            <div className="info-card-body px-2.5 pt-5 pb-2.5 flex flex-col gap-3">
              {card.lines.map((line, j) => (
                <p key={j} className="text-base font-normal text-text leading-normal">{line}</p>
              ))}
            </div>
          </motion.details>
        ))}
      </aside>
    </main>
  );
}
