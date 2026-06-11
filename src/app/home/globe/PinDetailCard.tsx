'use client';

import Link from 'next/link';
import type { PointerEvent } from 'react';
import Image from '@/components/ui/Image';

export interface CardData {
  citySlug: string;
  name: string;
  desc: string;
  photos: string[];
}

interface DragHandlers {
  onPointerDown: (e: PointerEvent) => void;
  onPointerMove: (e: PointerEvent) => void;
  onPointerUp: (e: PointerEvent) => void;
  onPointerCancel: (e: PointerEvent) => void;
}

interface Props {
  card: CardData;
  photoIdx: number;
  regionKey: string;
  panelGoToLocationLabel: string;
  btnExploreNowLabel: string;
  onClose: () => void;
  onLocationClick: () => void;
  dragHandlers?: DragHandlers;
}

export default function PinDetailCard({
  card,
  photoIdx,
  regionKey,
  panelGoToLocationLabel,
  btnExploreNowLabel,
  onClose,
  onLocationClick,
  dragHandlers,
}: Props) {
  return (
    <article className="ga-card">
      <div className="ga-sheet-handle" {...dragHandlers} aria-hidden="true">
        <span className="ga-sheet-grip" />
      </div>
      <div className="ga-thumb">
        {card.photos.map((p, i) => (
          <Image
            key={p + i}
            src={p}
            alt=""
            className={'ga-thumb-img' + (i === photoIdx ? ' active' : '')}
          />
        ))}
        <div className="ga-progress" aria-hidden="true">
          {card.photos.map((p, i) => (
            <span
              key={p + i}
              className={'ga-progress-seg' + (i === photoIdx ? ' active' : '')}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Close"
          className="ga-close"
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <div className="ga-card-body">
        <h3 className="ga-name">{card.name}</h3>
        <button type="button" className="ga-location" onClick={onLocationClick}>
          {panelGoToLocationLabel}
        </button>
        <p className="ga-desc">{card.desc}</p>
        <Link
          href={`/activities?id=${card.citySlug}`}
          className="ga-button"
          onClick={() => {
            try {
              sessionStorage.setItem(
                'globe.restore',
                JSON.stringify({ slug: card.citySlug, regionKey }),
              );
            } catch { /* private mode */ }
          }}
        >
          {btnExploreNowLabel}
        </Link>
      </div>
    </article>
  );
}
