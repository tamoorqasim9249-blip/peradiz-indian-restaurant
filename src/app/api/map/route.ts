import { restaurantFacts } from "../../../../content/restaurant-facts";
import { apiSuccess } from "@/lib/api/response";
import { toErrorResponse } from "@/lib/api/errors";
import { enforceRateLimit, PUBLIC_DATA_CACHE_HEADERS } from "@/lib/api/guard";

export const runtime = "nodejs";

/**
 * GET /api/map — location/map info for the verified Al Olaya coordinates.
 *
 * Deliberately excludes NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: even though that key is client-visible
 * by design (see CLAUDE.md §15 — it's inlined at build time and restricted by domain/API), an API
 * *response* is never the right place to hand it out. A caller that needs to render the
 * interactive map (InteractiveMap.tsx) already reads it directly via
 * `process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` at build time — no route ever forwards it.
 */
export async function GET(request: Request) {
  try {
    enforceRateLimit(request, "map", { limit: 60, windowMs: 60_000 });

    const { geo, plusCode, googleMapsUrl, directionsUrl } = restaurantFacts.location;
    return apiSuccess(
      {
        latitude: geo.latitude,
        longitude: geo.longitude,
        plusCode,
        googleMapsUrl,
        directionsUrl,
      },
      { headers: PUBLIC_DATA_CACHE_HEADERS }
    );
  } catch (err) {
    return toErrorResponse(err, "map");
  }
}
