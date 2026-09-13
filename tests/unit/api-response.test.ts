import { describe, it, expect } from "vitest";
import { apiSuccess, apiError } from "../../src/lib/api/response";
import { ApiError, toErrorResponse } from "../../src/lib/api/errors";

describe("apiSuccess", () => {
  it("wraps data in the { ok: true, data } envelope with a 200 default", async () => {
    const res = apiSuccess({ foo: "bar" });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, data: { foo: "bar" } });
  });

  it("honors a custom status and headers", async () => {
    const res = apiSuccess(null, { status: 201, headers: { "X-Test": "1" } });
    expect(res.status).toBe(201);
    expect(res.headers.get("X-Test")).toBe("1");
    await expect(res.json()).resolves.toEqual({ ok: true, data: null });
  });
});

describe("apiError", () => {
  it("wraps a code/message in the { ok: false, error } envelope with the given status", async () => {
    const res = apiError("rate_limited", "Too many requests.", 429, { retryAfterSeconds: 30 });
    expect(res.status).toBe(429);
    await expect(res.json()).resolves.toEqual({
      ok: false,
      error: { code: "rate_limited", message: "Too many requests.", retryAfterSeconds: 30 },
    });
  });
});

describe("toErrorResponse", () => {
  it("turns a known ApiError into its own response", async () => {
    const res = toErrorResponse(
      new ApiError("validation_error", "Request body failed validation.", 400),
      "test.route"
    );
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      ok: false,
      error: { code: "validation_error", message: "Request body failed validation." },
    });
  });

  // Regression guard — see errors.ts: this is the one mechanism guaranteeing an API response
  // never leaks internal error detail (a stray secret, a Prisma connection string fragment, a
  // stack trace) to the client, mirroring how json-ld.test.ts guards against invented facts.
  it("never leaks an unrecognized error's message to the client", async () => {
    const res = toErrorResponse(
      new Error("connection to postgres://user:hunter2@db failed"),
      "test.route"
    );
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("internal_error");
    expect(JSON.stringify(body)).not.toContain("hunter2");
    expect(JSON.stringify(body)).not.toContain("postgres://");
  });

  it("also gives a generic response for a non-Error thrown value", async () => {
    const res = toErrorResponse("a string was thrown, not an Error", "test.route");
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe("internal_error");
  });
});
