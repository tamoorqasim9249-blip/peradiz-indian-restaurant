import { defineRouting } from "next-intl/routing";

/**
 * Locale routing configuration — single source of truth for supported locales.
 * English is the default and primary locale (LTR); Arabic is the secondary locale (RTL).
 */
export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: "always",
  // next-intl's default (`localeDetection: true`) picks a locale from the browser's
  // Accept-Language header on a first, unprefixed visit — so a visitor with an Arabic-preferring
  // browser (common in Riyadh) would land on `/ar` even though English is the site's primary
  // locale (CLAUDE.md §3). Disabling detection makes an unprefixed `/` always resolve to
  // `defaultLocale` ("en") for a new visitor; a visitor who explicitly navigates to `/ar` (or
  // switches locale in the UI) still gets that choice remembered via the `NEXT_LOCALE` cookie
  // below on their next visit — this only removes the *automatic* browser-language guess.
  localeDetection: false,
  // Explicit cookie hardening for the NEXT_LOCALE preference cookie next-intl sets (default is
  // { name: "NEXT_LOCALE", sameSite: "lax" } with no `secure` flag) — see CLAUDE.md §10 "HTTP
  // Security". `secure` is gated on production so local http:// dev still works.
  localeCookie: {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  },
});

export type AppLocale = (typeof routing.locales)[number];

export const localeDirection: Record<AppLocale, "rtl" | "ltr"> = {
  ar: "rtl",
  en: "ltr",
};
