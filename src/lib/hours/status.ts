/**
 * Pure, dependency-free logic for computing a restaurant's open/closed status from a weekly
 * hours schedule, in Asia/Riyadh local time. No restaurant-specific data lives here — see
 * content/hours/weekly-schedule.ts for the (currently NOT VERIFIED placeholder) schedule.
 *
 * Design notes:
 * - Days are indexed 0 (Sunday) – 6 (Saturday), matching both `Date.prototype.getDay()` and the
 *   Sun–Thu/Fri–Sat week convention used in Saudi Arabia.
 * - A day may have multiple periods (e.g. a lunch service and a separate dinner service).
 * - A period whose `closes` time is less than or equal to its `opens` time is treated as
 *   crossing midnight (e.g. opens "17:00", closes "01:00" the next calendar day).
 * - Status is computed against Asia/Riyadh time regardless of the server/browser's own
 *   timezone, using Intl — no manual UTC+3 offset math (which would be wrong the moment Node's
 *   or the browser's environment differs, and fragile if that ever changed).
 */

export const RESTAURANT_TIME_ZONE = "Asia/Riyadh";

export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday .. 6 = Saturday

export interface TimePeriod {
  /** 24-hour "HH:mm", e.g. "12:30" */
  opens: string;
  /** 24-hour "HH:mm". May be "00:00" or otherwise <= `opens` to mean "the next calendar day". */
  closes: string;
}

export interface DaySchedule {
  day: DayIndex;
  /** Empty array = closed all day. */
  periods: TimePeriod[];
}

export type WeeklyHours = DaySchedule[];

export interface RestaurantStatus {
  isOpen: boolean;
  /** The specific period currently open, if any. */
  activePeriod: TimePeriod | null;
  /** Today's schedule entry (Riyadh-local "today"), for display alongside the status. */
  today: DaySchedule | null;
  /** Riyadh-local day index and "HH:mm" the status was computed for. */
  riyadhDay: DayIndex;
  riyadhTime: string;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Reads the current wall-clock day/time in Asia/Riyadh from a UTC instant, via Intl. */
export function getRiyadhNow(instant: Date = new Date()): { day: DayIndex; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: RESTAURANT_TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(instant);

  const weekdayShort = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  // Intl can format hour "24" for midnight with hour12:false in some environments — normalize.
  const hourRaw = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const hour = hourRaw === 24 ? 0 : hourRaw;
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");

  const weekdayIndex: Record<string, DayIndex> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return { day: weekdayIndex[weekdayShort] ?? 0, minutes: hour * 60 + minute };
}

function findDaySchedule(schedule: WeeklyHours, day: DayIndex): DaySchedule | null {
  return schedule.find((d) => d.day === day) ?? null;
}

/**
 * Computes whether the restaurant is currently open, given a full weekly schedule and an
 * instant in time (defaults to now). Correctly handles periods that cross midnight and days
 * with multiple periods by checking both "today" and "yesterday" (Riyadh-local) against a
 * shared minutes-since-yesterday-midnight timeline.
 */
export function getRestaurantStatus(
  schedule: WeeklyHours,
  instant: Date = new Date()
): RestaurantStatus {
  const { day: todayIndex, minutes: nowMinutes } = getRiyadhNow(instant);
  const yesterdayIndex = ((todayIndex + 6) % 7) as DayIndex;

  const today = findDaySchedule(schedule, todayIndex);
  const yesterday = findDaySchedule(schedule, yesterdayIndex);

  const candidates: Array<{ period: TimePeriod; dayOffset: 0 | -1 }> = [
    ...(today?.periods.map((period) => ({ period, dayOffset: 0 as const })) ?? []),
    ...(yesterday?.periods.map((period) => ({ period, dayOffset: -1 as const })) ?? []),
  ];

  for (const { period, dayOffset } of candidates) {
    const rawOpens = toMinutes(period.opens);
    const rawCloses0 = toMinutes(period.closes);
    // A close time at/before the open time means "closes the following calendar day".
    const rawCloses = rawCloses0 <= rawOpens ? rawCloses0 + 1440 : rawCloses0;

    const absOpens = rawOpens + dayOffset * 1440;
    const absCloses = rawCloses + dayOffset * 1440;

    if (nowMinutes >= absOpens && nowMinutes < absCloses) {
      return {
        isOpen: true,
        activePeriod: period,
        today,
        riyadhDay: todayIndex,
        riyadhTime: minutesToHHmm(nowMinutes),
      };
    }
  }

  return {
    isOpen: false,
    activePeriod: null,
    today,
    riyadhDay: todayIndex,
    riyadhTime: minutesToHHmm(nowMinutes),
  };
}

function minutesToHHmm(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
