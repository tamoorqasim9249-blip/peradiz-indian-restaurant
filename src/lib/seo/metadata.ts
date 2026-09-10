import type { Metadata } from "next";
import type { AppLocale } from "@/i18n/routing";
import { restaurantFacts } from "../../../content/restaurant-facts";

/**
 * Per-locale Open Graph / Twitter preview images — on-brand placeholder art (1200×630) at a
 * fixed path per CLAUDE.md §3 "Imagery"; real photography drops in at the same filenames with
 * zero code changes.
 */
const ogImageByLocale: Record<AppLocale, string> = {
  en: "/images/og/og-en.jpg",
  ar: "/images/og/og-ar.jpg",
};

/**
 * Builds a complete, per-route `Metadata` object — title, description, canonical URL, hreflang
 * alternates, Open Graph, and Twitter Card — from restaurant-facts.ts and siteUrl only, never a
 * hardcoded fact. Every `[locale]/**\/page.tsx` should use this instead of hand-rolling its own
 * metadata object, so every route (not just the home page) gets a correct per-page canonical URL
 * and Open Graph/Twitter preview. See CLAUDE.md §5 (folder structure) and §12 (SEO requirements).
 *
 * `metadataBase`, the title `template`, and `icons` are declared once in the root
 * `[locale]/layout.tsx` and are inherited by every page — they are not repeated here.
 */
export function buildPageMetadata({
  locale,
  path = "",
  title,
  description,
}: {
  locale: AppLocale;
  /** Route path after the locale segment, e.g. "/menu" — omit ("") for the locale home route. */
  path?: string;
  title: string;
  description: string;
}): Metadata {
  const canonicalPath = `/${locale}${path}`;
  const ogImage = ogImageByLocale[locale];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: {
        ar: `/ar${path}`,
        en: `/en${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      siteName: restaurantFacts.brand.shortNameEn,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
