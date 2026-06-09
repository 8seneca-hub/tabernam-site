// [lng, lat] — Mapbox convention, not [lat, lng].
export const IDLE_CENTER: [number, number] = [17.1077, 48.1486];
export const IDLE_ZOOM = 1.4;
export const MIN_ZOOM = 1.2;
export const MAX_ZOOM = 18;

// The globe's on-screen pixel diameter is set by the zoom level alone — it does
// NOT grow with the canvas size. So a low idle zoom fills a narrow phone but
// leaves a small disk (big side whitespace) on a wide desktop. We raise the
// idle zoom on larger viewports so the globe is drawn bigger *natively* — and
// stays crisp — instead of CSS-scaling the canvas, which only upscales the
// already-rendered bitmap and looks blurry.
export function idleZoomFor(width: number): number {
  if (width >= 1025) return 2.0; // desktop
  if (width >= 721) return 1.9; // tablet
  return IDLE_ZOOM; // phone (1.4)
}

// Whole-world view shown in the flat (mercator) detail map before any pin is
// selected. Slightly north-of-equator center frames the populated continents.
export const WORLD_CENTER: [number, number] = [10, 25];
export const WORLD_ZOOM = 1.3;

export interface RegionPreset {
  key: string;
  label: string;
  // [[west, south], [east, north]] bounding box. `null` = whole-world overview
  // (uses WORLD_CENTER / WORLD_ZOOM instead of fitBounds).
  bounds: [[number, number], [number, number]] | null;
}

// Region quick-jump presets for the detail-view button row. Bounding boxes are
// approximate continental extents; the map fitBounds() into them.
export const REGIONS: RegionPreset[] = [
  { key: 'world', label: 'World', bounds: null },
  { key: 'europe', label: 'Europe', bounds: [[-25, 34], [45, 72]] },
  { key: 'asia', label: 'Asia', bounds: [[40, 5], [150, 78]] },
  { key: 'africa', label: 'Africa', bounds: [[-20, -36], [52, 38]] },
  { key: 'americas', label: 'Americas', bounds: [[-170, -56], [-34, 72]] },
  { key: 'oceania', label: 'Oceania', bounds: [[110, -50], [180, 0]] },
];

const CITY_ZOOM_CLOSE = 16;
const CITY_ZOOM_MED = 14;

export function cityZoom(altitude: number): number {
  return altitude <= 0.6 ? CITY_ZOOM_CLOSE : CITY_ZOOM_MED;
}

const ALL_PHOTOS = Array.from({ length: 28 }, (_, i) =>
  `/carousel/photo-${String(i + 1).padStart(2, '0')}.jpg`,
);

export function pickRandom(n: number): string[] {
  return ALL_PHOTOS.slice().sort(() => Math.random() - 0.5).slice(0, n);
}

export function createMarkerEl(
  name: string,
  isActive: boolean,
  thumbUrl: string,
): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'globe-marker' + (isActive ? ' is-active' : '');

  const shape = document.createElement('div');
  shape.className = 'globe-marker-shape';
  shape.innerHTML = `
    <svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16 2 C8 2 2 8 2 14 C2 22 16 34 16 34 C16 34 30 22 30 14 C30 8 24 2 16 2 Z" fill="currentColor"/>
      <circle cx="16" cy="14" r="5" fill="#ffffff"/>
    </svg>
  `;
  el.appendChild(shape);

  // Hover preview: small thumbnail + city name. Only shown when the marker is
  // in hover state AND not the active pin. Active pin shows the enlarged
  // orange shape only, with no label/preview.
  const preview = document.createElement('div');
  preview.className = 'globe-marker-preview';
  const img = document.createElement('img');
  img.src = thumbUrl;
  img.alt = '';
  img.loading = 'lazy';
  // Force 4:3 landscape, doubled from the previous size. Use setAttribute with
  // `!important` so nothing in the cascade (Mapbox CSS, user-agent styles,
  // anything) can override these dimensions.
  img.setAttribute(
    'style',
    'width: 200px !important;' +
      'height: 150px !important;' +
      'min-width: 200px !important;' +
      'min-height: 150px !important;' +
      'max-width: 200px !important;' +
      'max-height: 150px !important;' +
      'object-fit: cover !important;' +
      'display: block !important;' +
      'border-radius: 4px 4px 0 0 !important;',
  );
  preview.appendChild(img);
  const nameEl = document.createElement('div');
  nameEl.className = 'globe-marker-name';
  nameEl.textContent = name;
  preview.appendChild(nameEl);
  el.appendChild(preview);

  // Persistent city-name label shown below the pin only when it's the active
  // (selected) marker. Red text with a white outline so it stays legible over
  // the satellite imagery.
  const label = document.createElement('div');
  label.className = 'globe-marker-label';
  label.textContent = name;
  el.appendChild(label);

  return el;
}
