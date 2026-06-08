

import { MarkerDatum } from "./types";

// data point and inserts the returned element into the globe scene.
export function createMarkerElement(d: MarkerDatum): HTMLElement {
  const el = document.createElement('div');
  el.className =
    'group cursor-pointer pointer-events-auto relative p-1' +
    (d.isActive ? ' z-[5]' : '');
  // Anchor the pin tip (at ~85% of the SVG height) to the lat/lng point.
  el.style.transform = 'translate(-50%, -85%)';

  const shape = document.createElement('div');
  shape.className =
    'block w-[18px] h-[22.5px] will-change-transform transition-[color,transform] duration-200 ' +
    (d.isActive ? 'text-[#e8421c]' : 'text-text');
  shape.style.transform = d.isActive ? 'scale(1.55)' : 'translateZ(0)';
  shape.innerHTML = `
    <svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="w-full h-full block overflow-visible">
      <path d="M16 2 C8 2 2 8 2 14 C2 22 16 34 16 34 C16 34 30 22 30 14 C30 8 24 2 16 2 Z" fill="currentColor"/>
      <circle cx="16" cy="14" r="5" fill="#ffffff"/>
    </svg>
  `;
  el.appendChild(shape);

  const label = document.createElement('div');
  label.className =
    'absolute left-[calc(100%+2px)] top-1/2 -translate-y-1/2 bg-[#0a1d3a] text-white px-[14px] py-[6px] rounded-full text-[13px] font-semibold whitespace-nowrap pointer-events-none shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-200 ' +
    (d.isActive
      ? 'opacity-100 translate-x-0'
      : 'opacity-0 -translate-x-[6px] group-hover:opacity-100 group-hover:translate-x-0');
  label.textContent = d.name;
  el.appendChild(label);

  el.addEventListener('click', () => {
    el.dispatchEvent(new CustomEvent('cityclick', { detail: d.idx, bubbles: true }));
  });

  return el;
}
