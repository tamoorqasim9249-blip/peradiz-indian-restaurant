import { describe, it, expect } from "vitest";
import { getRestaurantStatus, type WeeklyHours } from "../../src/lib/hours/status";

/**
 * `getRestaurantStatus` is pure and timezone-explicit (Asia/Riyadh), so tests construct precise
 * UTC instants (Riyadh is UTC+3, no DST) rather than relying on the machine running the tests.
 */

// Riyadh is always UTC+3 — helper to build a UTC Date for a given Riyadh wall-clock time.
function riyadh(year: number, month: number, day: number, hour: number, minute = 0): Date {
  return new Date(Date.UTC(year, month - 1, day, hour - 3, minute));
}

describe("getRestaurantStatus", () => {
  it("reports open during a normal same-day period", () => {
    // 2026-09-07 is a Monday.
    const schedule: WeeklyHours = [
      { day: 1, periods: [{ opens: "12:30", closes: "23:00" }] },
    ];
    const status = getRestaurantStatus(schedule, riyadh(2026, 9, 7, 15, 0));
    expect(status.isOpen).toBe(true);
    expect(status.activePeriod?.opens).toBe("12:30");
  });

  it("reports closed before opening and after closing on a normal day", () => {
    const schedule: WeeklyHours = [
      { day: 1, periods: [{ opens: "12:30", closes: "23:00" }] },
    ];
    expect(getRestaurantStatus(schedule, riyadh(2026, 9, 7, 10, 0)).isOpen).toBe(false);
    expect(getRestaurantStatus(schedule, riyadh(2026, 9, 7, 23, 30)).isOpen).toBe(false);
  });

  it("handles a period that closes at midnight", () => {
    const schedule: WeeklyHours = [
      { day: 1, periods: [{ opens: "12:30", closes: "00:00" }] },
    ];
    // 23:45 Monday — still within the period (closes at midnight).
    expect(getRestaurantStatus(schedule, riyadh(2026, 9, 7, 23, 45)).isOpen).toBe(true);
    // 00:15 Tuesday — the period closed at midnight, so this is now closed.
    expect(getRestaurantStatus(schedule, riyadh(2026, 9, 8, 0, 15)).isOpen).toBe(false);
  });

  it("handles a period that crosses midnight into the next day", () => {
    // Opens 17:00 Monday, closes 01:00 Tuesday.
    const schedule: WeeklyHours = [
      { day: 1, periods: [{ opens: "17:00", closes: "01:00" }] },
      { day: 2, periods: [] },
    ];
    // 23:30 Monday — within the period.
    expect(getRestaurantStatus(schedule, riyadh(2026, 9, 7, 23, 30)).isOpen).toBe(true);
    // 00:30 Tuesday — still within the same overnight period (spillover from Monday).
    const spillover = getRestaurantStatus(schedule, riyadh(2026, 9, 8, 0, 30));
    expect(spillover.isOpen).toBe(true);
    expect(spillover.activePeriod?.opens).toBe("17:00");
    // 01:30 Tuesday — past the 01:00 close, and Tuesday itself has no periods.
    expect(getRestaurantStatus(schedule, riyadh(2026, 9, 8, 1, 30)).isOpen).toBe(false);
  });

  it("supports multiple periods in a single day (lunch + dinner)", () => {
    const schedule: WeeklyHours = [
      {
        day: 1,
        periods: [
          { opens: "12:00", closes: "15:00" },
          { opens: "18:00", closes: "23:00" },
        ],
      },
    ];
    // Between the two periods — closed.
    expect(getRestaurantStatus(schedule, riyadh(2026, 9, 7, 16, 0)).isOpen).toBe(false);
    // Within the first period.
    expect(getRestaurantStatus(schedule, riyadh(2026, 9, 7, 13, 0)).isOpen).toBe(true);
    // Within the second period.
    expect(getRestaurantStatus(schedule, riyadh(2026, 9, 7, 19, 0)).isOpen).toBe(true);
  });

  it("reports closed on a day with no periods at all", () => {
    const schedule: WeeklyHours = [{ day: 1, periods: [] }];
    expect(getRestaurantStatus(schedule, riyadh(2026, 9, 7, 13, 0)).isOpen).toBe(false);
  });

  it("computes status using Riyadh local time, not server/UTC time", () => {
    // 22:30 UTC on 2026-09-07 is 01:30 Riyadh time on 2026-09-08 (a Tuesday).
    const schedule: WeeklyHours = [
      { day: 1, periods: [{ opens: "12:30", closes: "23:00" }] }, // Monday
      { day: 2, periods: [{ opens: "12:30", closes: "23:00" }] }, // Tuesday
    ];
    const instant = new Date(Date.UTC(2026, 8, 7, 22, 30)); // 2026-09-07T22:30:00Z
    const status = getRestaurantStatus(schedule, instant);
    expect(status.riyadhDay).toBe(2); // Tuesday in Riyadh, not Monday (UTC's day)
    expect(status.isOpen).toBe(false); // 01:30 is before Tuesday's 12:30 opening
  });
});
