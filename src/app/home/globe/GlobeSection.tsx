'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import posthog from 'posthog-js';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './globe-section.css';
import { useI18n } from '@/app/hook/useI18n';
import { Move, ZoomIn, MapPin, X } from 'lucide-react';
import { pickTranslation } from '@/lib/directus';
import PinDetailSheet from './PinDetailSheet';
import type { GlobeCity } from '@/lib/type';
import type { GlobeText, GlobeTextBundle, MapBundle, MapText } from '@/lib/directus';

const FALLBACK_GLOBE_TEXT: GlobeText = {
  introHeading: 'A career mapped across continents.',
  introBody: '',
  introCta: 'Explore the globe',
};

const FALLBACK_MAP_TEXT: MapText = {
  hintDrag: 'Drag to spin',
  hintZoom: 'Scroll to zoom',
  hintClickCity: 'Tap a city',
  zoomMaxToast: 'Zoomed in as far as it goes',
  zoomMinToast: 'Zoomed out as far as it goes',
  regionWorld: 'World',
  regionEurope: 'Europe',
  regionAsia: 'Asia',
  regionAfrica: 'Africa',
  regionAmericas: 'Americas',
  regionOceania: 'Oceania',
  panelGoToLocation: 'Go to location',
  btnExploreNow: 'Explore now',
};

const REGION_TEXT_KEY: Record<string, keyof MapText> = {
  world: 'regionWorld',
  europe: 'regionEurope',
  asia: 'regionAsia',
  africa: 'regionAfrica',
  americas: 'regionAmericas',
  oceania: 'regionOceania',
};
import {
  IDLE_CENTER,
  idleZoomFor,
  WORLD_CENTER,
  WORLD_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  REGIONS,
  cityZoom,
  pickRandom,
  createMarkerEl,
} from './utils/globe-helpers';

