'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useInView } from 'motion/react';
import { useI18n } from '@/lib/i18n-context';
import { ACTIVITIES as FALLBACK_ACTIVITIES, CHINA_DESTINATIONS, SLOVAKIA_COORDS } from '@/lib/data';
import type { Activity } from '@/lib/data';
import Button from '@/components/ui/Button';

interface Props {
  activities?: Activity[];
}

declare const Globe: (...args: unknown[]) => unknown;

interface GlobeInstance {
  backgroundColor: (c: string) => GlobeInstance;
  showAtmosphere: (b: boolean) => GlobeInstance;
  globeImageUrl: (u: string) => GlobeInstance;
  bumpImageUrl: (u: string) => GlobeInstance;
  arcsData: (d: unknown[]) => GlobeInstance;
  arcColor: (f: string) => GlobeInstance;
  arcStroke: (f: string) => GlobeInstance;
  arcAltitudeAutoScale: (n: number) => GlobeInstance;
  arcDashLength: (f: string) => GlobeInstance;
  arcDashGap: (f: string) => GlobeInstance;
  arcDashInitialGap: (f: string) => GlobeInstance;
  arcDashAnimateTime: (f: string) => GlobeInstance;
  arcsTransitionDuration: (n: number) => GlobeInstance;
  ringsData: (d: unknown[]) => GlobeInstance;
  ringColor: (f: () => (t: number) => string) => GlobeInstance;
  ringMaxRadius: (n: number) => GlobeInstance;
  ringPropagationSpeed: (n: number) => GlobeInstance;
  ringRepeatPeriod: (n: number) => GlobeInstance;
  ringAltitude: (n: number) => GlobeInstance;
  pointsData: (d: unknown[]) => GlobeInstance;
  pointColor: (f: (d: { isActive: boolean }) => string) => GlobeInstance;
  pointAltitude: (n: number) => GlobeInstance;
  pointRadius: (f: (d: { isActive: boolean }) => number) => GlobeInstance;
  globeMaterial: () => { bumpScale: number };
  lights: () => Array<{ isAmbientLight?: boolean; isDirectionalLight?: boolean; intensity: number }>;
  pointOfView: (pov: { lat: number; lng: number; altitude: number }, ms: number) => void;
  controls: () => {
    autoRotate: boolean;
    autoRotateSpeed: number;
    enableZoom: boolean;
    enablePan: boolean;
    enableRotate: boolean;
  };
  width: (w: number) => GlobeInstance;
  height: (h: number) => GlobeInstance;
}

