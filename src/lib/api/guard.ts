import type { ZodType } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isTrustedOrigin } from "@/lib/same-origin";
import { ApiError } from "./errors";

/**
 * The shared per-request pipeline every API route composes from — small standalone pieces
 * (not one giant framework function) so each route stays readable about exactly which checks it
 * runs. Every piece throws `ApiError`; a route's own try/catch (or the whole handler wrapped once)
 * converts that to a response via `toErrorResponse` in errors.ts. See CLAUDE.md §7/§10.
 */

/**
 * CSRF defense-in-depth for state-changing routes (POST /api/contact, /api/reservations,
 * /api/chat) — see src/lib/same-origin.ts for the actual check.
 *
 * Deliberately NOT used by the read-only GET routes (/api/restaurant, /api/menu, /api/hours,
 * GET /api/contact, /api/map): they're cacheable, side-effect-free, and return already-public
 * data, so requiring a matching Origin header would only break legitimate non-browser or future
 * client callers (a mobile app, a server-side integration) for no security benefit.
 */
export function requireTrustedOrigin(request: Request): void {
  if (!isTrustedOrigin(request)) {
    throw new ApiError("forbidden_origin", "This request's origin is not allowed.", 403);
  }
}

/**
 * Per-IP rate limiting — applied to every route, GET included, to bound scraping/DoS even on
 * public read endpoints. `key` should be prefixed per-route (e.g. `contact:${ip}`) so limits
 * don't bleed across routes.
 */
export function enforceRateLimit(
  request: Request,
  routeKey: string,
  opts: { limit: number; windowMs: number }
): void {
  const ip = getClientIp(request);
  const result = rateLimit(`${routeKey}:${ip}`, opts);
  if (!result.allowed) {
    throw new ApiError("rate_limited", "Too many requests. Please slow down.", 429, {
      retryAfterSeconds: result.retryAfterSeconds,
    });
  }
}

/**
 * Size-capped, zod-validated JSON body parsing for mutating routes. Rejects an oversized
 * `Content-Length` before reading the body, re-checks the actual byte length after (a client can
 * omit or lie about Content-Length), then parses and validates — the same sequence every POST
 * route used to hand-roll.
 */
export async function readJsonBody<T>(
  request: Request,
  schema: ZodType<T>,
  { maxBytes }: { maxBytes: number }
): Promise<T> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    throw new ApiError("payload_too_large", "Request body is too large.", 413);
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    throw new ApiError("invalid_json", "Request body could not be read.", 400);
  }
  if (rawBody.length > maxBytes) {
    throw new ApiError("payload_too_large", "Request body is too large.", 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    throw new ApiError("invalid_json", "Request body is not valid JSON.", 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError("validation_error", "Request body failed validation.", 400);
  }
  return parsed.data;
}

/** Response headers for the new public GET data endpoints — see CLAUDE.md §7. */
export const PUBLIC_DATA_CACHE_HEADERS: HeadersInit = {
  "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
};
