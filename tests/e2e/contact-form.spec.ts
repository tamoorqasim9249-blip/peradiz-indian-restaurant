import { test, expect } from "@playwright/test";

/**
 * Contact form smoke test — CLAUDE.md §19. The real POST /api/contact persists to Postgres
 * (CLAUDE.md §8), which isn't guaranteed to be configured wherever these e2e tests run, so the
 * network call is mocked here (the same "mock the external call in test env" approach CLAUDE.md
 * §19 prescribes for the chatbot's Anthropic call) — this verifies the *form's* behavior
 * (client-side validation, loading/success/error UI), not the database write, which
 * tests/unit/contact-route.test.ts already covers against a mocked Prisma client.
 */
test.describe("contact form", () => {
  test("shows inline validation errors instead of submitting an empty form", async ({ page }) => {
    let requestMade = false;
    await page.route("**/api/contact", async (route) => {
      requestMade = true;
      await route.abort();
    });

    await page.goto("/en/contact");
    await page.getByRole("button", { name: "Send Message" }).click();

    await expect(page.getByText("This field is required").first()).toBeVisible();
    expect(requestMade).toBe(false);
  });

  test("shows a success message after a valid submission", async ({ page }) => {
    await page.route("**/api/contact", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, data: null }),
      });
    });

    await page.goto("/en/contact");
    await page.getByLabel("Name").fill("Sara Ahmed");
    await page.getByLabel("Phone number").fill("+966501234567");
    await page.getByLabel("Your message").fill("Do you have vegetarian options?");
    await page.getByRole("button", { name: "Send Message" }).click();

    await expect(page.getByRole("status")).toContainText("Your message was sent successfully");
  });

  test("shows a friendly error notice when the submission fails server-side", async ({ page }) => {
    await page.route("**/api/contact", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, error: { code: "internal_error", message: "Something went wrong." } }),
      });
    });

    await page.goto("/en/contact");
    await page.getByLabel("Name").fill("Sara Ahmed");
    await page.getByLabel("Phone number").fill("+966501234567");
    await page.getByLabel("Your message").fill("Do you have vegetarian options?");
    await page.getByRole("button", { name: "Send Message" }).click();

    await expect(page.getByText(/Something went wrong sending your message/i)).toBeVisible();
  });
});
