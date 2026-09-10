import { contactSchema } from "@/lib/validation/contact-schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isTrustedOrigin } from "@/lib/same-origin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Well-formed requests here are tiny (name/phone/email/message, all capped by the zod schema) —
// same defense-in-depth pattern as /api/chat (CLAUDE.md §7/§10).
const MAX_BODY_BYTES = 20_000;

/**
 * POST /api/contact — validate + persist a ContactSubmission. See CLAUDE.md §7/§9.
 */
export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!limit.allowed) {
    return Response.json(
      { error: "rate_limited", retryAfterSeconds: limit.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } }
    );
  }

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

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  // Honeypot: a real visitor never fills this in. Respond as if it succeeded (so a bot doesn't
  // learn to leave it blank) but skip the DB write. See CLAUDE.md §10/§20.
  if (parsed.data.website) {
    return Response.json({ ok: true }, { status: 201 });
  }

  try {
    await prisma.contactSubmission.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || undefined,
        message: parsed.data.message,
        locale: parsed.data.locale,
      },
    });
  } catch (err) {
    // Never leak internal error detail to the client — see CLAUDE.md §9.
    console.error("[/api/contact] Prisma error:", err instanceof Error ? err.message : err);
    return Response.json({ error: "server_error" }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 201 });
}
