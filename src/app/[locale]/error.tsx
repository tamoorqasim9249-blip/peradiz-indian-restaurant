"use client";

// Route-level error boundary (Next.js convention) — catches any uncaught error thrown while
// rendering a page or its Server Components under this locale segment. Renders inside
// [locale]/layout.tsx (so Header/Footer/NextIntlClientProvider are still present), which is why
// useTranslations works here. See CLAUDE.md §10/"ERROR HANDLING": production visitors must never
// see a stack trace or raw error message — `error.message` is deliberately never rendered.

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { restaurantFacts } from "../../../content/restaurant-facts";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errorPage");

  useEffect(() => {
    // Client-side visibility only (browser console / error-reporting tooling a developer has
    // open) — this never reaches the server logger and never renders to the page, so it can't
    // leak anything to a visitor. `digest` is Next.js's own opaque reference id for correlating
    // with server-side logs, not the error detail itself.
    console.error("[locale error boundary]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-5 py-24">
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <h1 className="font-display text-3xl text-ink">{t("title")}</h1>
        <p className="text-base text-ink/65">{t("description")}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-chili px-6 py-3 text-sm font-medium tracking-wide text-paper shadow-[0_8px_24px_-8px_rgba(195,31,42,0.55)] transition-all duration-300 hover:bg-chili-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chili"
          >
            {t("retry")}
          </button>
          <a
            href={restaurantFacts.contact.phoneTel}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-transparent px-6 py-3 text-sm font-medium tracking-wide text-ink transition-all duration-300 hover:border-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chili"
          >
            {t("callUs")}
          </a>
        </div>
      </div>
    </div>
  );
}
