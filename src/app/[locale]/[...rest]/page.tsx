import { notFound } from "next/navigation";

// Catch-all for any unmatched path under a valid locale prefix (e.g. /en/typo-url). Without this,
// Next.js never matches a route here at all, so it never mounts [locale]/layout.tsx — meaning
// [locale]/not-found.tsx (the branded, bilingual 404) never renders, and visitors see Next's
// generic unbranded default instead. This route exists only to force the match and hand off to
// notFound(), which then renders the sibling not-found.tsx. Standard next-intl pattern for this —
// see https://next-intl.dev/docs/environments/error-files#catch-all-route.
export default function CatchAll() {
  notFound();
}
