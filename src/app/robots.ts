import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // No admin/API surface worth hiding (CLAUDE.md §7 — no admin UI in v1); API routes are
      // POST-only and not crawlable content anyway, so there's nothing else to disallow.
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
