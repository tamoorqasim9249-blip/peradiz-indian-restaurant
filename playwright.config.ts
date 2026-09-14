import { defineConfig, devices } from "@playwright/test";

/**
 * Happy-path E2E smoke coverage only — see CLAUDE.md §19: locale switch + RTL/LTR `dir` flip and
 * nav; contact form submit success + validation error; reservation form submit success +
 * validation error; chatbot open -> send message -> receive streamed reply (mocked). No visual
 * regression, load testing, or full cross-browser matrix in v1 (documented in CLAUDE.md §19 as a
 * deliberate choice, not an oversight) — two Chromium projects (Desktop + Mobile viewport) cover
 * the "mobile layout, desktop layout" requirement without turning this into a full device/browser
 * matrix.
 *
 * The contact/reservation/chat specs mock their route's network call (`page.route`) instead of
 * hitting a real Postgres database or the real Anthropic API — the same "mock the external call
 * in test env" approach CLAUDE.md §19 already prescribes for the chatbot. They verify the
 * *frontend's* behavior (client validation, loading/success/error states); the routes' own
 * request handling (origin checks, rate limiting, persistence, secret-leak safety) is covered by
 * tests/unit/{contact,reservations,chat}-route.test.ts instead.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  // Serialized rather than parallel: `npm run dev` (Turbopack) compiles each route on first
  // request, and several workers requesting different not-yet-compiled routes at once made that
  // first compile slow enough to blow past the navigation timeout below — not a flaky test, an
  // artifact of this being a single shared dev server rather than N isolated ones. A single
  // worker trades wall-clock time for not fighting itself over the same cold cache.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    navigationTimeout: 45_000,
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: "Desktop Chrome", use: { ...devices["Desktop Chrome"] } },
    { name: "Mobile Chrome", use: { ...devices["Pixel 5"] } },
  ],
});
