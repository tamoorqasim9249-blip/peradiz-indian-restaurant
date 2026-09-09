import type { MenuCategoryId } from "./categories";

/**
 * Menu items.
 *
 * IMPORTANT — read CLAUDE.md §2, §17, §21 before editing this file.
 *
 * - Dish NAMES below are cross-referenced from public sources: Google Maps' own "popular
 *   photo" tags for this exact Al Olaya listing (`source: "google-photo-tag"`), and dish names
 *   that recur consistently across public reviews/search summaries of the wider Peradiz brand
 *   (`source: "brand-wide-reviews"`). Category placement is a reasonable, standard grouping —
 *   not an independently verified official menu structure.
 * - NO PRICES are included anywhere — none are publicly verified for this branch. Do not add a
 *   `price` field. `priceNote` always points visitors to ask staff.
 * - `isVegetarian` is inferred only where unambiguous from the dish name itself (e.g. "Paneer"
 *   is cottage cheese, a chicken/lamb/shrimp dish is not vegetarian) — never guessed.
 * - `spiceLevel` is intentionally NOT included — heat level is recipe-specific and was not
 *   publicly verifiable; do not add it without a real source.
 * - `isSignature` is true only for the four dishes Google's own listing highlights with a
 *   dedicated photo tag (Samosa, Biryani, Chicken Tikka Masala, Butter Chicken).
 */

export type MenuItemSource = "google-photo-tag" | "brand-wide-reviews";

export interface MenuItem {
  id: string;
  category: MenuCategoryId;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  isVegetarian: boolean;
  isSignature?: boolean;
  image: string; // placeholder slot path — swap the file in place, no code change needed
  source: MenuItemSource;
}

