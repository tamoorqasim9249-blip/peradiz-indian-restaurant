"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { GalleryImage } from "../../../content/gallery/images";

const SWIPE_THRESHOLD_PX = 50;

/**
 * Fullscreen gallery lightbox: focus-trapped modal dialog with keyboard navigation
 * (Escape / ArrowLeft / ArrowRight) and touch swipe for mobile. `images` is the currently
 * *filtered* list shown in the grid, so navigation stays within what the visitor can see.
 */
export function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}) {
  const t = useTranslations("galleryPage");
  const locale = useLocale();
  const isAr = locale === "ar";
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);

  const image = images[index];
  const count = images.length;

  const goPrev = () => onNavigate((index - 1 + count) % count);
  const goNext = () => onNavigate((index + 1) % count);

  // Focus the close button on open, and restore focus to the trigger on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    return () => previouslyFocused?.focus?.();
  }, []);

  // Keyboard: Escape closes, arrows navigate. Left/Right map to prev/next regardless of
  // locale direction — media-viewer controls conventionally don't flip with RTL text.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Tab") {
        // Minimal focus trap: the dialog only contains the close/prev/next buttons.
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled])"
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, count]);

  // Lock background scroll while the lightbox is open.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    // Swipe left (negative delta) → next; swipe right → previous.
    if (deltaX < 0) goNext();
    else goPrev();
  }

  if (!image) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? image.altAr : image.altEn}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4 sm:p-8"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label={t("closeLightbox")}
        className="absolute top-4 end-4 flex h-11 w-11 items-center justify-center rounded-full bg-paper/10 text-paper transition-colors hover:bg-paper/20"
      >
        <CloseIcon />
      </button>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label={t("previousImage")}
            className="absolute start-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-paper/10 text-paper transition-colors hover:bg-paper/20 sm:start-6"
          >
            <ChevronIcon direction="prev" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label={t("nextImage")}
            className="absolute end-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-paper/10 text-paper transition-colors hover:bg-paper/20 sm:end-6"
          >
            <ChevronIcon direction="next" />
          </button>
        </>
      )}

      <div
        className="relative flex max-h-full max-w-full flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative max-h-[80vh] max-w-[90vw] overflow-hidden rounded-2xl"
          style={{ aspectRatio: `${image.width} / ${image.height}` }}
        >
          <Image
            key={image.id}
            src={image.src}
            alt={isAr ? image.altAr : image.altEn}
            fill
            sizes="90vw"
            className="object-contain"
            priority
          />
        </div>
        <p className="text-center text-sm text-paper/80">{isAr ? image.altAr : image.altEn}</p>
        {count > 1 && (
          <p aria-live="polite" className="text-xs text-paper/50">
            {t("imageCounter", { current: index + 1, total: count })}
          </p>
        )}
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "prev" | "next" }) {
  const d = direction === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
