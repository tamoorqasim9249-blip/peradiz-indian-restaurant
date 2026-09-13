"use client";

// Last-resort error boundary (Next.js convention) — only fires if [locale]/layout.tsx itself
// throws, so it cannot rely on next-intl's provider (which that layout sets up) being mounted.
// It must render its own <html>/<body> since it replaces the entire root layout output. Kept
// deliberately simple and bilingual-neutral (no next-intl dependency) — this path should be rare
// in practice. See CLAUDE.md §10/"ERROR HANDLING": never render `error.message` to the visitor.

import { useEffect } from "react";
import "./globals.css";
import { restaurantFacts } from "../../content/restaurant-facts";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global error boundary]", error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-paper text-ink">
        <div className="flex min-h-screen items-center justify-center px-5 py-24">
          <div className="flex max-w-md flex-col items-center gap-5 text-center">
            <h1 className="text-3xl font-semibold">Something Went Wrong</h1>
            <p dir="rtl" lang="ar" className="text-lg">
              حدث خطأ غير متوقع
            </p>
            <p className="text-base text-ink/65">
              We hit an unexpected error on our end. Please try again, or call us directly at{" "}
              <a href={restaurantFacts.contact.phoneTel} className="underline hover:text-chili">
                {restaurantFacts.contact.phoneDisplay}
              </a>
              .
            </p>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-chili px-6 py-3 text-sm font-medium tracking-wide text-paper transition-all duration-300 hover:bg-chili-dark"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
