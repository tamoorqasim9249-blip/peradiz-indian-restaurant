/**
 * Lightweight CSRF defense-in-depth for state-changing / cost-incurring API routes — see
 * CLAUDE.md §7/§10. Compares the request's `Origin` header against its own `Host` header; no
 * env var configuration needed, and no external dependency.
 *
 * Modern browsers always send `Origin` on same-origin and cross-origin fetch/XHR requests with
 * a body (POST, in particular) — a request with no `Origin` header here is treated as
 * untrusted, since this project has no legitimate non-browser caller for these routes.
 */
export function isTrustedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
