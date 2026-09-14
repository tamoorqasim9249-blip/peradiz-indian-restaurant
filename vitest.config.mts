import { defineConfig } from "vitest/config";
import path from "node:path";

// Mirrors tsconfig.json's "@/*" -> "./src/*" path alias (see CLAUDE.md §17) so tests can import
// route handlers and lib modules that use the `@/` alias internally (e.g. src/lib/api/guard.ts,
// src/app/api/**/route.ts) without every test having to reach for a relative path instead.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    // Vitest's default include pattern (`**/*.{test,spec}.ts`) would otherwise also pick up
    // tests/e2e/*.spec.ts — those are Playwright specs (see playwright.config.ts), not Vitest
    // ones, and use a different `test`/`expect` (Playwright's, with page fixtures) that would
    // fail under Vitest's runner. Scope Vitest to the unit suite only.
    include: ["tests/unit/**/*.test.ts"],
  },
});
