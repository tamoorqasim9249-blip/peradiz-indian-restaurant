import { menuItems } from "../menu/items";

/**
 * Gallery image slots.
 *
 * These are placeholder slots (see CLAUDE.md §3/§20) — no real, rights-cleared Peradiz Al Olaya
 * photography was available to source at build time, and copyrighted photos (Google Maps,
 * Instagram, etc.) must never be downloaded and redistributed here without permission. Each
 * entry's `src` is a stable path; dropping a real, licensed photo in at the same path replaces
 * the placeholder with zero code changes. See README.md "Photo Gallery" for how to supply real
 * assets.
 *
 * The "dish" category intentionally reuses the existing signature-dish images from
 * `content/menu/items.ts` (`isSignature: true`) rather than duplicating separate gallery-only
 * dish placeholders — one image per dish, one source of truth for its path/alt text.
 */

export type GalleryCategory =
  | "exterior"
  | "interior"
  | "diningArea"
  | "dish"
  | "presentation"
  | "atmosphere";

export interface GalleryImage {
  id: string;
  src: string;
  category: GalleryCategory;
  width: number;
  height: number;
  altAr: string;
  altEn: string;
}

const signatureDishImages: GalleryImage[] = menuItems
  .filter((item) => item.isSignature)
  .map((item) => ({
    id: `dish-${item.id}`,
    src: item.image,
    category: "dish" as const,
    width: 900,
    height: 900,
    altAr: item.nameAr,
    altEn: item.nameEn,
  }));

export const galleryImages: GalleryImage[] = [
  // Restaurant exterior
  {
    id: "exterior-1",
    src: "/images/exterior/exterior-1.jpg",
    category: "exterior",
    width: 1200,
    height: 800,
    altAr: "واجهة مطعم بيراديز في العليا",
    altEn: "Peradiz Al Olaya storefront",
  },
  {
    id: "exterior-2",
    src: "/images/gallery/exterior-2.jpg",
    category: "exterior",
    width: 1200,
    height: 800,
    altAr: "مدخل مطعم بيراديز",
    altEn: "Peradiz entrance",
  },

  // Restaurant interior
  {
    id: "interior-1",
    src: "/images/interior/interior-1.jpg",
    category: "interior",
    width: 1200,
    height: 800,
    altAr: "أجواء داخل مطعم بيراديز",
    altEn: "Interior seating at Peradiz",
  },
  {
    id: "interior-2",
    src: "/images/interior/interior-2.jpg",
    category: "interior",
    width: 1200,
    height: 800,
    altAr: "الغرف العائلية المغلقة",
    altEn: "Private family dining room",
  },
  {
    id: "interior-3",
    src: "/images/interior/interior-3.jpg",
    category: "interior",
    width: 1200,
    height: 800,
    altAr: "تصميم داخلي فاخر",
    altEn: "Premium interior design detail",
  },

  // Dining area
  {
    id: "dining-area-1",
    src: "/images/gallery/dining-area-1.jpg",
    category: "diningArea",
    width: 1200,
    height: 800,
    altAr: "طاولات منطقة الطعام الرئيسية",
    altEn: "Main dining area seating",
  },
  {
    id: "dining-area-2",
    src: "/images/gallery/dining-area-2.jpg",
    category: "diningArea",
    width: 1000,
    height: 750,
    altAr: "ترتيب طاولة للضيوف",
    altEn: "Table setting for guests",
  },

  // Signature dishes (sourced from content/menu/items.ts — no duplicate data)
  ...signatureDishImages,

  // Food presentation
  {
    id: "presentation-1",
    src: "/images/gallery/presentation-1.jpg",
    category: "presentation",
    width: 1000,
    height: 1200,
    altAr: "تقديم أنيق لأحد الأطباق الهندية",
    altEn: "Elegant close-up plating of an Indian dish",
  },
  {
    id: "presentation-2",
    src: "/images/gallery/presentation-2.jpg",
    category: "presentation",
    width: 1000,
    height: 1000,
    altAr: "تفاصيل تقديم الطعام في بيراديز",
    altEn: "Food presentation detail at Peradiz",
  },

  // Atmosphere
  {
    id: "atmosphere-1",
    src: "/images/gallery/atmosphere-1.jpg",
    category: "atmosphere",
    width: 1400,
    height: 900,
    altAr: "أجواء دافئة في المساء داخل المطعم",
    altEn: "Warm evening atmosphere inside the restaurant",
  },
  {
    id: "atmosphere-2",
    src: "/images/gallery/atmosphere-2.jpg",
    category: "atmosphere",
    width: 900,
    height: 1200,
    altAr: "إضاءة هادئة وأجواء فاخرة",
    altEn: "Soft lighting and a premium ambiance",
  },
];
