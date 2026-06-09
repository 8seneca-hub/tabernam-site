'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './globe-section.css';
import { useI18n } from '@/app/hook/useI18n';
import { Move, ZoomIn, MapPin, X } from 'lucide-react';
import { pickTranslation } from '@/lib/directus';
import Image from '@/components/ui/Image';
import type { GlobeCity } from '@/lib/type';
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
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function GlobeSection({ cities = [] }: Props) {
  const { t, lang } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const sheetDragRef = useRef<{ startY: number; collapsedPx: number; dragging: boolean }>({
    startY: 0,
    collapsedPx: 0,
    dragging: false,
  });
  // Collapsed translate (px) for the bottom sheet — measured from each city's
  // actual content height so the expanded sheet hugs its content instead of a
  // fixed height. Kept in sync via a ResizeObserver (see effect below).
  const sheetCollapsedRef = useRef(0);
  // Drag is throttled to one transform write per animation frame for smoothness.
  const sheetRafRef = useRef(0);
  const sheetLastYRef = useRef(0);
  const starsRef = useRef<HTMLCanvasElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const spinRef = useRef(true);
  const isCameraMovingRef = useRef(false);
  const edgeTimerRef = useRef<number | undefined>(undefined);
  // The map view the user was at right before opening a city card, captured so
  // closing the card can restore exactly that view (instead of re-framing the
  // region). prevActiveIdxRef detects the null→city transition (when to capture).
  // restoreOnCloseRef is an explicit intent set by the card-close button: only
  // then does deselecting restore the pre-card view; region-tab clicks leave it
  // false so they re-frame the region instead. Read (not mutated) by the sync
  // effect so it stays correct even if the effect runs twice for one gesture.
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
  // On touch devices (mobile/tablet) the interaction is a tap, not a click.
  // Resolved after mount to stay hydration-safe.
  const [isTouch, setIsTouch] = useState(false);
  // Mobile bottom-sheet expansion state (collapsed peek vs. full height).
  const [sheetExpanded, setSheetExpanded] = useState(false);
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
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      projection: { name: 'globe' },
      center: IDLE_CENTER,
      zoom: idleZoomFor(window.innerWidth),
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      // Don't tile infinite copies of the world horizontally in the flat
      // (mercator) detail view — otherwise dragging sideways wraps forever.
      renderWorldCopies: false,
      // Lock panning to a single world so you can't drag off the edges into
      // empty space. ±85 lat is the mercator pole limit.
      maxBounds: [[-180, -85], [180, 85]],
      // Don't tile infinite copies of the world horizontally in the flat
      // (mercator) detail view — otherwise dragging sideways wraps forever.
      // Lock panning to a single world so you can't drag off the edges into
      // empty space. ±85 lat is the mercator pole limit.
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
      // Small grace period after moveend in case the cursor is parked on a
      // marker that just slid under it — don't immediately fire.
      window.setTimeout(() => { isCameraMovingRef.current = false; }, 200);
    });

    // Flash a transient "can't zoom further" message when the user reaches the
    // min/max zoom limit (via wheel, pinch, or the +/- buttons).
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
        // Semi-transparent gray-20 (#F7F7F7) atmosphere: blends the globe's edge
        // into the section background without washing a near-white haze over the
        // whole disk (which read especially strong on smaller mobile globes).
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
      // Restore terrain relief for the globe (disabled in the flat view).
      if (map.getSource('mapbox-dem')) {
        map.setTerrain({ source: 'mapbox-dem', exaggeration: 0.9 });
      }
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
      // Reset the close-restore tracking so the next open starts fresh.
      prevActiveIdxRef.current = null;
      restoreOnCloseRef.current = false;
      preCityCameraRef.current = null;
      return;
    }

    spinRef.current = false;
    map.stop();

    // Flatten the globe into a 2D map for the detail/explore view.
    map.setProjection({ name: 'mercator' });

    // Disable 3D terrain in the flat view. With terrain on, Mapbox offsets each
    // marker by its ground elevation; at high zoom over high-altitude cities
    // (e.g. Lhasa, ~3650m) that pushes the pin far off its coordinate / off
    // screen. The flat detail map doesn't need terrain relief anyway.
    map.setTerrain(null);

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
      // Entering city-view from the overview (not switching city→city): remember
      // the current view so closing the card can return here.
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
      // Card was closed via its close button — restore the exact view the user
      // was at before opening it, rather than re-framing the region.
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
        // 'world' / default: open focused on the actual locations — fit a box
        // around every city pin rather than the whole globe. The user can still
        // zoom out to the full map from here.
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

    // Track activeIdx so the next run can detect the overview→city transition
    // (when to capture the pre-card view).
    prevActiveIdxRef.current = activeIdx;
  }, [activeIdx, isOpen, regionKey, cityViews, cardsPhotos, mapReady]);

  // Keep the idle globe both sized AND positioned to the viewport.
  //
  // Sizing: the right zoom is breakpoint-dependent (see idleZoomFor), so re-zoom
  // on resize while the intro globe is shown.
  //
  // Positioning: the globe's disk and the intro button live in different
  // reference frames — the disk is offset by a fraction of viewport *height*,
  // while the button sits at the bottom of copy that wraps by viewport *width*
  // (and language). No fixed percentage clears the button at every aspect ratio.
  // So we measure where the intro actually ends and place the globe so its
  // visible top edge sits a constant GAP below it.
  //
  // The globe is drawn with a *perspective* camera, so its on-screen silhouette
  // is larger than transform.globeRadius (the geometric radius). We therefore
  // measure the real silhouette by projecting a ring of near-limb surface points
  // and taking the farthest from the projected center — that distance is the
  // visible radius, and the disk is centered in the canvas, so the visible top
  // is centerY − R. Published as --ga-globe-ty. (The opened detail map drives
  // its own zoom/position and is left alone.)
  useEffect(() => {
    if (isOpen) return;
    const map = mapRef.current;
    const globe = mapContainerRef.current;
    const intro = introRef.current;
    const section = sectionRef.current;
    if (!map || !globe || !intro || !section) return;

    // Gap between the button's bottom and the globe's visible top. Desktop has
    // far more room beside/below the copy, so it gets a more generous gap than
    // the tighter mobile/tablet layouts. (Recomputed per recalc so it tracks
    // breakpoint changes on resize.)
    const gapFor = (w: number) => (w >= 1025 ? 88 : 28);

    // Max screen distance from the projected center to a ring of near-limb
    // surface points = the globe's visible silhouette radius (in canvas px).
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

    // Measure + position only — NEVER moves the camera. (Camera zoom is owned by
    // the sync effect's open/close flyTo and the resize handler below; if this
    // also drove zoom it would fight that flyTo and strand the map mid-close.)
    // Bails unless the map is settled at the idle zoom, so it never measures the
    // radius mid-flight (e.g. while the close flyTo is still zooming out from a
    // deep city view) — the flyTo's final moveend re-runs it at the right zoom.
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

  // Restore the previously-opened city when returning from its detail page
  // (e.g. globe → click city → "Explore now" → /activities → browser back).
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
    // maxBounds raises the real minimum zoom above MIN_ZOOM: you can't zoom out
    // past the point where the whole world fills the viewport, i.e.
    // log2(viewport / tileSize). That floor is viewport-dependent, so estimate
    // it from the container — this lets us skip a flyTo that would just bounce.
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
    setSheetExpanded(false);
  }, [activeIdx]);

  // Measure the bottom sheet's natural content height and derive the collapsed
  // peek: the sheet hugs its content (capped at 90vh by CSS), peeks at most 50vh
  // when collapsed, and the expanded position is the content height itself. The
  // collapsed translate is published as a CSS var so .ga-panel.in can use it,
  // and stored in a ref for the drag handlers. Re-runs on content/size changes.
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet || activeIdx === null) return;
    const measure = () => {
      const h = sheet.getBoundingClientRect().height;
      const peek = Math.min(h, 0.5 * window.innerHeight);
      const collapsed = Math.max(0, h - peek);
      sheet.style.setProperty('--sheet-collapsed', `${collapsed}px`);
      sheetCollapsedRef.current = collapsed;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(sheet);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
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

  // ── Mobile bottom-sheet drag ──────────────────────────────────────────────
  // The sheet rests at a collapsed peek (CSS translateY, derived from the
  // measured content height) and drags up to its content height. We track the
  // drag in px and snap to the nearest state on release.
  const collapsedOffsetPx = () => sheetCollapsedRef.current;

  const onSheetDragStart = (e: React.PointerEvent) => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    sheetDragRef.current = {
      startY: e.clientY,
      collapsedPx: collapsedOffsetPx(),
      dragging: true,
    };
    sheetLastYRef.current = e.clientY;
    // No transition while the finger is down so the sheet tracks 1:1, and hint
    // the compositor so the per-frame transforms stay on the GPU.
    sheet.style.transition = 'none';
    sheet.style.willChange = 'transform';
    // Capture on the handle (the listener target), NOT the sheet — capturing on
    // the sheet would redirect pointermove/up away from the handle's handlers
    // and the drag would stall after it starts.
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  // Apply the latest drag position once per frame (rAF-throttled) for smoothness.
  const renderSheetDrag = () => {
    sheetRafRef.current = 0;
    const drag = sheetDragRef.current;
    const sheet = sheetRef.current;
    if (!drag.dragging || !sheet) return;
    const base = sheetExpanded ? 0 : drag.collapsedPx;
    const next = Math.max(0, Math.min(drag.collapsedPx, base + (sheetLastYRef.current - drag.startY)));
    sheet.style.transform = `translate3d(0, ${next}px, 0)`;
  };

  const onSheetDragMove = (e: React.PointerEvent) => {
    if (!sheetDragRef.current.dragging) return;
    sheetLastYRef.current = e.clientY;
    if (!sheetRafRef.current) {
      sheetRafRef.current = requestAnimationFrame(renderSheetDrag);
    }
  };

  const onSheetDragEnd = (e: React.PointerEvent) => {
    const drag = sheetDragRef.current;
    const sheet = sheetRef.current;
    if (!drag.dragging || !sheet) return;
    drag.dragging = false;
    if (sheetRafRef.current) {
      cancelAnimationFrame(sheetRafRef.current);
      sheetRafRef.current = 0;
    }
    const base = sheetExpanded ? 0 : drag.collapsedPx;
    const ended = Math.max(0, Math.min(drag.collapsedPx, base + (e.clientY - drag.startY)));
    const willExpand = ended < drag.collapsedPx / 2;
    const target = willExpand ? 0 : drag.collapsedPx;
    // Animate to the snap target inline, then hand control back to the CSS class
    // (which now matches `sheetExpanded`) once the transition settles.
    sheet.style.transition = 'transform 0.42s cubic-bezier(0.32, 0.72, 0, 1)';
    sheet.style.transform = `translate3d(0, ${target}px, 0)`;
    setSheetExpanded(willExpand);
    const clear = () => {
      sheet.style.transition = '';
      sheet.style.transform = '';
      sheet.style.willChange = '';
      sheet.removeEventListener('transitionend', clear);
    };
    sheet.addEventListener('transitionend', clear);
    window.setTimeout(clear, 480);
  };

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
            const heading = t('globeIntro.heading');
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
        <p>{t('globeIntro.body')}</p>
        <button
          type="button"
          className="ga-cta"
          onClick={() => { setIsOpen(true); setActiveIdx(null); setRegionKey('world'); }}
          disabled={cityViews.length === 0}
        >
          {t('globeIntro.cta')}
        </button>
      </div>

      <aside
        ref={sheetRef}
        className={`ga-panel${isOpen && activeView ? ' in' : ''}${sheetExpanded ? ' expanded' : ''}`}
        aria-hidden={!(isOpen && activeView)}
      >
        {activeView && activeCards && (
          <article className="ga-card">
            {/* Drag grip — only shown on mobile, where the card is a bottom sheet. */}
            <div
              className="ga-sheet-handle"
              onPointerDown={onSheetDragStart}
              onPointerMove={onSheetDragMove}
              onPointerUp={onSheetDragEnd}
              onPointerCancel={onSheetDragEnd}
              aria-hidden="true"
            >
              <span className="ga-sheet-grip" />
            </div>
            <div className="ga-thumb">
              {activeCards.map((p, i) => (
                <Image
                  key={p + i}
                  src={p}
                  alt=""
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
                aria-label="Close"
                className="ga-close"
                onClick={() => { restoreOnCloseRef.current = true; setActiveIdx(null); }}
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
                    offset: sheetFlyOffset(),
                  });
                }}
              >
                {t('panel.goToLocation')}
              </button>
              <p className="ga-desc">{activeView.desc}</p>
              <Link
                href={`/activities?id=${activeView.city.slug}`}
                className="ga-button"
                onClick={() => {
                  try {
                    sessionStorage.setItem(
                      'globe.restore',
                      JSON.stringify({ slug: activeView.city.slug, regionKey }),
                    );
                  } catch { /* private mode */ }
                }}
              >
                {t('btn.exploreNow')}
              </Link>
            </div>
          </article>
        )}
      </aside>

      <div className={`ga-regions${isOpen ? ' visible' : ''}`} aria-hidden={!isOpen}>
        {REGIONS.map((r) => (
          <button
            key={r.key}
            type="button"
            className={`ga-region-btn${regionKey === r.key && activeIdx === null ? ' active' : ''}`}
            onClick={() => { setActiveIdx(null); setRegionKey(r.key); }}
          >
            {t(`region.${r.key}`)}
          </button>
        ))}
      </div>

      <button
        type="button"
        aria-label="Close"
        className={`ga-exit${isOpen ? ' visible' : ''}`}
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
          <span>{t('globeHint.drag')}</span>
        </div>
        <div className="ga-hint">
          <ZoomIn />
          <span>{t('globeHint.zoom')}</span>
        </div>
        <div className="ga-hint">
          <MapPin />
          <span>{t('globeHint.clickCity')}</span>
        </div>
      </div>

      <div
        className={`ga-zoom-toast${isOpen && zoomEdge ? ' visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        {zoomEdge === 'in' ? t('globeZoom.maxToast') : t('globeZoom.minToast')}
      </div>

    </section>
  );
}
