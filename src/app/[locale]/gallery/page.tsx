import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { Container } from "@/components/ui/Container";
import { GalleryGrid } from "@/components/sections/GalleryGrid";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return buildPageMetadata({
    locale: locale as AppLocale,
    path: "/gallery",
    title: isAr ? "معرض الصور" : "Gallery",
    description: isAr
      ? "لمحة عن أجواء بيراديز — الواجهة الخارجية، التصميم الداخلي، الأطباق المميزة، وتقديم الطعام."
      : "A glimpse into the Peradiz atmosphere — exterior, interior, signature dishes, and food presentation.",
  });
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("galleryPage");

  return (
    <div className="bg-paper py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col gap-3 text-center">
          <span className="font-display text-sm uppercase tracking-[0.25em] text-chili">
            Peradiz
          </span>
          <h1 className="font-display text-4xl text-ink sm:text-5xl">{t("title")}</h1>
          <p className="mx-auto max-w-xl text-ink/60">{t("subtitle")}</p>
          <p className="mx-auto max-w-xl text-sm font-medium text-gold">{t("placeholderNote")}</p>
        </div>

        <GalleryGrid />
      </Container>
    </div>
  );
}
