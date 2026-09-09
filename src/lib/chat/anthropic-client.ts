import Anthropic from "@anthropic-ai/sdk";

/**
 * Server-only Anthropic client singleton — see CLAUDE.md §10/§11: ANTHROPIC_API_KEY must never
 * reach the browser. This module must only ever be imported from `src/app/api/**` route
 * handlers (never from a "use client" component); no `server-only` package dependency is added
 * for this per CLAUDE.md §4/§20's dependency-justification rule — Next.js Route Handlers are
 * already server-only by construction, so the only real guard needed is not importing this file
 * from client code, same as `src/lib/prisma.ts`.
 */

let client: Anthropic | null = null;

export class ChatbotUnavailableError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY is not configured");
    this.name = "ChatbotUnavailableError";
  }
}

export function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new ChatbotUnavailableError();

  if (!client) client = new Anthropic({ apiKey });
  return client;
}

export const CHAT_MODEL = "claude-sonnet-5";
export const CHAT_MAX_TOKENS = 500;
