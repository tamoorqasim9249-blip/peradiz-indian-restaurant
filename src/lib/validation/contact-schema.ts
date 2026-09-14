import { z } from "zod";

// Shared client + server validation — see CLAUDE.md §10 ("never trust client validation alone").
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(30),
  email: z.union([z.literal(""), z.string().trim().email()]).optional(),
  message: z.string().trim().min(5).max(2000),
  locale: z.enum(["ar", "en"]).default("en"),
  // Honeypot field — real users never fill this in (it's hidden from view); bots that fill
  // every field they find often do. Deliberately NOT `.max(0)`: that would make a non-empty
  // value fail validation with a 400 before the route ever reaches its `if (data.website)`
  // check, revealing detection to the bot and making that check dead code. Accepting any string
  // here lets a filled-in honeypot reach the route, which then fakes a success response instead
  // — see CLAUDE.md §10/§20 and src/app/api/contact/route.ts.
  website: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