export const menuItems: MenuItem[] = [
  {
    id: "samosa",
    category: "starters",
    nameAr: "سمبوسة",
    nameEn: "Samosa",
    descriptionAr: "عجينة مقرمشة محشوة بحشوة هندية تقليدية، تُقدّم ساخنة.",
    descriptionEn: "Crisp pastry parcels with a traditional Indian-spiced filling, served hot.",
    isVegetarian: false,
    isSignature: true,
    image: "/images/dishes/samosa.jpg",
    source: "google-photo-tag",
  },
  {
    id: "paneer-tikka",
    category: "starters",
    nameAr: "بانير تكة",
    nameEn: "Paneer Tikka",
    descriptionAr: "مكعبات جبن بانير متبّلة ومشوية في الفرن التندوري.",
    descriptionEn: "Marinated cottage-cheese (paneer) cubes, chargrilled in the tandoor.",
    isVegetarian: true,
    image: "/images/dishes/paneer-tikka.jpg",
    source: "brand-wide-reviews",
  },
  {
    id: "chicken-65",
    category: "starters",
    nameAr: "دجاج 65",
    nameEn: "Chicken 65",
    descriptionAr: "قطع دجاج مقرمشة ومتبّلة بالطريقة الهندية الجنوبية الحارة.",
    descriptionEn: "Deep-fried, spiced South Indian chicken bites.",
    isVegetarian: false,
    image: "/images/dishes/chicken-65.jpg",
    source: "brand-wide-reviews",
  },
  {
    id: "chicken-lollipop",
    category: "starters",
    nameAr: "لوليبوب دجاج",
    nameEn: "Chicken Lollipop",
    descriptionAr: "أجنحة دجاج متبّلة ومقلية على الطريقة الهندية-الصينية.",
    descriptionEn: "Frenched chicken wings, marinated and fried Indo-Chinese style.",
    isVegetarian: false,
    image: "/images/dishes/chicken-lollipop.jpg",
    source: "brand-wide-reviews",
  },
  {
    id: "dynamite-shrimp",
    category: "starters",
    nameAr: "روبيان دايناميت",
    nameEn: "Dynamite Shrimp",
    descriptionAr: "روبيان مقرمش بصلصة حارة كريمية.",
    descriptionEn: "Crispy shrimp tossed in a creamy, spiced sauce.",
    isVegetarian: false,
    image: "/images/dishes/dynamite-shrimp.jpg",
    source: "brand-wide-reviews",
  },
  {
    id: "fish-tandoori",
    category: "tandoori",
    nameAr: "سمك تندوري",
    nameEn: "Fish Tandoori",
    descriptionAr: "سمك متبّل بالبهارات الهندية ومشوي في الفرن التندوري.",
    descriptionEn: "Fish marinated in Indian spices and roasted in the tandoor.",
    isVegetarian: false,
    image: "/images/dishes/fish-tandoori.jpg",
    source: "brand-wide-reviews",
  },
  {
    id: "chicken-biryani",
    category: "biryani-rice",
    nameAr: "برياني دجاج",
    nameEn: "Chicken Biryani",
    descriptionAr: "أرز بسمتي معطّر مطهو مع الدجاج والبهارات على الطريقة الهندية.",
    descriptionEn: "Fragrant basmati rice layered and slow-cooked with chicken and whole spices.",
    isVegetarian: false,
    isSignature: true,
    image: "/images/dishes/chicken-biryani.jpg",
    source: "google-photo-tag",
  },
  {
    id: "lamb-biryani",
    category: "biryani-rice",
    nameAr: "برياني لحم",
    nameEn: "Lamb Biryani",
    descriptionAr: "أرز بسمتي معطّر مطهو مع لحم الضأن الطري والبهارات.",
    descriptionEn: "Fragrant basmati rice layered and slow-cooked with tender lamb and whole spices.",
    isVegetarian: false,
    image: "/images/dishes/lamb-biryani.jpg",
    source: "brand-wide-reviews",
  },
  {
    id: "butter-chicken",
    category: "curries-masala",
    nameAr: "دجاج بالزبدة",
    nameEn: "Butter Chicken",
    descriptionAr: "قطع دجاج طرية في صلصة الطماطم والزبدة الكريمية.",
    descriptionEn: "Tender chicken simmered in a rich, creamy tomato-butter sauce.",
    isVegetarian: false,
    isSignature: true,
    image: "/images/dishes/butter-chicken.jpg",
    source: "google-photo-tag",
  },
  {
    id: "chicken-tikka-masala",
    category: "curries-masala",
    nameAr: "تكة مساله دجاج",
    nameEn: "Chicken Tikka Masala",
    descriptionAr: "قطع دجاج مشوية في التندوري وتُطهى في صلصة مساله غنية.",
    descriptionEn: "Tandoor-grilled chicken tikka simmered in a rich, spiced masala sauce.",
    isVegetarian: false,
    isSignature: true,
    image: "/images/dishes/chicken-tikka-masala.jpg",
    source: "google-photo-tag",
  },
  {
    id: "peradiz-special-masala",
    category: "curries-masala",
    nameAr: "مساله بيراديز الخاصة",
    nameEn: "Peradiz Special Masala",
    descriptionAr: "الطبق الخاص من بيراديز، متوفر بالدجاج أو اللحم.",
    descriptionEn: "Peradiz's own house-special masala, available with chicken or lamb.",
    isVegetarian: false,
    image: "/images/dishes/peradiz-special-masala.jpg",
    source: "brand-wide-reviews",
  },
  {
    id: "haleem",
    category: "curries-masala",
    nameAr: "هليم",
    nameEn: "Haleem",
    descriptionAr: "طبق حيدر آبادي تقليدي من اللحم والقمح والعدس المطهو ببطء.",
    descriptionEn: "A traditional Hyderabadi slow-cooked stew of meat, wheat, and lentils.",
    isVegetarian: false,
    image: "/images/dishes/haleem.jpg",
    source: "brand-wide-reviews",
  },
  {
    id: "garlic-naan",
    category: "breads",
    nameAr: "نان بالثوم",
    nameEn: "Garlic Naan",
    descriptionAr: "خبز نان طازج من الفرن التندوري متبّل بالثوم.",
    descriptionEn: "Fresh tandoor-baked flatbread topped with garlic.",
    isVegetarian: true,
    image: "/images/dishes/garlic-naan.jpg",
    source: "brand-wide-reviews",
  },
];
