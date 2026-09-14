import { test, expect } from "@playwright/test";

/**
 * Reservation-request form smoke test — CLAUDE.md §1/§19: this is a request only, staff confirm
 * by phone (never a live booking). See contact-form.spec.ts for why the network call is mocked
 * rather than hitting a real database.
 */
test.describe("reservation form", () => {
  test("shows inline validation errors instead of submitting an empty form", async ({ page }) => {
    let requestMade = false;
    await page.route("**/api/reservations", async (route) => {
      requestMade = true;
      await route.abort();
    });

    await page.goto("/en/reservations");
    await page.getByRole("button", { name: "Send Reservation Request" }).click();

    await expect(page.getByText("This field is required").first()).toBeVisible();
    expect(requestMade).toBe(false);
  });

  test("shows a success message after a valid submission", async ({ page }) => {
    await page.route("**/api/reservations", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, data: null }),
      });
    });

    await page.goto("/en/reservations");
    await page.getByLabel("Name").fill("Omar Khan");
    await page.getByLabel("Phone number").fill("+966501234567");
    await page.getByLabel("Party size").fill("4");
    await page.getByLabel("Preferred date").fill("2026-12-01");
    await page.getByLabel("Preferred time").fill("19:30");
    await page.getByRole("button", { name: "Send Reservation Request" }).click();

    await expect(page.getByRole("status")).toContainText("Your reservation request was received");
  });

  test("shows a friendly error notice when the submission fails server-side", async ({ page }) => {
    await page.route("**/api/reservations", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, error: { code: "internal_error", message: "Something went wrong." } }),
      });
    });

    await page.goto("/en/reservations");
    await page.getByLabel("Name").fill("Omar Khan");
    await page.getByLabel("Phone number").fill("+966501234567");
    await page.getByLabel("Party size").fill("4");
    await page.getByLabel("Preferred date").fill("2026-12-01");
    await page.getByLabel("Preferred time").fill("19:30");
    await page.getByRole("button", { name: "Send Reservation Request" }).click();

    await expect(page.getByText(/Something went wrong sending your request/i)).toBeVisible();
  });
});
