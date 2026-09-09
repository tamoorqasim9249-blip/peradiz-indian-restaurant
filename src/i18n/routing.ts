import { defineRouting } from "next-intl/routing";

/**
 * Locale routing configuration — single source of truth for supported locales.
 * Arabic is the default and primary locale (RTL); English is the secondary locale (LTR).
 */
export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
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
