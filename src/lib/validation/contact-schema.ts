import { z } from "zod";

// Shared client + server validation — see CLAUDE.md §10 ("never trust client validation alone").
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(30),
  email: z.union([z.literal(""), z.string().trim().email()]).optional(),
  message: z.string().trim().min(5).max(2000),
  locale: z.enum(["ar", "en"]).default("ar"),
  // Honeypot field — real users never fill this in; bots often do. See CLAUDE.md §10.
  website: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
