import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/site";

/**
 * Every real route in the app, relative to the `/[locale]` segment. Keep in sync with
 * `src/app/[locale]/*` — see CLAUDE.md §12. The home route is `""`.
 */
const routePaths = ["", "/menu", "/about", "/gallery", "/contact", "/reservations"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routePaths.map((path) => ({
    url: `${siteUrl}/${routing.defaultLocale}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [locale, `${siteUrl}/${locale}${path}`]),
      ),
    },
  }));
}
