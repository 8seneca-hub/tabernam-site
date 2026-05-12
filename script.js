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
  { image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=480&q=80', alt: 'Business meeting' },
  { image: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=480&q=80', alt: 'Shanghai by night' },
  { image: 'https://images.unsplash.com/photo-1542223616-740d5dff7f56?auto=format&fit=crop&w=480&q=80', alt: 'Beijing skyline' },
  { image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=480&q=80', alt: 'Hong Kong harbour' },
  { image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=480&q=80', alt: 'Singapore Marina Bay' },
  { image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=480&q=80', alt: 'Dubai skyline' },
  { image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=480&q=80', alt: 'Diplomatic handshake' },
  { image: 'https://images.unsplash.com/photo-1496564203457-11bb12075d90?auto=format&fit=crop&w=480&q=80', alt: 'Bratislava' },
  { image: 'https://images.unsplash.com/photo-1543059080-f9b1272213d5?auto=format&fit=crop&w=480&q=80', alt: 'São Paulo aerial' },
  { image: 'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=480&q=80', alt: 'New York City' },
  { image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=480&q=80', alt: 'Boardroom table' },
  { image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=480&q=80', alt: 'Mountain landscape' },
];

const SLOVAKIA = { x: 305, y: 215 };

const AUTO_ADVANCE_MS = 3000;
/* Time for the slowest in-flight pulse to expand to ringMaxRadius and
   fade out. ringMaxRadius (1) ÷ ringPropagationSpeed (0.5 deg/sec) = 2 s.
   We pause for that long between cities so the previous bubble is fully
   gone before the next appears. */
const RING_FADE_MS = 2000;

/* focus { x, y, scale } — applied to the globe-wrap when this
   business is active. x/y are in PIXELS from the centred resting
   position. Keep them small (-40 to 40) so the globe stays roughly
   centred; otherwise it gets shoved past the viewport edges. */
/* Six featured addresses across three Chinese cities. The `altitude`
   sets globe.gl camera distance when this entry is active:
     - more addresses in the same city  →  altitude bigger (wider view)
     - fewer addresses                  →  altitude smaller (close zoom)
   So Beijing's three entries all sit at 2.0 (broad city overview),
   Shanghai's pair at 1.5 (medium), and the single Shenzhen entry at 0.9
   (tight on the district). */
const BUSINESSES = [
  /* Coords are spread within each city's wider region so each bubble
     lands on a visibly distinct spot on the globe. Real CBD / Wangjing /
     Zhongguancun coordinates sit within ~10 km of each other, which is
     sub-pixel at the altitudes we're using — the bubble would appear
     not to move at all when cycling addresses. */
  {
    id: 'beijing-cbd',
    name: 'Business',
    label: 'Beijing',
    coords: { lat: 39.9087, lng: 116.4581 },
    altitude: 2.1,
    dot: { x: 470, y: 230 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1542223616-740d5dff7f56?auto=format&fit=crop&w=900&q=80',
    title: 'Beijing CBD Office',
    /* per-entry altitude — Beijing (3 addresses) sits in the 1.9–2.4
       band so the city as a whole reads as "wide overview", but each
       individual address has its own zoom so the camera scale changes
       on every chevron tick. */
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'beijing-wangjing',
    name: 'Business',
    label: 'Beijing',
    coords: { lat: 41.8, lng: 118.6 },
    altitude: 1.9,
    dot: { x: 472, y: 226 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=900&q=80',
    title: 'Beijing Wangjing Hub',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'beijing-zhongguancun',
    name: 'Business',
    label: 'Beijing',
    coords: { lat: 37.6, lng: 113.7 },
    altitude: 2.4,
    dot: { x: 467, y: 228 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
    title: 'Beijing Zhongguancun Tech Centre',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'shanghai-pudong',
    name: 'Business',
    label: 'Shanghai',
    coords: { lat: 31.2304, lng: 121.5435 },
    altitude: 1.6,
    dot: { x: 497, y: 265 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=900&q=80',
    title: 'Shanghai Pudong Tower',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'shanghai-jingan',
    name: 'Business',
    label: 'Shanghai',
    coords: { lat: 29.5, lng: 119.4 },
    altitude: 1.8,
    dot: { x: 493, y: 265 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=900&q=80',
    title: "Shanghai Jing'an Plaza",
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'shenzhen-futian',
    name: 'Business',
    label: 'Shenzhen',
    coords: { lat: 22.5431, lng: 114.0579 },
    altitude: 1.4,
    dot: { x: 478, y: 302 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=900&q=80',
    title: 'Shenzhen Futian Studio',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'guangzhou-tianhe',
    name: 'Business',
    label: 'Guangzhou',
    coords: { lat: 23.13, lng: 113.26 },
    altitude: 1.45,
    dot: { x: 476, y: 300 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=900&q=80',
    title: 'Guangzhou Tianhe Loft',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'chengdu',
    name: 'Business',
    label: 'Chengdu',
    coords: { lat: 30.57, lng: 104.07 },
    altitude: 1.5,
    dot: { x: 446, y: 268 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1559136656-50bc62a48b6e?auto=format&fit=crop&w=900&q=80',
    title: 'Chengdu Riverside Atelier',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'hangzhou',
    name: 'Business',
    label: 'Hangzhou',
    coords: { lat: 30.27, lng: 120.15 },
    altitude: 1.55,
    dot: { x: 491, y: 269 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1605101100278-5d1deb2b6498?auto=format&fit=crop&w=900&q=80',
    title: 'Hangzhou West Lake Studio',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'xian',
    name: 'Business',
    label: "Xi'an",
    coords: { lat: 34.34, lng: 108.94 },
    altitude: 1.35,
    dot: { x: 460, y: 250 },
    focus: { x: 0, y: 0, scale: 1.2 },
    image: 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=900&q=80',
    title: "Xi'an Heritage Office",
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
  cardImage: document.getElementById('card-image'),
  cardCity: document.getElementById('card-city'),
  cardTitle: document.getElementById('card-title'),
  cardBody: document.getElementById('card-body'),
  cardLink: document.getElementById('card-link'),
  cardProgress: document.getElementById('card-progress-bar'),
  cityName: document.getElementById('city-name'),
  cityPanel: document.getElementById('city-panel'),
  intro: document.getElementById('activity-intro'),
  viewCities: document.getElementById('view-cities'),
  goBack: document.getElementById('go-back'),
  cityPrev: document.getElementById('city-prev'),
  cityNext: document.getElementById('city-next'),
};

let activeIndex = -1;
let autoTimer = null;
let progressTimer = null;
let autoRunning = false;
// Set true when the user has just seen the full address tour (auto-cycle
// completed or chevroned past the last/first card). Suppresses the
// "next scroll-down enters detail" trigger so the user can continue down
// to the footer without re-entering the tour they just exited. Cleared
// when the user scrolls back up past the activity section, so a fresh
// approach re-arms the trigger.
let tourCompleted = false;
/* Timer for the fade-then-show delay between cities. Tracked so a fast
   prev/next click cancels the pending swap instead of stacking. */
let transitionTimer = null;

function buildList() {
  if (!els.list) return;
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

/* Switch the active city. If a previous city was active, this first
   stops its ring emission and waits RING_FADE_MS for the last in-flight
   pulse to expand and disappear before swapping the panel + bubble. */
function setActive(i) {
  if (transitionTimer) {
    clearTimeout(transitionTimer);
    transitionTimer = null;
  }

  const wasActive = activeIndex !== -1;

  // Stop emitting on the outgoing city so its rings can fade naturally.
  // Don't touch pointsData — the six static bubbles stay visible across
  // transitions; only the active address's pulse-ring is swapped.
  if (els.globe) {
    els.globe.ringsData([]);
  }

  if (wasActive) {
    transitionTimer = setTimeout(() => {
      transitionTimer = null;
      applyActive(i);
    }, RING_FADE_MS);
  } else {
    applyActive(i);
  }
}

/* The visible swap: text, pill, marker, ring, camera. Always called via
   setActive (immediately on first activation, or after the fade delay
   on subsequent switches). */
function applyActive(i) {
  activeIndex = i;
  const b = BUSINESSES[i];

  if (els.list) {
    els.list.querySelectorAll('button').forEach((btn) => {
      btn.classList.toggle('is-active', Number(btn.dataset.index) === i);
    });
  }

  if (els.cityName) {
    // Pill shows the specific address (b.title), not the city (b.label).
    // Chevrons advance through addresses one at a time.
    els.cityName.textContent = b.title || b.label || b.id;
  }

  if (els.cardImage) {
    els.cardImage.src = b.image;
    els.cardImage.alt = b.title;
  }
  if (els.cardCity) els.cardCity.textContent = b.label || '';
  if (els.cardTitle) els.cardTitle.textContent = b.title;
  if (els.cardBody) els.cardBody.textContent = b.body;
  if (els.cardLink) els.cardLink.href = `business.html?id=${encodeURIComponent(b.id)}`;
  if (els.card) els.card.setAttribute('aria-hidden', 'false');
  if (els.cityPanel) els.cityPanel.setAttribute('aria-hidden', 'false');

  if (els.globe && b.coords) {
    // Re-emit all six points with the new active flag so the active one
    // renders bright + bigger and the others fade to gray. Pulse-ring on
    // the active address only.
    els.globe.pointsData(BUSINESSES.map((entry, idx) => ({
      lat: entry.coords.lat,
      lng: entry.coords.lng,
      isActive: idx === i,
    })));
    els.globe.ringsData([{ lat: b.coords.lat, lng: b.coords.lng }]);
    els.globe.pointOfView(
      { lat: b.coords.lat, lng: b.coords.lng, altitude: b.altitude ?? 1.55 },
      1200,
    );
  }

  startProgress();
}

function clearActive() {
  activeIndex = -1;
  if (transitionTimer) {
    clearTimeout(transitionTimer);
    transitionTimer = null;
  }
  if (els.list) els.list.querySelectorAll('button').forEach((btn) => btn.classList.remove('is-active'));
  if (els.card) els.card.setAttribute('aria-hidden', 'true');
  if (els.cityPanel) els.cityPanel.setAttribute('aria-hidden', 'true');
  if (els.globe) {
    els.globe.ringsData([]);
    els.globe.pointsData([]);
  }
  stopAuto();
  resetProgress();
}

function enterDetailMode(startIndex = 0) {
  if (!els.activity) return;
  els.activity.classList.add('is-detail');
  if (els.globe) {
    // Hide the fan of arcs in detail view — only the destination pulse
    // should read against the globe.
    els.globe.arcsData([]);
    // Six static bubbles, one per address; applyActive(0) below replaces
    // this with the same six but flagged isActive=true on index 0.
    els.globe.pointsData(BUSINESSES.map((b, idx) => ({
      lat: b.coords.lat,
      lng: b.coords.lng,
      isActive: idx === startIndex,
    })));
  }
  // Stop the slow globe rotation in detail mode so the address bubbles
  // stay anchored to the same screen positions while the user cycles.
  if (els.globeControls) els.globeControls.autoRotate = false;
  setActive(startIndex);
  scheduleNext();
  autoRunning = true;
}

function exitDetailMode(viaTour = false) {
  if (!els.activity) return;
  els.activity.classList.remove('is-detail');
  if (els.globe && els.globeArcs) els.globe.arcsData(els.globeArcs);
  if (els.globeControls) els.globeControls.autoRotate = true;
  clearActive();
  // When the exit came from tour completion (auto-cycle ended or
  // chevroned past either edge), suppress the scroll-down trigger so the
  // next wheel/touch falls through to native scroll → footer. The Go
  // Back button calls exitDetailMode() with no argument, leaving the
  // trigger armed so the user can immediately enter detail again.
  tourCompleted = !!viaTour;
}

function nextCity(delta) {
  const len = BUSINESSES.length;
  const current = activeIndex < 0 ? 0 : activeIndex;
  const next = current + delta;
  // Falling off either end of the list returns to intro state instead
  // of wrapping — the tour is one-shot: once the user has seen every
  // address, the next intent collapses back to the activity intro.
  if (next < 0 || next >= len) {
    exitDetailMode(true);
    return;
  }
  // User clicked a chevron — swap immediately, don't wait the 2s
  // ring-fade pause that auto-cycling uses. The previous city's rings
  // continue to fade naturally in the scene; the new ones come up at
  // the new location right away.
  if (transitionTimer) {
    clearTimeout(transitionTimer);
    transitionTimer = null;
  }
  if (els.globe) {
    // Only clear the active pulse; the six static address bubbles stay.
    els.globe.ringsData([]);
  }
  applyActive(next);
  scheduleNext();
}

function startProgress() {
  if (!els.cardProgress) return;
  resetProgress();
  requestAnimationFrame(() => {
    els.cardProgress.style.transition = `width ${AUTO_ADVANCE_MS}ms linear`;
    els.cardProgress.style.width = '100%';
  });
}

function resetProgress() {
  if (!els.cardProgress) return;
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
      // Tour completed — back to intro state instead of looping.
      exitDetailMode(true);
      return;
    }
    setActive(next);
    scheduleNext();
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

/* ─── Hero carousel ──────────────────────────────────────────────
   "Film tape" marquee — every CAROUSEL_INTERVAL_MS the strip advances
   one slot to the left. Each card carries an integer slot in the range
   [-N/2 .. +N/2). Slots -3..+3 are visible on the curve (CSS in
   styles.css maps each slot to its width/height/translateX/rotateY);
   anything outside that range is parked off-stage and hidden.
   When a card's slot drops below the wrap threshold it teleports back
   to the rightmost off-stage slot with the transition disabled for
   one frame, so the wrap is invisible. Hovering any card pauses the
   advance via a hover counter — multiple cards can be entered/left in
   quick succession without the timer flickering on and off. */
const CAROUSEL_INTERVAL_MS = 3000;
const VISIBLE_RANGE = 3;       // slots -3..+3 are on-stage
const PRELOAD_RANGE = 4;       // slots ±4 have CSS positions for graceful entry/exit

const carousel = {
  track: null,
  cards: [],
  shift: 0,        // total leftward steps taken; subtracted from each card's base slot
  timer: null,
  hoverCount: 0,   // number of cards currently hovered
};

function buildCarousel() {
  carousel.track = document.getElementById('carousel-track');
  if (!carousel.track) return;

  HERO_SLIDES.forEach((slide, i) => {
    const card = document.createElement('div');
    card.className = 'carousel-card';
    card.dataset.index = i;
    card.setAttribute('role', 'img');
    card.setAttribute('aria-label', slide.alt || `Slide ${i + 1}`);

    const img = document.createElement('img');
    img.src = slide.image;
    img.alt = slide.alt || '';
    img.decoding = 'async';
    if (i < 7) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    } else {
      img.loading = 'lazy';
    }
    card.appendChild(img);

    card.addEventListener('mouseenter', onCardEnter);
    card.addEventListener('mouseleave', onCardLeave);

    carousel.track.appendChild(card);
    carousel.cards.push(card);
  });

  updateCarousel();
  startCarouselAuto();
}

function onCardEnter() {
  carousel.hoverCount++;
  if (carousel.hoverCount === 1) stopCarouselAuto();
}

function onCardLeave() {
  carousel.hoverCount = Math.max(0, carousel.hoverCount - 1);
  if (carousel.hoverCount === 0) startCarouselAuto();
}

function startCarouselAuto() {
  stopCarouselAuto();
  carousel.timer = setInterval(() => {
    carousel.shift += 1;
    updateCarousel();
  }, CAROUSEL_INTERVAL_MS);
}

function stopCarouselAuto() {
  if (carousel.timer) {
    clearInterval(carousel.timer);
    carousel.timer = null;
  }
}

function updateCarousel() {
  const n = carousel.cards.length;
  // Centre slot index within the strip — card index 0 maps to its
  // base slot at (0 - centre), card N-1 at (N-1 - centre), so the
  // carousel starts centred without rebalancing.
  const centre = Math.floor(n / 2);
  // Wrap range: keep slot inside (-half, half] so passing one edge
  // teleports to the other.
  const half = Math.ceil(n / 2);

  carousel.cards.forEach((card, i) => {
    let slot = (i - centre) - carousel.shift;
    // Normalise to (-half, half]
    slot = ((slot + half) % n + n) % n - half;

    const prev = card._slot;
    // If a card jumped more than one step in a single tick, it just
    // wrapped from one edge to the other — drop the transition for one
    // frame so it teleports invisibly instead of flying across.
    const isWrap = prev !== undefined && Math.abs(slot - prev) > 1;
    if (isWrap) card.style.transition = 'none';

    card._slot = slot;
    card.dataset.slot = String(slot);
    card.classList.toggle('is-far', Math.abs(slot) > PRELOAD_RANGE);
    card.setAttribute('aria-hidden', Math.abs(slot) > VISIBLE_RANGE ? 'true' : 'false');

    if (isWrap) {
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
   Mirrors globe-v2.html: same textures, atmosphere, dashed arcs from
   Slovakia to ~20 cities, pulsing ring at the origin. Auto-rotates,
   and the user can drag-rotate / zoom freely (matching v2). */
function setupActivityGlobe() {
  const container = document.getElementById('globe-3d');
  if (!container || typeof Globe !== 'function') return;

  // Single origin (Bratislava) → ~20 destinations across China.
  const SLOVAKIA = { lat: 48.1486, lng: 17.1077 };
  const CHINA_DESTINATIONS = [
    { lat: 39.9042, lng: 116.4074 }, { lat: 31.2304, lng: 121.4737 },
    { lat: 23.1291, lng: 113.2644 }, { lat: 22.5429, lng: 114.0596 },
    { lat: 30.5728, lng: 104.0668 }, { lat: 29.5630, lng: 106.5516 },
    { lat: 34.3416, lng: 108.9398 }, { lat: 30.5928, lng: 114.3055 },
    { lat: 30.2741, lng: 120.1551 }, { lat: 39.3434, lng: 117.3616 },
    { lat: 32.0603, lng: 118.7969 }, { lat: 45.8038, lng: 126.5340 },
    { lat: 41.8057, lng: 123.4315 }, { lat: 25.0389, lng: 102.7183 },
    { lat: 29.6520, lng:  91.1721 }, { lat: 43.8256, lng:  87.6168 },
    { lat: 36.0611, lng: 103.8343 }, { lat: 36.0671, lng: 120.3826 },
    { lat: 22.3193, lng: 114.1694 }, { lat: 24.4798, lng: 118.0894 },
  ];

  const PALETTE = [
    'rgba(25,250,143,0.5)', 'rgba(25,250,143,0.25)', 'rgba(3,109,60,0.125)',
    'rgba(3,109,60,0.125)', 'rgba(25,250,143,0.25)', 'rgba(25,250,143,0.5)',
  ];
  const DASH_LEN = 1;
  const DASH_GAP = 15;

  const arcs = CHINA_DESTINATIONS.map((d) => ({
    startLat: SLOVAKIA.lat, startLng: SLOVAKIA.lng,
    endLat: d.lat, endLng: d.lng,
    color: PALETTE,
    stroke: 0.5,
    dashLength: DASH_LEN, dashGap: DASH_GAP,
    dashInitialGap: Math.random() * (DASH_LEN + DASH_GAP),
    dashAnimateTime: 2000,
  }));

  const globe = Globe()(container)
    .backgroundColor('rgba(0,0,0,0)')
    // WebGL atmosphere is disabled because it gets clipped at the rectangular
    // canvas edges, leaving a visible hard line. The soft halo around the
    // globe is provided by the CSS .globe-aura element instead.
    .showAtmosphere(false)
    .globeImageUrl('world-map-with-texture-global-satellite-photo-earth-view-from-space.jpg')
    .bumpImageUrl('globe-topology.png')
    .arcsData(arcs)
    .arcColor('color')
    .arcStroke('stroke')
    .arcAltitudeAutoScale(0.22)
    .arcDashLength('dashLength')
    .arcDashGap('dashGap')
    .arcDashInitialGap('dashInitialGap')
    .arcDashAnimateTime('dashAnimateTime')
    .arcsTransitionDuration(0)
    // Rings + a solid point start empty — both render only at the
    // currently selected destination (set in setActive).
    // Soft, gentle pulse — small max radius keeps the rings close to the
    // bubble, slow propagation gives the trails their fade-out, and a
    // short repeat period stacks several rings in flight at once
    // (2 s lifetime ÷ 0.33 s emit period ≈ 6 concurrent rings).
    .ringsData([])
    .ringColor(() => (t) => `rgba(255, 255, 255, ${1 - t})`)
    .ringMaxRadius(1.5)
    .ringPropagationSpeed(0.75)
    .ringRepeatPeriod(330)
    .ringAltitude(0.01)
    .pointsData([])
    // Per-datum styling: the active address pops as a bright white point;
    // the other five fade back to a translucent gray. Lets the user see
    // at a glance which of the six bubbles the card is currently on.
    .pointColor((d) => (d.isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.45)'))
    .pointAltitude(0.02)
    .pointRadius((d) => (d.isActive ? 0.55 : 0.25));

  globe.globeMaterial().bumpScale = 5;

  // Flatten lighting so the globe stays bright on every face.
  globe.lights().forEach((l) => {
    if (l.isAmbientLight) l.intensity = 2.5;
    else if (l.isDirectionalLight) l.intensity = 0.5;
  });

  // Start centred on Slovakia; auto-rotate brings China into view.
  // altitude 1.55 makes the sphere read bigger so its top edge sits
  // closer to the heading without clipping at the canvas corners.
  globe.pointOfView({ lat: SLOVAKIA.lat, lng: SLOVAKIA.lng, altitude: 1.55 }, 0);

  const controls = globe.controls();
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.3;
  controls.enableZoom = false;     // never zoom — section keeps a fixed scale
  controls.enablePan = false;      // no panning either
  controls.enableRotate = true;    // drag-rotate allowed in default state

  // Expose for setActive/clearActive to lock controls + drive the
  // destination ring and POV.
  els.globeControls = controls;
  els.globe = globe;
  els.globeArcs = arcs;

  function resize() {
    const r = container.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) globe.width(r.width).height(r.height);
  }
  resize();
  window.addEventListener('resize', resize);
  // Container size changes when the activity toggles intro/detail; pick
  // those up so the canvas matches the new globe-stage dimensions.
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(resize).observe(container);
  }
}

/* ─── Header auto-hide ──────────────────────────────────────────
   Hide the fixed header when the user scrolls down past a threshold,
   reveal it again on any upward scroll. Top-of-page always shows it. */
function setupHeaderHide() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const activityEl = document.querySelector('.activity');
  const SHOW_AT_TOP = 80;     // always shown above this scrollY
  const DELTA = 6;            // ignore tiny scroll jitter
  let lastY = window.scrollY;
  let raf = 0;

  function tick() {
    raf = 0;
    // Freeze the header state while the activity detail view is open.
    // The detail-mode scroll-pin can fire synthetic upward scrolls (the
    // snap-back when entering detail, the bounce-back when the user
    // tries to drag past), and we don't want those to flash the nav in.
    if (activityEl && activityEl.classList.contains('is-detail')) {
      lastY = window.scrollY;
      return;
    }
    const y = window.scrollY;
    const dy = y - lastY;
    if (Math.abs(dy) < DELTA) return;
    if (y < SHOW_AT_TOP) {
      header.classList.remove('is-hidden');
    } else if (dy > 0) {
      header.classList.add('is-hidden');
    } else {
      header.classList.remove('is-hidden');
    }
    lastY = y;
  }

  window.addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(tick);
  }, { passive: true });
}

/* ─── Language switcher ──────────────────────────────────────── */
function setupLangSwitcher() {
  const switcher = document.querySelector('[data-lang-switcher]');
  if (!switcher) return;
  const trigger = switcher.querySelector('.lang-trigger');
  const menu = switcher.querySelector('.lang-menu');
  const label = trigger?.querySelector('.lang-label');
  const flag = trigger?.querySelector('.lang-flag');
  if (!trigger || !menu || !label || !flag) return;

  const close = () => {
    switcher.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  };
  const open = () => {
    switcher.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
  };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (switcher.classList.contains('is-open')) close();
    else open();
  });

  document.addEventListener('click', (e) => {
    if (!switcher.contains(e.target)) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  menu.querySelectorAll('button[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.querySelector('.lang-name')?.textContent?.trim();
      const flagText = btn.querySelector('.lang-flag')?.textContent?.trim();
      if (name) label.textContent = name;
      if (flagText) flag.textContent = flagText;
      close();
    });
  });
}

/* ─── Programmatic scroll helper ─────────────────────────────── */
const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
let isProgrammaticScrolling = false;

function smoothScrollTo(targetY, durationSeconds = 0.9) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, targetY);
    return;
  }
  const startY = window.scrollY;
  const dy = targetY - startY;
  const startT = performance.now();
  const durMs = durationSeconds * 1000;
  isProgrammaticScrolling = true;
  function tick(now) {
    const t = Math.min(1, (now - startT) / durMs);
    window.scrollTo(0, startY + dy * easeOutExpo(t));
    if (t < 1) requestAnimationFrame(tick);
    else isProgrammaticScrolling = false;
  }
  requestAnimationFrame(tick);
}

/* ─── Init ───────────────────────────────────────────────────── */
function init() {
  setupHeaderHide();
  setupLangSwitcher();
  buildCarousel();
  setupQuoteReveal();

  if (els.activity) {
    buildList();
    buildOverlay();
    setupActivityGlobe();

    if (els.viewCities) {
      els.viewCities.addEventListener('click', () => enterDetailMode(0));
    }
    if (els.goBack) {
      els.goBack.addEventListener('click', exitDetailMode);
    }
    if (els.cityPrev) {
      els.cityPrev.addEventListener('click', () => nextCity(-1));
    }
    if (els.cityNext) {
      els.cityNext.addEventListener('click', () => nextCity(1));
    }

    // Reveal the globe (slide up from below) on first scroll into view.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            els.activity.classList.add('is-revealed');
          }
        });
      },
      { threshold: 0.7 },
    );
    observer.observe(els.activity);

    // Scroll-down trigger: once the activity intro is fully pinned at
    // the top of the viewport, the next attempted scroll-down (wheel
    // or touch) flips to detail mode and swallows that one event so
    // the page doesn't actually scroll past. Hero and quote scroll
    // normally.
    setupActivityScrollTrigger();
  }
}

function setupActivityScrollTrigger() {
  if (!els.activity) return;
  const quote = document.querySelector('.quote');
  const activity = els.activity;

  let cooldownUntil = 0;
  let lastWheelTime = 0;
  let wheelGestureHandled = false;
  let touchStartY = null;
  let touchGestureHandled = false;
  // While true, the page is pinned at activity.offsetTop and any further
  // down-intent in the same gesture is swallowed. Cleared by a fresh
  // gesture (large wheel gap or new touchstart) so the user can then
  // proceed to the footer.
  let detailScrollLock = false;
  // A trackpad inertia tail can have gaps approaching ~400ms at the end —
  // keep the gesture lock alive across those so one physical swipe is
  // always one logical gesture.
  const GESTURE_GAP_MS = 500;
  const SNAP_DURATION_S = 0.9;

  // Mirror .is-detail onto the local lock flag so it works no matter how
  // detail mode is entered (wheel, touch, "View cities" button) or
  // exited ("Go back" button).
  const detailObserver = new MutationObserver(() => {
    detailScrollLock = activity.classList.contains('is-detail');
  });
  detailObserver.observe(activity, { attributes: true, attributeFilter: ['class'] });

  // Safety net: if any scroll slips through the wheel/touch handlers
  // while the lock is on, bounce it back. We only correct downward drift —
  // upward scrolling out of activity stays allowed.
  // Also re-arm the tour trigger: once the user has scrolled well
  // upward out of the activity section, clear tourCompleted so the next
  // approach to activity-pinned re-triggers the detail tour.
  window.addEventListener('scroll', () => {
    if (tourCompleted && window.scrollY < activity.offsetTop - 200) {
      tourCompleted = false;
    }
    if (!detailScrollLock) return;
    if (isProgrammaticScrolling) return;
    if (window.scrollY > activity.offsetTop) {
      window.scrollTo(0, activity.offsetTop);
    }
  }, { passive: true });

  function isAnimating() {
    return isProgrammaticScrolling;
  }

  function isQuoteArmed() {
    if (!quote) return false;
    if (activity.classList.contains('is-detail')) return false;
    const qRect = quote.getBoundingClientRect();
    const aRect = activity.getBoundingClientRect();
    // Quote pinned at top, activity hasn't reached the viewport top yet —
    // we're in the quote → activity transit zone.
    return qRect.top <= 0 && aRect.top > 5;
  }

  function isActivityArmed() {
    if (activity.classList.contains('is-detail')) return false;
    if (!activity.classList.contains('is-revealed')) return false;
    const rect = activity.getBoundingClientRect();
    return rect.top <= 0 && rect.bottom > window.innerHeight * 0.5;
  }

  // Returns true if the down-intent fired an action (caller should
  // preventDefault + stopImmediatePropagation so Lenis doesn't also
  // advance its own scroll target from the same wheel input).
  function tryFireDown() {
    if (isAnimating()) return true;
    if (performance.now() < cooldownUntil) return true;
    if (isQuoteArmed()) {
      smoothScrollTo(activity.offsetTop, SNAP_DURATION_S);
      cooldownUntil = performance.now() + SNAP_DURATION_S * 1000 + 200;
      return true;
    }
    if (isActivityArmed()) {
      if (tourCompleted) {
        // User just finished the tour. Let this down-intent fall through
        // to native scroll so the page continues to the footer instead of
        // re-entering detail mode. Re-arms when they scroll back up.
        return false;
      }
      // If the user's wheel pushed scrollY slightly past activity.offsetTop
      // before the trigger fired, snap back exactly so the detail view is
      // centred — otherwise the globe would render with a small offset.
      if (window.scrollY > activity.offsetTop + 2) {
        window.scrollTo(0, activity.offsetTop);
      }
      enterDetailMode(0);
      // detailScrollLock flips on via the MutationObserver above. Short
      // gesture cooldown only — the real ongoing lock is the scroll-pin.
      cooldownUntil = performance.now() + 200;
      return true;
    }
    return false;
  }

  function swallow(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }

  // Capture phase so we see wheel/touch before any other listener.
  window.addEventListener('wheel', (e) => {
    const now = performance.now();
    const gap = now - lastWheelTime;
    lastWheelTime = now;
    if (gap > GESTURE_GAP_MS) wheelGestureHandled = false;
    if (e.deltaY <= 0) return;

    // Detail is on and we're holding the scroll-pin: same-gesture wheels
    // (small gap from the previous one) get swallowed. A fresh gesture
    // — gap > GESTURE_GAP_MS since the last wheel — releases the pin and
    // falls through to native scroll, taking the user to the footer.
    if (detailScrollLock) {
      if (gap > GESTURE_GAP_MS) {
        detailScrollLock = false;
        return;
      }
      swallow(e);
      return;
    }

    if (wheelGestureHandled) {
      swallow(e);
      return;
    }

    if (tryFireDown()) {
      wheelGestureHandled = true;
      swallow(e);
    }
  }, { passive: false, capture: true });

  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0]?.clientY ?? null;
    touchGestureHandled = false;
  }, { passive: true, capture: true });
  window.addEventListener('touchmove', (e) => {
    if (touchStartY === null) return;

    // Touch equivalent of the wheel branch above: a fresh touchstart
    // (post-detail) resets touchGestureHandled to false, so the first
    // significant move of that new session releases the pin.
    if (detailScrollLock) {
      if (!touchGestureHandled) {
        detailScrollLock = false;
        return;
      }
      swallow(e);
      return;
    }

    if (touchGestureHandled) {
      swallow(e);
      return;
    }
    const dy = touchStartY - (e.touches[0]?.clientY ?? touchStartY);
    if (dy <= 30) return;
    if (tryFireDown()) {
      touchGestureHandled = true;
      swallow(e);
    }
  }, { passive: false, capture: true });
  window.addEventListener('touchend', () => {
    touchStartY = null;
  }, { capture: true });
}

document.addEventListener('DOMContentLoaded', init);
