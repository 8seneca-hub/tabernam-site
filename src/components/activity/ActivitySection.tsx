'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useInView } from 'motion/react';
import { useI18n } from '@/lib/i18n-context';
import { ACTIVITIES as FALLBACK_ACTIVITIES, CHINA_DESTINATIONS, SLOVAKIA_COORDS, AUTO_ADVANCE_MS, RING_FADE_MS } from '@/lib/data';
import type { Activity } from '@/lib/data';

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
  const cityNameRef = useRef<HTMLSpanElement>(null);
  const cardImageRef = useRef<HTMLImageElement>(null);
  const cardCityRef = useRef<HTMLSpanElement>(null);
  const cardTitleRef = useRef<HTMLHeadingElement>(null);
  const cardBodyRef = useRef<HTMLParagraphElement>(null);
  const cardLinkRef = useRef<HTMLAnchorElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const cityPanelRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const globeRef = useRef<GlobeInstance | null>(null);
  const globeControlsRef = useRef<ReturnType<GlobeInstance['controls']> | null>(null);
  const globeArcsRef = useRef<unknown[]>([]);
  const activeIndexRef = useRef(-1);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRunningRef = useRef(false);
  const tourCompletedRef = useRef(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetProgress = useCallback(() => {
    const bar = progressRef.current;
    if (!bar) return;
    bar.style.transition = 'none';
    bar.style.width = '0%';
  }, []);

  const startProgress = useCallback(() => {
    const bar = progressRef.current;
    if (!bar) return;
    resetProgress();
    requestAnimationFrame(() => {
      bar.style.transition = `width ${AUTO_ADVANCE_MS}ms linear`;
      bar.style.width = '100%';
    });
  }, [resetProgress]);

  const stopAuto = useCallback(() => {
    autoRunningRef.current = false;
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, []);

  const applyActive = useCallback((i: number) => {
    activeIndexRef.current = i;
    const b: Activity = ACTIVITIES[i];
    const globe = globeRef.current;

    if (listRef.current) {
      listRef.current.querySelectorAll('button').forEach((btn) => {
        btn.classList.toggle('is-active', Number(btn.dataset.index) === i);
      });
    }

    if (cityNameRef.current) {
      cityNameRef.current.textContent = b.title || b.label || b.id;
    }

    if (cardImageRef.current) {
      cardImageRef.current.src = b.image;
      cardImageRef.current.alt = b.title;
    }
    if (cardCityRef.current) cardCityRef.current.textContent = b.label || '';
    if (cardTitleRef.current) cardTitleRef.current.textContent = b.title;
    if (cardBodyRef.current) cardBodyRef.current.textContent = b.body;
    if (cardLinkRef.current) cardLinkRef.current.href = `/activities?id=${encodeURIComponent(b.id)}`;
    if (cardRef.current) cardRef.current.setAttribute('aria-hidden', 'false');
    if (cityPanelRef.current) cityPanelRef.current.setAttribute('aria-hidden', 'false');

    if (globe && b.coords) {
      globe.pointsData(ACTIVITIES.map((entry, idx) => ({
        lat: entry.coords.lat,
        lng: entry.coords.lng,
        isActive: idx === i,
      })));
      globe.ringsData([{ lat: b.coords.lat, lng: b.coords.lng }]);
      globe.pointOfView(
        { lat: b.coords.lat, lng: b.coords.lng, altitude: b.altitude ?? 1.55 },
        1200,
      );
    }

    startProgress();
  }, [startProgress, ACTIVITIES]);

  const setActive = useCallback((i: number) => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    const wasActive = activeIndexRef.current !== -1;
    if (globeRef.current) {
      globeRef.current.ringsData([]);
    }

    if (wasActive) {
      transitionTimerRef.current = setTimeout(() => {
        transitionTimerRef.current = null;
        applyActive(i);
      }, RING_FADE_MS);
    } else {
      applyActive(i);
    }
  }, [applyActive]);

  const clearActive = useCallback(() => {
    activeIndexRef.current = -1;
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    if (listRef.current) {
      listRef.current.querySelectorAll('button').forEach((btn) => btn.classList.remove('is-active'));
    }
    if (cardRef.current) cardRef.current.setAttribute('aria-hidden', 'true');
    if (cityPanelRef.current) cityPanelRef.current.setAttribute('aria-hidden', 'true');
    if (globeRef.current) {
      globeRef.current.ringsData([]);
      globeRef.current.pointsData([]);
    }
    stopAuto();
    resetProgress();
  }, [stopAuto, resetProgress]);

  const scheduleNextRef = useRef<() => void>(() => {});
  const exitDetailModeRef = useRef<(viaTour?: boolean) => void>(() => {});

  const exitDetailMode = useCallback((viaTour = false) => {
    const activity = activityRef.current;
    if (!activity) return;
    activity.classList.remove('is-detail');
    if (globeRef.current && globeArcsRef.current) {
      globeRef.current.arcsData(globeArcsRef.current);
    }
    if (globeControlsRef.current) globeControlsRef.current.autoRotate = true;
    if (globeRef.current) {
      globeRef.current.pointOfView(
        { lat: SLOVAKIA_COORDS.lat, lng: SLOVAKIA_COORDS.lng, altitude: 1.55 },
        1200,
      );
    }
    clearActive();
    tourCompletedRef.current = !!viaTour;
  }, [clearActive]);

  exitDetailModeRef.current = exitDetailMode;

  const scheduleNext = useCallback(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    autoTimerRef.current = setTimeout(() => {
      if (!autoRunningRef.current) return;
      const next = activeIndexRef.current + 1;
      if (next >= ACTIVITIES.length) {
        exitDetailModeRef.current(true);
        return;
      }
      setActive(next);
      scheduleNextRef.current();
    }, AUTO_ADVANCE_MS);
  }, [setActive, ACTIVITIES.length]);

  scheduleNextRef.current = scheduleNext;

  const enterDetailMode = useCallback((startIndex = 0) => {
    const activity = activityRef.current;
    if (!activity) return;
    activity.classList.add('is-detail');
    if (globeRef.current) {
      globeRef.current.arcsData([]);
      globeRef.current.pointsData(ACTIVITIES.map((b, idx) => ({
        lat: b.coords.lat,
        lng: b.coords.lng,
        isActive: idx === startIndex,
      })));
    }
    if (globeControlsRef.current) globeControlsRef.current.autoRotate = false;
    setActive(startIndex);
    scheduleNext();
    autoRunningRef.current = true;
  }, [setActive, scheduleNext, ACTIVITIES]);

  const nextCity = useCallback((delta: number) => {
    const current = activeIndexRef.current < 0 ? 0 : activeIndexRef.current;
    const next = current + delta;
    if (next < 0 || next >= ACTIVITIES.length) {
      exitDetailMode(true);
      return;
    }
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    if (globeRef.current) {
      globeRef.current.ringsData([]);
    }
    applyActive(next);
    scheduleNext();
  }, [exitDetailMode, applyActive, scheduleNext, ACTIVITIES.length]);

  // Initialize globe
  useEffect(() => {
    const container = globeContainerRef.current;
    if (!container || typeof Globe !== 'function') return;

    const PALETTE = [
      'rgba(25,250,143,0.5)', 'rgba(25,250,143,0.25)', 'rgba(3,109,60,0.125)',
      'rgba(3,109,60,0.125)', 'rgba(25,250,143,0.25)', 'rgba(25,250,143,0.5)',
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
      .pointColor((d: { isActive: boolean }) => (d.isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.45)'))
      .pointAltitude(0.02)
      .pointRadius((d: { isActive: boolean }) => (d.isActive ? 0.55 : 0.25));

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

  // Scroll trigger for entering detail mode
  useEffect(() => {
    const activityEl = activityRef.current;
    if (!activityEl) return;
    const activity: HTMLElement = activityEl;
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const quote = document.querySelector('.quote');
    let isProgrammaticScrolling = false;
    let cooldownUntil = 0;
    let lastWheelTime = 0;
    let wheelGestureHandled = false;
    let touchStartY: number | null = null;
    let touchGestureHandled = false;
    let detailScrollLock = false;
    const GESTURE_GAP_MS = 500;
    const SNAP_DURATION_S = 0.9;

    const easeOutExpo = (tt: number) => (tt === 1 ? 1 : 1 - Math.pow(2, -10 * tt));

    function smoothScrollTo(targetY: number, durationSeconds = 0.9) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.scrollTo(0, targetY);
        return;
      }
      const startY = window.scrollY;
      const dy = targetY - startY;
      const startT = performance.now();
      const durMs = durationSeconds * 1000;
      isProgrammaticScrolling = true;
      function tick(now: number) {
        const tt = Math.min(1, (now - startT) / durMs);
        window.scrollTo(0, startY + dy * easeOutExpo(tt));
        if (tt < 1) requestAnimationFrame(tick);
        else isProgrammaticScrolling = false;
      }
      requestAnimationFrame(tick);
    }

    const detailObserver = new MutationObserver(() => {
      detailScrollLock = activity.classList.contains('is-detail');
    });
    detailObserver.observe(activity, { attributes: true, attributeFilter: ['class'] });

    const onScroll = () => {
      if (tourCompletedRef.current && window.scrollY < activity.offsetTop - 200) {
        tourCompletedRef.current = false;
      }
      if (!detailScrollLock) return;
      if (isProgrammaticScrolling) return;
      if (window.scrollY > activity.offsetTop) {
        window.scrollTo(0, activity.offsetTop);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    function isAnimating() { return isProgrammaticScrolling; }

    function isQuoteArmed() {
      if (!quote) return false;
      if (activity.classList.contains('is-detail')) return false;
      const qRect = quote.getBoundingClientRect();
      const aRect = activity.getBoundingClientRect();
      return qRect.top <= 0 && aRect.top > 5;
    }

    function isActivityArmed() {
      if (activity.classList.contains('is-detail')) return false;
      if (!activity.classList.contains('is-revealed')) return false;
      const rect = activity.getBoundingClientRect();
      return rect.top <= 0 && rect.bottom > window.innerHeight * 0.5;
    }

    function tryFireDown() {
      if (isAnimating()) return true;
      if (performance.now() < cooldownUntil) return true;
      if (isQuoteArmed()) {
        smoothScrollTo(activity.offsetTop, SNAP_DURATION_S);
        cooldownUntil = performance.now() + SNAP_DURATION_S * 1000 + 200;
        return true;
      }
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
        <button type="button" className="btn-outline bg-white/10 backdrop-blur-sm border border-[#c0c0c0] rounded-lg px-10 py-5 text-xl font-medium text-black font-[inherit] cursor-pointer transition-[background,border-color] duration-200 hover:bg-white/50 hover:border-[#888]" id="view-cities" onClick={() => enterDetailMode(0)}>
          {t('btn.viewCities')}
        </button>
      </div>

      <aside ref={cityPanelRef} className="city-panel flex flex-col gap-2.5" id="city-panel" aria-hidden="true">
        <button type="button" className="btn-back self-start bg-transparent border-0 px-5 py-3 text-base font-medium text-black cursor-pointer font-[inherit] rounded-lg transition-colors duration-200 hover:bg-black/5" id="go-back" onClick={() => exitDetailMode()}>
          {t('btn.goBack')}
        </button>
        <ul ref={listRef} className="activity-list" id="activity-list" role="tablist" hidden></ul>
        <div className="flex items-center justify-between gap-2 bg-[#eee] border border-[#c2c2c2] rounded-[20px] px-5 py-2.5" role="tablist" aria-label={t('aria.cities')}>
          <button type="button" className="pill-nav bg-transparent border-0 p-2 inline-flex items-center justify-center text-black cursor-pointer rounded-full transition-[background,opacity] duration-200 hover:bg-black/5" id="city-prev" aria-label={t('aria.prevCity')} onClick={() => nextCity(-1)}>
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span ref={cityNameRef} className="flex-1 text-center text-base font-normal text-black py-2.5" id="city-name">Beijing</span>
          <button type="button" className="pill-nav bg-transparent border-0 p-2 inline-flex items-center justify-center text-black cursor-pointer rounded-full transition-[background,opacity] duration-200 hover:bg-black/5" id="city-next" aria-label={t('aria.nextCity')} onClick={() => nextCity(1)}>
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div ref={cardRef} className="city-card relative flex-1 min-h-0 bg-[#f8f8f8] border border-[#cbcbcb] rounded-[20px] p-4 flex flex-col justify-between gap-6 overflow-hidden backdrop-blur-[22px]" id="detail-card">
          <div className="city-card-top flex flex-col gap-8 min-h-0">
            <div className="card-image w-full h-[315px] bg-[#c9c9c9] rounded-xl overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img ref={cardImageRef} className="w-full h-full object-cover" id="card-image" alt="" />
            </div>
            <div className="card-text flex flex-col gap-4">
              <span ref={cardCityRef} className="inline-block self-start text-xs font-medium text-[#646464] bg-[#eee] border border-[#c2c2c2] px-3 py-1 rounded-full tracking-wide" id="card-city"></span>
              <h3 ref={cardTitleRef} className="text-2xl font-bold text-text" id="card-title"></h3>
              <p ref={cardBodyRef} className="text-base font-normal leading-normal text-text" id="card-body"></p>
            </div>
          </div>
          <Link ref={cardLinkRef} className="btn self-start inline-flex items-center justify-center bg-button text-button-text text-base font-medium px-5 py-3 rounded-lg border-0 w-max cursor-pointer font-[inherit] transition-[background,transform] duration-200 hover:bg-button-hover hover:-translate-y-px" id="card-link" href="/activities">
            {t('btn.learnMore')}
          </Link>
          <div className="card-progress absolute -left-px -right-px -bottom-px h-1 bg-black/[0.04] overflow-hidden"><span ref={progressRef} id="card-progress-bar"></span></div>
        </div>
      </aside>
    </section>
  );
}
