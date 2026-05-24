'use client';

import { City, GlobeControls, GlobeInstance, MarkerDatum, SLOVAKIA } from '@/components/activity/globe/types';
import { useCallback, useEffect, useRef, type RefObject } from 'react';

declare const Globe: (...args: unknown[]) => unknown;

interface UseGlobeArgs {
  containerRef: RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  activeIdx: number | null;
  cities: City[];
  onCityClick: (idx: number) => void;
}

function buildMarkers(cities: City[], activeIdx: number | null): MarkerDatum[] {
  return cities.map((d, i) => ({
    idx: i,
    lat: d.lat,
    lng: d.lng,
    name: d.business,
    isActive: i === activeIdx,
  }));
}

export function useGlobe({ containerRef, isOpen, activeIdx, cities, onCityClick }: UseGlobeArgs) {
  const globeRef = useRef<GlobeInstance | null>(null);
  const controlsRef = useRef<GlobeControls | null>(null);
  const readyRef = useRef(false);
  const citiesRef = useRef(cities);
  useEffect(() => {
    citiesRef.current = cities;
  }, [cities]);

  const initGlobe = useCallback(() => {
    const container = containerRef.current;
    if (!container || typeof Globe !== 'function') return;
    if (readyRef.current) return;
    readyRef.current = true;

    const globe = (Globe() as (el: HTMLElement) => GlobeInstance)(container)
      .backgroundColor('rgba(0,0,0,0)')
      .atmosphereColor('#6db4ff')
      .atmosphereAltitude(0.22)
      .globeImageUrl('/earth-blue-marble.jpg')
      .bumpImageUrl('/globe-topology.png')
      .htmlElementsData(buildMarkers(citiesRef.current, null))
      .htmlLat('lat')
      .htmlLng('lng')
      .htmlAltitude(0.012)
      .htmlElement((d: MarkerDatum) => {
        const el = document.createElement('div');
        el.className = 'globe-marker' + (d.isActive ? ' is-active' : '');
        const label = document.createElement('span');
        label.className = 'globe-marker-label';
        label.textContent = d.name;
        const shape = document.createElement('div');
        shape.className = 'globe-marker-shape';
        el.appendChild(label);
        el.appendChild(shape);
        el.addEventListener('click', () => {
          el.dispatchEvent(new CustomEvent('citypick', { detail: d.idx, bubbles: true }));
        });
        return el;
      });

    globe.globeMaterial().bumpScale = 5;
    globe.pointOfView({ lat: SLOVAKIA.lat, lng: SLOVAKIA.lng, altitude: 2.2 }, 0);

    const ctrl = globe.controls();
    ctrl.autoRotate = true;
    ctrl.autoRotateSpeed = 0.3;
    ctrl.enableZoom = false;

    globeRef.current = globe;
    controlsRef.current = ctrl;

    const resize = () => globe.width(window.innerWidth).height(window.innerHeight);
    resize();
    window.addEventListener('resize', resize);
  }, [containerRef]);

  useEffect(() => {
    if (typeof Globe === 'function') initGlobe();
  }, [initGlobe]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = (e: Event) => {
      const idx = (e as CustomEvent<number>).detail;
      if (typeof idx === 'number') onCityClick(idx);
    };
    container.addEventListener('citypick', handler as EventListener);
    return () => container.removeEventListener('citypick', handler as EventListener);
  }, [containerRef, onCityClick]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.htmlElementsData(buildMarkers(cities, isOpen ? activeIdx : null));
    if (isOpen && activeIdx !== null) {
      const c = cities[activeIdx];
      if (c) globe.pointOfView({ lat: c.lat, lng: c.lng, altitude: c.altitude }, 1200);
    }
  }, [activeIdx, isOpen, cities]);

  useEffect(() => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;
    ctrl.autoRotate = !isOpen;
    ctrl.enableZoom = isOpen;
  }, [isOpen]);

  return { initGlobe };
}
