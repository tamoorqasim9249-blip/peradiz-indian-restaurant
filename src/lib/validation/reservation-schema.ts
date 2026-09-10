import { z } from "zod";

export const reservationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(30),
  email: z.union([z.literal(""), z.string().trim().email()]).optional(),
  partySize: z.coerce.number().int().min(1).max(30),
  preferredDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  preferredTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Expected HH:mm"),
  notes: z.string().trim().max(1000).optional(),
  contactMethod: z.enum(["PHONE", "EMAIL"]).default("PHONE"),
  locale: z.enum(["ar", "en"]).default("en"),
  // Honeypot field — see contact-schema.ts.
  website: z.string().max(0).optional(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
