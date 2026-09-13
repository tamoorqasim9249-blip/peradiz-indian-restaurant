/**
 * The one consistent JSON response envelope every API route returns — see CLAUDE.md §7/§9.
 *
 * Success:  { ok: true,  data: T }
 * Error:    { ok: false, error: { code, message, ...extra } }
 *
 * Status codes are unchanged from what each route returned before this existed (400/403/413/
 * 429/503/500) — only the body shape is unified, so existing client code (ContactForm.tsx,
 * ReservationForm.tsx, ChatPanel.tsx), which only ever checks `res.status`/`res.ok` and never
 * parses the body, needs no changes.
 *
 * Exception: POST /api/chat's success response is a raw `text/plain` stream, not this envelope —
 * see src/app/api/chat/route.ts for why, and src/lib/api/guard.ts's module comment.
 */

export type ApiErrorCode =
  | "invalid_json"
  | "validation_error"
  | "forbidden_origin"
  | "payload_too_large"
  | "rate_limited"
  | "unavailable"
  | "internal_error";

export interface ApiSuccessBody<T> {
  ok: true;
  data: T;
}

export interface ApiErrorBody {
  ok: false;
  error: {
    code: ApiErrorCode;
    message: string;
    [key: string]: unknown;
  };
}

export function apiSuccess<T>(
  data: T,
  init?: { status?: number; headers?: HeadersInit }
): Response {
  return Response.json(
    { ok: true, data } satisfies ApiSuccessBody<T>,
    { status: init?.status ?? 200, headers: init?.headers }
  );
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
  extra?: Record<string, unknown>
): Response {
  return Response.json(
    { ok: false, error: { code, message, ...extra } } satisfies ApiErrorBody,
    { status }
  );
}
