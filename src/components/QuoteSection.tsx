'use client';

import { useEffect, useRef } from 'react';

function splitByWord(el: HTMLElement) {
  const text = el.textContent || '';
  el.textContent = '';
  text.split(/(\s+)/).forEach((tok) => {
    if (!tok) return;
    if (/^\s+$/.test(tok)) {
      el.appendChild(document.createTextNode(tok));
    } else {
      const span = document.createElement('span');
      span.className = 'reveal-unit';
      span.textContent = tok;
      el.appendChild(span);
    }
  });
}

function splitByChar(el: HTMLElement) {
  const text = el.textContent || '';
  el.textContent = '';
  for (const ch of text) {
    if (/\s/.test(ch)) {
      el.appendChild(document.createTextNode(ch));
    } else {
      const span = document.createElement('span');
      span.className = 'reveal-unit';
      span.textContent = ch;
      el.appendChild(span);
    }
  }
}

import type { PageTexts } from '@/lib/directus';

interface Props {
  texts?: PageTexts;
}

const FALLBACK_EN = 'Trade is not a transaction. It is a relationship \u2014 built across decades, sustained through trust, and measured by what endures long after the contract is signed.';
const FALLBACK_ZH = '\u8D38\u6613\u4E0D\u4EC5\u4EC5\u662F\u4EA4\u6613\uFF0C\u800C\u662F\u4E00\u79CD\u5173\u7CFB\u2014\u2014\u7ECF\u6570\u5341\u5E74\u6784\u5EFA\uFF0C\u56E0\u4FE1\u4EFB\u800C\u5EF6\u7EED\uFF0C\u5E76\u4EE5\u5408\u540C\u7B7E\u8BA2\u540E\u957F\u4E45\u7559\u5B58\u7684\u4EF7\u503C\u6765\u8861\u91CF\u3002';
const FALLBACK_FEATURE_GLOBE = 'Four decades navigating cross-border trade \u2014 from China across Southeast Asia and beyond.';
const FALLBACK_FEATURE_NETWORK = 'A trusted network of partners, factories and decision-makers across more than thirty countries.';
const FALLBACK_FEATURE_GROWTH = 'Considered counsel for European leaders entering, scaling or repositioning in Asian markets.';

export default function QuoteSection({ texts = {} }: Props) {
  const quoteRef = useRef<HTMLElement>(null);
  const enRef = useRef<HTMLParagraphElement>(null);
  const zhRef = useRef<HTMLParagraphElement>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const quote = quoteRef.current;
    const en = enRef.current;
    const zh = zhRef.current;
    if (!quote || !en || !zh) return;

    splitByWord(en);
    splitByChar(zh);

    const enUnits = en.querySelectorAll('.reveal-unit');
    const zhUnits = zh.querySelectorAll('.reveal-unit');

    function applyProgress(units: NodeListOf<Element>, progress: number) {
      const count = Math.ceil(progress * units.length);
      units.forEach((u, i) => {
        const visible = i < count;
        if (visible !== u.classList.contains('is-visible')) {
          u.classList.toggle('is-visible', visible);
        }
      });
    }

    function tick() {
      const rect = quote!.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / vh));
      applyProgress(enUnits, progress);
      applyProgress(zhUnits, progress);
    }

    let raf = 0;
    function schedule() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        tick();
      });
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    tick();

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <section ref={quoteRef} className="quote min-h-screen w-[1018px] max-w-[calc(100%-80px)] mx-auto flex flex-col justify-center items-center gap-15 pb-15 max-[1100px]:min-h-auto max-[1100px]:py-20">
      <div className="flex flex-col gap-[30px] w-full text-center">
        <p ref={enRef} className="text-2xl font-normal text-text leading-snug max-[1100px]:text-[22px]">{texts.quote_en || FALLBACK_EN}</p>
        <p ref={zhRef} className="font-[var(--font-inter),var(--font-noto-sc),sans-serif] text-2xl font-normal text-[#868686] leading-relaxed max-[1100px]:text-[22px]">{texts.quote_zh || FALLBACK_ZH}</p>
      </div>
      <ul className="list-none flex gap-15 items-start justify-center flex-wrap">
        <li className="w-[229px] flex flex-col gap-5 items-start text-left">
          <span className="feature-icon inline-flex items-center justify-center w-12 h-12 rounded-[14px] shrink-0" aria-hidden="true">
            <img src="/icons/globe.svg" alt="" width={40} height={40} className="w-10 h-10" />
          </span>
          <p className="text-base font-normal text-black leading-normal">{FALLBACK_FEATURE_GLOBE}</p>
        </li>
        <li className="w-[229px] flex flex-col gap-5 items-start text-left">
          <span className="feature-icon inline-flex items-center justify-center w-12 h-12 rounded-[14px] shrink-0" aria-hidden="true">
            <img src="/icons/cooperation.svg" alt="" width={40} height={40} className="w-10 h-10" />
          </span>
          <p className="text-base font-normal text-black leading-normal">{FALLBACK_FEATURE_NETWORK}</p>
        </li>
        <li className="w-[229px] flex flex-col gap-5 items-start text-left">
          <span className="feature-icon inline-flex items-center justify-center w-12 h-12 rounded-[14px] shrink-0" aria-hidden="true">
            <img src="/icons/bar-chart.svg" alt="" width={40} height={40} className="w-10 h-10" />
          </span>
          <p className="text-base font-normal text-black leading-normal">{FALLBACK_FEATURE_GROWTH}</p>
        </li>
      </ul>
    </section>
  );
}
