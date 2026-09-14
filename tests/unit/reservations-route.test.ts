import { describe, it, expect, vi, beforeEach } from "vitest";

const createMock = vi.hoisted(() => vi.fn().mockResolvedValue({ id: "test-id" }));
vi.mock("@/lib/prisma", () => ({
  prisma: { reservationRequest: { create: createMock } },
}));

const { POST } = await import("../../src/app/api/reservations/route");

const TRUSTED_HOST = "peradiz.example";

function ip(): string {
  return `192.0.2.${Math.random() * 255 | 0}`;
}

function trustedPost(body: unknown): Request {
  return new Request(`https://${TRUSTED_HOST}/api/reservations`, {
    method: "POST",
    headers: {
      origin: `https://${TRUSTED_HOST}`,
      host: TRUSTED_HOST,
      "x-forwarded-for": ip(),
    },
    body: JSON.stringify(body),
  });
}

const validPayload = {
  name: "Omar Khan",
  phone: "+966501234567",
  partySize: 4,
  preferredDate: "2026-12-01",
  preferredTime: "19:30",
  contactMethod: "PHONE",
  locale: "en",
};

describe("POST /api/reservations", () => {
  beforeEach(() => {
    createMock.mockClear();
  });

  it("rejects a cross-origin request (403, forbidden_origin) without touching the database", async () => {
    const res = await POST(
      new Request(`https://${TRUSTED_HOST}/api/reservations`, {
        method: "POST",
        headers: { origin: "https://attacker.example", host: TRUSTED_HOST, "x-forwarded-for": ip() },
        body: JSON.stringify(validPayload),
      })
    );
    expect(res.status).toBe(403);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid payload (400, validation_error) — e.g. a malformed time", async () => {
    const res = await POST(trustedPost({ ...validPayload, preferredTime: "7:30pm" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("validation_error");
    expect(createMock).not.toHaveBeenCalled();
  });

  it("rejects a party size outside the allowed range", async () => {
    const res = await POST(trustedPost({ ...validPayload, partySize: 0 }));
    expect(res.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("persists a valid reservation request and returns 201", async () => {
    const res = await POST(trustedPost(validPayload));
    expect(res.status).toBe(201);
    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "Omar Khan", partySize: 4, contactMethod: "PHONE" }),
      })
    );
  });

  it("silently drops a honeypot-filled submission without writing to the database", async () => {
    const res = await POST(trustedPost({ ...validPayload, website: "http://spam.example" }));
    expect(res.status).toBe(201);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("never leaks internal error detail when the database write fails", async () => {
    createMock.mockRejectedValueOnce(new Error("connection to postgres://user:hunter2@db failed"));
    const res = await POST(trustedPost(validPayload));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe("internal_error");
    expect(JSON.stringify(body)).not.toContain("hunter2");
  });

  it("enforces per-IP rate limiting on submissions", async () => {
    const fixedIp = `198.51.100.${Math.random() * 255 | 0}`;
    const requestWith = () =>
      new Request(`https://${TRUSTED_HOST}/api/reservations`, {
        method: "POST",
        headers: { origin: `https://${TRUSTED_HOST}`, host: TRUSTED_HOST, "x-forwarded-for": fixedIp },
        body: JSON.stringify(validPayload),
      });
    let last;
    for (let i = 0; i < 6; i++) {
      last = await POST(requestWith());
    }
    expect(last!.status).toBe(429);
  });
});
