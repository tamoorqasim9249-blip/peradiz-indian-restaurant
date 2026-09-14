import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  requireTrustedOrigin,
  enforceRateLimit,
  readJsonBody,
} from "../../src/lib/api/guard";
import { ApiError } from "../../src/lib/api/errors";

// Unique host per test file run so this file's rate-limit buckets never collide with another
// test file's (rate-limit.test.ts uses its own randomized keys; this file exercises the
// higher-level `enforceRateLimit` wrapper specifically).
function uniqueHost(): string {
  return `${Math.random().toString(36).slice(2)}.test`;
}

describe("requireTrustedOrigin", () => {
  it("passes silently for a same-origin request", () => {
    const host = uniqueHost();
    const request = new Request(`https://${host}/api/contact`, {
      method: "POST",
      headers: { origin: `https://${host}`, host },
    });
    expect(() => requireTrustedOrigin(request)).not.toThrow();
  });

  it("throws a 403 ApiError for a cross-origin request", () => {
    const host = uniqueHost();
    const request = new Request(`https://${host}/api/contact`, {
      method: "POST",
      headers: { origin: "https://attacker.example", host },
    });
    try {
      requireTrustedOrigin(request);
      expect.unreachable("expected requireTrustedOrigin to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(403);
      expect((err as ApiError).code).toBe("forbidden_origin");
    }
  });
});

describe("enforceRateLimit", () => {
  it("allows requests under the limit", () => {
    const request = new Request("https://example.com/api/menu", {
      headers: { "x-forwarded-for": `${Math.random()}` },
    });
    expect(() =>
      enforceRateLimit(request, `guard-allow-${Math.random()}`, { limit: 3, windowMs: 60_000 })
    ).not.toThrow();
  });

  it("throws a 429 ApiError with a retryAfterSeconds once the limit is exceeded", () => {
    const routeKey = `guard-block-${Math.random()}`;
    const request = new Request("https://example.com/api/menu", {
      headers: { "x-forwarded-for": "203.0.113.9" },
    });
    for (let i = 0; i < 3; i++) {
      enforceRateLimit(request, routeKey, { limit: 3, windowMs: 60_000 });
    }
    try {
      enforceRateLimit(request, routeKey, { limit: 3, windowMs: 60_000 });
      expect.unreachable("expected enforceRateLimit to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(429);
      expect((err as ApiError).code).toBe("rate_limited");
      expect((err as ApiError).extra?.retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  it("keys buckets per-IP, so one IP hitting the limit doesn't block another", () => {
    const routeKey = `guard-perip-${Math.random()}`;
    const ipA = new Request("https://example.com/api/menu", {
      headers: { "x-forwarded-for": "203.0.113.10" },
    });
    const ipB = new Request("https://example.com/api/menu", {
      headers: { "x-forwarded-for": "203.0.113.11" },
    });
    for (let i = 0; i < 3; i++) enforceRateLimit(ipA, routeKey, { limit: 3, windowMs: 60_000 });
    expect(() => enforceRateLimit(ipA, routeKey, { limit: 3, windowMs: 60_000 })).toThrow(ApiError);
    expect(() => enforceRateLimit(ipB, routeKey, { limit: 3, windowMs: 60_000 })).not.toThrow();
  });
});

describe("readJsonBody", () => {
  const schema = z.object({ name: z.string().min(1) });

  it("parses and validates a well-formed body", async () => {
    const request = new Request("https://example.com/api/contact", {
      method: "POST",
      body: JSON.stringify({ name: "Ali" }),
    });
    await expect(readJsonBody(request, schema, { maxBytes: 1000 })).resolves.toEqual({
      name: "Ali",
    });
  });

  it("rejects a body over the declared Content-Length cap before reading it", async () => {
    const request = new Request("https://example.com/api/contact", {
      method: "POST",
      headers: { "content-length": "999999" },
      body: JSON.stringify({ name: "Ali" }),
    });
    await expect(readJsonBody(request, schema, { maxBytes: 100 })).rejects.toMatchObject({
      code: "payload_too_large",
      status: 413,
    });
  });

  it("rejects a body whose actual size exceeds the cap even if Content-Length lied", async () => {
    const request = new Request("https://example.com/api/contact", {
      method: "POST",
      body: JSON.stringify({ name: "a".repeat(500) }),
    });
    await expect(readJsonBody(request, schema, { maxBytes: 10 })).rejects.toMatchObject({
      code: "payload_too_large",
      status: 413,
    });
  });

  it("rejects a body that isn't valid JSON", async () => {
    const request = new Request("https://example.com/api/contact", {
      method: "POST",
      body: "{not json",
    });
    await expect(readJsonBody(request, schema, { maxBytes: 1000 })).rejects.toMatchObject({
      code: "invalid_json",
      status: 400,
    });
  });

  it("rejects a JSON body that fails schema validation", async () => {
    const request = new Request("https://example.com/api/contact", {
      method: "POST",
      body: JSON.stringify({ name: "" }),
    });
    await expect(readJsonBody(request, schema, { maxBytes: 1000 })).rejects.toMatchObject({
      code: "validation_error",
      status: 400,
    });
  });
});
