import { reservationSchema } from "@/lib/validation/reservation-schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isTrustedOrigin } from "@/lib/same-origin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 20_000;

/**
 * POST /api/reservations — validate + persist a ReservationRequest. This is a request only —
 * staff confirm by phone, it is never a live/instant booking. See CLAUDE.md §1/§7/§9.
 */
export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`reservations:${ip}`, { limit: 5, windowMs: 60_000 });
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

  const parsed = reservationSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  // Honeypot — see /api/contact/route.ts.
  if (parsed.data.website) {
    return Response.json({ ok: true }, { status: 201 });
  }

  try {
    await prisma.reservationRequest.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || undefined,
        partySize: parsed.data.partySize,
        preferredDate: new Date(parsed.data.preferredDate),
        preferredTime: parsed.data.preferredTime,
        notes: parsed.data.notes || undefined,
        contactMethod: parsed.data.contactMethod,
        locale: parsed.data.locale,
      },
    });
  } catch (err) {
    console.error("[/api/reservations] Prisma error:", err instanceof Error ? err.message : err);
    return Response.json({ error: "server_error" }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 201 });
}
