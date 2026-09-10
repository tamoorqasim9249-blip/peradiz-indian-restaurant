"use client";

// Floating "Peradiz Assistant" trigger button — mounted site-wide in the locale layout, so its
// own JS is small and shipped on every route. The actual chat UI (message state, streaming
// fetch, form) lives in ChatPanel.tsx and is code-split via next/dynamic below: most visitors
// never open the widget, so that logic is only fetched the first time someone clicks it. See
// CLAUDE.md §11 for the chatbot's grounding/safety rules (unchanged by this split).

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

const ChatPanel = dynamic(() => import("./ChatPanel").then((m) => m.ChatPanel));

export function ChatWidget() {
  const t = useTranslations("chat");
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 end-5 z-50 flex flex-col items-end gap-3">
      {open && <ChatPanel onClose={() => setOpen(false)} />}

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
