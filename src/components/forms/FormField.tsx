import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

// A form control's own accessibility wiring — merged onto whatever single input/textarea
// FormField was given as `children`, so ContactForm/ReservationForm never have to pass
// aria-invalid/aria-describedby by hand at every call site (CLAUDE.md §17 "never re-implement
// … logic twice", applied here to the label/error/control association instead of validation).
type FieldControlProps = {
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

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
  const errorId = `${htmlFor}-error`;
  const hintId = `${htmlFor}-hint`;

  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<FieldControlProps>, {
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? errorId : hint ? hintId : undefined,
      })
    : children;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink/80">
        {label}
      </label>
      {control}
      {hint && !error && (
        <p id={hintId} className="text-xs text-ink/60">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-chili">
          {error}
        </p>
      )}
    </div>
  );
}

// Shared Tailwind classes so every form input in the site looks identical. `outline-none` is
// paired with an explicit focus-visible ring rather than left bare — a border-color change alone
// is too subtle to reliably read as "this is the focused field" (WCAG 2.4.7/2.4.11).
export const formInputClass =
  "w-full rounded-xl border border-ink/15 bg-white/60 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-chili focus-visible:ring-2 focus-visible:ring-chili focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:opacity-60";
