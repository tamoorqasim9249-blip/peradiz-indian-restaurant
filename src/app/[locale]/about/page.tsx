import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Container } from "@/components/ui/Container";
import { RatingBadge } from "@/components/sections/RatingBadge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "من نحن" : "About",
    description: isAr
      ? "تعرف على قصة مطعم بيراديز الهندي في العليا، الرياض."
      : "Learn the story behind Peradiz Indian Restaurant in Al Olaya, Riyadh.",
    alternates: {
      canonical: `/${locale}/about`,
      languages: { ar: "/ar/about", en: "/en/about" },
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("aboutPage");

  return (
    <div className="bg-paper py-16 sm:py-24">
      <Container className="flex flex-col gap-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="font-display text-sm uppercase tracking-[0.25em] text-chili">
            {t("subtitle")}
          </span>
          <h1 className="font-display text-4xl text-ink sm:text-5xl">{t("title")}</h1>
          <RatingBadge tone="dark" />
        </div>

        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl md:order-2">
            <Image
              src="/images/interior/interior-1.jpg"
              alt=""
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-ink/10" />
          </div>
          <div className="flex flex-col gap-4 md:order-1">
            <h2 className="font-display text-2xl text-ink">{t("storyTitle")}</h2>
            <p className="text-ink/70">{t("story")}</p>
          </div>
        </div>

        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-2xl text-ink">{t("diningTitle")}</h2>
            <p className="text-ink/70">{t("dining")}</p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <Image
              src="/images/interior/interior-3.jpg"
              alt=""
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-ink/10" />
          </div>
        </div>
      </Container>
    </div>
  );
}
