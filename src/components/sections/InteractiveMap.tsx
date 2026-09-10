"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { restaurantFacts } from "../../../content/restaurant-facts";
import { GoogleMapEmbed } from "./GoogleMapEmbed";

// NEXT_PUBLIC_* vars are inlined at build time by Next.js — this never reaches the client as a
// server secret, and is empty/undefined whenever the user hasn't provisioned a restricted key.
const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

declare global {
  interface Window {
    google?: typeof google;
    __peradizMapsCallbacks__?: Array<() => void>;
  }
}

let scriptLoadPromise: Promise<void> | null = null;

/**
 * Loads the Google Maps JavaScript API script exactly once per page, regardless of how many
 * InteractiveMap instances mount. Hand-rolled (no @vis.gl/react-google-maps or other npm
 * dependency) per CLAUDE.md's "does this materially improve the project?" dependency test —
 * this project already prefers small hand-rolled solutions over new dependencies elsewhere.
 */
function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    if (window.google?.maps) return resolve();

    const callbackName = "__peradizInitMaps__";
    (window as unknown as Record<string, () => void>)[callbackName] = () => resolve();

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&loading=async&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => reject(new Error("Google Maps script failed to load"));
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

/**
 * Premium interactive location map. Renders a real, draggable Google Map with a marker at the
 * verified Al Olaya coordinates when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is configured; otherwise
 * (no key provisioned yet, or the script fails to load) falls back to the existing free,
 * keyless GoogleMapEmbed iframe — the site never depends on a Maps key existing.
 *
 * The (comparatively heavy) Google Maps JS API script is only fetched once this section is
 * within ~200px of the viewport (IntersectionObserver) rather than eagerly on mount — this
 * section sits below the fold on the home page, so a visitor who never scrolls that far never
 * pays for it.
 */
export function InteractiveMap({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">(
    MAPS_API_KEY ? "loading" : "fallback"
  );
  // The map sits below the fold on the home page — don't fetch the (much heavier) Maps JS API
  // script until this section is actually about to scroll into view.
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    if (!MAPS_API_KEY || !containerRef.current) return;
    const node = containerRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!MAPS_API_KEY || !isNearViewport || !containerRef.current) return;

    let cancelled = false;

    loadGoogleMapsScript(MAPS_API_KEY)
      .then(() => {
        if (cancelled || !containerRef.current || !window.google?.maps) return;

        const { latitude, longitude } = restaurantFacts.location.geo;
        const position = { lat: latitude, lng: longitude };
        const name = isAr ? restaurantFacts.brand.nameAr : restaurantFacts.brand.nameEn;

        const map = new window.google.maps.Map(containerRef.current, {
          center: position,
          zoom: 17,
          gestureHandling: "cooperative",
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: true,
          mapId: "PERADIZ_LOCATION_MAP",
        });

        const marker = new window.google.maps.Marker({
          position,
          map,
          title: name,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="font-family:inherit;font-size:14px;line-height:1.5;padding:2px;">
            <strong>${name}</strong><br/>
            <a href="${restaurantFacts.location.googleMapsUrl}" target="_blank" rel="noopener noreferrer">
              ${isAr ? "عرض في خرائط جوجل" : "View on Google Maps"}
            </a>
          </div>`,
        });
        marker.addListener("click", () => infoWindow.open({ anchor: marker, map }));

        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("fallback");
      });

    return () => {
      cancelled = true;
    };
  }, [isAr, isNearViewport]);

  if (status === "fallback") {
    return <GoogleMapEmbed className={className} />;
  }

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label={
        isAr
          ? "خريطة تفاعلية لموقع مطعم بيراديز"
          : "Interactive map of Peradiz Indian Restaurant's location"
      }
      className={`h-full w-full ${className}`}
    />
  );
}
