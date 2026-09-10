// Dumb, locale-agnostic primitive (CLAUDE.md §6) — callers pass already-translated text so this
// component never needs its own next-intl dependency.
export function LoadingState({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center gap-2 py-2 text-sm text-ink/60">
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-ink/20 border-t-chili"
      />
      <span>{label}</span>
    </div>
  );
}
