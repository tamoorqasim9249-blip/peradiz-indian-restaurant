import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-chili text-paper hover:bg-chili-dark shadow-[0_8px_24px_-8px_rgba(195,31,42,0.55)]",
  secondary:
    "bg-transparent text-paper border border-paper/40 hover:border-paper hover:bg-paper/10",
  ghost: "bg-transparent text-ink border border-ink/15 hover:border-ink/40",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-all duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chili";

export function Button({
  href,
  variant = "primary",
  children,
  className = "",
  ...rest
}: {
  href: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href">) {
  return (
    <Link
      href={href}
      className={`${base} ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}
