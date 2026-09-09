import { setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Hero } from "@/components/sections/Hero";
import { IntroSection } from "@/components/sections/IntroSection";
import { FeaturedDishes } from "@/components/sections/FeaturedDishes";
import { AboutSection } from "@/components/sections/AboutSection";
import { MenuPreview } from "@/components/sections/MenuPreview";
import { HoursLocation } from "@/components/sections/HoursLocation";
import { CTASection } from "@/components/sections/CTASection";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <IntroSection />
      <FeaturedDishes />
      <AboutSection />
      <MenuPreview />
      <HoursLocation />
      <CTASection />
    </>
  );
}
