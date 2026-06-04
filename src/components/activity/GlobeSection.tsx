'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './globe-section.css';
import { useI18n } from '@/app/hook/useI18n';
import { Move, ZoomIn, MapPin } from 'lucide-react';
import { pickTranslation } from '@/lib/directus';
import type { GlobeCity } from '@/lib/type';
import {
  IDLE_CENTER,
  IDLE_ZOOM,
  WORLD_CENTER,
  WORLD_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  cityZoom,
  pickRandom,
  createMarkerEl,
} from './globe-helpers';

interface Props {
  cities?: GlobeCity[];
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function GlobeSection({ cities = [] }: Props) {
  const { t, lang } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const starsRef = useRef<HTMLCanvasElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const spinRef = useRef(true);
  const isCameraMovingRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [tokenMissing, setTokenMissing] = useState(false);

  const cityViews = useMemo(
    () =>
      cities.map((c) => {
        const tr = pickTranslation(c, lang);
        return { city: c, name: tr.name || c.slug, desc: tr.description || '' };
      }),
    [cities, lang],
  );

  const cardsPhotos = useMemo(
    () => cities.map((c) => (c.photos && c.photos.length > 0 ? c.photos : pickRandom(5))),
    [cities],
  );

  // Initialize the Mapbox globe once on mount.
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;
    if (!MAPBOX_TOKEN) {
      setTokenMissing(true);
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/satellite-v9',
      projection: { name: 'globe' },
      center: IDLE_CENTER,
      zoom: IDLE_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      attributionControl: false,
      interactive: false,
      pitchWithRotate: false,
      dragRotate: false,
    });

    mapRef.current = map;
    if (typeof window !== 'undefined') {
      (window as unknown as { __tabMap?: mapboxgl.Map }).__tabMap = map;
    }

    map.on('movestart', () => { isCameraMovingRef.current = true; });
    map.on('moveend', () => {
      // Small grace period after moveend in case the cursor is parked on a
      // marker that just slid under it — don't immediately fire.
      window.setTimeout(() => { isCameraMovingRef.current = false; }, 200);
    });

