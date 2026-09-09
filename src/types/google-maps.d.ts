/**
 * Minimal ambient type declarations for the small subset of the Google Maps JavaScript API used
 * by src/components/sections/InteractiveMap.tsx. Hand-written on purpose instead of adding the
 * @types/google.maps package, to keep this feature at zero new dependencies (runtime or dev) —
 * consistent with this project's hand-rolled-over-dependency pattern (CLAUDE.md §4/§20).
 *
 * The actual `google.maps.*` runtime objects are supplied at runtime by the Google Maps JS API
 * script loaded dynamically in InteractiveMap.tsx — this file only describes their shape to the
 * TypeScript compiler.
 */

declare namespace google.maps {
  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface MapOptions {
    center?: LatLngLiteral;
    zoom?: number;
    gestureHandling?: "cooperative" | "greedy" | "none" | "auto";
    disableDefaultUI?: boolean;
    zoomControl?: boolean;
    fullscreenControl?: boolean;
    mapId?: string;
  }

  class Map {
    constructor(element: HTMLElement, options?: MapOptions);
  }

  interface MarkerOptions {
    position: LatLngLiteral;
    map?: Map;
    title?: string;
  }

  class Marker {
    constructor(options: MarkerOptions);
    addListener(eventName: string, handler: () => void): void;
  }

  interface InfoWindowOptions {
    content?: string;
  }

  interface InfoWindowOpenOptions {
    anchor?: Marker;
    map?: Map;
  }

  class InfoWindow {
    constructor(options?: InfoWindowOptions);
    open(options?: InfoWindowOpenOptions): void;
  }
}
