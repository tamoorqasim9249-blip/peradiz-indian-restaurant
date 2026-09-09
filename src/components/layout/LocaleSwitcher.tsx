"use client";

import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";

const labels: Record<string, string> = { ar: "العربية", en: "English" };
const otherLocale: Record<string, "ar" | "en"> = { ar: "en", en: "ar" };

export function LocaleSwitcher({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const locale = useLocale();
  const pathname = usePathname();
  const target = otherLocale[locale] ?? "en";

  return (
    <Link
      href={pathname}
      locale={target}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        tone === "dark"
          ? "border-ink/20 text-ink hover:border-ink/50"
          : "border-paper/30 text-paper hover:border-paper/70"
      }`}
      aria-label={`Switch language to ${labels[target]}`}
    >
      {labels[target]}
    </Link>
  );
}
