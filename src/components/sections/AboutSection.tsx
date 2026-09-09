import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.12" />
      <path
        d="M7.5 12.5l3 3 6-6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AboutSection() {
  const t = useTranslations("about");

  const services = [
    { key: "dineIn" },
    { key: "takeaway" },
    { key: "delivery" },
    { key: "familyRooms" },
  ] as const;

  return (
    <section className="bg-ink py-20 text-paper sm:py-28">
      <Container className="grid items-center gap-12 md:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
          <Image
            src="/images/interior/interior-2.jpg"
            alt=""
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-paper/10" />
        </div>

        <div className="flex flex-col gap-6">
          <SectionHeading tone="light" eyebrow={t("eyebrow")} title={t("title")} />
          <p className="text-paper/75">{t("body1")}</p>
          <p className="text-paper/75">{t("body2")}</p>

          <div className="mt-2">
            <h3 className="font-display text-sm uppercase tracking-[0.2em] text-gold">
              {t("serviceOptions")}
            </h3>
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {services.map((s) => (
                <li key={s.key} className="flex items-center gap-2.5 text-sm text-paper/85">
                  <span className="text-chili">
                    <CheckIcon />
                  </span>
                  {t(s.key)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
