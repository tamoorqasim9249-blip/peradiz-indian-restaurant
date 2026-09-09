import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "../ui/Container";

export function CTASection() {
  const t = useTranslations("cta");

  return (
    <section className="relative overflow-hidden bg-ink py-20 text-paper sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(195,31,42,0.25),transparent_55%)]" />
      <Container className="relative flex flex-col items-center gap-6 text-center">
        <h2 className="font-display max-w-2xl text-3xl sm:text-4xl md:text-5xl">{t("title")}</h2>
        <p className="max-w-xl text-paper/70">{t("subtitle")}</p>
        <Link
          href="/reservations"
          className="mt-2 inline-flex items-center justify-center rounded-full bg-chili px-8 py-3.5 text-sm font-medium tracking-wide text-paper shadow-[0_10px_30px_-8px_rgba(195,31,42,0.65)] transition-transform hover:scale-[1.03]"
        >
          {t("button")}
        </Link>
      </Container>
    </section>
  );
}
