import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "../ui/Container";
import { restaurantFacts } from "../../../content/restaurant-facts";

const navItems = [
  { href: "/", key: "home" },
  { href: "/menu", key: "menu" },
  { href: "/about", key: "about" },
  { href: "/gallery", key: "gallery" },
  { href: "/contact", key: "contact" },
  { href: "/reservations", key: "reservations" },
] as const;

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-paper/10 bg-ink text-paper">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col gap-4 sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-3">
            <span className="relative block h-11 w-11 overflow-hidden rounded-xl">
              <Image
                src={restaurantFacts.brand.logoPath}
                alt={restaurantFacts.brand.shortNameEn}
                fill
                sizes="44px"
                className="object-cover"
              />
            </span>
            <span className="font-display text-lg">{restaurantFacts.brand.shortNameEn}</span>
          </div>
          <p className="text-sm text-paper/60">{t("footer.tagline")}</p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-display text-sm uppercase tracking-[0.2em] text-gold">
            {t("footer.quickLinks")}
          </h3>
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-sm text-paper/70 transition-colors hover:text-paper"
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-display text-sm uppercase tracking-[0.2em] text-gold">
            {t("footer.contactUs")}
          </h3>
          <a
            href={restaurantFacts.contact.phoneTel}
            className="text-sm text-paper/70 transition-colors hover:text-paper"
            dir="ltr"
          >
            {restaurantFacts.contact.phoneDisplay}
          </a>
          <p className="text-sm text-paper/70">{restaurantFacts.location.addressEn}</p>
          <a
            href={restaurantFacts.location.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-paper/70 underline decoration-paper/30 underline-offset-4 transition-colors hover:text-paper"
          >
            {t("location.getDirections")}
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-display text-sm uppercase tracking-[0.2em] text-gold">
            {t("footer.followUs")}
          </h3>
          <a
            href={restaurantFacts.social.x}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-paper/70 transition-colors hover:text-paper"
          >
            X (Twitter)
          </a>
          <a
            href={restaurantFacts.social.linktree}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-paper/70 transition-colors hover:text-paper"
          >
            Linktree
          </a>
        </div>
      </Container>

      <div className="border-t border-paper/10 py-5">
        <Container>
          <p className="text-center text-xs text-paper/45">
            © {year} {restaurantFacts.brand.shortNameEn} — {t("footer.rights")}
          </p>
        </Container>
      </div>
    </footer>
  );
}
