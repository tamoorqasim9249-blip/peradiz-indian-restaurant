import { describe, it, expect, vi, beforeEach } from "vitest";

// Never hits a real database — see CLAUDE.md §8/§10. The mock lets these tests assert on
// exactly what the route tries to persist without needing Postgres running.
const createMock = vi.hoisted(() => vi.fn().mockResolvedValue({ id: "test-id" }));
vi.mock("@/lib/prisma", () => ({
  prisma: { contactSubmission: { create: createMock } },
}));

const { GET, POST } = await import("../../src/app/api/contact/route");

const TRUSTED_HOST = "peradiz.example";

function ip(): string {
  return `192.0.2.${Math.random() * 255 | 0}`;
}

function trustedPost(body: unknown): Request {
  return new Request(`https://${TRUSTED_HOST}/api/contact`, {
    method: "POST",
    headers: {
      origin: `https://${TRUSTED_HOST}`,
      host: TRUSTED_HOST,
      "x-forwarded-for": ip(),
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

const validPayload = {
  name: "Sara Ahmed",
  phone: "+966501234567",
  message: "Do you have vegetarian options?",
  locale: "en",
};

describe("GET /api/contact", () => {
  it("returns the restaurant's own public contact info", async () => {
    const res = await GET(
      new Request("https://example.com/api/contact", {
        headers: { "x-forwarded-for": ip() },
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.phone.display).toBeTruthy();
    expect(body.data.whatsapp).toContain("wa.me");
  });
});

describe("POST /api/contact", () => {
  beforeEach(() => {
    createMock.mockClear();
  });

  it("rejects a cross-origin request before touching the database (403, forbidden_origin)", async () => {
    const res = await POST(
      new Request(`https://${TRUSTED_HOST}/api/contact`, {
        method: "POST",
        headers: {
          origin: "https://attacker.example",
          host: TRUSTED_HOST,
          "x-forwarded-for": ip(),
        },
        body: JSON.stringify(validPayload),
      })
    );
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe("forbidden_origin");
    expect(createMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid payload (400, validation_error) without touching the database", async () => {
    const res = await POST(trustedPost({ name: "A", phone: "", message: "" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("validation_error");
    expect(createMock).not.toHaveBeenCalled();
  });

  it("persists a valid submission and returns 201", async () => {
    const res = await POST(trustedPost(validPayload));
    expect(res.status).toBe(201);
    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "Sara Ahmed", message: expect.any(String) }),
      })
    );
  });

  it("silently drops a honeypot-filled submission without writing to the database", async () => {
    const res = await POST(trustedPost({ ...validPayload, website: "http://spam.example" }));
    // Responds as if it succeeded, per CLAUDE.md §10/§20, so a bot can't learn to leave it blank.
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
      new Request(`https://${TRUSTED_HOST}/api/contact`, {
        method: "POST",
        headers: {
          origin: `https://${TRUSTED_HOST}`,
          host: TRUSTED_HOST,
          "x-forwarded-for": fixedIp,
        },
        body: JSON.stringify(validPayload),
      });
    let last;
    for (let i = 0; i < 6; i++) {
      last = await POST(requestWith());
    }
    expect(last!.status).toBe(429);
  });
});
