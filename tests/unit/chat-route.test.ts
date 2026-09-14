import { describe, it, expect, vi, beforeEach } from "vitest";

// Never calls the real Anthropic API — see CLAUDE.md §11/§19 ("mock the Anthropic call in test
// env"). `importOriginal` keeps the real `ChatbotUnavailableError` class (route.ts does an
// `instanceof` check on it) and the real CHAT_MODEL/CHAT_MAX_TOKENS constants; only
// `getAnthropicClient` is swapped for a per-test mock.
const getAnthropicClientMock = vi.hoisted(() => vi.fn());
vi.mock("../../src/lib/chat/anthropic-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/lib/chat/anthropic-client")>();
  return { ...actual, getAnthropicClient: getAnthropicClientMock };
});

const { POST } = await import("../../src/app/api/chat/route");
const { ChatbotUnavailableError } = await import("../../src/lib/chat/anthropic-client");

const TRUSTED_HOST = "peradiz.example";

function ip(): string {
  return `192.0.2.${Math.random() * 255 | 0}`;
}

function trustedPost(body: unknown): Request {
  return new Request(`https://${TRUSTED_HOST}/api/chat`, {
    method: "POST",
    headers: { origin: `https://${TRUSTED_HOST}`, host: TRUSTED_HOST, "x-forwarded-for": ip() },
    body: JSON.stringify(body),
  });
}

/** A minimal stand-in for the Anthropic SDK's `client.messages.stream(...)` return value. */
function fakeAnthropicClient(textChunks: string[]) {
  return {
    messages: {
      stream: () => {
        const listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
        const fakeStream = {
          on(event: string, cb: (...args: unknown[]) => void) {
            (listeners[event] ??= []).push(cb);
            return fakeStream;
          },
          async finalMessage() {
            for (const chunk of textChunks) {
              listeners.text?.forEach((cb) => cb(chunk));
            }
            return {};
          },
        };
        return fakeStream;
      },
    },
  };
}

const validPayload = {
  messages: [{ role: "user", content: "Do you have vegetarian options?" }],
  locale: "en",
};

describe("POST /api/chat", () => {
  beforeEach(() => {
    getAnthropicClientMock.mockReset();
  });

  it("rejects a cross-origin request before ever calling Anthropic (403, forbidden_origin)", async () => {
    const res = await POST(
      new Request(`https://${TRUSTED_HOST}/api/chat`, {
        method: "POST",
        headers: { origin: "https://attacker.example", host: TRUSTED_HOST, "x-forwarded-for": ip() },
        body: JSON.stringify(validPayload),
      })
    );
    expect(res.status).toBe(403);
    expect(getAnthropicClientMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid payload (400, validation_error) — e.g. an empty messages array", async () => {
    const res = await POST(trustedPost({ messages: [], locale: "en" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("validation_error");
    expect(getAnthropicClientMock).not.toHaveBeenCalled();
  });

  it("rejects an unexpected extra field (schema is .strict()) instead of silently ignoring it", async () => {
    const res = await POST(
      trustedPost({
        messages: [{ role: "user", content: "hi", extraField: "ignored?" }],
        locale: "en",
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 503 unavailable (not a 500) when no Anthropic API key is configured", async () => {
    getAnthropicClientMock.mockImplementation(() => {
      throw new ChatbotUnavailableError();
    });
    const res = await POST(trustedPost(validPayload));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error.code).toBe("unavailable");
    // The internal reason ("ANTHROPIC_API_KEY is not configured") never reaches the client.
    expect(JSON.stringify(body)).not.toContain("ANTHROPIC_API_KEY");
  });

  it("streams the assistant's reply as plain text on success, never as JSON", async () => {
    getAnthropicClientMock.mockReturnValue(fakeAnthropicClient(["Yes, we have ", "several vegetarian dishes."]));
    const res = await POST(trustedPost(validPayload));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");
    expect(res.headers.get("cache-control")).toBe("no-store");
    await expect(res.text()).resolves.toBe("Yes, we have several vegetarian dishes.");
  });

  it("enforces per-IP rate limiting", async () => {
    getAnthropicClientMock.mockReturnValue(fakeAnthropicClient(["ok"]));
    const fixedIp = `198.51.100.${Math.random() * 255 | 0}`;
    const requestWith = () =>
      new Request(`https://${TRUSTED_HOST}/api/chat`, {
        method: "POST",
        headers: { origin: `https://${TRUSTED_HOST}`, host: TRUSTED_HOST, "x-forwarded-for": fixedIp },
        body: JSON.stringify(validPayload),
      });
    let last;
    for (let i = 0; i < 16; i++) {
      last = await POST(requestWith());
    }
    expect(last!.status).toBe(429);
  });
});
