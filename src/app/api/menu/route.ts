import { menuCategories } from "../../../../content/menu/categories";
import { menuItems } from "../../../../content/menu/items";
import { apiSuccess } from "@/lib/api/response";
import { toErrorResponse } from "@/lib/api/errors";
import { enforceRateLimit, PUBLIC_DATA_CACHE_HEADERS } from "@/lib/api/guard";

export const runtime = "nodejs";

/**
 * GET /api/menu — menu categories + items (names/descriptions/tags only, never prices — see
 * CLAUDE.md §2/§20/§21). Sourced directly from content/menu/{categories,items}.ts.
 */
export async function GET(request: Request) {
  try {
    enforceRateLimit(request, "menu", { limit: 60, windowMs: 60_000 });

    return apiSuccess(
      { categories: menuCategories, items: menuItems },
      { headers: PUBLIC_DATA_CACHE_HEADERS }
    );
  } catch (err) {
    return toErrorResponse(err, "menu");
  }
}
