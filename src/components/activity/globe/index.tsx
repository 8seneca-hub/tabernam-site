'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Script from 'next/script';
import GlobeIntro from './GlobeIntro';
import GlobePanel from './GlobePanel';
import type { City } from './types';
import { pickTranslation, type GlobeCity } from '@/lib/directus';
import { useI18n } from '@/app/hook/useI18n';
import './styles.css';
import Button from '@/components/ui/Button';
import { useGlobe } from '@/app/hook/useGlobe';

interface GlobeActivitySectionProps {
  cities: GlobeCity[];
}

export default function GlobeActivitySection({ cities }: GlobeActivitySectionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { lang, t } = useI18n();

  const resolved: City[] = useMemo(
    () =>
      cities.map((c) => {
        const t = pickTranslation(c, lang);
        return {
          slug: c.slug,
          name: t.name,
          business: t.business,
          desc: t.description,
          lat: c.lat,
          lng: c.lng,
          altitude: c.altitude,
          photos: c.photos,
        };
      }),
    [cities, lang],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const handleCityClick = useCallback((idx: number) => {
    setActiveIdx(idx);
    setIsOpen(true);
  }, []);
  const { initGlobe } = useGlobe({
    containerRef,
    isOpen,
    activeIdx,
    cities: resolved,
    onCityClick: handleCityClick,
  });

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const activeCity = activeIdx !== null ? resolved[activeIdx] : null;
  const activePhotos = activeCity ? activeCity.photos : null;

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/globe.gl@2"
        strategy="afterInteractive"
        onLoad={initGlobe}
      />
      <section className="ga-section">
        <div className={`ga-backdrop${isOpen ? ' visible' : ''}`} aria-hidden="true" />
        <div ref={containerRef} className={`ga-globe${isOpen ? ' shifted' : ''}`} />

        <GlobeIntro
          isOut={isOpen}
          onOpen={() => {
            setIsOpen(true);
            setActiveIdx(0);
          }}
        />

        <GlobePanel isOpen={isOpen} city={activeCity} photos={activePhotos} />

        <Button
          type="button"
          aria-label={t('aria.close')}
          className={`ga-close${isOpen ? ' visible' : ''}`}
          onClick={() => setIsOpen(false)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Button>
      </section>
    </>
  );
}
