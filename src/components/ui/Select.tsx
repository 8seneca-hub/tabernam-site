'use client';

import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel?: string;
  className?: string;
}

export default function Select({ value, onChange, options, ariaLabel, className }: Props) {
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

  const current = options.find((o) => o.value === value) ?? options[0];
  if (!current) return null;

  return (
    <div
      ref={ref}
      className={`relative${className ? ` ${className}` : ''}${open ? ' is-open' : ''}`}
    >
      <button
        type="button"
        className="flex items-center gap-2 bg-transparent px-4 py-2 font-[inherit] text-sm font-semibold uppercase tracking-wider text-text cursor-pointer w-max hover:bg-gray-40/40 transition-colors max-sm:px-3 max-sm:text-xs"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
      >
        <span className="text-left whitespace-nowrap">{current.label}</span>
        {current.icon && (
          <span className="text-base leading-none normal-case shrink-0" aria-hidden="true">
            {current.icon}
          </span>
        )}
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-text transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute top-[calc(100%+2px)] left-0 m-0 p-0 bg-white list-none flex flex-col gap-1 shadow-[0_4px_12px_rgba(16,24,35,0.12)] z-110 min-w-full w-max"
        >
          {options.map((o) => (
            <li key={o.value} className="list-none">
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                className="flex items-center gap-2 w-full px-5 py-2.5 bg-transparent border-0 font-[inherit] text-base text-text text-left cursor-pointer hover:bg-gray-40 focus-visible:bg-gray-40 focus-visible:outline-none"
                onClick={() => { onChange(o.value); close(); }}
              >
                <span className="flex-1 whitespace-nowrap">{o.label}</span>
                {o.icon && (
                  <span className="text-base leading-none normal-case shrink-0" aria-hidden="true">
                    {o.icon}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