    map.on('style.load', () => {
      map.setFog({
        // gray-20 (#F7F7F7) so the space/haze around the globe matches the
        // section background instead of painting it white.
        color: 'rgb(247, 247, 247)',
        'high-color': 'rgb(190, 210, 240)',
        'horizon-blend': 0.01,
        'space-color': 'rgb(247, 247, 247)',
        'star-intensity': 0,
      });

      // Hide every Mapbox-provided text label (country, place, road, POI,
      // transit, water, natural). Our red active pin marker is the only
      // label we want — Mapbox's labels would clutter the satellite
      // imagery and overlap our pins.
      const styleDef = map.getStyle();
      styleDef?.layers?.forEach((layer) => {
        if (layer.type === 'symbol') {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });

      if (!map.getSource('mapbox-dem')) {
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.terrain-rgb',
          tileSize: 512,
          maxzoom: 14,
        });
      }
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 0.9 });

      scheduleSpin(map);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Smooth continuous rotation when idle.
  function scheduleSpin(map: mapboxgl.Map) {
    function step() {
      if (!spinRef.current) return;
      const current = map.getBearing();
      map.easeTo({
        bearing: current - 60,
        duration: 60_000,
        easing: (t) => t,
      });
    }
    map.on('moveend', () => {
      if (spinRef.current) step();
    });
    step();
  }

  // Sync map state with the open/active flags.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!isOpen) {
      spinRef.current = true;
      // Back to the 3D globe when the detail view is closed.
      map.setProjection({ name: 'globe' });
      map.dragPan.disable();
      map.scrollZoom.disable();
      map.touchZoomRotate.disable();
      map.doubleClickZoom.disable();
      map.keyboard.disable();
      map.stop();
      map.flyTo({
        center: IDLE_CENTER,
        zoom: IDLE_ZOOM,
        bearing: map.getBearing(),
        duration: 1200,
        essential: true,
      });
      return;
    }

    spinRef.current = false;
    map.stop();

    // Flatten the globe into a 2D map for the detail/explore view.
    map.setProjection({ name: 'mercator' });

    map.dragPan.enable();
    map.scrollZoom.enable();
    map.touchZoomRotate.enable();
    map.doubleClickZoom.enable();
    map.keyboard.enable();

    cityViews.forEach((v, i) => {
      const thumb = cardsPhotos[i]?.[0] || '/carousel/photo-01.jpg';
      const el = createMarkerEl(v.name, i === activeIdx, thumb);
      el.addEventListener('mouseenter', () => {
        if (isCameraMovingRef.current) return;
        el.classList.add('is-hover');
      });
      el.addEventListener('mouseleave', () => {
        el.classList.remove('is-hover');
      });
      el.addEventListener('click', () => {
        setActiveIdx(i);
        setPhotoIdx(0);
      });
      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([v.city.lng, v.city.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });

    if (activeIdx !== null && cityViews[activeIdx]) {
      const c = cityViews[activeIdx].city;
      map.flyTo({
        center: [c.lng, c.lat],
        zoom: cityZoom(c.altitude),
        bearing: 0,
        duration: 1200,
        essential: true,
      });
    } else {
      // No pin selected yet — show the whole flat map with all (inactive) pins.
      map.flyTo({
        center: WORLD_CENTER,
        zoom: WORLD_ZOOM,
        bearing: 0,
        duration: 1200,
        essential: true,
      });
    }
  }, [activeIdx, isOpen, cityViews, cardsPhotos]);

  function zoomBy(delta: number) {
    const map = mapRef.current;
    if (!map || !isOpen) return;
    const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, map.getZoom() + delta));
    if (next === map.getZoom()) return;
    map.flyTo({ zoom: next, duration: 400, essential: true });
  }

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

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

  useEffect(() => {
    setPhotoIdx(0);
  }, [activeIdx]);

  // Stars animation kept for the section's white-to-black backdrop strip
  // (currently hidden via CSS). Preserved for parity with the previous build.
  useEffect(() => {
    const canvas = starsRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const LAYERS = [
      { density: 9600, speed: 0.0010, sizeMin: 0.3, sizeMax: 0.7, alphaMin: 0.06, alphaMax: 0.18, brightChance: 0.0 },
      { density: 14400, speed: 0.0040, sizeMin: 0.5, sizeMax: 1.0, alphaMin: 0.14, alphaMax: 0.32, brightChance: 0.02 },
      { density: 28000, speed: 0.0080, sizeMin: 0.8, sizeMax: 1.6, alphaMin: 0.28, alphaMax: 0.55, brightChance: 0.12 },
    ];

    let tileW = 0;
    let tileH = 0;
    let last = performance.now();
    let layers: Array<{ tile: HTMLCanvasElement; speed: number; offset: number }> = [];
    let rafId = 0;

    function buildLayer(layer: typeof LAYERS[number], dpr: number) {
      const count = Math.floor((tileW * tileH) / layer.density);
      const tile = document.createElement('canvas');
      tile.width = tileW;
      tile.height = tileH;
      const tctx = tile.getContext('2d');
      if (!tctx) return { tile, speed: layer.speed, offset: 0 };
      for (let i = 0; i < count; i++) {
        const bright = Math.random() < layer.brightChance;
        const x = Math.random() * tileW;
        const y = Math.random() * tileH;
        const r = (layer.sizeMin + Math.random() * (layer.sizeMax - layer.sizeMin)) * dpr * (bright ? 1.6 : 1);
        const a = (layer.alphaMin + Math.random() * (layer.alphaMax - layer.alphaMin)) * (bright ? 1 : 0.85);
        const tint = bright && Math.random() < 0.25 ? 'rgba(150,175,210,' : 'rgba(180,195,215,';
        for (const dx of [0, -tileW, tileW]) {
          tctx.beginPath();
          tctx.fillStyle = tint + a + ')';
          tctx.arc(x + dx, y, r, 0, Math.PI * 2);
          tctx.fill();
        }
      }
      return { tile, speed: layer.speed, offset: Math.random() * tileW };
    }

    function seed() {
      const dpr = window.devicePixelRatio || 1;
      const w = section!.offsetWidth * dpr;
      const h = section!.offsetHeight * dpr;
      canvas!.width = w;
      canvas!.height = h;
      canvas!.style.width = section!.offsetWidth + 'px';
      canvas!.style.height = section!.offsetHeight + 'px';
      tileW = w * 2;
      tileH = h;
      layers = LAYERS.map((l) => buildLayer(l, dpr));
    }

    function tick(now: number) {
      const dt = now - last;
      last = now;
      ctx!.fillStyle = '#000';
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
      for (const L of layers) {
        const pxPerMs = (canvas!.width * L.speed) / 1000;
        L.offset = (L.offset + dt * pxPerMs) % tileW;
        ctx!.drawImage(L.tile, -L.offset, 0);
        ctx!.drawImage(L.tile, -L.offset + tileW, 0);
      }
      rafId = requestAnimationFrame(tick);
    }

    seed();
    rafId = requestAnimationFrame(tick);
    const onResize = () => seed();
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const activeView = activeIdx !== null ? cityViews[activeIdx] : null;
  const activeCards = activeIdx !== null ? cardsPhotos[activeIdx] : null;

  return (
    <section id="activity" ref={sectionRef} className="ga-section">
      <canvas ref={starsRef} className="ga-stars" />
      <div className={`ga-backdrop${isOpen ? ' visible' : ''}`} aria-hidden="true" />
      <div
        ref={mapContainerRef}
        className={`ga-globe${isOpen ? ' shifted' : ''}`}
      />

      {tokenMissing && (
        <div className="ga-token-warn" role="alert">
          <strong>Mapbox token missing.</strong>
          <span>
            Add <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> to your <code>.env</code> and restart the dev server.
            Get a free token at <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noreferrer">mapbox.com</a>.
          </span>
        </div>
      )}

      <div className={`ga-intro${isOpen ? ' out' : ''}`}>
        <h2>
          {(() => {
            const heading = t('globeIntro.heading');
            const i = heading.indexOf('across');
            // Highlight "across continents…" in the accent color. Falls back to
            // the plain heading for translations that don't contain "across".
            if (i === -1) return heading;
            return (
              <>
                {heading.slice(0, i)}
                <span className="text-accent">{heading.slice(i)}</span>
              </>
            );
          })()}
        </h2>
        <p>{t('globeIntro.body')}</p>
        <button
          type="button"
          className="ga-cta"
          onClick={() => { setIsOpen(true); setActiveIdx(null); }}
          disabled={cityViews.length === 0}
        >
          View cities
        </button>
      </div>

      <aside className={`ga-panel${isOpen && activeView ? ' in' : ''}`} aria-hidden={!(isOpen && activeView)}>
        {activeView && activeCards && (
          <article className="ga-card">
            <div className="ga-thumb">
              {activeCards.map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p + i}
                  src={p}
                  alt=""
                  loading="lazy"
                  className={'ga-thumb-img' + (i === photoIdx ? ' active' : '')}
                />
              ))}
              <div className="ga-progress" aria-hidden="true">
                {activeCards.map((p, i) => (
                  <span
                    key={p + i}
                    className={'ga-progress-seg' + (i === photoIdx ? ' active' : '')}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label={t('aria.close')}
                className="ga-close"
                onClick={() => setIsOpen(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="ga-card-body">
              <h3 className="ga-name">{activeView.name}</h3>
              <button
                type="button"
                className="ga-location"
                onClick={() => {
                  const map = mapRef.current;
                  if (!map || activeIdx === null) return;
                  const c = cityViews[activeIdx].city;
                  map.flyTo({
                    center: [c.lng, c.lat],
                    zoom: cityZoom(c.altitude),
                    bearing: 0,
                    duration: 1000,
                    essential: true,
                  });
                }}
              >
                {t('panel.goToLocation')}
              </button>
              <p className="ga-desc">{activeView.desc}</p>
              <Link href={`/activities?id=${activeView.city.slug}`} className="ga-button">
                {t('btn.exploreNow')}
              </Link>
            </div>
          </article>
        )}
      </aside>

      <div className={`ga-zoom${isOpen ? ' visible' : ''}`} aria-hidden={!isOpen}>
        <button
          type="button"
          aria-label={t('aria.zoomIn')}
          className="ga-zoom-btn"
          onClick={() => zoomBy(+1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <button
          type="button"
          aria-label={t('aria.zoomOut')}
          className="ga-zoom-btn"
          onClick={() => zoomBy(-1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Detail-view guide — bottom-left. Hardcoded English for now; could be
          wired to i18n keys later (the .ga-hint span preserves \n line breaks). */}
      <div className={`ga-hints${isOpen ? ' visible' : ''}`} aria-hidden="true">
        <div className="ga-hint">
          <Move />
          <span>{'Drag to move the\nglobe around'}</span>
        </div>
        <div className="ga-hint">
          <ZoomIn />
          <span>{'Zoom in & out\nto view'}</span>
        </div>
        <div className="ga-hint">
          <MapPin />
          <span>{'Click on city to view\ndetails'}</span>
        </div>
      </div>

    </section>
  );
}
