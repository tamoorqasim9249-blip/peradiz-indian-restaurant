import { apiError, type ApiErrorCode } from "./response";
import { logError } from "./logger";

/**
 * A known, deliberately-thrown API error — carries everything needed to build its response.
 * Every piece in guard.ts throws this; route handlers never construct an error Response by hand.
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly extra?: Record<string, unknown>;

  constructor(code: ApiErrorCode, message: string, status: number, extra?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.extra = extra;
  }
}

/**
 * Converts anything a route handler's try/catch might see into a safe client response.
 *
 * This is the single mechanism that guarantees an API response never exposes secrets or internal
 * detail: a recognized `ApiError` becomes its own response, but *any other* thrown value (a raw
 * Prisma error whose message can include connection details, an Anthropic SDK error, an
 * unexpected bug) is logged in full server-side via logError and turned into a generic
 * "internal_error" response with no detail attached. No route should ever do
 * `Response.json({ error: err.message })` itself — always route unknown errors through here.
 */
export function toErrorResponse(err: unknown, route: string): Response {
  if (err instanceof ApiError) {
    if (err.status >= 500) {
      logError(`${route}.error`, { code: err.code, message: err.message });
    }
    return apiError(err.code, err.message, err.status, err.extra);
  }

  logError(`${route}.unhandled_error`, {
    message: err instanceof Error ? err.message : String(err),
  });
  return apiError("internal_error", "Something went wrong. Please try again.", 500);
}
