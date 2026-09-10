import { useLocale, useTranslations } from "next-intl";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Button } from "../ui/Button";
import { menuCategories } from "../../../content/menu/categories";
import { menuItems } from "../../../content/menu/items";

export function MenuPreview() {
  const t = useTranslations("menuPreview");
  const highlights = useTranslations("highlights");
  const locale = useLocale();
  const isAr = locale === "ar";

  const activeCategories = menuCategories.filter((c) => !c.isPlaceholder);

  return (
    <section className="bg-paper py-20 sm:py-28">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow={isAr ? "قائمتنا" : "Our Menu"} title={t("title")} subtitle={t("subtitle")} />

        <div className="flex flex-wrap gap-2.5">
          {activeCategories.map((category) => (
            <span
              key={category.id}
              className="rounded-full border border-ink/15 bg-white/50 px-4 py-2 text-sm text-ink/75"
            >
              {isAr ? category.nameAr : category.nameEn}
            </span>
          ))}
        </div>

        <ul className="grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
          {menuItems.slice(0, 8).map((item) => (
            <li
              key={item.id}
              className="flex items-baseline justify-between gap-4 border-b border-ink/10 pb-3"
            >
              <span className="font-display text-lg text-ink">
                {isAr ? item.nameAr : item.nameEn}
              </span>
              <span className="shrink-0 text-xs text-gold-deep">{highlights("askForPricing")}</span>
            </li>
          ))}
        </ul>

        <div>
          <Button href="/menu" variant="ghost">
            {t("viewFullMenu")}
          </Button>
        </div>
      </Container>
    </section>
  );
}
