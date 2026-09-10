import { describe, it, expect } from "vitest";
import { buildRestaurantJsonLd } from "../../src/lib/seo/json-ld";

const siteUrl = "https://example.com";

describe("buildRestaurantJsonLd", () => {
  it("never includes unverified priceRange or openingHoursSpecification", () => {
    const jsonLd = buildRestaurantJsonLd(siteUrl, "en");
    expect(jsonLd).not.toHaveProperty("priceRange");
    expect(jsonLd).not.toHaveProperty("openingHoursSpecification");
  });

  it("includes every required Restaurant field, sourced from verified facts", () => {
    const jsonLd = buildRestaurantJsonLd(siteUrl, "en");
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("Restaurant");
    expect(jsonLd.name).toBe("Peradiz Indian Restaurant — Al Olaya");
    expect(jsonLd.telephone).toBe("+966552005913");
    expect(jsonLd.servesCuisine).toBe("Indian");
    expect(jsonLd.address).toMatchObject({
      "@type": "PostalAddress",
      addressCountry: "SA",
    });
    expect(jsonLd.geo).toMatchObject({
      "@type": "GeoCoordinates",
      latitude: 24.6977924,
      longitude: 46.6860333,
    });
    expect(jsonLd.aggregateRating).toMatchObject({
      "@type": "AggregateRating",
      ratingValue: 4.8,
      reviewCount: 2692,
    });
    expect(jsonLd.sameAs).toContain("https://x.com/peradiz_sa");
  });

  it("points acceptsReservations and url at the locale it was built for", () => {
    expect(buildRestaurantJsonLd(siteUrl, "en").acceptsReservations).toBe(
      `${siteUrl}/en/reservations`,
    );
    expect(buildRestaurantJsonLd(siteUrl, "ar").acceptsReservations).toBe(
      `${siteUrl}/ar/reservations`,
    );
    expect(buildRestaurantJsonLd(siteUrl, "ar").url).toBe(`${siteUrl}/ar`);
  });
});
