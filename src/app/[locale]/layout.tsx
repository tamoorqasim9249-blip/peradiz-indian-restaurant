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

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const notoKufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-kufi",
  display: "swap",
});
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
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
