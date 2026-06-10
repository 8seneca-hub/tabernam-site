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

export interface MarkerDatum {
  idx: number;
  lat: number;
  lng: number;
  name: string;
  isActive: boolean;
}

export interface City {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  desc: string;
  altitude: number;
  photos?: string[];
}
