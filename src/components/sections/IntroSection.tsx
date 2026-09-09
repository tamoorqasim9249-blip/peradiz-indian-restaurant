import { useTranslations } from "next-intl";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";

export function IntroSection() {
  const t = useTranslations("intro");

  return (
    <section className="bg-paper py-20 sm:py-28">
      <Container className="flex flex-col items-center gap-6 text-center">
        <SectionHeading
          align="center"
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("body")}
        />
        <div className="mt-2 h-px w-16 bg-gold" />
      </Container>
    </section>
  );
}
