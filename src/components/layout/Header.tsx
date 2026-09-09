"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { restaurantFacts } from "../../../content/restaurant-facts";

const navItems = [
  { href: "/", key: "home" },
  { href: "/menu", key: "menu" },
  { href: "/about", key: "about" },
  { href: "/gallery", key: "gallery" },
  { href: "/contact", key: "contact" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="relative block h-11 w-11 overflow-hidden rounded-xl shadow-sm">
            <Image
              src={restaurantFacts.brand.logoPath}
              alt={restaurantFacts.brand.shortNameEn}
              fill
              sizes="44px"
              className="object-cover"
              priority
            />
          </span>
          <span className="hidden font-display text-lg text-ink sm:block">
            {restaurantFacts.brand.shortNameEn}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`text-sm font-medium tracking-wide transition-colors ${
                  active ? "text-chili" : "text-ink/75 hover:text-ink"
                }`}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LocaleSwitcher />
          <Link
            href="/reservations"
            className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper transition-colors hover:bg-chili"
          >
            {t("reservations")}
          </Link>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-3.5 w-5">
            <span
              className={`absolute inset-x-0 top-0 h-0.5 bg-ink transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`}
            />
            <span
              className={`absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-ink transition-opacity ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`absolute inset-x-0 bottom-0 h-0.5 bg-ink transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div className="border-t border-ink/10 bg-paper md:hidden">
          <nav className="flex flex-col gap-1 px-5 py-4">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-ink hover:bg-ink/5"
              >
                {t(item.key)}
              </Link>
            ))}
            <Link
              href="/reservations"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-chili px-5 py-3 text-center text-base font-medium text-paper"
            >
              {t("reservations")}
            </Link>
            <div className="mt-3 flex justify-start">
              <LocaleSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
