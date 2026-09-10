import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Container } from "@/components/ui/Container";
import { ReservationForm } from "@/components/forms/ReservationForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "طلب حجز" : "Reservations",
    description: isAr
      ? "اطلب حجزاً في مطعم بيراديز الهندي — سيتصل بك فريقنا للتأكيد."
      : "Request a table at Peradiz Indian Restaurant — our team will call to confirm.",
    alternates: {
      canonical: `/${locale}/reservations`,
      languages: { ar: "/ar/reservations", en: "/en/reservations" },
    },
  };
}

export default async function ReservationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("reservationsPage");

  return (
    <div className="bg-paper py-16 sm:py-24">
      <Container className="mx-auto flex max-w-2xl flex-col gap-8">
        <div className="flex flex-col gap-3 text-center">
          <span className="font-display text-sm uppercase tracking-[0.25em] text-chili">
            Peradiz
          </span>
          <h1 className="font-display text-4xl text-ink sm:text-5xl">{t("title")}</h1>
          <p className="mx-auto max-w-lg text-ink/60">{t("subtitle")}</p>
          <p className="mx-auto max-w-lg rounded-xl bg-gold/10 px-4 py-2.5 text-sm font-medium text-gold">
            {t("disclaimer")}
          </p>
        </div>

        <div className="rounded-3xl border border-ink/10 bg-white/40 p-6 sm:p-8">
          <ReservationForm />
        </div>
      </Container>
    </div>
  );
}
