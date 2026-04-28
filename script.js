/* =============================================================
   TABERNAM — front-page interactions
   -------------------------------------------------------------
   ADMIN / CMS CONFIG
   - HERO_SLIDES: cards shown in the hero coverflow carousel.
       Each entry: { image, alt, href? }
   - BUSINESSES: globe markers + detail-card content (Activity).
       Each entry: { id, name, dot {x,y}, focus {x,y,scale},
                     image, title, body }
   - SLOVAKIA: origin point on the globe (SVG units, 0–600).
   - AUTO_ADVANCE_MS: per-card auto-cycle duration in Activity.
   ============================================================= */

const HERO_SLIDES = [
  { image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1000&q=85', alt: 'Business meeting' },
  { image: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=1000&q=85', alt: 'Shanghai by night' },
  { image: 'https://images.unsplash.com/photo-1542223616-740d5dff7f56?auto=format&fit=crop&w=1000&q=85', alt: 'Beijing skyline' },
  { image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1000&q=85', alt: 'Hong Kong harbour' },
  { image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1000&q=85', alt: 'Singapore Marina Bay' },
  { image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=85', alt: 'Dubai skyline' },
  { image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85', alt: 'Diplomatic handshake' },
  { image: 'https://images.unsplash.com/photo-1496564203457-11bb12075d90?auto=format&fit=crop&w=1000&q=85', alt: 'Bratislava' },
  { image: 'https://images.unsplash.com/photo-1543059080-f9b1272213d5?auto=format&fit=crop&w=1000&q=85', alt: 'São Paulo aerial' },
  { image: 'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=1000&q=85', alt: 'New York City' },
  { image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=1000&q=85', alt: 'Boardroom table' },
  { image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1000&q=85', alt: 'Mountain landscape' },
];

const SLOVAKIA = { x: 305, y: 215 };

const AUTO_ADVANCE_MS = 2000;

/* focus { x, y, scale } — applied to the globe-wrap when this
   business is active. x/y are in PIXELS from the centred resting
   position. Keep them small (-40 to 40) so the globe stays roughly
   centred; otherwise it gets shoved past the viewport edges. */
const BUSINESSES = [
  {
    id: 'beijing',
    name: 'Business',
    dot: { x: 470, y: 230 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=900&q=80',
    title: 'Lorem ipsum dolor',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'shanghai',
    name: 'Business',
    dot: { x: 495, y: 265 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=900&q=80',
    title: 'Lorem ipsum dolor',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'hongkong',
    name: 'Business',
    dot: { x: 480, y: 305 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=900&q=80',
    title: 'Lorem ipsum dolor',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'singapore',
    name: 'Business',
    dot: { x: 455, y: 360 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80',
    title: 'Lorem ipsum dolor',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'dubai',
    name: 'Business',
    dot: { x: 380, y: 305 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80',
    title: 'Lorem ipsum dolor',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'newyork',
    name: 'Business',
    dot: { x: 165, y: 245 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=900&q=80',
    title: 'Lorem ipsum dolor',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'sao-paulo',
    name: 'Business',
    dot: { x: 230, y: 395 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1543059080-f9b1272213d5?auto=format&fit=crop&w=900&q=80',
    title: 'Lorem ipsum dolor',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'sydney',
    name: 'Business',
    dot: { x: 510, y: 415 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=900&q=80',
    title: 'Lorem ipsum dolor',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
];

/* ============================================================= */

const SVG_NS = 'http://www.w3.org/2000/svg';

const els = {
  activity: document.getElementById('activity'),
  list: document.getElementById('business-list'),
  globeWrap: document.getElementById('globe-wrap'),
  lines: document.getElementById('connection-lines'),
  dots: document.getElementById('business-dots'),
  card: document.getElementById('detail-card'),
  cardClose: document.getElementById('card-close'),
  cardImage: document.getElementById('card-image'),
  cardTitle: document.getElementById('card-title'),
  cardBody: document.getElementById('card-body'),
  cardLink: document.getElementById('card-link'),
  cardProgress: document.getElementById('card-progress-bar'),
};

let activeIndex = -1;
let autoTimer = null;
let progressTimer = null;
let autoRunning = false;

function buildList() {
  BUSINESSES.forEach((b, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = b.name;
    btn.setAttribute('role', 'tab');
    btn.dataset.index = i;
    btn.addEventListener('click', () => onBusinessClick(i));
    li.appendChild(btn);
    els.list.appendChild(li);
  });
}

function buildOverlay() {
  // SVG-globe overlay. We render a 3D globe instead now, so no-op
  // when the SVG groups don't exist.
  if (!els.lines || !els.dots) return;

  BUSINESSES.forEach((b, i) => {
    // dashed connection line from Slovakia to dot
    const path = document.createElementNS(SVG_NS, 'path');
    const dx = b.dot.x - SLOVAKIA.x;
    const dy = b.dot.y - SLOVAKIA.y;
    const cx = SLOVAKIA.x + dx / 2 + dy * 0.15;
    const cy = SLOVAKIA.y + dy / 2 - dx * 0.15;
    path.setAttribute('d', `M ${SLOVAKIA.x} ${SLOVAKIA.y} Q ${cx} ${cy} ${b.dot.x} ${b.dot.y}`);
    path.setAttribute('class', 'connection');
    path.dataset.index = i;
    els.lines.appendChild(path);

    // dot group: 3 pulse rings + core
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'dot');
    g.setAttribute('transform', `translate(${b.dot.x} ${b.dot.y})`);
    g.dataset.index = i;
    g.addEventListener('click', () => onBusinessClick(i));

    [0, 1, 2].forEach((k) => {
      const ring = document.createElementNS(SVG_NS, 'circle');
      ring.setAttribute('r', '6');
      ring.setAttribute('class', `dot-pulse${k ? ' delay-' + k : ''}`);
      g.appendChild(ring);
    });

    const core = document.createElementNS(SVG_NS, 'circle');
    core.setAttribute('r', '5');
    core.setAttribute('class', 'dot-core');
    g.appendChild(core);

    // origin pin for Slovakia (only render once, on the first iteration)
    els.dots.appendChild(g);
  });

  // Slovakia origin marker
  const origin = document.createElementNS(SVG_NS, 'circle');
  origin.setAttribute('cx', SLOVAKIA.x);
  origin.setAttribute('cy', SLOVAKIA.y);
  origin.setAttribute('r', '4');
  origin.setAttribute('fill', '#1a1a1a');
  els.dots.appendChild(origin);
}

function setActive(i) {
  activeIndex = i;
  const b = BUSINESSES[i];

  // sidebar active state
  els.list.querySelectorAll('button').forEach((btn) => {
    btn.classList.toggle('is-active', Number(btn.dataset.index) === i);
  });

  // globe transform
  const f = b.focus;
  els.globeWrap.style.transform = `translate(${f.x}px, ${f.y}px) scale(${f.scale})`;

  // populate card
  els.cardImage.src = b.image;
  els.cardImage.alt = b.title;
  els.cardTitle.textContent = b.title;
  els.cardBody.textContent = b.body;
  els.cardLink.href = `business.html?id=${encodeURIComponent(b.id)}`;
  els.card.setAttribute('aria-hidden', 'false');

  els.activity.classList.add('is-focused');
  startProgress();
}

function clearActive() {
  activeIndex = -1;
  els.globeWrap.style.transform = '';
  els.list.querySelectorAll('button').forEach((btn) => btn.classList.remove('is-active'));
  els.card.setAttribute('aria-hidden', 'true');
  els.activity.classList.remove('is-focused');
  stopAuto();
  resetProgress();
}

function startProgress() {
  resetProgress();
  // force reflow then animate to 100%
  requestAnimationFrame(() => {
    els.cardProgress.style.transition = `width ${AUTO_ADVANCE_MS}ms linear`;
    els.cardProgress.style.width = '100%';
  });
}

function resetProgress() {
  els.cardProgress.style.transition = 'none';
  els.cardProgress.style.width = '0%';
}

function stopAuto() {
  autoRunning = false;
  if (autoTimer) {
    clearTimeout(autoTimer);
    autoTimer = null;
  }
}

function startAuto(fromIndex = 0) {
  autoRunning = true;
  setActive(fromIndex);
  scheduleNext();
}

function scheduleNext() {
  if (autoTimer) clearTimeout(autoTimer);
  autoTimer = setTimeout(() => {
    if (!autoRunning) return;
    const next = activeIndex + 1;
    if (next >= BUSINESSES.length) {
      clearActive();
    } else {
      setActive(next);
      scheduleNext();
    }
  }, AUTO_ADVANCE_MS);
}

function onBusinessClick(i) {
  // user clicked a business — pause auto-run, focus on this one
  if (autoRunning) {
    stopAuto();
    setActive(i);
  } else if (activeIndex === i) {
    // clicking the same one again does nothing
    return;
  } else {
    setActive(i);
  }
}

/* ─── Hero carousel ──────────────────────────────────────────── */
const carousel = {
  track: null,
  cards: [],
  active: 0,
};

function buildCarousel() {
  carousel.track = document.getElementById('carousel-track');
  if (!carousel.track) return;

  HERO_SLIDES.forEach((slide, i) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'carousel-card';
    card.dataset.index = i;
    card.setAttribute('aria-label', slide.alt || `Slide ${i + 1}`);

    const img = document.createElement('img');
    img.src = slide.image;
    img.alt = slide.alt || '';
    card.appendChild(img);

    card.addEventListener('click', () => onCardClick(i, slide));
    carousel.track.appendChild(card);
    carousel.cards.push(card);
  });

  updateCarousel();

  document.getElementById('carousel-prev')?.addEventListener('click', () => goTo(carousel.active - 1));
  document.getElementById('carousel-next')?.addEventListener('click', () => goTo(carousel.active + 1));

  document.addEventListener('keydown', (e) => {
    if (!isHeroInView()) return;
    if (e.key === 'ArrowLeft') goTo(carousel.active - 1);
    if (e.key === 'ArrowRight') goTo(carousel.active + 1);
  });
}

function isHeroInView() {
  const hero = document.querySelector('.hero');
  if (!hero) return false;
  const r = hero.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
}

function onCardClick(i, slide) {
  if (i === carousel.active) {
    if (slide.href) window.location.href = slide.href;
    return;
  }
  goTo(i);
}

function goTo(target) {
  const n = carousel.cards.length;
  carousel.active = ((target % n) + n) % n;
  updateCarousel();
}

function updateCarousel() {
  const n = carousel.cards.length;
  carousel.cards.forEach((card, i) => {
    let delta = i - carousel.active;
    // wrap to shortest direction so cards animate past each other naturally
    if (delta > n / 2) delta -= n;
    if (delta < -n / 2) delta += n;

    // If a card jumps more than one step, it's wrapping around the carousel.
    // Skip the transition for that single tick so it teleports off-screen
    // instead of flying across the visible area.
    const prev = card._delta;
    const isWrap = prev !== undefined && Math.abs(delta - prev) > 1;
    if (isWrap) {
      card.style.transition = 'none';
    }

    card.dataset.distance = delta;
    card._delta = delta;
    card.classList.toggle('is-active', delta === 0);
    card.classList.toggle('is-far', Math.abs(delta) > 4);
    card.setAttribute('aria-hidden', delta === 0 ? 'false' : 'true');
    card.tabIndex = delta === 0 ? 0 : -1;

    if (isWrap) {
      // force reflow then re-enable the original transition on the next frame
      void card.offsetWidth;
      requestAnimationFrame(() => { card.style.transition = ''; });
    }
  });
}

/* ─── Quote scroll-reveal ────────────────────────────────────────
   English splits per word, Chinese per character. Both reveal at the
   same 0→1 progress, where:
     0 = section top sits at the bottom edge of the viewport
     1 = section top reaches the top edge of the viewport
   So the user sees text fill in as they scroll the section up, and it
   is fully revealed by the time the section is pinned at the top. */

function splitByWord(el) {
  const text = el.textContent;
  el.textContent = '';
  text.split(/(\s+)/).forEach((tok) => {
    if (!tok) return;
    if (/^\s+$/.test(tok)) {
      el.appendChild(document.createTextNode(tok));
    } else {
      const span = document.createElement('span');
      span.className = 'reveal-unit';
      span.textContent = tok;
      el.appendChild(span);
    }
  });
}

function splitByChar(el) {
  const text = el.textContent;
  el.textContent = '';
  for (const ch of text) {
    if (/\s/.test(ch)) {
      el.appendChild(document.createTextNode(ch));
    } else {
      const span = document.createElement('span');
      span.className = 'reveal-unit';
      span.textContent = ch;
      el.appendChild(span);
    }
  }
}

function setupQuoteReveal() {
  const quote = document.querySelector('.quote');
  if (!quote) return;
  const en = quote.querySelector('.quote-en');
  const zh = quote.querySelector('.quote-zh');
  if (!en || !zh) return;

  splitByWord(en);
  splitByChar(zh);

  const enUnits = en.querySelectorAll('.reveal-unit');
  const zhUnits = zh.querySelectorAll('.reveal-unit');

  function applyProgress(units, progress) {
    const count = Math.ceil(progress * units.length);
    units.forEach((u, i) => {
      const visible = i < count;
      if (visible !== u.classList.contains('is-visible')) {
        u.classList.toggle('is-visible', visible);
      }
    });
  }

  function tick() {
    const rect = quote.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    // 0 when rect.top === vh (just entering from bottom)
    // 1 when rect.top === 0 (top of section pinned at top of viewport)
    const progress = Math.max(0, Math.min(1, (vh - rect.top) / vh));
    applyProgress(enUnits, progress);
    applyProgress(zhUnits, progress);
  }

  let raf = 0;
  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      tick();
    });
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  tick();
}

/* ─── Activity 3D globe ────────────────────────────────────────
   Drop-in replacement for the SVG globe. Mirrors globe.html: same
   textures, atmosphere, and three-palette dashed arcs over 20 anchor
   cities. Auto-rotates. User drag/zoom is disabled so the globe
   doesn't fight page scroll. */
function setupActivityGlobe() {
  const container = document.getElementById('globe-3d');
  if (!container || typeof Globe !== 'function') return;

  const CITIES = [
    { lat:  40.7128, lng:  -74.0060 }, { lat:  37.7749, lng: -122.4194 },
    { lat:  43.6532, lng:  -79.3832 }, { lat:  19.4326, lng:  -99.1332 },
    { lat: -23.5505, lng:  -46.6333 }, { lat: -34.6037, lng:  -58.3816 },
    { lat:  51.5074, lng:   -0.1278 }, { lat:  48.8566, lng:    2.3522 },
    { lat:  52.5200, lng:   13.4050 }, { lat:  55.7558, lng:   37.6173 },
    { lat:  30.0444, lng:   31.2357 }, { lat:  32.0853, lng:   34.7818 },
    { lat:  25.2048, lng:   55.2708 }, { lat:   6.5244, lng:    3.3792 },
    { lat:  19.0760, lng:   72.8777 }, { lat:   1.3521, lng:  103.8198 },
    { lat:  39.9042, lng:  116.4074 }, { lat:  37.5665, lng:  126.9780 },
    { lat:  35.6762, lng:  139.6503 }, { lat: -33.8688, lng:  151.2093 },
  ];

  const PALETTES = {
    surveilling: [
      'rgba(217,70,8,1)', 'rgba(154,52,18,0.7)', 'rgba(124,45,18,0.55)',
      'rgba(124,45,18,0.55)', 'rgba(154,52,18,0.7)', 'rgba(217,70,8,1)',
    ],
    providing: [
      'rgba(5,150,105,1)', 'rgba(4,120,87,0.7)', 'rgba(6,95,70,0.55)',
      'rgba(6,95,70,0.55)', 'rgba(4,120,87,0.7)', 'rgba(5,150,105,1)',
    ],
    funding: [
      'rgba(29,78,216,1)', 'rgba(30,64,175,0.7)', 'rgba(30,58,138,0.55)',
      'rgba(30,58,138,0.55)', 'rgba(30,64,175,0.7)', 'rgba(29,78,216,1)',
    ],
  };

  const TYPES = ['surveilling', 'providing', 'funding'];
  const arcs = [];
  for (let i = 0; i < 60; i++) {
    const a = CITIES[Math.floor(Math.random() * CITIES.length)];
    let b = CITIES[Math.floor(Math.random() * CITIES.length)];
    while (b === a) b = CITIES[Math.floor(Math.random() * CITIES.length)];
    const dashGap = 15;
    const dashLength = 1;
    arcs.push({
      startLat: a.lat, startLng: a.lng,
      endLat:   b.lat, endLng:   b.lng,
      color: PALETTES[TYPES[i % TYPES.length]],
      stroke: 0.8,
      dashLength,
      dashGap,
      dashInitialGap: Math.random() * (dashLength + dashGap),
      dashAnimateTime: 2000,
    });
  }

  const globe = Globe()(container)
    .backgroundColor('rgba(0,0,0,0)')
    .atmosphereColor('#dfe8f2')
    .atmosphereAltitude(0.15)
    .globeImageUrl('earth-blue-marble.jpg')
    .bumpImageUrl('globe-topology.png')
    .arcsData(arcs)
    .arcColor('color')
    .arcStroke('stroke')
    .arcAltitudeAutoScale(0.5)
    .arcDashLength('dashLength')
    .arcDashGap('dashGap')
    .arcDashInitialGap('dashInitialGap')
    .arcDashAnimateTime('dashAnimateTime')
    .arcsTransitionDuration(0);

  globe.globeMaterial().bumpScale = 5;

  // Flatten the default rotation-dependent lighting: boost ambient so
  // every face of the globe stays bright, soften the directional so it
  // still gives subtle shading without dark hemispheres.
  globe.lights().forEach((l) => {
    if (l.isAmbientLight) l.intensity = 2.5;
    else if (l.isDirectionalLight) l.intensity = 0.5;
  });

  const controls = globe.controls();
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.4;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableRotate = false;

  function resize() {
    const r = container.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) globe.width(r.width).height(r.height);
  }
  resize();
  window.addEventListener('resize', resize);
}

/* ─── Init ───────────────────────────────────────────────────── */
function init() {
  buildCarousel();
  setupQuoteReveal();

  if (els.activity) {
    buildList();
    buildOverlay();
    setupActivityGlobe();
    els.cardClose.addEventListener('click', clearActive);

    // start auto-cycle the first time the section enters view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && activeIndex === -1 && !autoRunning) {
            startAuto(0);
          }
        });
      },
      { threshold: 0.45 },
    );
    observer.observe(els.activity);
  }
}

document.addEventListener('DOMContentLoaded', init);
