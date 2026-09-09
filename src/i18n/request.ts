import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // UI-chrome translation strings live in content/i18n/*.json — see CLAUDE.md §6.
  // Restaurant facts and menu data are NOT routed through this dictionary; they live in
  // content/restaurant-facts.ts and content/menu/* as bilingual fields directly.
  const messages = (await import(`../../content/i18n/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
