"use client";

// Contact form — client component (react-hook-form + zod) per CLAUDE.md §6/§14. Submits to
// POST /api/contact, which re-validates with the same zod schema server-side (CLAUDE.md §17,
// "never re-implement validation logic twice"; §10, "never trust client-side validation alone").

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import type { z } from "zod";
import { contactSchema } from "@/lib/validation/contact-schema";
import { FormField, formInputClass } from "./FormField";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";

// Zod's `.default()` on `locale` makes the parsed *output* type required while the raw *input*
// (what the form actually holds before submit-time validation) keeps it optional — react-hook-form
// needs both: the input shape for field registration/defaultValues, the output shape for onSubmit.
type ContactFormValues = z.input<typeof contactSchema>;
type ContactSubmitValues = z.output<typeof contactSchema>;

export function ContactForm() {
  const t = useTranslations("contactPage");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "ar" | "en";
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues, unknown, ContactSubmitValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", phone: "", email: "", message: "", locale, website: "" },
  });

  async function onSubmit(data: ContactSubmitValues) {
    setSubmitError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale }),
      });
      if (!res.ok) throw new Error("request_failed");
      setSubmitted(true);
      reset({ name: "", phone: "", email: "", message: "", locale, website: "" });
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
      {/* Honeypot — invisible to real visitors, left empty; bots that auto-fill every field trip
          it. See CLAUDE.md §10/§20 (no paid CAPTCHA in v1). */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <FormField label={t("name")} htmlFor="contact-name" error={errors.name && tCommon("required")}>
        <input id="contact-name" type="text" autoComplete="name" {...register("name")} className={formInputClass} />
      </FormField>

      <FormField label={t("phone")} htmlFor="contact-phone" error={errors.phone && tCommon("required")}>
        <input
          id="contact-phone"
          type="tel"
          dir="ltr"
          autoComplete="tel"
          {...register("phone")}
          className={formInputClass}
        />
      </FormField>

      <FormField label={t("email")} htmlFor="contact-email" error={errors.email?.message}>
        <input
          id="contact-email"
          type="email"
          dir="ltr"
          autoComplete="email"
          {...register("email")}
          className={formInputClass}
        />
      </FormField>

      <FormField label={t("message")} htmlFor="contact-message" error={errors.message && tCommon("required")}>
        <textarea id="contact-message" rows={5} {...register("message")} className={formInputClass} />
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
