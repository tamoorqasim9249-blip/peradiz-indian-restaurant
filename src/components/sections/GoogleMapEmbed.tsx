import { restaurantFacts } from "../../../content/restaurant-facts";

/**
 * Embeds Google Maps centered on the verified Al Olaya coordinates. Uses the no-API-key
 * `output=embed` form — sufficient for a simple location embed and avoids provisioning a
 * billed Google Maps API key for a feature this size (see CLAUDE.md tool-selection rule).
 */
export function GoogleMapEmbed({ className = "" }: { className?: string }) {
  const { latitude, longitude } = restaurantFacts.location.geo;
  const src = `https://www.google.com/maps?q=${latitude},${longitude}&z=17&output=embed`;

  return (
    <iframe
      title="Peradiz Indian Restaurant — Al Olaya, Riyadh"
      src={src}
      className={`h-full w-full border-0 ${className}`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}
