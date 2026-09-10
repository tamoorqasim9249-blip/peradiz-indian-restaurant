// Dumb, locale-agnostic primitive (CLAUDE.md §6) — callers pass already-translated text.
export function ErrorState({
  message,
  onRetry,
  retryLabel,
}: {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-2 rounded-xl border border-chili/25 bg-chili/5 px-4 py-3 text-sm text-chili"
    >
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-xs font-semibold underline underline-offset-4 hover:text-chili-dark"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
