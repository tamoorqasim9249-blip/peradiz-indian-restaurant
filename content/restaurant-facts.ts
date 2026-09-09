/**
 * SINGLE SOURCE OF TRUTH for every verified fact about Peradiz Indian Restaurant — Al Olaya.
 *
 * Every other place in this codebase that needs a restaurant fact (JSON-LD, the chatbot
 * system prompt, the footer, the contact page, metadata) MUST import from this file rather
 * than hardcoding a value. See CLAUDE.md §2, §17, §21 ("Restaurant Data Verification Rules").
 *
 * Fields marked NOT VERIFIED are deliberately absent or explicitly flagged — do not fill them
 * in with a guess. If new information is confirmed later, update it here first, and note the
 * source.
 *
 * Source: Google Maps listing "مطعم بيراديز الهندي - العليا peradiz" and the official X/Twitter
 * account @peradiz_sa, both checked September 2026.
 */

export const restaurantFacts = {
  brand: {
    nameAr: "مطعم بيراديز الهندي - العليا",
    nameEn: "Peradiz Indian Restaurant — Al Olaya",
    shortNameAr: "بيراديز",
    shortNameEn: "Peradiz",
    taglineAr: "بيراديز، إحدى سلسلة مطاعم بارادايز الهندية العالمية — أصل الأكل الهندي",
    taglineEn: "Peradiz — part of the Paradise global Indian restaurant chain, the origin of Indian food",
    cuisine: "Indian",
    logoPath: "/images/brand/peradiz-logo.jpg",
  },

  location: {
    addressAr: "طريق الأمير محمد بن عبدالعزيز، العليا، الرياض 12241، المملكة العربية السعودية",
    addressEn: "Prince Mohammad ibn Abdulaziz Road, Al Olaya, Riyadh 12241, Saudi Arabia",
    streetAddress: "Prince Mohammad ibn Abdulaziz Road",
    addressLocality: "Al Olaya, Riyadh",
    postalCode: "12241",
    addressCountry: "SA",
    plusCode: "MMXP+4C Al Olaya, Riyadh",
    geo: {
      latitude: 24.6977924,
      longitude: 46.686_0333,
    },
    googleMapsUrl:
      "https://www.google.com/maps/place/%D8%A8%D9%8A%D8%B1%D8%A7%D8%AF%D9%8A%D8%B2%E2%80%AD/@24.6977924,46.6860333,17z",
    // Turn-by-turn directions URL — distinct from googleMapsUrl (the place page) above.
    // Derived from the same verified coordinates, not a separately sourced fact.
    directionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=24.6977924,46.6860333",
  },

  contact: {
    phoneDisplay: "+966 55 200 5913",
    phoneE164: "+966552005913",
    phoneTel: "tel:+966552005913",
    whatsappUrl: "https://wa.me/966552005913",
  },

  hours: {
    // VERIFIED fragment only — do NOT expand into a full weekly schedule anywhere in the app.
    verifiedFragmentAr: "يفتح الساعة ١٢:٣٠ ظهراً",
    verifiedFragmentEn: "Opens 12:30 PM",
    // NOT VERIFIED: full weekly hours are not confirmed for this specific Al Olaya listing.
    // A sister branch in Qurtubah shows different hours/address/phone and must never be reused
    // here. Always pair the fragment above with a call-to-confirm note in the UI.
    callToConfirmAr: "للتأكد من مواعيد العمل الكاملة يرجى الاتصال بنا",
    callToConfirmEn: "Please call to confirm full opening hours",
  },

  services: {
    dineIn: true,
    takeaway: true,
    noContactDelivery: true,
    familyRooms: true, // owner-stated: private/closed rooms for families
  },

  rating: {
    value: 4.8,
    count: 2692,
    source: "Google",
  },

  social: {
    x: "https://x.com/peradiz_sa",
    linktree: "https://linktr.ee/peradiz",
    // NOT VERIFIED: no confirmed Instagram/Facebook/WhatsApp Business page for this listing.
  },

  ownerNoteAr:
    "في بيرادیز نأخذكم في تجربة تجمع بين الطعم والتقديم المميز، كما يوجد لدينا غرف مغلقة للعوائل ✨",
  ownerNoteEn:
    "At Peradiz, we take you on an experience that combines great taste with distinguished presentation — and we have private rooms for families.",

  /**
   * Facts explicitly excluded from this file because they are NOT VERIFIED for the Al Olaya
   * branch. Kept here as a visible list so no one reintroduces them as fact by accident:
   * - Full weekly opening hours (see `hours` above)
   * - Any menu prices
   * - Chef identity or biography
   * - Instagram / Facebook / WhatsApp Business links
   * - Awards or certifications
   */
} as const;

export type RestaurantFacts = typeof restaurantFacts;
