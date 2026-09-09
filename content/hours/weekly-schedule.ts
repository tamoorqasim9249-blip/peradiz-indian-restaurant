import type { DayIndex, WeeklyHours } from "../../src/lib/hours/status";

/**
 * NOT VERIFIED — placeholder weekly opening-hours schedule.
 *
 * See CLAUDE.md §2/§21 and `content/restaurant-facts.ts` `hours`: only the fragment
 * "Opens 12:30 PM" is confirmed for the Al Olaya branch. No closing time and no schedule for
 * any other day of the week has been verified, and the Qurtubah sister branch's hours must
 * never be substituted in here.
 *
 * This file exists only to exercise the reusable opening-hours engine
 * (`src/lib/hours/status.ts`) and component (`src/components/sections/OpeningHoursTable.tsx`)
 * during development. `isVerified: false` below is load-bearing — `OpeningHoursTable` renders a
 * visible "not yet confirmed" notice whenever it's false, and this schedule is NOT imported by
 * any live, visitor-facing page (see CLAUDE.md §6/§21). Replace the `periods` below with the
 * real, sourced hours — and flip `isVerified` to `true` — before ever wiring this into the site,
 * per CLAUDE.md §21.3 ("new information must be added to the source-of-truth file first").
 */
export const isVerified = false as const;

const daysAr: Record<DayIndex, string> = {
  0: "الأحد",
  1: "الاثنين",
  2: "الثلاثاء",
  3: "الأربعاء",
  4: "الخميس",
  5: "الجمعة",
  6: "السبت",
};

const daysEn: Record<DayIndex, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export function dayName(day: DayIndex, locale: "ar" | "en"): string {
  return locale === "ar" ? daysAr[day] : daysEn[day];
}

// Placeholder example only — NOT VERIFIED. A single evening period every day, matching only the
// one confirmed data point (opens 12:30 PM) and otherwise illustrative, not factual.
export const weeklyHoursSchedule: WeeklyHours = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
  day: day as DayIndex,
  periods: [{ opens: "12:30", closes: "00:00" }],
}));
