import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  Playfair_Display,
  Inter,
  Noto_Kufi_Arabic,
  IBM_Plex_Sans_Arabic,
} from "next/font/google";
import { routing, localeDirection, type AppLocale } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { buildRestaurantJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { siteUrl } from "@/lib/site";
import { restaurantFacts } from "../../../content/restaurant-facts";
import "../globals.css";

// Font loaders must be called at module top level, and this one `[locale]/layout.tsx` file
// renders BOTH locale route trees — so Next.js cannot tell, at build time, which pair of
// fonts a given request will actually need, and (with the default `preload: true`) would emit
// a <link rel="preload" as="font"> for all four families on every request to either locale.
// Concretely: an /en visitor was downloading the Arabic Noto Kufi + IBM Plex Sans Arabic (4
// weights) font files, and an /ar visitor was downloading Playfair + Inter, even though
// globals.css's `[dir="rtl"]`/`[dir="ltr"]` rules (see CLAUDE.md §14) mean only 2 of the 4 are
// ever rendered with on a given page. `preload: false` here stops that wasted fetch; `display:
// "swap"` (kept below) still avoids invisible text while the *correct* 2 fonts load.
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  preload: false,
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});
const notoKufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-kufi",
  display: "swap",
  preload: false,
});
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
  preload: false,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  const title = isAr
    ? `${restaurantFacts.brand.nameAr} | ${restaurantFacts.brand.shortNameEn}`
    : `${restaurantFacts.brand.nameEn}`;
  const description = isAr
    ? "تجربة طعام هندي فاخرة في قلب العليا، الرياض — نكهات أصيلة وتقديم استثنائي."
    : "A premium Indian dining experience in the heart of Al Olaya, Riyadh — authentic flavors, exceptional presentation.";

  const pageMetadata = buildPageMetadata({ locale: locale as AppLocale, title, description });

  return {
    metadataBase: new URL(siteUrl),
    // The home route's own title/description are wrapped in the `default`/`template` pair so
    // every other route's plain string title (e.g. "Menu") becomes "Menu | Peradiz" for free.
    title: {
      default: title,
      template: `%s | ${restaurantFacts.brand.shortNameEn}`,
    },
    description,
    alternates: pageMetadata.alternates,
    openGraph: pageMetadata.openGraph,
    twitter: pageMetadata.twitter,
    icons: {
      icon: restaurantFacts.brand.logoPath,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = localeDirection[locale as AppLocale];
  const jsonLd = buildRestaurantJsonLd(siteUrl, locale as AppLocale);

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${playfair.variable} ${inter.variable} ${notoKufi.variable} ${plexArabic.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        {/* Sanctioned dangerouslySetInnerHTML exception (CLAUDE.md §10): static, server-built
            JSON from lib/seo/json-ld.ts — never user input. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatWidget />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
