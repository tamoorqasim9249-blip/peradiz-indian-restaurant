import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "../ui/Container";
import { RatingBadge } from "./RatingBadge";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative isolate overflow-hidden bg-ink text-paper">
      <div className="absolute inset-0">
        <Image
          src="/images/hero/hero-1.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-transparent to-transparent" />
      </div>

      <Container className="relative flex min-h-[88vh] flex-col justify-end gap-8 py-24 sm:min-h-[92vh]">
        <span className="font-display text-sm uppercase tracking-[0.35em] text-gold">
          {t("eyebrow")}
        </span>

        <h1 className="font-display max-w-3xl text-5xl leading-[1.05] sm:text-6xl md:text-7xl">
          {t("titleLine1")}
          <br />
          <span className="text-chili">{t("titleLine2")}</span>
        </h1>

        <p className="max-w-xl text-lg text-paper/80 sm:text-xl">{t("subtitle")}</p>

        <RatingBadge tone="light" />

        <div className="mt-4 flex flex-wrap gap-4">
          <Link
            href="/menu"
            className="inline-flex items-center justify-center rounded-full bg-chili px-7 py-3.5 text-sm font-medium tracking-wide text-paper shadow-[0_10px_30px_-8px_rgba(195,31,42,0.65)] transition-transform hover:scale-[1.03]"
          >
            {t("ctaMenu")}
          </Link>
          <Link
            href="/reservations"
            className="inline-flex items-center justify-center rounded-full border border-paper/40 px-7 py-3.5 text-sm font-medium tracking-wide text-paper transition-colors hover:border-paper hover:bg-paper/10"
          >
            {t("ctaReserve")}
          </Link>
        </div>
      </Container>
    </section>
  );
}
