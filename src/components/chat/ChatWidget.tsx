"use client";

// Floating "Peradiz Assistant" chat widget — streams replies from POST /api/chat, which is
// grounded exclusively in content/restaurant-facts.ts and content/menu/*.ts (see CLAUDE.md §11).
// Chat history lives only in this component's state — never persisted, never sent anywhere but
// this one request/response round trip.

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type ChatRole = "user" | "assistant";
interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

const SUGGESTION_KEYS = ["openNow", "location", "biryani", "recommend"] as const;
// Keep the request small and within the server's zod cap (20 messages) regardless of how long
// a conversation runs client-side.
const MAX_HISTORY_SENT = 12;

function newId() {
  return Math.random().toString(36).slice(2);
}

export function ChatWidget() {
  const t = useTranslations("chat");
  const locale = useLocale() as "ar" | "en";
  const inputId = useId();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    setNotice(null);
    const userMessage: ChatMessage = { id: newId(), role: "user", content: trimmed };
    const assistantId = newId();
    const nextMessages = [...messages, userMessage];
    setMessages([...nextMessages, { id: assistantId, role: "assistant", content: "" }]);
    setDraft("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.slice(-MAX_HISTORY_SENT).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          locale,
        }),
        signal: controller.signal,
      });

      if (res.status === 503) {
        setNotice(t("unavailable"));
        removeEmptyAssistantMessage(assistantId);
        return;
      }
      if (res.status === 429) {
        setNotice(t("rateLimited"));
        removeEmptyAssistantMessage(assistantId);
        return;
      }
      if (!res.ok || !res.body) {
        setNotice(t("error"));
        removeEmptyAssistantMessage(assistantId);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const text = accumulated;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: text } : m))
        );
      }

      if (!accumulated.trim()) {
        setNotice(t("error"));
        removeEmptyAssistantMessage(assistantId);
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        setNotice(t("error"));
        removeEmptyAssistantMessage(assistantId);
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function removeEmptyAssistantMessage(id: string) {
    setMessages((prev) => prev.filter((m) => !(m.id === id && m.content === "")));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(draft);
  }

  return (
    <div className="fixed bottom-5 end-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label={t("title")}
          className="flex h-[min(32rem,calc(100vh-8rem))] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-ink/10 bg-paper shadow-2xl"
        >
          <div className="flex items-center justify-between bg-ink px-4 py-3 text-paper">
            <span className="font-display text-sm">{t("title")}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("close")}
              className="text-paper/70 hover:text-paper"
            >
              ×
            </button>
          </div>

          <div
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm"
          >
            <p className="rounded-xl bg-ink/5 px-3 py-2 text-ink/80">{t("greeting")}</p>

            {messages.map((m) => (
              <p
                key={m.id}
                className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 ${
                  m.role === "user"
                    ? "ms-auto bg-chili text-paper"
                    : "bg-ink/5 text-ink/80"
                }`}
              >
                {m.content}
                {m.role === "assistant" && m.content === "" && isStreaming && (
                  <TypingDots />
                )}
              </p>
            ))}

            {notice && (
              <p className="rounded-xl bg-gold/10 px-3 py-2 text-xs text-ink/70">{notice}</p>
            )}

            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTION_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => void sendMessage(t(`suggestions.${key}`))}
                    className="rounded-full border border-ink/15 px-3 py-1.5 text-xs text-ink/70 transition-colors hover:border-chili hover:text-chili"
                  >
                    {t(`suggestions.${key}`)}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-ink/10 p-3">
            <label htmlFor={inputId} className="sr-only">
              {t("inputLabel")}
            </label>
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("placeholder")}
              disabled={isStreaming}
              maxLength={2000}
              className="flex-1 rounded-full border border-ink/15 bg-white/60 px-4 py-2 text-sm text-ink outline-none focus:border-chili disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isStreaming || !draft.trim()}
              className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-chili disabled:opacity-40"
            >
              {t("send")}
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("widgetLabel")}
        aria-expanded={open}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-chili text-paper shadow-[0_10px_30px_-8px_rgba(195,31,42,0.6)] transition-transform hover:scale-105"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.2-3.6A7.96 7.96 0 0 1 4 12Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
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
