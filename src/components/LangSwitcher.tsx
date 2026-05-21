'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useI18n } from '@/lib/i18n-context';

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
        className="lang-trigger flex items-center gap-2 bg-white border-0 px-5 py-3.5 font-[inherit] text-base text-text cursor-pointer w-[162px] max-sm:w-[140px] max-sm:px-3.5 max-sm:py-2.5 max-sm:text-sm"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
      >
        <span className="flex-1 text-left">{current.name}</span>
        {current.flag && <span className="text-base leading-none" aria-hidden="true">{current.flag}</span>}
        <svg className="lang-chevron shrink-0 text-text" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <ul className="absolute top-[calc(100%+2px)] left-0 right-0 m-0 p-0 bg-white list-none flex flex-col gap-1 shadow-[0_4px_12px_rgba(16,24,35,0.12)] z-110" role="listbox">
          {languages.map((l) => (
            <li key={l.code} className="list-none">
              <button
                type="button"
                role="option"
                className="flex items-center gap-2 w-full px-5 py-2.5 bg-transparent border-0 font-[inherit] text-base text-text text-left cursor-pointer hover:bg-gray-70 focus-visible:bg-gray-70 focus-visible:outline-none"
                onClick={() => { switchLang(l.code); close(); }}
              >
                <span className="flex-1">{l.name}</span>
                {l.flag && <span className="text-base leading-none" aria-hidden="true">{l.flag}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
