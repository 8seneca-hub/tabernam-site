'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface SlideItem {
  /** Unique key for React state + active tracking. */
  id: string | number;
  /** Text rendered inside the pill button. */
  label: string;
  /** Body rendered under the tabs when this slide is active. */
  content: ReactNode;
}

interface Props {
  items: SlideItem[];
  className?: string;
  contentSpacing?: string;
  alwaysShowTabs?: boolean;
}

const VISIBLE_COUNT = 3;
const GAP_PX = 4;       // matches `gap-1`
const PADDING_PX = 12;  // matches `p-1.5` × 2 sides

export default function SlideTabs({ items, className, contentSpacing = 'mt-[32px]', alwaysShowTabs = false }: Props) {
  const [activeId, setActiveId] = useState<string | number | undefined>(items[0]?.id);
  const pillRef = useRef<HTMLDivElement>(null);

  // When there are more than 3 tabs, cap the pill's visible width at the first
  // 3 buttons so the rest scrolls horizontally instead of overflowing the page.
  useEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;

    const measure = () => {
      pill.style.maxWidth = '';
      if (items.length <= VISIBLE_COUNT) return;
      const buttons = Array.from(
        pill.querySelectorAll<HTMLButtonElement>(':scope > button'),
      );
      if (buttons.length === 0) return;
      const take = Math.min(VISIBLE_COUNT, buttons.length);
      let width = 0;
      for (let i = 0; i < take; i++) width += buttons[i].offsetWidth;
      width += (take - 1) * GAP_PX + PADDING_PX;
      pill.style.maxWidth = `${width}px`;
    };

    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [items]);

  if (items.length === 0) return null;

  const current = items.find((i) => i.id === activeId) ?? items[0];
  const showTabs = alwaysShowTabs || items.length > 1;

  return (
    <div className={className}>
      {showTabs && (
        <div className="flex justify-center">
          <div
            ref={pillRef}
            className="flex w-fit min-w-0 max-w-full items-center gap-1 overflow-x-auto rounded-full bg-white p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item) => {
              const isActive = item.id === current.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  aria-pressed={isActive}
                  title={item.label}
                  className={`max-w-[120px] shrink-0 truncate whitespace-nowrap rounded-full px-7 py-1.5 text-[16px] font-medium transition-colors md:max-w-[200px] ${isActive ? 'bg-brand text-white' : 'text-gray-80 hover:text-dark'}`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div className={showTabs ? contentSpacing : ''}>
        {current.content}
      </div>
    </div>
  );
}
