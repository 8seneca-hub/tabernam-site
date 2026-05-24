export interface City {
  /** Stable identifier used in URLs. */
  slug: string;
  /** Region label shown above the title (the small uppercase eyebrow). */
  name: string;
  /** Latitude — where the pin and camera-focus point sit. */
  lat: number;
  /** Longitude. */
  lng: number;
  /** Business / office name shown as the big title. */
  business: string;
  /** Short narrative paragraph that opens the card body. */
  desc: string;
  /** Camera altitude when this city is focused. Smaller = closer/zoomed in. */
  altitude: number;
  /** Resolved asset URLs for this city's photo carousel. */
  photos: string[];
}

export interface MarkerDatum {
  idx: number;
  lat: number;
  lng: number;
  name: string;
  isActive: boolean;
}

export interface GlobeInstance {
  backgroundColor: (c: string) => GlobeInstance;
  atmosphereColor: (c: string) => GlobeInstance;
  atmosphereAltitude: (n: number) => GlobeInstance;
  globeImageUrl: (u: string) => GlobeInstance;
  bumpImageUrl: (u: string) => GlobeInstance;
  htmlElementsData: (d: unknown[]) => GlobeInstance;
  htmlLat: (k: string) => GlobeInstance;
  htmlLng: (k: string) => GlobeInstance;
  htmlAltitude: (n: number) => GlobeInstance;
  htmlElement: (f: (d: MarkerDatum) => HTMLElement) => GlobeInstance;
  globeMaterial: () => { bumpScale: number };
  pointOfView: (pov: { lat: number; lng: number; altitude: number }, ms: number) => void;
  controls: () => {
    autoRotate: boolean;
    autoRotateSpeed: number;
    enableZoom: boolean;
  };
  width: (w: number) => GlobeInstance;
  height: (h: number) => GlobeInstance;
}

export type GlobeControls = ReturnType<GlobeInstance['controls']>;

export const SLOVAKIA = { lat: 48.1486, lng: 17.1077 };
