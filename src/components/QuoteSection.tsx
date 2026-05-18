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

const FALLBACK_EN = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
const FALLBACK_ZH = '\u7F57\u9A6C\u5047\u540D\u75DB\u82E6\u5750\u5728\u8FD9\u91CC\uFF0C\u6784\u6210\u4E86\u4E00\u4E2A\u7CBE\u81F4\u7684\u5B66\u672F\u754C\u3002\u4E3A\u4E86\u5DE5\u4F5C\u548C\u75DB\u82E6\u7684\u5DE8\u5927\u5229\u76CA\uFF0C\u8FDB\u884C\u4E86\u4E00\u4E9B\u4E34\u65F6\u7684\u5DE5\u4F5C\u3002\u4E3A\u4E86\u6700\u5C0F\u5316\u8BF7\u6C42\uFF0C\u8C01\u4E5F\u4E0D\u60F3\u8FDB\u884C\u4E0D\u5FC5\u8981\u7684\u52B3\u52A8\uFF0C\u9664\u975E\u662F\u4E3A\u4E86\u83B7\u5F97\u67D0\u79CD\u4FBF\u5229\u3002';
const FALLBACK_FEATURE = 'Morbi leo risus porta ac consectetur ac, vestibulum at eros. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.';

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
          <span className="feature-icon inline-flex items-center justify-center w-12 h-12 border border-black rounded-[14px] text-black shrink-0" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M3 12h18"/>
              <path d="M12 3a14 14 0 0 1 0 18"/>
              <path d="M12 3a14 14 0 0 0 0 18"/>
            </svg>
          </span>
          <p className="text-base font-normal text-black leading-normal">{FALLBACK_FEATURE}</p>
        </li>
        <li className="w-[229px] flex flex-col gap-5 items-start text-left">
          <span className="feature-icon inline-flex items-center justify-center w-12 h-12 border border-black rounded-[14px] text-black shrink-0" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 17 8.5 14.5a2 2 0 0 1 0-2.83l3.67-3.67a2 2 0 0 1 2.83 0L17.5 10.5"/>
              <path d="m13 19 1.5 1.5a2 2 0 0 0 2.83 0L21 17a2 2 0 0 0 0-2.83L18.5 11.5"/>
              <path d="M3 14.5 5.5 17a2 2 0 0 0 2.83 0l1.17-1.17"/>
              <path d="M2 11.5 5.5 8 9 11.5"/>
            </svg>
          </span>
          <p className="text-base font-normal text-black leading-normal">{FALLBACK_FEATURE}</p>
        </li>
        <li className="w-[229px] flex flex-col gap-5 items-start text-left">
          <span className="feature-icon inline-flex items-center justify-center w-12 h-12 border border-black rounded-[14px] text-black shrink-0" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17 9 11l4 4 8-8"/>
              <path d="M14 7h7v7"/>
            </svg>
          </span>
          <p className="text-base font-normal text-black leading-normal">{FALLBACK_FEATURE}</p>
        </li>
      </ul>
    </section>
  );
}
