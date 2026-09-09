import { restaurantFacts } from "../../../content/restaurant-facts";

/**
 * Builds the `Restaurant` JSON-LD structured data object from restaurantFacts ONLY.
 * See CLAUDE.md §12 — `priceRange` and `openingHoursSpecification` are deliberately omitted
 * because neither is verified; do not add them here without updating restaurant-facts.ts with
 * a real, sourced value first.
 */
export function buildRestaurantJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurantFacts.brand.nameEn,
    alternateName: restaurantFacts.brand.nameAr,
    image: [`${siteUrl}${restaurantFacts.brand.logoPath}`],
    logo: `${siteUrl}${restaurantFacts.brand.logoPath}`,
    url: siteUrl,
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
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: restaurantFacts.rating.value,
      reviewCount: restaurantFacts.rating.count,
    },
    acceptsReservations: `${siteUrl}/ar/reservations`,
    sameAs: [restaurantFacts.social.x, restaurantFacts.social.linktree],
    // priceRange: intentionally omitted — not verified.
    // openingHoursSpecification: intentionally omitted — full weekly hours not verified.
  } as const;
}
