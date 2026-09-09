"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  getRestaurantStatus,
  type WeeklyHours,
  type DayIndex,
} from "@/lib/hours/status";
import { dayName } from "../../../content/hours/weekly-schedule";

/**
 * Premium opening-hours card: per-day open/close times (supporting multiple periods and
 * midnight-crossing closes) plus a live OPEN NOW / CLOSED badge computed in Asia/Riyadh time
 * from the supplied `schedule` — never hardcoded. See src/lib/hours/status.ts for the
 * computation and content/hours/weekly-schedule.ts for the (currently NOT VERIFIED placeholder)
 * data this reads.
 *
 * NOT mounted on any live page yet — see content/hours/weekly-schedule.ts and CLAUDE.md §21.
 * Once real hours are confirmed and added to the source-of-truth content file, render this
 * component (e.g. in HoursLocation.tsx) with the real schedule and set `isVerified`.
 */
export function OpeningHoursTable({
  schedule,
  isVerified,
  className = "",
}: {
  schedule: WeeklyHours;
  isVerified: boolean;
  className?: string;
}) {
  const t = useTranslations("hours");
  const locale = useLocale() as "ar" | "en";
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const status = getRestaurantStatus(schedule, now);
  const orderedDays: DayIndex[] = [0, 1, 2, 3, 4, 5, 6];

  return (
    <div className={`rounded-3xl border border-ink/10 bg-white/50 p-6 sm:p-8 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-xl text-ink">{t("title")}</h3>
        <span
          role="status"
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide ${
            status.isOpen
              ? "bg-chili/10 text-chili"
              : "bg-ink/10 text-ink/60"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              status.isOpen ? "bg-chili" : "bg-ink/40"
            }`}
            aria-hidden="true"
          />
          {status.isOpen ? t("openNow") : t("closed")}
        </span>
      </div>

      <ul className="mt-5 flex flex-col divide-y divide-ink/10">
        {orderedDays.map((day) => {
          const daySchedule = schedule.find((d) => d.day === day);
          const isToday = day === status.riyadhDay;

          return (
            <li
              key={day}
              className={`flex items-center justify-between gap-4 py-2.5 text-sm ${
                isToday ? "font-semibold text-ink" : "text-ink/70"
              }`}
            >
              <span className="flex items-center gap-2">
                {dayName(day, locale)}
                {isToday && (
                  <span className="rounded-full bg-chili/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-chili">
                    {t("today")}
                  </span>
                )}
              </span>
              <span dir="ltr" className="text-end">
                {daySchedule && daySchedule.periods.length > 0
                  ? daySchedule.periods
                      .map((p) => `${formatTime(p.opens, locale)} – ${formatTime(p.closes, locale)}`)
                      .join(", ")
                  : t("closedAllDay")}
              </span>
            </li>
          );
        })}
      </ul>

      {!isVerified && (
        <p className="mt-5 rounded-xl bg-gold/10 px-4 py-3 text-xs leading-relaxed text-ink/70">
          {t("notVerifiedNotice")}
        </p>
      )}
    </div>
  );
}

function formatTime(hhmm: string, locale: "ar" | "en"): string {
  const [h, m] = hhmm.split(":").map(Number);
  const asDate = new Date(Date.UTC(2000, 0, 1, h, m));
  return asDate.toLocaleTimeString(locale === "ar" ? "ar-SA" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
}
