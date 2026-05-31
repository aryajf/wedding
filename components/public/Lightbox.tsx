"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Slide = {
  url: string;
  caption?: string;
  /** Optional small eyebrow shown above the caption (e.g. a date). */
  eyebrow?: string;
};

/**
 * A refined, theme-aware image lightbox shared by the gallery and the story
 * timeline. Features: animated entrance, glass chrome, prev/next, keyboard
 * (←/→/Esc), touch-swipe, a caption plate, and a film-strip of thumbnails on
 * larger screens. Controlled via `index` (null = closed).
 */
export function Lightbox({
  slides,
  index,
  onClose,
  onIndexChange,
}: {
  slides: Slide[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const [entered, setEntered] = useState(false);
  const open = index !== null;

  const go = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return;
      onIndexChange((index + dir + slides.length) % slides.length);
    },
    [index, slides.length, onIndexChange],
  );

  // Entrance animation flag + body scroll lock + keyboard nav.
  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, go]);

  // Touch swipe.
  const touchX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  }

  if (index === null) return null;
  const slide = slides[index];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
    >
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className={`absolute inset-0 cursor-zoom-out bg-[#1a120b]/85 backdrop-blur-md transition-opacity duration-500 ${
          entered ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>

      {/* Counter */}
      <span className="absolute left-1/2 top-5 z-10 -translate-x-1/2 rounded-full bg-white/10 px-3.5 py-1 text-sm tracking-wide text-white/90 ring-1 ring-white/15 backdrop-blur">
        {index + 1}
        <span className="mx-1 text-white/40">/</span>
        {slides.length}
      </span>

      {/* Prev / Next (desktop) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous"
            className="absolute left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20 sm:flex"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next"
            className="absolute right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20 sm:flex"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      {/* Stage */}
      <figure
        key={index}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={`relative z-[1] mx-auto flex max-h-[90vh] w-[92vw] max-w-3xl flex-col items-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          entered ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="relative overflow-hidden rounded-[1.5rem] p-2 ring-1 ring-white/15">
          {/* warm matte behind the photo */}
          <span className="absolute inset-0 bg-gradient-to-br from-white/12 to-white/[0.03]" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.url}
            alt={slide.caption ?? `Photo ${index + 1}`}
            className="relative max-h-[68vh] w-auto rounded-[1.1rem] object-contain shadow-2xl"
          />
        </div>

        {(slide.eyebrow || slide.caption) && (
          <figcaption className="mt-5 max-w-prose px-4 text-center">
            {slide.eyebrow && (
              <span className="block text-xs uppercase tracking-[0.3em] text-[color:var(--accent)]">
                {slide.eyebrow}
              </span>
            )}
            {slide.caption && (
              <span className="mt-1.5 block font-serif text-lg italic text-white/90">
                {slide.caption}
              </span>
            )}
          </figcaption>
        )}

        {/* Thumbnail film strip */}
        {slides.length > 1 && (
          <div className="mt-6 hidden max-w-full items-center gap-2 overflow-x-auto px-2 sm:flex">
            {slides.map((s, i) => (
              <button
                key={`${s.url}-${i}`}
                onClick={() => onIndexChange(i)}
                aria-label={`Go to photo ${i + 1}`}
                className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                  i === index
                    ? "ring-[color:var(--accent)] opacity-100"
                    : "ring-transparent opacity-50 hover:opacity-90"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </figure>

      {/* Mobile dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 sm:hidden">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
