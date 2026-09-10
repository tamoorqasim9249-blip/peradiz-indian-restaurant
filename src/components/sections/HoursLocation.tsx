import { useLocale, useTranslations } from "next-intl";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { InteractiveMap } from "./InteractiveMap";
import { restaurantFacts } from "../../../content/restaurant-facts";

function PinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 7v5l3.5 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.6 10.5c1.3 2.6 3.4 4.7 6 6l2-2a1 1 0 0 1 1-.25c1.1.36 2.3.56 3.4.56a1 1 0 0 1 1 1v3.4a1 1 0 0 1-1 1C10.6 20.2 3.8 13.4 3.8 4.9a1 1 0 0 1 1-1H8.2a1 1 0 0 1 1 1c0 1.16.2 2.3.56 3.4a1 1 0 0 1-.25 1l-2 2.1Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HoursLocation() {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <section className="bg-paper-soft py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={isAr ? "زوروا بيراديز" : "Visit Peradiz"} title={t("location.title")} />

        <div className="mt-10 grid gap-6 lg:grid-cols-5">
          <div className="flex flex-col gap-5 rounded-3xl border border-ink/10 bg-white/50 p-6 sm:p-8 lg:col-span-2">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-chili">
                <PinIcon />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink/60">{t("location.address")}</p>
                <p className="mt-1 text-ink">
                  {isAr ? restaurantFacts.location.addressAr : restaurantFacts.location.addressEn}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-chili">
                <ClockIcon />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink/60">{t("hours.title")}</p>
                <p className="mt-1 text-ink">
                  {isAr
                    ? restaurantFacts.hours.verifiedFragmentAr
                    : restaurantFacts.hours.verifiedFragmentEn}
                </p>
                <p className="mt-0.5 text-sm text-ink/60">{t("hours.note")}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-chili">
                <PhoneIcon />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink/60">{t("location.phone")}</p>
                <a
                  href={restaurantFacts.contact.phoneTel}
                  className="mt-1 block text-ink hover:text-chili"
                  dir="ltr"
                >
                  {restaurantFacts.contact.phoneDisplay}
                </a>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-3">
              <a
                href={restaurantFacts.contact.phoneTel}
                className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-chili"
              >
                {t("location.callUs")}
              </a>
              <a
                href={restaurantFacts.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-ink/20 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/50"
              >
                {t("location.whatsapp")}
                <span className="sr-only"> {t("common.opensInNewTab")}</span>
              </a>
              <a
                href={restaurantFacts.location.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-ink/20 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/50"
              >
                {t("location.getDirections")}
                <span className="sr-only"> {t("common.opensInNewTab")}</span>
              </a>
              <a
                href={restaurantFacts.location.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-ink/20 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/50"
              >
                {t("location.viewOnGoogleMaps")}
                <span className="sr-only"> {t("common.opensInNewTab")}</span>
              </a>
            </div>
          </div>

          <div className="min-h-[320px] overflow-hidden rounded-3xl border border-ink/10 lg:col-span-3">
            <InteractiveMap />
          </div>
        </div>
      </Container>
    </section>
  );
}
