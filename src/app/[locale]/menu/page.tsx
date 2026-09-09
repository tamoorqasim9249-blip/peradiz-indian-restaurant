import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Container } from "@/components/ui/Container";
import { MenuBrowser } from "@/components/sections/MenuBrowser";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "قائمة الطعام" : "Menu",
    description: isAr
      ? "تصفح قائمة بيراديز — نكهات هندية أصيلة من المقبلات إلى البرياني والحلويات."
      : "Browse the Peradiz menu — authentic Indian flavors from starters to biryani and beyond.",
    alternates: {
      canonical: `/${locale}/menu`,
      languages: { ar: "/ar/menu", en: "/en/menu" },
    },
  };
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("menuPage");

  return (
    <div className="bg-paper py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col gap-3 text-center">
          <span className="font-display text-sm uppercase tracking-[0.25em] text-chili">
            Peradiz
          </span>
          <h1 className="font-display text-4xl text-ink sm:text-5xl">{t("title")}</h1>
          <p className="mx-auto max-w-xl text-ink/60">{t("subtitle")}</p>
          <p className="mx-auto max-w-xl text-sm font-medium text-gold">{t("priceNote")}</p>
        </div>

        <MenuBrowser />
      </Container>
    </div>
  );
}
