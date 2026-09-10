"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { menuCategories, type MenuCategoryId } from "../../../content/menu/categories";
import { menuItems, type MenuItem } from "../../../content/menu/items";

function ItemCard({ item }: { item: MenuItem }) {
  const locale = useLocale();
  const t = useTranslations("menuPage");
  const isAr = locale === "ar";

  return (
    <article className="group flex gap-4 rounded-2xl border border-ink/10 bg-white/40 p-3 transition-shadow duration-300 hover:shadow-lg sm:p-4">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-28">
        <Image
          src={item.image}
          alt={isAr ? item.nameAr : item.nameEn}
          fill
          sizes="112px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-lg text-ink">{isAr ? item.nameAr : item.nameEn}</h3>
          {item.isSignature && (
            <span className="rounded-full bg-chili/10 px-2 py-0.5 text-[11px] font-semibold text-chili">
              {t("signature")}
            </span>
          )}
          {item.isVegetarian && (
            <span className="rounded-full bg-emerald-600/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              {t("vegetarian")}
            </span>
          )}
        </div>
        <p className="text-sm text-ink/60">{isAr ? item.descriptionAr : item.descriptionEn}</p>
      </div>
    </article>
  );
}

export function MenuBrowser() {
  const t = useTranslations("menuPage");
  const locale = useLocale();
  const isAr = locale === "ar";
  const [active, setActive] = useState<MenuCategoryId | "all">("all");

  const filtered = useMemo(
    () => (active === "all" ? menuItems : menuItems.filter((i) => i.category === active)),
    [active]
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => setActive("all")}
          aria-pressed={active === "all"}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            active === "all"
              ? "bg-ink text-paper"
              : "border border-ink/15 text-ink/70 hover:border-ink/40"
          }`}
        >
          {t("allCategories")}
        </button>
        {menuCategories
          .filter((c) => !c.isPlaceholder)
          .map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActive(category.id)}
              aria-pressed={active === category.id}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active === category.id
                  ? "bg-ink text-paper"
                  : "border border-ink/15 text-ink/70 hover:border-ink/40"
              }`}
            >
              {isAr ? category.nameAr : category.nameEn}
            </button>
          ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filtered.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>

      {menuCategories
        .filter((c) => c.isPlaceholder)
        .map((category) => (
          <div
            key={category.id}
            className="rounded-2xl border border-dashed border-ink/15 p-6 text-center text-sm text-ink/60"
          >
            <span className="font-display text-base text-ink/60">
              {isAr ? category.nameAr : category.nameEn}
            </span>
            <p className="mt-1">{t("comingSoon")}</p>
          </div>
        ))}
    </div>
  );
}
