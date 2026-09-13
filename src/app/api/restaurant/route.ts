import { restaurant } from "../../../../content/restaurant";
import { apiSuccess } from "@/lib/api/response";
import { toErrorResponse } from "@/lib/api/errors";
import { enforceRateLimit, PUBLIC_DATA_CACHE_HEADERS } from "@/lib/api/guard";

export const runtime = "nodejs";

/**
 * GET /api/restaurant — public restaurant info composed from content/restaurant.ts (itself
 * composed from content/restaurant-facts.ts — see CLAUDE.md §2/§6/§21; no new/duplicated data).
 * Excludes `menu` — see GET /api/menu, which is the dedicated endpoint for that, avoiding
 * shipping the full menu twice.
 */
export async function GET(request: Request) {
  try {
    enforceRateLimit(request, "restaurant", { limit: 60, windowMs: 60_000 });

    // Everything except `menu` — GET /api/menu is the dedicated endpoint for that.
    const { menu, ...restaurantInfo } = restaurant;
    void menu;
    return apiSuccess(restaurantInfo, { headers: PUBLIC_DATA_CACHE_HEADERS });
  } catch (err) {
    return toErrorResponse(err, "restaurant");
  }
}
