import type { Page } from "@playwright/test";

/**
 * Shared helpers for navigating Header.tsx's responsive nav, which renders two variants of the
 * same links: an always-in-DOM desktop nav (`hidden md:flex`, CSS-hidden below the md breakpoint)
 * and a mobile nav panel that only mounts once the hamburger toggle is opened. A spec that runs
 * against both the Desktop and Mobile Chrome projects (see playwright.config.ts) needs to pick
 * whichever variant is actually visible rather than hardcoding one.
 */

/** Opens the mobile hamburger nav if it's present and visible (i.e. we're below the md breakpoint). */
export async function ensureNavOpen(page: Page): Promise<void> {
  const toggle = page.getByRole("button", { name: /Toggle menu|فتح القائمة/ });
  if (await toggle.isVisible().catch(() => false)) {
    await toggle.click();
  }
}

/**
 * The locale-switcher link, scoped to whichever copy of it is currently visible. Matches on the
 * `aria-label` attribute directly (CSS attribute selector) rather than `hasText`, since the
 * link's rendered text is just "English"/"العربية" — the "Switch language to ..." wording lives
 * only in the `aria-label`, not the visible text content.
 */
export function visibleLocaleSwitcherLink(page: Page) {
  return page.locator('a[aria-label*="Switch language"]:visible');
}
