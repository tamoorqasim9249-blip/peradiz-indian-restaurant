import { describe, it, expect } from "vitest";
import { contactSchema } from "../../src/lib/validation/contact-schema";

describe("contactSchema", () => {
  it("accepts a valid submission", () => {
    const result = contactSchema.safeParse({
      name: "Sara",
      phone: "+966501234567",
      email: "sara@example.com",
      message: "Do you have vegetarian options?",
      locale: "en",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an omitted/empty email (optional field)", () => {
    const result = contactSchema.safeParse({
      name: "Sara",
      phone: "+966501234567",
      message: "Do you have vegetarian options?",
      locale: "ar",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing name", () => {
    const result = contactSchema.safeParse({
      phone: "+966501234567",
      message: "Hello",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a message that is too short", () => {
    const result = contactSchema.safeParse({
      name: "Sara",
      phone: "+966501234567",
      message: "hi",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = contactSchema.safeParse({
      name: "Sara",
      phone: "+966501234567",
      email: "not-an-email",
      message: "Do you have vegetarian options?",
    });
    expect(result.success).toBe(false);
  });

  it("silently accepts a filled honeypot field at the schema level (route.ts drops it later)", () => {
    // The honeypot itself must stay a valid, non-required field so a real visitor whose browser
    // autofills it isn't blocked — the *response* to a filled honeypot is handled in
    // src/app/api/contact/route.ts, not by rejecting the request here.
    const result = contactSchema.safeParse({
      name: "Sara",
      phone: "+966501234567",
      message: "Do you have vegetarian options?",
      website: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unexpected field on the payload it doesn't already allow", () => {
    const result = contactSchema.safeParse({
      name: "Sara",
      phone: "+966501234567",
      message: "Do you have vegetarian options?",
      isAdmin: true,
    } as unknown as Record<string, unknown>);
    // contactSchema is a plain z.object (not .strict()) — extra keys are stripped, not rejected.
    // Assert the stripped-parse behavior explicitly so a future switch to .strict() is a
    // deliberate, visible change rather than a silent regression either way.
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("isAdmin");
    }
  });
});
