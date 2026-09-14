import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rateLimit, getClientIp } from "../../src/lib/rate-limit";

/**
 * Rate limiting — see CLAUDE.md §10 ("Rate limit every API route per-IP") and §7 (guard.ts's
 * `enforceRateLimit`, which is a thin wrapper around this module). Uses a fresh, unpredictable
 * key per test (Math.random) so buckets from one test never bleed into another via the shared
 * module-level Map.
 */

function uniqueKey(prefix: string): string {
  return `${prefix}:${Math.random().toString(36).slice(2)}`;
}

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the limit", () => {
    const key = uniqueKey("allow");
    for (let i = 0; i < 5; i++) {
      const result = rateLimit(key, { limit: 5, windowMs: 60_000 });
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks the request once the limit is exceeded within the window", () => {
    const key = uniqueKey("block");
    for (let i = 0; i < 5; i++) {
      rateLimit(key, { limit: 5, windowMs: 60_000 });
    }
    const blocked = rateLimit(key, { limit: 5, windowMs: 60_000 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets the count once the window has elapsed", () => {
    const key = uniqueKey("reset");
    for (let i = 0; i < 5; i++) {
      rateLimit(key, { limit: 5, windowMs: 60_000 });
    }
    expect(rateLimit(key, { limit: 5, windowMs: 60_000 }).allowed).toBe(false);

    vi.advanceTimersByTime(60_001);

    const afterWindow = rateLimit(key, { limit: 5, windowMs: 60_000 });
    expect(afterWindow.allowed).toBe(true);
    expect(afterWindow.remaining).toBe(4);
  });

  it("tracks separate buckets per key so one IP/route never exhausts another's limit", () => {
    const keyA = uniqueKey("a");
    const keyB = uniqueKey("b");
    for (let i = 0; i < 5; i++) rateLimit(keyA, { limit: 5, windowMs: 60_000 });

    expect(rateLimit(keyA, { limit: 5, windowMs: 60_000 }).allowed).toBe(false);
    expect(rateLimit(keyB, { limit: 5, windowMs: 60_000 }).allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  it("prefers the first address in X-Forwarded-For", () => {
    const request = new Request("https://example.com/api/contact", {
      headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1" },
    });
    expect(getClientIp(request)).toBe("203.0.113.5");
  });

  it("falls back to X-Real-IP when there is no X-Forwarded-For", () => {
    const request = new Request("https://example.com/api/contact", {
      headers: { "x-real-ip": "198.51.100.9" },
    });
    expect(getClientIp(request)).toBe("198.51.100.9");
  });

  it("falls back to \"unknown\" when neither header is present", () => {
    const request = new Request("https://example.com/api/contact");
    expect(getClientIp(request)).toBe("unknown");
  });
});
