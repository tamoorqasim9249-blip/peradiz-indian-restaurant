import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Security headers applied to every route — see CLAUDE.md §10.
// CSP allows: self (scripts/styles/images/fonts), Google Fonts stylesheet host,
// Google Maps embed frame, and connections needed for the app itself. The Anthropic API is
// only ever called server-side (src/app/api/chat/route.ts), so it does not need to appear in
// a client-facing connect-src.
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "object-src 'none'",
  // Maps tiles/icons load from maps.gstatic.com and maps.googleapis.com when
  // NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set (InteractiveMap.tsx) — see CLAUDE.md §4.
  "img-src 'self' data: blob: https://maps.gstatic.com https://maps.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Next.js dev/runtime needs 'unsafe-inline' for inline scripts it injects; 'unsafe-eval' is
  // required only in development (fast refresh) — restricted to production below. The Google
  // Maps JS API loader (InteractiveMap.tsx) also needs its own script host allowlisted.
  process.env.NODE_ENV === "production"
    ? "script-src 'self' 'unsafe-inline' https://maps.googleapis.com https://maps.gstatic.com"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com",
  "frame-src 'self' https://www.google.com https://maps.google.com",
  // Maps JS API calls its own endpoints (tile/place data) via fetch/XHR at runtime.
  "connect-src 'self' https://maps.googleapis.com",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Direct requests to public/images/** (e.g. the og:image a social-media crawler
        // fetches, or the favicon fallback) — NOT the same route as /_next/image, which Next.js
        // already caches itself (Cache-Control driven by `images.minimumCacheTTL`, currently
        // its 4-hour default). Without this, Next serves these with `max-age=0` — refetched
        // every time. A short, non-`immutable` cache is used deliberately: real photography is
        // documented (README "Photo Gallery") to drop into these exact filenames later with no
        // code change, so caching them forever would hide that swap from returning visitors
        // for a year instead of the redeploy actually taking effect.
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, must-revalidate" }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
