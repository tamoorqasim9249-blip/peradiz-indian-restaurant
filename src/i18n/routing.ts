import { defineRouting } from "next-intl/routing";

/**
 * Locale routing configuration — single source of truth for supported locales.
 * English is the default and primary locale (LTR); Arabic is the secondary locale (RTL).
 */
export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: "always",
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
