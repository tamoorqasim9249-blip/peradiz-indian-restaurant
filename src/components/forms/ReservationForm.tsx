"use client";

// Reservation-request form — see CLAUDE.md §1/§8: this creates a `ReservationRequest` row for
// staff to confirm by phone, it is NOT a live booking system. Same client+server zod pattern as
// ContactForm.tsx.

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import type { z } from "zod";
import { reservationSchema } from "@/lib/validation/reservation-schema";
import { FormField, formInputClass } from "./FormField";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";

// See ContactForm.tsx for why both the input and output types of the schema are needed here.
type ReservationFormValues = z.input<typeof reservationSchema>;
type ReservationSubmitValues = z.output<typeof reservationSchema>;

export function ReservationForm() {
  const t = useTranslations("reservationsPage");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "ar" | "en";
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReservationFormValues, unknown, ReservationSubmitValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      partySize: 2,
      preferredDate: "",
      preferredTime: "",
      notes: "",
      contactMethod: "PHONE",
      locale,
      website: "",
    },
  });

  async function onSubmit(data: ReservationSubmitValues) {
    setSubmitError(null);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale }),
      });
      if (!res.ok) throw new Error("request_failed");
      setSubmitted(true);
      reset({
        name: "",
        phone: "",
        email: "",
        partySize: 2,
        preferredDate: "",
        preferredTime: "",
        notes: "",
        contactMethod: "PHONE",
        locale,
        website: "",
      });
    } catch {
      setSubmitError(t("error"));
    }
  }

  if (submitted) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-emerald-600/20 bg-emerald-600/5 px-5 py-6 text-emerald-800"
      >
        {t("success")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {/* Honeypot — see ContactForm.tsx. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="reservation-website">Website</label>
        <input
          id="reservation-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <FormField label={t("name")} htmlFor="reservation-name" error={errors.name && tCommon("required")}>
        <input
          id="reservation-name"
          type="text"
          autoComplete="name"
          {...register("name")}
          className={formInputClass}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label={t("phone")} htmlFor="reservation-phone" error={errors.phone && tCommon("required")}>
          <input
            id="reservation-phone"
            type="tel"
            dir="ltr"
            autoComplete="tel"
            {...register("phone")}
            className={formInputClass}
          />
        </FormField>

        <FormField label={t("email")} htmlFor="reservation-email" error={errors.email?.message}>
          <input
            id="reservation-email"
            type="email"
            dir="ltr"
            autoComplete="email"
            {...register("email")}
            className={formInputClass}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <FormField
          label={t("partySize")}
          htmlFor="reservation-partySize"
          error={errors.partySize && tCommon("required")}
        >
          <input
            id="reservation-partySize"
            type="number"
            min={1}
            max={30}
            dir="ltr"
            {...register("partySize")}
            className={formInputClass}
          />
        </FormField>

        <FormField label={t("date")} htmlFor="reservation-date" error={errors.preferredDate && tCommon("required")}>
          <input
            id="reservation-date"
            type="date"
            dir="ltr"
            {...register("preferredDate")}
            className={formInputClass}
          />
        </FormField>

        <FormField label={t("time")} htmlFor="reservation-time" error={errors.preferredTime && tCommon("required")}>
          <input
            id="reservation-time"
            type="time"
            dir="ltr"
            {...register("preferredTime")}
            className={formInputClass}
          />
        </FormField>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-ink/80">{t("contactMethod")}</legend>
        <div className="flex gap-5">
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input type="radio" value="PHONE" {...register("contactMethod")} className="accent-chili" />
            {t("contactPhone")}
          </label>
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input type="radio" value="EMAIL" {...register("contactMethod")} className="accent-chili" />
            {t("contactEmail")}
          </label>
        </div>
      </fieldset>

      <FormField label={t("notes")} htmlFor="reservation-notes">
        <textarea id="reservation-notes" rows={3} {...register("notes")} className={formInputClass} />
      </FormField>

      {submitError && <ErrorState message={submitError} />}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-chili px-6 py-3 text-sm font-medium tracking-wide text-paper shadow-[0_8px_24px_-8px_rgba(195,31,42,0.55)] transition-all duration-300 hover:bg-chili-dark disabled:opacity-60"
      >
        {t("submit")}
      </button>
      {isSubmitting && <LoadingState label={t("submitting")} />}
    </form>
  );
}
