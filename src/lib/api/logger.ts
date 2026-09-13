/**
 * Minimal structured logging for API routes — one JSON line per event to stdout/stderr, captured
 * by the hosting platform's normal log pipeline (Vercel, or `next start`'s console). No logging
 * library dependency added (CLAUDE.md §4/§20's "does this materially improve the project?" test)
 * — a small site's log volume doesn't need one.
 *
 * Rule for every call site, present and future: pass only route/event names and non-sensitive
 * identifiers (an error message, a status code, a rate-limit key). NEVER pass a request body,
 * an env var value, or anything that could contain `ANTHROPIC_API_KEY`/`DATABASE_URL`/a
 * visitor's full submitted message — see CLAUDE.md §10. Logs are server-side only; they are
 * never a source for an API response (see toErrorResponse in errors.ts).
 */

type LogMeta = Record<string, unknown>;

function log(level: "info" | "warn" | "error", event: string, meta?: LogMeta) {
  const line = JSON.stringify({ level, event, time: new Date().toISOString(), ...meta });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logInfo = (event: string, meta?: LogMeta) => log("info", event, meta);
export const logWarn = (event: string, meta?: LogMeta) => log("warn", event, meta);
export const logError = (event: string, meta?: LogMeta) => log("error", event, meta);
