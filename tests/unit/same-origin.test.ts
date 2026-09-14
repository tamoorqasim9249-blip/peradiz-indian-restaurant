import { describe, it, expect } from "vitest";
import { isTrustedOrigin } from "../../src/lib/same-origin";

/**
 * Authorization / CSRF defense-in-depth for mutating routes — see CLAUDE.md §7/§10 and
 * src/lib/same-origin.ts. This is the closest thing this app has to "authorization": there are
 * no user accounts (CLAUDE.md §7 — "No user authentication in v1"), so the only access-control
 * question a request faces is "did this come from the site's own frontend" rather than "which
 * user is this."
 */
describe("isTrustedOrigin", () => {
  it("trusts a request whose Origin host matches its Host header", () => {
    const request = new Request("https://peradiz.example/api/contact", {
      method: "POST",
      headers: { origin: "https://peradiz.example", host: "peradiz.example" },
    });
    expect(isTrustedOrigin(request)).toBe(true);
  });

  it("rejects a request whose Origin host does not match its Host header", () => {
    const request = new Request("https://peradiz.example/api/contact", {
      method: "POST",
      headers: { origin: "https://evil.example", host: "peradiz.example" },
    });
    expect(isTrustedOrigin(request)).toBe(false);
  });

  it("rejects a request with no Origin header at all", () => {
    const request = new Request("https://peradiz.example/api/contact", {
      method: "POST",
      headers: { host: "peradiz.example" },
    });
    expect(isTrustedOrigin(request)).toBe(false);
  });

  it("rejects a request with no Host header at all", () => {
    const request = new Request("https://peradiz.example/api/contact", {
      method: "POST",
      headers: { origin: "https://peradiz.example" },
    });
    expect(isTrustedOrigin(request)).toBe(false);
  });

  it("rejects a malformed Origin header instead of throwing", () => {
    const request = new Request("https://peradiz.example/api/contact", {
      method: "POST",
      headers: { origin: "not-a-url", host: "peradiz.example" },
    });
    expect(() => isTrustedOrigin(request)).not.toThrow();
    expect(isTrustedOrigin(request)).toBe(false);
  });

  it("is scheme-agnostic — only the host is compared, per the implementation", () => {
    // Documents actual behavior: a same-host http origin against an https Host header is
    // trusted, since only `.host` is compared. Local dev runs on http; this is intentional, not
    // a gap being introduced by this test.
    const request = new Request("https://peradiz.example/api/contact", {
      method: "POST",
      headers: { origin: "http://peradiz.example", host: "peradiz.example" },
    });
    expect(isTrustedOrigin(request)).toBe(true);
  });
});
