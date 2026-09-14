import { test, expect } from "@playwright/test";
import { ensureNavOpen, visibleLocaleSwitcherLink } from "./utils";

/**
 * Locale routing + RTL/LTR smoke test — see CLAUDE.md §3/§19. English is the default/primary
 * locale; `localeDetection: false` in src/i18n/routing.ts means an unprefixed "/" must always
 * resolve to /en, never negotiate a locale from the browser's Accept-Language header.
 *
 * Runs against both the Desktop and Mobile Chrome projects (see playwright.config.ts). On mobile
 * the locale switcher lives behind the hamburger menu, so `ensureNavOpen` opens it first — see
 * ./utils.ts. Nav-link clicks that depend on which nav variant is currently rendered live in
 * responsive-nav.spec.ts instead.
 */
test.describe("locale switch and RTL/LTR", () => {
  test("an unprefixed visit resolves to English (LTR)", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en(\/|$|\?)/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  });

  test("switching locale flips to Arabic (RTL)", async ({ page }) => {
    await page.goto("/en");
    await ensureNavOpen(page);
    await visibleLocaleSwitcherLink(page).click();

    await expect(page).toHaveURL(/\/ar(\/|$|\?)/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });

  test("switching back to English restores LTR", async ({ page }) => {
    await page.goto("/ar");
    await ensureNavOpen(page);
    await visibleLocaleSwitcherLink(page).click();

    await expect(page).toHaveURL(/\/en(\/|$|\?)/);
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  });

  test("direct navigation to a route keeps it in the requested locale", async ({ page }) => {
    // level: 1 scopes to the page's own <h1> — Footer.tsx has its own "Contact Us" *section*
    // heading (its quick-links column), which would otherwise be a second, ambiguous match.
    await page.goto("/en/contact");
    await expect(page.getByRole("heading", { name: "Contact Us", level: 1 })).toBeVisible();

    await page.goto("/ar/contact");
    await expect(page.getByRole("heading", { name: "تواصل معنا", level: 1 })).toBeVisible();
  });
});
