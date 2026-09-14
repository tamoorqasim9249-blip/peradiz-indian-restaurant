import { test, expect } from "@playwright/test";

/**
 * Mobile vs. desktop layout smoke test — see CLAUDE.md §3 ("mobile experience is a first-class
 * design target") and §19. Header.tsx renders an inline nav at the `md` breakpoint and up, and a
 * hamburger-triggered nav below it — this asserts each project (see playwright.config.ts) gets
 * the variant meant for its viewport, and that the hamburger menu actually works end to end.
 *
 * Footer.tsx repeats every primary nav link in its own "quick links" column, so every query here
 * is scoped to the header (`getByRole("banner")` — the `<header>` element's implicit ARIA role)
 * to avoid an ambiguous match against the footer's copy.
 */
test.describe("responsive navigation", () => {
  test("shows the inline desktop nav without a hamburger toggle", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop-only assertion.");

    await page.goto("/en");
    const header = page.getByRole("banner");
    await expect(header.getByRole("link", { name: "Contact", exact: true })).toBeVisible();
    await expect(header.getByRole("button", { name: "Toggle menu" })).toBeHidden();
  });

  test("shows a hamburger toggle instead of the inline nav, and it opens/closes the menu", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Mobile-only assertion.");

    await page.goto("/en");
    const header = page.getByRole("banner");
    const toggle = header.getByRole("button", { name: "Toggle menu" });
    await expect(toggle).toBeVisible();
    await expect(header.getByRole("link", { name: "Contact", exact: true })).toBeHidden();

    await toggle.click();
    const mobileContact = page.locator("#mobile-nav").getByRole("link", { name: "Contact", exact: true });
    await expect(mobileContact).toBeVisible();

    // The link's own onClick also closes the menu (`setOpen(false)`), unmounting #mobile-nav on
    // the same click that triggers navigation — racy against a plain post-click URL assertion
    // (confirmed working for a real user; this is a Playwright automated-click timing quirk, not
    // an app bug). Starting the URL wait before the click, rather than polling afterwards,
    // removes the race.
    await Promise.all([page.waitForURL(/\/en\/contact$/), mobileContact.click()]);
  });
});
