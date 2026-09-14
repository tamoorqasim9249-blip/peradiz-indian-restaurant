import { test, expect } from "@playwright/test";

/**
 * Chatbot smoke test — CLAUDE.md §11/§19: "chatbot open → send message → receive streamed reply
 * (mock the Anthropic call in test env)". The mock here operates one level up, at the /api/chat
 * network boundary itself (rather than mocking the Anthropic SDK), which is simpler for an e2e
 * test and just as effective — ChatPanel.tsx only cares that it gets a text/plain body back from
 * a ReadableStream reader, not how that body was produced server-side.
 */
test.describe("chat widget", () => {
  test("opens, sends a message, and renders the (mocked) streamed reply", async ({ page }) => {
    await page.route("**/api/chat", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/plain; charset=utf-8",
        body: "Yes, we have several vegetarian dishes on the menu.",
      });
    });

    await page.goto("/en");
    await page.getByRole("button", { name: "Chat with us" }).click();

    const dialog = page.getByRole("dialog", { name: "Peradiz Assistant" });
    await expect(dialog).toBeVisible();

    await page.getByLabel("Your message").fill("Do you have vegetarian options?");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(dialog.getByText("Yes, we have several vegetarian dishes on the menu.")).toBeVisible();
  });

  test("shows an unavailable notice on a 503 without crashing the widget", async ({ page }) => {
    await page.route("**/api/chat", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          error: { code: "unavailable", message: "The chat assistant is temporarily unavailable." },
        }),
      });
    });

    await page.goto("/en");
    await page.getByRole("button", { name: "Chat with us" }).click();
    await page.getByLabel("Your message").fill("Are you open now?");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText(/currently unavailable/i)).toBeVisible();
  });

  test("closes with the × button and returns focus to the trigger", async ({ page }) => {
    await page.goto("/en");
    const trigger = page.getByRole("button", { name: "Chat with us" });
    await trigger.click();
    await page.getByRole("button", { name: "Close chat" }).click();

    await expect(page.getByRole("dialog", { name: "Peradiz Assistant" })).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