export default function ActivitySection({ activities: activitiesProp }: Props) {
  const ACTIVITIES = activitiesProp && activitiesProp.length > 0 ? activitiesProp : FALLBACK_ACTIVITIES;
  const { t } = useI18n();

  const activityRef = useRef<HTMLElement>(null);
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const globeControlsRef = useRef<ReturnType<GlobeInstance['controls']> | null>(null);
  const globeArcsRef = useRef<unknown[]>([]);
  const tourCompletedRef = useRef(false);

  const [isDetail, setIsDetail] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Initialize globe
  useEffect(() => {
    const container = globeContainerRef.current;
    if (!container || typeof Globe !== 'function') return;

    const PALETTE = [
      'rgba(178,34,34,0.5)', 'rgba(178,34,34,0.25)', 'rgba(16,24,35,0.125)',
      'rgba(16,24,35,0.125)', 'rgba(178,34,34,0.25)', 'rgba(178,34,34,0.5)',
    ];
    const DASH_LEN = 1;
    const DASH_GAP = 15;

    const arcs = CHINA_DESTINATIONS.map((d) => ({
      startLat: SLOVAKIA_COORDS.lat, startLng: SLOVAKIA_COORDS.lng,
      endLat: d.lat, endLng: d.lng,
      color: PALETTE,
      stroke: 0.5,
      dashLength: DASH_LEN, dashGap: DASH_GAP,
      dashInitialGap: Math.random() * (DASH_LEN + DASH_GAP),
      dashAnimateTime: 2000,
    }));

    const globe = (Globe() as (el: HTMLElement) => GlobeInstance)(container)
      .backgroundColor('rgba(0,0,0,0)')
      .showAtmosphere(false)
      .globeImageUrl('/world-map-with-texture-global-satellite-photo-earth-view-from-space.jpg')
      .bumpImageUrl('/globe-topology.png')
      .arcsData(arcs)
      .arcColor('color')
      .arcStroke('stroke')
      .arcAltitudeAutoScale(0.22)
      .arcDashLength('dashLength')
      .arcDashGap('dashGap')
      .arcDashInitialGap('dashInitialGap')
      .arcDashAnimateTime('dashAnimateTime')
      .arcsTransitionDuration(0)
      .ringsData([])
      .ringColor(() => (ringT: number) => `rgba(255, 255, 255, ${1 - ringT})`)
      .ringMaxRadius(1.5)
      .ringPropagationSpeed(0.75)
      .ringRepeatPeriod(330)
      .ringAltitude(0.01)
      .pointsData([])
      .pointColor((d: { isActive: boolean }) => (d.isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.55)'))
      .pointAltitude(0.02)
      .pointRadius((d: { isActive: boolean }) => (d.isActive ? 0.6 : 0.3));

    globe.globeMaterial().bumpScale = 5;
    globe.lights().forEach((l) => {
      if (l.isAmbientLight) l.intensity = 2.5;
      else if (l.isDirectionalLight) l.intensity = 0.5;
    });
    globe.pointOfView({ lat: SLOVAKIA_COORDS.lat, lng: SLOVAKIA_COORDS.lng, altitude: 1.55 }, 0);

    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = true;

    globeRef.current = globe;
    globeControlsRef.current = controls;
    globeArcsRef.current = arcs;

    function resize() {
      const r = container!.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) globe.width(r.width).height(r.height);
    }
    resize();
    window.addEventListener('resize', resize);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver === 'function') {
      ro = new ResizeObserver(resize);
      ro.observe(container);
    }

    return () => {
      window.removeEventListener('resize', resize);
      ro?.disconnect();
    };
  }, []);

  // Reveal animation via motion's useInView
  const isInView = useInView(activityRef, { once: true, amount: 0.7 });
  useEffect(() => {
    if (isInView && activityRef.current) {
      activityRef.current.classList.add('is-revealed');
    }
  }, [isInView]);

  // Sync detail-mode class + globe arcs/points/auto-rotate
  useEffect(() => {
    const activity = activityRef.current;
    const globe = globeRef.current;
    if (!activity) return;

    if (isDetail) {
      activity.classList.add('is-detail');
      if (globe) {
        globe.arcsData([]);
        globe.pointsData(ACTIVITIES.map((a, idx) => ({
          lat: a.coords.lat,
          lng: a.coords.lng,
          isActive: idx === activeIndex,
        })));
      }
      if (globeControlsRef.current) globeControlsRef.current.autoRotate = false;
    } else {
      activity.classList.remove('is-detail');
      if (globe) {
        globe.pointsData([]);
        globe.ringsData([]);
        if (globeArcsRef.current.length) globe.arcsData(globeArcsRef.current);
        globe.pointOfView(
          { lat: SLOVAKIA_COORDS.lat, lng: SLOVAKIA_COORDS.lng, altitude: 1.55 },
          1200,
        );
      }
      if (globeControlsRef.current) globeControlsRef.current.autoRotate = true;
    }
  }, [isDetail, ACTIVITIES, activeIndex]);

  // Rotate / highlight on activeIndex change while in detail mode
  useEffect(() => {
    if (!isDetail) return;
    const globe = globeRef.current;
    if (!globe) return;
    const a = ACTIVITIES[activeIndex];
    if (!a) return;
    globe.pointsData(ACTIVITIES.map((entry, idx) => ({
      lat: entry.coords.lat,
      lng: entry.coords.lng,
      isActive: idx === activeIndex,
    })));
    globe.ringsData([{ lat: a.coords.lat, lng: a.coords.lng }]);
    globe.pointOfView(
      { lat: a.coords.lat, lng: a.coords.lng, altitude: a.altitude ?? 1.55 },
      1200,
    );
  }, [activeIndex, isDetail, ACTIVITIES]);

  const enterDetailMode = useCallback((startIndex = 0) => {
    setActiveIndex(startIndex);
    setIsDetail(true);
  }, []);

  const exitDetailMode = useCallback((viaTour = false) => {
    setIsDetail(false);
    tourCompletedRef.current = !!viaTour;
  }, []);

  // Scroll trigger for entering detail mode
  useEffect(() => {
    const activityEl = activityRef.current;
    if (!activityEl) return;
    const activity: HTMLElement = activityEl;
    if (window.matchMedia('(max-width: 768px)').matches) return;

    let cooldownUntil = 0;
    let lastWheelTime = 0;
    let wheelGestureHandled = false;
    let touchStartY: number | null = null;
    let touchGestureHandled = false;
    let detailScrollLock = false;
    const GESTURE_GAP_MS = 500;

    const detailObserver = new MutationObserver(() => {
      detailScrollLock = activity.classList.contains('is-detail');
    });
    detailObserver.observe(activity, { attributes: true, attributeFilter: ['class'] });

    const onScroll = () => {
      if (tourCompletedRef.current && window.scrollY < activity.offsetTop - 200) {
        tourCompletedRef.current = false;
      }
      if (!detailScrollLock) return;
      if (window.scrollY > activity.offsetTop) {
        window.scrollTo(0, activity.offsetTop);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    function isActivityArmed() {
      if (activity.classList.contains('is-detail')) return false;
      if (!activity.classList.contains('is-revealed')) return false;
      const rect = activity.getBoundingClientRect();
      return rect.top <= 0 && rect.bottom > window.innerHeight * 0.5;
    }

    function tryFireDown() {
      if (performance.now() < cooldownUntil) return true;
      if (isActivityArmed()) {
        if (tourCompletedRef.current) return false;
        if (window.scrollY > activity.offsetTop + 2) {
          window.scrollTo(0, activity.offsetTop);
        }
        enterDetailMode(0);
        cooldownUntil = performance.now() + 200;
        return true;
      }
      return false;
    }

    function swallow(e: Event) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }

    const onWheel = (e: WheelEvent) => {
      const now = performance.now();
      const gap = now - lastWheelTime;
      lastWheelTime = now;
      if (gap > GESTURE_GAP_MS) wheelGestureHandled = false;
      if (e.deltaY <= 0) return;

      if (detailScrollLock) {
        if (gap > GESTURE_GAP_MS) {
          detailScrollLock = false;
          return;
        }
        swallow(e);
        return;
      }

      if (wheelGestureHandled) { swallow(e); return; }
      if (tryFireDown()) {
        wheelGestureHandled = true;
        swallow(e);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? null;
      touchGestureHandled = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStartY === null) return;
      if (detailScrollLock) {
        if (!touchGestureHandled) {
          detailScrollLock = false;
          return;
        }
        swallow(e);
        return;
      }
      if (touchGestureHandled) { swallow(e); return; }
      const dy = touchStartY - (e.touches[0]?.clientY ?? touchStartY);
      if (dy <= 30) return;
      if (tryFireDown()) {
        touchGestureHandled = true;
        swallow(e);
      }
    };

    const onTouchEnd = () => { touchStartY = null; };

    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
    window.addEventListener('touchend', onTouchEnd, { capture: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel, { capture: true } as EventListenerOptions);
      window.removeEventListener('touchstart', onTouchStart, { capture: true } as EventListenerOptions);
      window.removeEventListener('touchmove', onTouchMove, { capture: true } as EventListenerOptions);
      window.removeEventListener('touchend', onTouchEnd, { capture: true } as EventListenerOptions);
      detailObserver.disconnect();
    };
  }, [enterDetailMode]);

  return (
    <section id="activity" ref={activityRef} className="activity relative min-h-screen pb-[max(60px,calc(660px-50vh))] overflow-x-clip">
      <div className="globe-stage" id="globe-stage">
        <div className="globe-wrap" id="globe-wrap">
          <div className="globe-3d" ref={globeContainerRef} id="globe-3d"></div>
        </div>
      </div>

      <div className="activity-intro flex flex-col gap-15 items-start" id="activity-intro">
        <div className="activity-intro-text flex flex-col gap-5">
          <h2 className="text-4xl font-medium leading-tight text-text max-sm:text-[28px]">A career mapped across continents.</h2>
          <p className="text-base font-normal leading-normal text-text">Each pin marks years of work — negotiations, factories, partnerships and the people behind them. Explore the cities that have shaped four decades of foreign trade, with a focus on the relationships built across China.</p>
        </div>
        <Button variant="outline" size="lg" id="view-cities" onClick={() => enterDetailMode(0)}>
          {t('btn.viewCities')}
        </Button>
      </div>

      <aside className="city-panel flex flex-col gap-3" id="city-panel" aria-hidden={!isDetail}>
        <Button variant="ghost" size="md" id="go-back" onClick={() => exitDetailMode()} className="self-start text-white hover:bg-white/10 hover:text-white">
          {t('btn.goBack')}
        </Button>
        <ul className="activity-list list-none flex flex-col gap-3 overflow-y-auto pr-1" role="list">
          {ACTIVITIES.map((a, i) => {
            const isOpen = i === activeIndex;
            return (
              <li key={a.id}>
                <article
                  onMouseEnter={() => setActiveIndex(i)}
                  onFocus={() => setActiveIndex(i)}
                  tabIndex={0}
                  className={`activity-card group relative rounded-2xl overflow-hidden bg-dark/60 border border-white/10 backdrop-blur-md transition-[border-color,background] duration-300 ${isOpen ? 'border-white/40 bg-dark/80' : ''}`}
                >
                  <div className="activity-card-image relative w-full aspect-[16/9] bg-gray-90 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-2">
                    <h3 className="text-lg font-bold text-white truncate">{a.title}</h3>
                    <span className="text-sm text-gray-80 shrink-0">{a.label}</span>
                  </div>
                  <div
                    className={`grid transition-[grid-template-rows,padding] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] pb-5' : 'grid-rows-[0fr]'}`}
                  >
                    <div className="overflow-hidden px-5">
                      <p className="text-sm font-normal leading-normal text-gray-80 mb-4">{a.body}</p>
                      <Button
                        as={Link}
                        href={`/activities?id=${encodeURIComponent(a.id)}`}
                        variant="primary"
                        size="sm"
                        className="hover:bg-dark hover:-translate-y-px transition-[background,transform]"
                      >
                        {t('btn.learnMore')}
                      </Button>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </aside>
    </section>
  );
}
