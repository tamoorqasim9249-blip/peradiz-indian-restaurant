import { restaurantFacts } from "../../../../content/restaurant-facts";
import { contactSchema } from "@/lib/validation/contact-schema";
import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api/response";
import { toErrorResponse } from "@/lib/api/errors";
import { enforceRateLimit, readJsonBody, requireTrustedOrigin, PUBLIC_DATA_CACHE_HEADERS } from "@/lib/api/guard";

export const runtime = "nodejs";

// Well-formed requests here are tiny (name/phone/email/message, all capped by the zod schema) —
// same defense-in-depth pattern as /api/chat (CLAUDE.md §7/§10).
const MAX_BODY_BYTES = 20_000;

/**
 * GET /api/contact — the restaurant's own public contact info (phone, WhatsApp, address). See
 * CLAUDE.md §7/§9. Distinct from POST below, which submits a visitor's message.
 */
export async function GET(request: Request) {
  try {
    enforceRateLimit(request, "contact-info", { limit: 60, windowMs: 60_000 });

    const { phoneDisplay, phoneE164, whatsappUrl } = restaurantFacts.contact;
    return apiSuccess(
      {
        phone: { display: phoneDisplay, e164: phoneE164 },
        whatsapp: whatsappUrl,
        address: {
          ar: restaurantFacts.location.addressAr,
          en: restaurantFacts.location.addressEn,
        },
      },
      { headers: PUBLIC_DATA_CACHE_HEADERS }
    );
  } catch (err) {
    return toErrorResponse(err, "contact.get");
  }
}

/**
 * POST /api/contact — validate + persist a ContactSubmission. See CLAUDE.md §7/§9.
 */
export async function POST(request: Request) {
  try {
    requireTrustedOrigin(request);
    enforceRateLimit(request, "contact", { limit: 5, windowMs: 60_000 });
    const data = await readJsonBody(request, contactSchema, { maxBytes: MAX_BODY_BYTES });

    // Honeypot: a real visitor never fills this in. Respond as if it succeeded (so a bot doesn't
    // learn to leave it blank) but skip the DB write. See CLAUDE.md §10/§20.
    if (data.website) {
      return apiSuccess(null, { status: 201 });
    }

    // A Prisma failure here is an unexpected error, not an `ApiError` — it falls through to the
    // catch below, which logs it (never the client-facing response) via toErrorResponse. See
    // CLAUDE.md §9/§10.
    await prisma.contactSubmission.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        message: data.message,
        locale: data.locale,
      },
    });

    return apiSuccess(null, { status: 201 });
  } catch (err) {
    return toErrorResponse(err, "contact.post");
  }
}
