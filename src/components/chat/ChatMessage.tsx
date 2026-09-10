// Single chat bubble — extracted from ChatWidget.tsx so the widget stays focused on
// streaming/state management (CLAUDE.md §17 "avoid giant components").
export function ChatMessage({
  role,
  content,
  isStreaming,
}: {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}) {
  return (
    <p
      className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 ${
        role === "user" ? "ms-auto bg-chili text-paper" : "bg-ink/5 text-ink/80"
      }`}
    >
      {content}
      {role === "assistant" && content === "" && isStreaming && <TypingDots />}
    </p>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 align-middle" aria-hidden="true">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink/40" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink/40 [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink/40 [animation-delay:300ms]" />
    </span>
  );
}
