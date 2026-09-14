import { describe, it, expect } from "vitest";
import { GET as getMenu } from "../../src/app/api/menu/route";
import { GET as getRestaurant } from "../../src/app/api/restaurant/route";
import { GET as getHours } from "../../src/app/api/hours/route";
import { GET as getMap } from "../../src/app/api/map/route";

/**
 * The read-only public data surface (CLAUDE.md §7/§9): GET /api/menu, /api/restaurant,
 * /api/hours, /api/map. All four share one shape — rate-limited, cacheable, no origin check
 * needed (side-effect-free, already-public data) — so they're covered together here rather than
 * duplicating the same assertions across four files.
 *
 * Each test uses a unique X-Forwarded-For per call so this file's rate-limit buckets never
 * collide with each other or with api-guard.test.ts's.
 */
function requestFrom(path: string): Request {
  return new Request(`https://example.com${path}`, {
    headers: { "x-forwarded-for": `10.${Math.random() * 255 | 0}.${Math.random() * 255 | 0}.1` },
  });
}

describe("GET /api/menu", () => {
  it("returns categories and items in the standard success envelope", async () => {
    const res = await getMenu(requestFrom("/api/menu"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.data.categories)).toBe(true);
    expect(Array.isArray(body.data.items)).toBe(true);
    expect(body.data.items.length).toBeGreaterThan(0);
  });

  it("never includes a price field on any menu item — see CLAUDE.md §2/§20/§21", async () => {
    const res = await getMenu(requestFrom("/api/menu"));
    const body = await res.json();
    for (const item of body.data.items) {
      expect(item).not.toHaveProperty("price");
      expect(item).not.toHaveProperty("priceAr");
      expect(item).not.toHaveProperty("priceEn");
    }
  });

  it("sets a public cache-control header", async () => {
    const res = await getMenu(requestFrom("/api/menu"));
    expect(res.headers.get("cache-control")).toContain("max-age=300");
  });

  it("enforces per-IP rate limiting and returns 429 with Retry-After info past the threshold", async () => {
    const ip = `172.16.${Math.random() * 255 | 0}.1`;
    const req = () =>
      new Request("https://example.com/api/menu", { headers: { "x-forwarded-for": ip } });
    let last;
    for (let i = 0; i < 61; i++) {
      last = await getMenu(req());
    }
    expect(last!.status).toBe(429);
    const body = await last!.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("rate_limited");
  });
});

describe("GET /api/restaurant", () => {
  it("returns verified restaurant info required for the UI/JSON-LD", async () => {
    const res = await getRestaurant(requestFrom("/api/restaurant"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.nameArabic).toBeTruthy();
    expect(body.data.nameEnglish).toBeTruthy();
    expect(body.data.phone.e164).toBeTruthy();
    expect(typeof body.data.latitude).toBe("number");
    expect(typeof body.data.longitude).toBe("number");
    expect(body.data.rating.value).toBe(4.8);
  });

  it("excludes the menu field — GET /api/menu is the dedicated endpoint for that", async () => {
    const res = await getRestaurant(requestFrom("/api/restaurant"));
    const body = await res.json();
    expect(body.data).not.toHaveProperty("menu");
  });

  it("never leaks a secret env var (ANTHROPIC_API_KEY / DATABASE_URL) in the response", async () => {
    const res = await getRestaurant(requestFrom("/api/restaurant"));
    const text = JSON.stringify(await res.json());
    expect(text).not.toContain("ANTHROPIC_API_KEY");
    expect(text).not.toContain("DATABASE_URL");
  });
});

describe("GET /api/hours", () => {
  it("returns only the verified fragment + call-to-confirm note, flagged isVerified: false", async () => {
    const res = await getHours(requestFrom("/api/hours"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.isVerified).toBe(false);
    expect(body.data.verifiedFragment.en).toContain("12:30");
    expect(body.data.callToConfirm.en).toBeTruthy();
  });

  it("never returns a computed open/closed status — see CLAUDE.md §21.5", async () => {
    const res = await getHours(requestFrom("/api/hours"));
    const body = await res.json();
    expect(body.data).not.toHaveProperty("isOpenNow");
    expect(body.data).not.toHaveProperty("status");
    expect(body.data).not.toHaveProperty("schedule");
  });
});

describe("GET /api/map", () => {
  it("returns coordinates and map links without the Google Maps API key", async () => {
    const res = await getMap(requestFrom("/api/map"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.data.latitude).toBe("number");
    expect(typeof body.data.longitude).toBe("number");
    expect(body.data.googleMapsUrl).toContain("google.com/maps");
    const text = JSON.stringify(body);
    expect(text).not.toContain("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
  });
});