interface Props {
  cities?: GlobeCity[];
  globeText?: GlobeTextBundle;
  map?: MapBundle;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function GlobeSection({ cities = [], globeText, map }: Props) {
  const { lang } = useI18n();

  const langGlobe = globeText?.[lang];
  const enGlobe = globeText?.['en'];
  const text: GlobeText =
    (langGlobe && langGlobe.introHeading ? langGlobe : null) ??
    (enGlobe && enGlobe.introHeading ? enGlobe : null) ??
    FALLBACK_GLOBE_TEXT;

  const langMap = map?.byLang[lang];
  const enMap = map?.byLang['en'];
  const mapText: MapText =
    (langMap && langMap.regionWorld ? langMap : null) ??
    (enMap && enMap.regionWorld ? enMap : null) ??
    FALLBACK_MAP_TEXT;
  const sectionRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLCanvasElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const spinRef = useRef(true);
  const isCameraMovingRef = useRef(false);
  const edgeTimerRef = useRef<number | undefined>(undefined);
  const preCityCameraRef = useRef<{ center: [number, number]; zoom: number; bearing: number } | null>(null);
  const prevActiveIdxRef = useRef<number | null>(null);
  const restoreOnCloseRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [regionKey, setRegionKey] = useState('world');
  const [zoomEdge, setZoomEdge] = useState<'in' | 'out' | null>(null);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [tokenMissing, setTokenMissing] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const restoredRef = useRef(false);

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  // On tablet/phone the detail card is a bottom sheet covering the lower ~50vh,
  // so the selected pin is flown to the center of the top 50vh (≈25vh from the
  // top) instead of dead-center. Must match the CSS breakpoint (≤1024px).
  const sheetFlyOffset = (): [number, number] =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches
      ? [0, -window.innerHeight * 0.25]
      : [0, 0];

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
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      projection: { name: 'globe' },
      center: IDLE_CENTER,
      zoom: idleZoomFor(window.innerWidth),
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      renderWorldCopies: false,
      maxBounds: [[-180, -85], [180, 85]],
      attributionControl: false,
      interactive: false,
      pitchWithRotate: false,
      dragRotate: false,
    });

    mapRef.current = map;
    if (typeof window !== 'undefined') {
      (window as unknown as { __tabMap?: mapboxgl.Map }).__tabMap = map;
    }

    map.on('load', () => setMapReady(true));
    map.on('movestart', () => { isCameraMovingRef.current = true; });
    map.on('moveend', () => {
      window.setTimeout(() => { isCameraMovingRef.current = false; }, 200);
    });

    map.on('zoom', () => {
      const z = map.getZoom();
      let edge: 'in' | 'out' | null = null;
      if (z >= MAX_ZOOM - 0.02) edge = 'in';
      else if (z <= MIN_ZOOM + 0.02) edge = 'out';
      setZoomEdge(edge);
      if (edge) {
        if (edgeTimerRef.current) window.clearTimeout(edgeTimerRef.current);
        edgeTimerRef.current = window.setTimeout(() => setZoomEdge(null), 2200);
      }
    });

    map.on('style.load', () => {
      map.setFog({
        color: 'rgba(247, 247, 247, 0.35)',
        'high-color': 'rgba(190, 210, 240, 0.5)',
        'horizon-blend': 0.01,
        'space-color': 'rgb(247, 247, 247)',
        'star-intensity': 0,
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
      if (edgeTimerRef.current) window.clearTimeout(edgeTimerRef.current);
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

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

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    const runWhenStyleReady = (fn: () => void) => {
      if (map.isStyleLoaded()) fn();
      else map.once('style.load', fn);
    };

    if (!isOpen) {
      spinRef.current = true;
      runWhenStyleReady(() => {
        map.setProjection({ name: 'globe' });
        if (map.getSource('mapbox-dem')) {
          map.setTerrain({ source: 'mapbox-dem', exaggeration: 0.9 });
        }
      });
      map.dragPan.disable();
      map.scrollZoom.disable();
      map.touchZoomRotate.disable();
      map.doubleClickZoom.disable();
      map.keyboard.disable();
      map.stop();
      map.flyTo({
        center: IDLE_CENTER,
        zoom: idleZoomFor(window.innerWidth),
        bearing: map.getBearing(),
        duration: 1200,
        essential: true,
      });
      prevActiveIdxRef.current = null;
      restoreOnCloseRef.current = false;
      preCityCameraRef.current = null;
      return;
    }

    spinRef.current = false;
    map.stop();

    runWhenStyleReady(() => {
      map.setProjection({ name: 'mercator' });
      map.setTerrain(null);
    });

    map.dragPan.enable();
    map.scrollZoom.enable();
    map.touchZoomRotate.enable();
    map.doubleClickZoom.enable();
    map.keyboard.enable();

    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    cityViews.forEach((v, i) => {
      const thumb = cardsPhotos[i]?.[0] || '/carousel/photo-01.jpg';
      const el = createMarkerEl(v.name, i === activeIdx, thumb);
      // Skip hover preview on touch devices — synthetic mouseenter sticks
      // after tap and leaves the preview card visible until another tap.
      if (!isCoarsePointer) {
        el.addEventListener('mouseenter', () => {
          if (isCameraMovingRef.current) return;
          el.classList.add('is-hover');
        });
        el.addEventListener('mouseleave', () => {
          el.classList.remove('is-hover');
        });
      }
      el.addEventListener('click', () => {
        setActiveIdx(i);
        setPhotoIdx(0);
        posthog.capture('globe_city_selected', {
          city_slug: v.city.slug,
          city_name: v.name,
          region: regionKey,
        });
      });
      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([v.city.lng, v.city.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });

    if (activeIdx !== null && cityViews[activeIdx]) {
      if (prevActiveIdxRef.current === null) {
        const cc = map.getCenter();
        preCityCameraRef.current = {
          center: [cc.lng, cc.lat],
          zoom: map.getZoom(),
          bearing: map.getBearing(),
        };
      }
      const c = cityViews[activeIdx].city;
      map.flyTo({
        center: [c.lng, c.lat],
        zoom: cityZoom(c.altitude),
        bearing: 0,
        duration: 1200,
        essential: true,
        offset: sheetFlyOffset(),
      });
    } else if (restoreOnCloseRef.current && preCityCameraRef.current) {
      const cam = preCityCameraRef.current;
      map.flyTo({
        center: cam.center,
        zoom: cam.zoom,
        bearing: cam.bearing,
        duration: 1200,
        essential: true,
      });
    } else {
      // No pin selected — show the chosen region (or the whole flat map) with
      // all (inactive) pins.
      const region = REGIONS.find((r) => r.key === regionKey);
      if (region?.bounds) {
        map.fitBounds(region.bounds, {
          padding: 60,
          bearing: 0,
          duration: 1200,
          essential: true,
        });
      } else if (cityViews.length > 0) {
        const lngs = cityViews.map((v) => v.city.lng);
        const lats = cityViews.map((v) => v.city.lat);
        map.fitBounds(
          [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
          ],
          { padding: 80, bearing: 0, duration: 1200, essential: true, maxZoom: 6 },
        );
      } else {
        map.flyTo({
          center: WORLD_CENTER,
          zoom: WORLD_ZOOM,
          bearing: 0,
          duration: 1200,
          essential: true,
        });
      }
    }
    prevActiveIdxRef.current = activeIdx;
  }, [activeIdx, isOpen, regionKey, cityViews, cardsPhotos, mapReady]);
  useEffect(() => {
    if (isOpen) return;
    const map = mapRef.current;
    const globe = mapContainerRef.current;
    const intro = introRef.current;
    const section = sectionRef.current;
    if (!map || !globe || !intro || !section) return;

    const gapFor = (w: number) => (w >= 1025 ? 88 : 28);
    const visibleRadius = (centerScreen: mapboxgl.Point) => {
      const c = map.getCenter();
      const R2D = 180 / Math.PI;
      const D2R = Math.PI / 180;
      const dest = (arcDeg: number, brgDeg: number) => {
        const f1 = c.lat * D2R, l1 = c.lng * D2R, d = arcDeg * D2R, t = brgDeg * D2R;
        const f2 = Math.asin(Math.sin(f1) * Math.cos(d) + Math.cos(f1) * Math.sin(d) * Math.cos(t));
        const l2 = l1 + Math.atan2(Math.sin(t) * Math.sin(d) * Math.cos(f1), Math.cos(d) - Math.sin(f1) * Math.sin(f2));
        return { lng: l2 * R2D, lat: f2 * R2D };
      };
      let maxDist = 0;
      for (let arc = 70; arc <= 90; arc += 2) {
        for (let brg = 0; brg < 360; brg += 45) {
          const p = map.project(dest(arc, brg));
          const dist = Math.hypot(p.x - centerScreen.x, p.y - centerScreen.y);
          if (dist > maxDist) maxDist = dist;
        }
      }
      return maxDist;
    };

    const recalc = () => {
      if (Math.abs(map.getZoom() - idleZoomFor(window.innerWidth)) > 0.05) return;
      const center = map.project(map.getCenter());
      const visibleTop = center.y - visibleRadius(center); // px from canvas top
      const introBottom =
        intro.getBoundingClientRect().bottom - section.getBoundingClientRect().top;
      const ty = introBottom + gapFor(window.innerWidth) - visibleTop;
      globe.style.setProperty('--ga-globe-ty', `${Math.round(ty)}px`);
    };

    // Resize is the only place the idle globe changes zoom (breakpoint switch).
    // The easeTo's moveend then re-runs recalc to reposition at the new radius.
    const onResize = () => {
      const targetZoom = idleZoomFor(window.innerWidth);
      if (Math.abs(map.getZoom() - targetZoom) > 0.01) {
        map.easeTo({ zoom: targetZoom, duration: 300, essential: true });
      } else {
        recalc();
      }
    };

    recalc();
    map.on('moveend', recalc); // re-measure after a flyTo/easeTo settles, or each spin cycle
    const ro = new ResizeObserver(recalc);
    ro.observe(intro);
    window.addEventListener('resize', onResize);
    return () => {
      map.off('moveend', recalc);
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [isOpen, lang, cityViews]);

  useEffect(() => {
    if (restoredRef.current || cityViews.length === 0) return;
    let saved: string | null = null;
    try { saved = sessionStorage.getItem('globe.restore'); } catch { /* private mode */ }
    if (!saved) return;
    restoredRef.current = true;
    try { sessionStorage.removeItem('globe.restore'); } catch { /* private mode */ }
    try {
      const { slug, regionKey: rk } = JSON.parse(saved) as { slug: string; regionKey?: string };
      const idx = cityViews.findIndex((v) => v.city.slug === slug);
      if (idx >= 0) {
        setIsOpen(true);
        if (rk) setRegionKey(rk);
        setActiveIdx(idx);
      }
    } catch { /* malformed */ }
  }, [cityViews]);

  function flashZoomEdge(edge: 'in' | 'out') {
    setZoomEdge(edge);
    if (edgeTimerRef.current) window.clearTimeout(edgeTimerRef.current);
    edgeTimerRef.current = window.setTimeout(() => setZoomEdge(null), 2200);
  }

  function zoomBy(delta: number) {
    const map = mapRef.current;
    if (!map || !isOpen) return;
    const cur = map.getZoom();
    const el = map.getContainer();
    const boundsMin = Math.log2(Math.max(el.clientWidth, el.clientHeight) / 512);
    const atFloor = delta < 0 && cur <= Math.max(MIN_ZOOM, boundsMin) + 0.1;
    const atCeil = delta > 0 && cur >= MAX_ZOOM - 0.02;
    if (atFloor || atCeil) {
      flashZoomEdge(delta > 0 ? 'in' : 'out');
      return;
    }
    const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, cur + delta));
    map.flyTo({ zoom: next, duration: 400, essential: true });
    // Exact backstop: if the estimate was off and the map didn't actually move
    // (clamped by maxBounds), still surface the message.
    map.once('moveend', () => {
      if (Math.abs(map.getZoom() - cur) < 0.03) {
        flashZoomEdge(delta > 0 ? 'in' : 'out');
      }
    });
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
    <section
      id="activity"
      ref={sectionRef}
      className={`ga-section${activeView ? ' city-open' : ''}`}
    >
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

      <div ref={introRef} className={`ga-intro${isOpen ? ' out' : ''}`}>
        <h2>
          {(() => {
            const heading = text.introHeading;
            const i = heading.indexOf('across');
            if (i === -1) return heading;
            return (
              <>
                {heading.slice(0, i)}
                <span className="text-accent">{heading.slice(i)}</span>
              </>
            );
          })()}
        </h2>
        <p>{text.introBody}</p>
        <button
          type="button"
          className="ga-cta"
          onClick={() => {
            setIsOpen(true);
            setActiveIdx(null);
            setRegionKey('world');
            posthog.capture('globe_explore_opened');
          }}
          disabled={cityViews.length === 0}
        >
          {text.introCta}
        </button>
      </div>

      <PinDetailSheet
        isOpen={isOpen}
        card={
          activeView && activeCards
            ? {
                citySlug: activeView.city.slug,
                name: activeView.name,
                desc: activeView.desc,
                photos: activeCards,
              }
            : null
        }
        photoIdx={photoIdx}
        regionKey={regionKey}
        panelGoToLocationLabel={mapText.panelGoToLocation}
        btnExploreNowLabel={mapText.btnExploreNow}
        onClose={() => {
          restoreOnCloseRef.current = true;
          setActiveIdx(null);
        }}
        onLocationClick={() => {
          const map = mapRef.current;
          if (!map || activeIdx === null) return;
          const c = cityViews[activeIdx].city;
          map.flyTo({
            center: [c.lng, c.lat],
            zoom: cityZoom(c.altitude),
            bearing: 0,
            duration: 1000,
            essential: true,
            offset: sheetFlyOffset(),
          });
        }}
      />

      <div className={`ga-regions${isOpen ? ' visible' : ''}`} aria-hidden={!isOpen}>
        {REGIONS.map((r) => (
          <button
            key={r.key}
            type="button"
            className={`ga-region-btn${regionKey === r.key && activeIdx === null ? ' active' : ''}`}
            onClick={() => {
              setActiveIdx(null);
              setRegionKey(r.key);
              posthog.capture('globe_region_changed', { region: r.key });
            }}
          >
            {mapText[REGION_TEXT_KEY[r.key]] ?? r.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        aria-label="Close"
        className={`ga-exit${isOpen && activeIdx === null ? ' visible' : ''}`}
        onClick={() => { setIsOpen(false); setActiveIdx(null); setRegionKey('world'); }}
      >
        <X />
      </button>

      <div className={`ga-zoom${isOpen ? ' visible' : ''}`} aria-hidden={!isOpen}>
        <button
          type="button"
          aria-label="Zoom in"
          className="ga-zoom-btn"
          onClick={() => zoomBy(+1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          className="ga-zoom-btn"
          onClick={() => zoomBy(-1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 12h14" />
          </svg>
        </button>
      </div>
      <div className={`ga-hints${isOpen ? ' visible' : ''}`} aria-hidden="true">
        <div className="ga-hint">
          <Move />
          <span>{mapText.hintDrag}</span>
        </div>
        <div className="ga-hint">
          <ZoomIn />
          <span>{mapText.hintZoom}</span>
        </div>
        <div className="ga-hint">
          <MapPin />
          <span>{mapText.hintClickCity}</span>
        </div>
      </div>

      <div
        className={`ga-zoom-toast${isOpen && zoomEdge ? ' visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        {zoomEdge === 'in' ? mapText.zoomMaxToast : mapText.zoomMinToast}
      </div>

    </section>
  );
}
