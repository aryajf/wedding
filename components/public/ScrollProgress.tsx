"use client";

import { useEffect, useState } from "react";

/**
 * A slim reading-progress bar pinned to the very top of the viewport, in place
 * of the native scrollbar. Colour comes from the theme var --progress.
 */
export function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const next = max > 0 ? (el.scrollTop / max) * 100 : 0;
      setPct(next);
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px]"
    >
      <div
        className="h-full origin-left rounded-r-full transition-[width] duration-75 ease-out"
        style={{
          width: `${pct}%`,
          background:
            "linear-gradient(90deg, color-mix(in oklab, var(--progress) 65%, white) 0%, var(--progress) 100%)",
          boxShadow: "0 0 10px color-mix(in oklab, var(--progress) 50%, transparent)",
        }}
      />
    </div>
  );
}
