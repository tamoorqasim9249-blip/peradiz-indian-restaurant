import { reservationSchema } from "@/lib/validation/reservation-schema";
import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api/response";
import { toErrorResponse } from "@/lib/api/errors";
import { enforceRateLimit, readJsonBody, requireTrustedOrigin } from "@/lib/api/guard";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 20_000;

/**
 * POST /api/reservations — validate + persist a ReservationRequest. This is a request only —
 * staff confirm by phone, it is never a live/instant booking. See CLAUDE.md §1/§7/§9.
 */
export async function POST(request: Request) {
  try {
    requireTrustedOrigin(request);
    enforceRateLimit(request, "reservations", { limit: 5, windowMs: 60_000 });
    const data = await readJsonBody(request, reservationSchema, { maxBytes: MAX_BODY_BYTES });

    // Honeypot — see /api/contact/route.ts.
    if (data.website) {
      return apiSuccess(null, { status: 201 });
    }

    // A Prisma failure here is an unexpected error, not an `ApiError` — it falls through to the
    // catch below, which logs it (never the client-facing response) via toErrorResponse.
    await prisma.reservationRequest.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        partySize: data.partySize,
        preferredDate: new Date(data.preferredDate),
        preferredTime: data.preferredTime,
        notes: data.notes || undefined,
        contactMethod: data.contactMethod,
        locale: data.locale,
      },
    });

    return apiSuccess(null, { status: 201 });
  } catch (err) {
    return toErrorResponse(err, "reservations.post");
  }
}
