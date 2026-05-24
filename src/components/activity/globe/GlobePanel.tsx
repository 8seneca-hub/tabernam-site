'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/app/hook/useI18n';
import type { City } from './types';

interface Props {
  isOpen: boolean;
  city: City | null;
  photos: string[] | null;
}

const PHOTO_INTERVAL_MS = 2000;

export default function GlobePanel({ isOpen, city, photos }: Props) {
  const { t } = useI18n();
  const [photoIdx, setPhotoIdx] = useState(0);
  const photoCount = photos?.length ?? 0;

  useEffect(() => setPhotoIdx(0), [city]);

  useEffect(() => {
    if (!isOpen || photoCount < 2) return;
    const id = window.setInterval(() => {
      setPhotoIdx((p) => (p + 1) % photoCount);
    }, PHOTO_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [isOpen, photoCount]);

  return (
    <aside className={`ga-panel${isOpen ? ' in' : ''}`} aria-hidden={!isOpen}>
      {city && photos && (
        <article className="ga-card">
          <div className="ga-eyebrow">{city.name}</div>
          <h2 className="ga-name">{city.business}</h2>
          <div className="ga-thumb">
            {photos.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p + i}
                src={p}
                alt=""
                loading="lazy"
                className={'ga-thumb-img' + (i === photoIdx ? ' active' : '')}
              />
            ))}
          </div>
          <p className="ga-desc">{city.desc}</p>
          <Link href={`/activities?id=${city.slug}`} className="ga-button">
            {t('panel.viewDetails')}
          </Link>
        </article>
      )}
    </aside>
  );
}
