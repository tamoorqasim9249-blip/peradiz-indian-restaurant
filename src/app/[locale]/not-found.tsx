// Route-level 404 (Next.js convention) — fires for any unmatched path under a valid locale
// segment, and for `notFound()` calls (e.g. an invalid locale in layout.tsx/page.tsx). Renders
// inside [locale]/layout.tsx (so Header/Footer/NextIntlClientProvider are still present), which
// is why useTranslations works here. Without this file Next.js falls back to its unbranded
// default 404 — see CLAUDE.md "QUALITY STANDARD" / empty states.
//
// A Server Component (no interactivity needed, unlike error.tsx's `reset()`) — see CLAUDE.md §14
// ("no unnecessary client components").

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { restaurantFacts } from "../../../content/restaurant-facts";

export default function LocaleNotFound() {
  const t = useTranslations("notFoundPage");

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-5 py-24">
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <span className="font-display text-6xl text-chili/90" aria-hidden="true">
          404
        </span>
        <h1 className="font-display text-3xl text-ink">{t("title")}</h1>
        <p className="text-base text-ink/65">{t("description")}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-chili px-6 py-3 text-sm font-medium tracking-wide text-paper shadow-[0_8px_24px_-8px_rgba(195,31,42,0.55)] transition-all duration-300 hover:bg-chili-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chili"
          >
            {t("backHome")}
          </Link>
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
