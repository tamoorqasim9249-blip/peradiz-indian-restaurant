import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/forms/ContactForm";
import { restaurantFacts } from "../../../../content/restaurant-facts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "تواصل معنا" : "Contact",
    description: isAr
      ? "تواصل مع مطعم بيراديز الهندي في العليا، الرياض."
      : "Get in touch with Peradiz Indian Restaurant in Al Olaya, Riyadh.",
    alternates: {
      canonical: `/${locale}/contact`,
      languages: { ar: "/ar/contact", en: "/en/contact" },
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("contactPage");
  const tLocation = await getTranslations("location");
  const isAr = locale === "ar";

  return (
    <div className="bg-paper py-16 sm:py-24">
      <Container className="grid gap-12 md:grid-cols-2 md:gap-16">
        <div className="flex flex-col gap-3">
          <span className="font-display text-sm uppercase tracking-[0.25em] text-chili">
            Peradiz
          </span>
          <h1 className="font-display text-4xl text-ink sm:text-5xl">{t("title")}</h1>
          <p className="max-w-md text-ink/60">{t("subtitle")}</p>

          <dl className="mt-6 flex flex-col gap-4 text-sm">
            <div>
              <dt className="font-medium text-ink/80">{tLocation("phone")}</dt>
              <dd>
                <a href={restaurantFacts.contact.phoneTel} dir="ltr" className="text-ink/60 hover:text-chili">
                  {restaurantFacts.contact.phoneDisplay}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-ink/80">{tLocation("address")}</dt>
              <dd className="text-ink/60">{isAr ? restaurantFacts.location.addressAr : restaurantFacts.location.addressEn}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-3xl border border-ink/10 bg-white/40 p-6 sm:p-8">
          <h2 className="font-display mb-6 text-xl text-ink">{t("formTitle")}</h2>
          <ContactForm />
        </div>
      </Container>
    </div>
  );
}
