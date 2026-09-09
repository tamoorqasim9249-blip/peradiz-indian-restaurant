/**
 * Menu categories.
 *
 * No independently-verified, fully-categorized printed menu was publicly available at the time
 * of writing (see CLAUDE.md §2/§21). The categories below are the standard, universally-used
 * groupings for North Indian / Hyderabadi restaurant menus, used here only to organize the
 * dish NAMES that were independently cross-referenced from public sources (Google Maps photo
 * tags + brand-wide reviews — see each item's `source` note in `items.ts`).
 *
 * Categories with `isPlaceholder: true` have no verified item names yet and intentionally ship
 * empty — replace this file's contents once the restaurant's real printed/digital menu is
 * available, rather than inventing item names to fill them.
 */

export type MenuCategoryId =
  | "starters"
  | "tandoori"
  | "biryani-rice"
  | "curries-masala"
  | "breads"
  | "desserts"
  | "beverages";

export interface MenuCategory {
  id: MenuCategoryId;
  nameAr: string;
  nameEn: string;
  isPlaceholder?: boolean;
}

export const menuCategories: MenuCategory[] = [
  { id: "starters", nameAr: "المقبلات", nameEn: "Starters" },
  { id: "tandoori", nameAr: "التندوري", nameEn: "Tandoori" },
  { id: "biryani-rice", nameAr: "البرياني والأرز", nameEn: "Biryani & Rice" },
  { id: "curries-masala", nameAr: "الكاري والمساله", nameEn: "Curries & Masala" },
  { id: "breads", nameAr: "الخبز الهندي", nameEn: "Breads" },
  { id: "desserts", nameAr: "الحلويات", nameEn: "Desserts", isPlaceholder: true },
  { id: "beverages", nameAr: "المشروبات", nameEn: "Beverages", isPlaceholder: true },
];
