"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { galleryImages, type GalleryCategory } from "../../../content/gallery/images";
import { Lightbox } from "./Lightbox";

const CATEGORIES: GalleryCategory[] = [
  "exterior",
  "interior",
  "diningArea",
  "dish",
  "presentation",
  "atmosphere",
];

/**
 * Premium photo gallery: CSS-columns masonry grid with category filtering, lazy-loaded/
 * optimized images (next/image), and a keyboard/swipe-navigable lightbox. All images are the
 * placeholder slots documented in content/gallery/images.ts until real, rights-cleared
 * photography is supplied — see CLAUDE.md §3/§20 and README.md "Photo Gallery".
 */
export function GalleryGrid() {
  const t = useTranslations("galleryPage");
  const locale = useLocale() as "ar" | "en";
  const isAr = locale === "ar";
  const [active, setActive] = useState<GalleryCategory | "all">("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () => (active === "all" ? galleryImages : galleryImages.filter((img) => img.category === active)),
    [active]
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => {
            setActive("all");
            setOpenIndex(null);
          }}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            active === "all"
              ? "bg-ink text-paper"
              : "border border-ink/15 text-ink/70 hover:border-ink/40"
          }`}
        >
          {t("allCategories")}
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => {
              setActive(category);
              setOpenIndex(null);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active === category
                ? "bg-ink text-paper"
                : "border border-ink/15 text-ink/70 hover:border-ink/40"
            }`}
          >
            {t(`categories.${category}`)}
          </button>
        ))}
      </div>

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {filtered.map((image, i) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label={t("openImage")}
            className="group relative block w-full overflow-hidden rounded-2xl border border-ink/10 break-inside-avoid focus:outline-none focus-visible:ring-2 focus-visible:ring-chili"
          >
            <Image
              src={image.src}
              alt={isAr ? image.altAr : image.altEn}
              width={image.width}
              height={image.height}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              loading="lazy"
              className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/10" />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          images={filtered}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </div>
  );
}
