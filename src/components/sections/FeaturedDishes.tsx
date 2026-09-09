import { useTranslations } from "next-intl";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { DishCard } from "./DishCard";
import { menuItems } from "../../../content/menu/items";

export function FeaturedDishes() {
  const t = useTranslations("highlights");
  const signature = menuItems.filter((item) => item.isSignature);

  return (
    <section className="bg-paper-soft py-20 sm:py-28">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow="Peradiz" title={t("title")} subtitle={t("subtitle")} />
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
          {signature.map((item) => (
            <DishCard key={item.id} item={item} />
          ))}
        </div>
      </Container>
    </section>
  );
}
