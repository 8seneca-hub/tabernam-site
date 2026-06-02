'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useI18n } from '@/app/hook/useI18n';

export default function LangSwitcher() {
  const { lang, languages, switchLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [close]);

  const current = languages.find((l) => l.code === lang) || languages[0];
  if (!current || languages.length < 2) return null;

  return (
    <div ref={ref} className={`lang-switcher relative ml-1${open ? ' is-open' : ''}`} data-lang-switcher>
      <button
        type="button"
        className="lang-trigger flex items-center gap-2 bg-transparent px-5 py-[14px] font-[inherit] text-[18px] font-normal tracking-[-0.007em] !text-white cursor-pointer w-max max-sm:px-3"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
      >
        <span className="text-left">{current.name}</span>
        {current.flag && <span className="text-base leading-none" aria-hidden="true">{current.flag}</span>}
        <svg
          aria-hidden="true"
          viewBox="0 0 12 8"
          className={`w-3 h-2 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 1.5L6 6.5L11 1.5" />
        </svg>
      </button>
      {open && (
        <ul
          className="absolute top-[calc(100%+8px)] right-0 m-0 p-1.5 bg-white list-none flex flex-col gap-0.5 rounded-xl shadow-[0_8px_24px_rgba(16,24,35,0.08),0_2px_6px_rgba(16,24,35,0.04)] ring-1 ring-black/5 min-w-[180px] z-110 origin-top-right"
          role="listbox"
        >
          {languages.map((l) => {
            const isActive = l.code === lang;
            return (
              <li key={l.code} className="list-none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`flex items-center gap-2 w-full px-3 py-2.5 border-0 font-[inherit] text-[15px] text-text text-left cursor-pointer rounded-lg transition-colors duration-150 focus-visible:outline-none ${
                    isActive
                      ? 'bg-gray-70/70 font-medium'
                      : 'bg-transparent hover:bg-gray-70/50 focus-visible:bg-gray-70/50'
                  }`}
                  onClick={() => { switchLang(l.code); close(); }}
                >
                  <span className="flex-1">{l.name}</span>
                  {l.flag && <span className="text-base leading-none" aria-hidden="true">{l.flag}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
