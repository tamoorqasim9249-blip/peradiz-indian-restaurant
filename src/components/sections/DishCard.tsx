import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { MenuItem } from "../../../content/menu/items";

export function DishCard({ item }: { item: MenuItem }) {
  const locale = useLocale();
  const t = useTranslations("highlights");
  const isAr = locale === "ar";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white/40 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={item.image}
          alt={isAr ? item.nameAr : item.nameEn}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {item.isVegetarian && (
          <span className="absolute top-3 start-3 rounded-full bg-paper/90 px-2.5 py-1 text-[11px] font-semibold text-ink shadow">
            {t("vegetarian")}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-display text-lg text-ink">{isAr ? item.nameAr : item.nameEn}</h3>
        <p className="line-clamp-2 text-sm text-ink/60">
          {isAr ? item.descriptionAr : item.descriptionEn}
        </p>
        <span className="mt-2 text-xs font-medium text-gold-deep">{t("askForPricing")}</span>
      </div>
    </article>
  );
}
