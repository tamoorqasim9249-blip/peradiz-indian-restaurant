/**
 * Unified `restaurant` object — a composed, convenience view over the real sources of truth.
 *
 * This file is NOT a new data source. Every field here is re-shaped from
 * `content/restaurant-facts.ts` and `content/menu/{categories,items}.ts`, which remain the
 * actual single sources of truth (see CLAUDE.md §2, §17, §21). If a fact needs to change or a
 * new fact needs to be added, edit those files first — never edit a value here directly, and
 * never add a field here that isn't traceable back to one of them.
 *
 * Why this file exists: it gives callers (e.g. the future chatbot system prompt, CLAUDE.md §11)
 * one flat, discoverable `restaurant` object to import instead of reaching into several content
 * modules. The existing granular imports (`restaurantFacts`, `menuCategories`, `menuItems`)
 * remain valid and unchanged for every current consumer.
 */

import { restaurantFacts } from "./restaurant-facts";
import { menuCategories } from "./menu/categories";
import { menuItems } from "./menu/items";

export const restaurant = {
  nameArabic: restaurantFacts.brand.nameAr,
  nameEnglish: restaurantFacts.brand.nameEn,

  // The only verified descriptive copy available (the owner's own note) — see
  // restaurant-facts.ts. Not a marketing description invented for this file.
  descriptionArabic: restaurantFacts.ownerNoteAr,
  descriptionEnglish: restaurantFacts.ownerNoteEn,

  logo: restaurantFacts.brand.logoPath,

  address: {
    arabic: restaurantFacts.location.addressAr,
    english: restaurantFacts.location.addressEn,
    plusCode: restaurantFacts.location.plusCode,
    googleMapsUrl: restaurantFacts.location.googleMapsUrl,
    directionsUrl: restaurantFacts.location.directionsUrl,
  },
  latitude: restaurantFacts.location.geo.latitude,
  longitude: restaurantFacts.location.geo.longitude,

  phone: {
    display: restaurantFacts.contact.phoneDisplay,
    e164: restaurantFacts.contact.phoneE164,
    tel: restaurantFacts.contact.phoneTel,
    whatsapp: restaurantFacts.contact.whatsappUrl,
  },

  // NOT VERIFIED (see CLAUDE.md §16): no production domain exists yet. Set
  // NEXT_PUBLIC_SITE_URL once the site is deployed; do not hardcode a domain here.
  website: process.env.NEXT_PUBLIC_SITE_URL,

  // Verified fragment only — never a fabricated full weekly schedule. See
  // restaurant-facts.ts `hours` for the NOT VERIFIED rationale.
  openingHours: restaurantFacts.hours,

  socialLinks: restaurantFacts.social,

  rating: restaurantFacts.rating,
  services: restaurantFacts.services,

  menu: {
    categories: menuCategories,
    items: menuItems,
  },
} as const;

export type Restaurant = typeof restaurant;
