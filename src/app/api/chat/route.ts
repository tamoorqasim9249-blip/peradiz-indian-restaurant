import { chatRequestSchema } from "@/lib/validation/chat-schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isTrustedOrigin } from "@/lib/same-origin";
import {
  getAnthropicClient,
  ChatbotUnavailableError,
  CHAT_MODEL,
  CHAT_MAX_TOKENS,
} from "@/lib/chat/anthropic-client";
import { buildChatSystemPrompt } from "@/lib/chat/system-prompt";

// Streaming responses need the Node.js runtime (not edge) to use the Anthropic SDK as written.
export const runtime = "nodejs";

/**
 * POST /api/chat — streaming Claude chatbot reply, grounded in content/restaurant-facts.ts and
 * content/menu/*.ts only. See CLAUDE.md §7/§9/§11.
 *
 * Response body is a plain UTF-8 text stream of the assistant's reply (no SSE framing, no JSON
 * envelope) — deliberately simple so the browser client needs nothing but a ReadableStream
 * reader, never the Anthropic SDK itself.
 */
export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`chat:${ip}`, { limit: 15, windowMs: 60_000 });
  if (!limit.allowed) {
    return Response.json(
      { error: "rate_limited", retryAfterSeconds: limit.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } }
    );
  }

  // Reject oversized payloads before parsing — the schema below caps content to 20 messages of
  // 2000 chars each, so a well-formed request is always small; anything declaring a much larger
  // body is either malformed or an abuse attempt and isn't worth spending memory/CPU to parse.
  const MAX_BODY_BYTES = 50_000;
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return Response.json({ error: "payload_too_large" }, { status: 413 });
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_BYTES) {
      return Response.json({ error: "payload_too_large" }, { status: 413 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }
  const { messages, locale } = parsed.data;

  let client;
  try {
    client = getAnthropicClient();
  } catch (err) {
    if (err instanceof ChatbotUnavailableError) {
      return Response.json({ error: "unavailable" }, { status: 503 });
    }
    throw err;
  }

  const system = buildChatSystemPrompt(locale);

  const encoder = new TextEncoder();
  const body_ = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model: CHAT_MODEL,
          max_tokens: CHAT_MAX_TOKENS,
          system,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        anthropicStream.on("text", (delta) => {
          controller.enqueue(encoder.encode(delta));
        });

        await anthropicStream.finalMessage();
        controller.close();
      } catch (err) {
        // Never leak internal error detail to the client — see CLAUDE.md §9.
        console.error("[/api/chat] Anthropic stream error:", err instanceof Error ? err.message : err);
        controller.error(new Error("stream_failed"));
      }
    },
  });

  return new Response(body_, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
