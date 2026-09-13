import { chatRequestSchema } from "@/lib/validation/chat-schema";
import {
  getAnthropicClient,
  ChatbotUnavailableError,
  CHAT_MODEL,
  CHAT_MAX_TOKENS,
} from "@/lib/chat/anthropic-client";
import { buildChatSystemPrompt } from "@/lib/chat/system-prompt";
import { toErrorResponse, ApiError } from "@/lib/api/errors";
import { enforceRateLimit, readJsonBody, requireTrustedOrigin } from "@/lib/api/guard";
import { logError } from "@/lib/api/logger";

// Streaming responses need the Node.js runtime (not edge) to use the Anthropic SDK as written.
export const runtime = "nodejs";

const MAX_BODY_BYTES = 50_000;

/**
 * POST /api/chat — streaming Claude chatbot reply, grounded in content/restaurant-facts.ts and
 * content/menu/*.ts only. See CLAUDE.md §7/§9/§11.
 *
 * The success response body is a plain UTF-8 text stream of the assistant's reply (no SSE
 * framing, no JSON envelope) — deliberately simple so the browser client needs nothing but a
 * ReadableStream reader, never the Anthropic SDK itself. This is the one documented exception to
 * the `{ ok, data }` envelope every other route uses (see src/lib/api/response.ts) — everything
 * *before* the stream starts (origin/rate-limit/validation errors, the 503 below) still goes
 * through the standard envelope via toErrorResponse.
 */
export async function POST(request: Request) {
  try {
    requireTrustedOrigin(request);
    enforceRateLimit(request, "chat", { limit: 15, windowMs: 60_000 });
    const { messages, locale } = await readJsonBody(request, chatRequestSchema, {
      maxBytes: MAX_BODY_BYTES,
    });

    let client;
    try {
      client = getAnthropicClient();
    } catch (err) {
      if (err instanceof ChatbotUnavailableError) {
        throw new ApiError("unavailable", "The chat assistant is temporarily unavailable.", 503);
      }
      throw err;
    }

    const system = buildChatSystemPrompt(locale);

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
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
          // Never leak internal error detail to the client — see CLAUDE.md §9/§10. The stream has
          // already started, so this can't become a normal JSON error response; the client just
          // sees the stream end in error.
          logError("chat.stream_failed", {
            message: err instanceof Error ? err.message : String(err),
          });
          controller.error(new Error("stream_failed"));
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return toErrorResponse(err, "chat.post");
  }
}
