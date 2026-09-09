import { z } from "zod";

// Caps bound token usage / abuse surface — see CLAUDE.md §11.
// `.strict()` rejects any unexpected extra key instead of silently ignoring it, so a malformed
// or probing payload fails validation rather than passing through with unused fields.
const chatMessageSchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(2000),
  })
  .strict();

export const chatRequestSchema = z
  .object({
    messages: z.array(chatMessageSchema).min(1).max(20),
    locale: z.enum(["ar", "en"]).default("ar"),
  })
  .strict();

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
