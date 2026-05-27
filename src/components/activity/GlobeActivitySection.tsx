'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import Script from 'next/script';
import { useI18n } from '@/app/hook/useI18n';
import { pickTranslation } from '@/lib/directus';
import { GlobeCity } from '@/lib/type';

import type { GlobeInstance, MarkerDatum, City } from './globe/types';
import { SLOVAKIA, pickRandom } from './globe/constants';
import { createMarkerElement } from './globe/createMarkerElement';
import { useStarsAnimation } from '../../app/hook/useStarsAnimation';
import HandHint from './globe/HandHint';
import DancingText from './globe/DancingText';
import IntroOverlay from './globe/IntroOverlay';
import DetailPanel from './globe/DetailPanel';
import ZoomControls from './globe/ZoomControls';

declare const Globe: (...args: unknown[]) => unknown;

interface GlobeActivitySectionProps {
  cities: GlobeCity[];
}

export default function GlobeActivitySection({ cities: cmsCities }: GlobeActivitySectionProps) {
  const { lang, t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const starsRef = useRef<HTMLCanvasElement>(null);
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const controlsRef = useRef<ReturnType<GlobeInstance['controls']> | null>(null);
  const globeReadyRef = useRef(false);
  const currentAltitudeRef = useRef(2.2);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [hintVisible, setHintVisible] = useState(true);

  const CITIES = useMemo<City[]>(() => {
    return cmsCities.map((c) => {
      const tr = pickTranslation(c, lang);
      return {
        slug: c.slug,
        name: tr.name,
        lat: c.lat,
        lng: c.lng,
        altitude: c.altitude,
        desc: tr.description,
        photos: c.photos && c.photos.length > 0 ? c.photos : undefined,
      };
    });
  }, [cmsCities, lang]);

  const cardsPhotos = useMemo(
    () => CITIES.map((c) => (c.photos && c.photos.length > 0 ? c.photos : pickRandom(5))),
    [CITIES],
  );

  function buildPoints(activeIdxLocal: number | null): MarkerDatum[] {
    return CITIES.map((d, i) => ({
      idx: i,
      lat: d.lat,
      lng: d.lng,
      name: d.name,
      isActive: i === activeIdxLocal,
    }));
  }

  function initGlobe() {
    const container = globeContainerRef.current;
    if (!container || typeof Globe !== 'function') return;
    if (globeReadyRef.current) return;
    globeReadyRef.current = true;

    const globe = (Globe() as (el: HTMLElement) => GlobeInstance)(container)
      .backgroundColor('rgba(0,0,0,0)')
      .atmosphereColor('#6db4ff')
      .atmosphereAltitude(0.22)
      .globeImageUrl('/earth-blue-marble.jpg')
      .bumpImageUrl('/globe-topology.png')
      .htmlElementsData(buildPoints(null))
      .htmlLat('lat')
      .htmlLng('lng')
      .htmlAltitude(0.012)
      .htmlElement(createMarkerElement);

    globe.globeMaterial().bumpScale = 5;
    globe.pointOfView({ lat: SLOVAKIA.lat, lng: SLOVAKIA.lng, altitude: 2.2 }, 0);

    const ctrl = globe.controls();
    ctrl.autoRotate = true;
    ctrl.autoRotateSpeed = 0.3;
    ctrl.enableZoom = false;

    globeRef.current = globe;
    controlsRef.current = ctrl;

    function resize() {
      globe.width(window.innerWidth).height(window.innerHeight);
    }
    resize();
    window.addEventListener('resize', resize);
  }

  // If the globe.gl script is already loaded (e.g. user navigated away and
  // returned), the <Script> onLoad won't re-fire — initialize directly.
  useEffect(() => {
    if (typeof Globe === 'function') {
      initGlobe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Marker click bubbles a custom event from createMarkerElement.
  useEffect(() => {
    const container = globeContainerRef.current;
    if (!container) return;
    const handler = (e: Event) => {
      const idx = (e as CustomEvent<number>).detail;
      if (typeof idx === 'number') {
        setActiveIdx(idx);
        setIsOpen(true);
        setPhotoIdx(0);
      }
    };
    container.addEventListener('cityclick', handler as EventListener);
    return () => container.removeEventListener('cityclick', handler as EventListener);
  }, []);

  // Dismiss the hand-swipe hint on first interaction.
  useEffect(() => {
    const container = globeContainerRef.current;
    if (!container) return;
    const onFirstDrag = () => setHintVisible(false);
    container.addEventListener('pointerdown', onFirstDrag, { once: true });
    return () => container.removeEventListener('pointerdown', onFirstDrag);
  }, []);

  // Sync globe markers + camera to the active city / open state.
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.htmlElementsData(buildPoints(activeIdx));
    if (!isOpen) {
      globe.pointOfView({ lat: SLOVAKIA.lat, lng: SLOVAKIA.lng, altitude: 2.2 }, 1200);
      currentAltitudeRef.current = 2.2;
      return;
    }
    if (activeIdx !== null) {
      const c = CITIES[activeIdx];
      globe.pointOfView({ lat: c.lat, lng: c.lng, altitude: c.altitude }, 1200);
      currentAltitudeRef.current = c.altitude;
    }
  }, [activeIdx, isOpen, CITIES]);

  function zoomBy(factor: number) {
    const globe = globeRef.current;
    if (!globe || activeIdx === null) return;
    const c = CITIES[activeIdx];
    const next = Math.min(4, Math.max(0.15, currentAltitudeRef.current * factor));
    if (next === currentAltitudeRef.current) return;
    globe.pointOfView({ lat: c.lat, lng: c.lng, altitude: next }, 400);
    currentAltitudeRef.current = next;
  }

  // Pause auto-rotate while the detail panel is open.
  useEffect(() => {
    if (controlsRef.current) controlsRef.current.autoRotate = !isOpen;
  }, [isOpen]);

  // Lock body scroll when detail panel is open.
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Hide the site header while the detail view is open.
  useEffect(() => {
    const header = document.querySelector('.site-header');
    if (!header) return;
    if (isOpen) {
      header.classList.add('is-hidden');
      return () => {
        header.classList.remove('is-hidden');
      };
    }
  }, [isOpen]);

  // Auto-rotate the card carousel while the panel is open.
  useEffect(() => {
    if (!isOpen) return;
    const id = window.setInterval(() => {
      setPhotoIdx((p) => {
        const count = activeIdx !== null ? cardsPhotos[activeIdx].length : 5;
        return count > 0 ? (p + 1) % count : 0;
      });
    }, 2000);
    return () => window.clearInterval(id);
  }, [isOpen, activeIdx, cardsPhotos]);

  // Reset carousel when active city changes.
  useEffect(() => {
    setPhotoIdx(0);
  }, [activeIdx]);

  useStarsAnimation(starsRef, sectionRef);

  const activeCity = activeIdx !== null ? CITIES[activeIdx] : null;
  const activeCards = activeIdx !== null ? cardsPhotos[activeIdx] : null;

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/globe.gl@2"
        strategy="afterInteractive"
        onLoad={initGlobe}
      />
      <section
        id="activity"
        ref={sectionRef}
        className="relative w-full h-[130vh] mt-32 bg-bg text-text overflow-hidden"
      >
        <canvas ref={starsRef} className="absolute inset-0 z-0 hidden pointer-events-none" />
        <motion.div
          className="fixed inset-0 z-[1] bg-bg pointer-events-none"
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          aria-hidden="true"
        />

        <motion.div
          ref={globeContainerRef}
          className={`${isOpen ? 'fixed' : 'absolute'} top-0 left-0 w-screen h-screen z-[2] origin-center cursor-grab active:cursor-grabbing [&_canvas]:cursor-grab [&_canvas:active]:cursor-grabbing`}
          animate={isOpen ? { y: 0 } : { y: '30%' }}
          transition={{ duration: 1.1, ease: [0.65, 0.05, 0.36, 1] }}
        />

        <HandHint visible={hintVisible && !isOpen} />

        <IntroOverlay
          isOpen={isOpen}
          disabled={CITIES.length === 0}
          onOpen={() => { setIsOpen(true); setActiveIdx(0); }}
        />

        <DancingText
          visible={hintVisible && !isOpen}
          text={t('globe.hint.text')}
        />

        <DetailPanel
          isOpen={isOpen}
          city={activeCity}
          photos={activeCards}
          photoIdx={photoIdx}
          onClose={() => setIsOpen(false)}
        />

        <ZoomControls
          isOpen={isOpen}
          onZoomIn={() => zoomBy(0.7)}
          onZoomOut={() => zoomBy(1.4)}
        />
      </section>
    </>
  );
}
