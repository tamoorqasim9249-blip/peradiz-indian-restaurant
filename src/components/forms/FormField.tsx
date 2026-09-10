import type { ReactNode } from "react";

// Shared label/input/error wrapper for ContactForm and ReservationForm — kept out of each form
// file so the two don't duplicate the same markup (CLAUDE.md §17 "clean architecture").
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink/80">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink/45">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-chili">
          {error}
        </p>
      )}
    </div>
  );
}

// Shared Tailwind classes so every form input in the site looks identical.
export const formInputClass =
  "w-full rounded-xl border border-ink/15 bg-white/60 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-chili disabled:opacity-60";
