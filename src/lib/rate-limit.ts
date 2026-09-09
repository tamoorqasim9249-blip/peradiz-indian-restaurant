/**
 * In-memory, per-IP sliding-window rate limiter for API routes.
 *
 * Deliberately simple (no Redis/Upstash) — proportionate to a single-branch restaurant site's
 * traffic. Tradeoff, documented per CLAUDE.md §10: state resets on redeploy/cold start and
 * isn't shared across concurrent serverless instances. Revisit only if abuse becomes a measured
 * problem at real traffic scale.
 */

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    const retryAfterSeconds = Math.ceil(
      (bucket.windowStart + windowMs - now) / 1000
    );
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}

/** Extracts a best-effort client identifier from standard proxy headers. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

// Periodically clear stale buckets so the map doesn't grow unbounded on a long-lived instance.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > 10 * 60 * 1000) buckets.delete(key);
  }
}, 10 * 60 * 1000).unref?.();
