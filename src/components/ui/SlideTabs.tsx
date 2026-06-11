'use client';

import { useState, type ReactNode } from 'react';
import './slide-tabs.css';

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
        <div className="slide-tabs-pill">
          {items.map((item) => {
            const isActive = item.id === current.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveId(item.id)}
                aria-pressed={isActive}
                title={item.label}
                className={`slide-tabs-btn${isActive ? ' is-active' : ''}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
      <div className={showTabs ? contentSpacing : ''}>
        {current.content}
      </div>
    </div>
  );
}
