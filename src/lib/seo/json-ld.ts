import type { AppLocale } from "@/i18n/routing";
import { restaurantFacts } from "../../../content/restaurant-facts";

/**
 * Builds the `Restaurant` JSON-LD structured data object from restaurantFacts ONLY.
 * See CLAUDE.md §12 — `priceRange` and `openingHoursSpecification` are deliberately omitted
 * because neither is verified; do not add them here without updating restaurant-facts.ts with
 * a real, sourced value first.
 */
export function buildRestaurantJsonLd(siteUrl: string, locale: AppLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurantFacts.brand.nameEn,
    alternateName: restaurantFacts.brand.nameAr,
    image: [`${siteUrl}/images/og/og-${locale}.jpg`],
    logo: `${siteUrl}${restaurantFacts.brand.logoPath}`,
    url: `${siteUrl}/${locale}`,
    telephone: restaurantFacts.contact.phoneE164,
    servesCuisine: restaurantFacts.brand.cuisine,
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurantFacts.location.streetAddress,
      addressLocality: restaurantFacts.location.addressLocality,
      postalCode: restaurantFacts.location.postalCode,
      addressCountry: restaurantFacts.location.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: restaurantFacts.location.geo.latitude,
      longitude: restaurantFacts.location.geo.longitude,
    },
    hasMap: restaurantFacts.location.googleMapsUrl,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: restaurantFacts.rating.value,
      reviewCount: restaurantFacts.rating.count,
    },
    // Points at this locale's reservation-*request* page (staff confirm by phone — not
    // instant booking), matching the routing.defaultLocale/locale actually being rendered.
    acceptsReservations: `${siteUrl}/${locale}/reservations`,
    sameAs: [restaurantFacts.social.x, restaurantFacts.social.linktree],
    // priceRange: intentionally omitted — not verified.
    // openingHoursSpecification: intentionally omitted — full weekly hours not verified.
  } as const;
}
