'use client';

import { useState, type ReactNode } from 'react';

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

export default function SlideTabs({ items, className, contentSpacing = 'mt-[32px]', alwaysShowTabs = false }: Props) {
  const [activeId, setActiveId] = useState<string | number | undefined>(items[0]?.id);
  if (items.length === 0) return null;

  const current = items.find((i) => i.id === activeId) ?? items[0];
  const showTabs = alwaysShowTabs || items.length > 1;

  return (
    <div className={className}>
      {showTabs && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full bg-white p-1.5">
            {items.map((item) => {
              const isActive = item.id === current.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  aria-pressed={isActive}
                  className={`rounded-full px-7 py-1.5 text-[16px] font-medium transition-colors ${isActive ? 'bg-brand text-white' : 'text-gray-80 hover:text-dark'}`}
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
