import { restaurantFacts } from "../../../../content/restaurant-facts";
import { apiSuccess } from "@/lib/api/response";
import { toErrorResponse } from "@/lib/api/errors";
import { enforceRateLimit, PUBLIC_DATA_CACHE_HEADERS } from "@/lib/api/guard";

export const runtime = "nodejs";

/**
 * GET /api/hours — the restaurant's opening-hours info.
 *
 * Deliberately returns ONLY the verified fragment + call-to-confirm note + `isVerified: false`
 * — never a computed OPEN NOW/CLOSED status. Per CLAUDE.md §21.5, `content/hours/weekly-schedule.ts`
 * is an explicitly unverified placeholder that "must not be imported into any live,
 * visitor-facing page" — a public API response is visitor-facing (any client can call it and
 * display a computed status), so the same rule applies here: no full schedule, no computed
 * status, until real hours are confirmed and the schedule's `isVerified` flag is flipped.
 */
export async function GET(request: Request) {
  try {
    enforceRateLimit(request, "hours", { limit: 60, windowMs: 60_000 });

    const { hours } = restaurantFacts;
    return apiSuccess(
      {
        verifiedFragment: { ar: hours.verifiedFragmentAr, en: hours.verifiedFragmentEn },
        callToConfirm: { ar: hours.callToConfirmAr, en: hours.callToConfirmEn },
        isVerified: false,
      },
      { headers: PUBLIC_DATA_CACHE_HEADERS }
    );
  } catch (err) {
    return toErrorResponse(err, "hours");
  }
}
