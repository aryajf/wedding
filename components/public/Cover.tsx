"use client";

import { useEffect, useRef, useState } from "react";
import type { WeddingSettings } from "@/lib/types";
import { formatEventDate } from "@/lib/utils";
import { Divider, CornerFlourish } from "./Ornaments";
import { enableGyro, subscribeGyro } from "@/lib/gyro";

/**
 * Full-screen "envelope" intro shown before the invitation. Tapping "Open"
 * slides it away and signals the parent (to start music & reveal content).
 */
export function Cover({
  settings,
  guestName,
  onOpen,
}: {
  settings: WeddingSettings;
  guestName: string | null;
  onOpen: () => void;
}) {
  const [leaving, setLeaving] = useState(false);
  const dateLabel = formatEventDate(settings.event_date);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Subtle parallax: background drifts opposite the content as the cursor
  // moves or the phone tilts, giving the cover physical depth.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (x: number, y: number) => {
      if (bgRef.current)
        bgRef.current.style.transform = `scale(1.08) translate(${x * -16}px, ${y * -16}px)`;
      if (contentRef.current)
        contentRef.current.style.transform = `translate(${x * 11}px, ${y * 9}px)`;
    };
    return subscribeGyro(({ beta, gamma }) => {
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      move(clamp(gamma / 28), clamp((beta - 45) / 28));
    });
  }, []);

  function onPointerMove(e: React.PointerEvent) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    if (bgRef.current)
      bgRef.current.style.transform = `scale(1.08) translate(${x * -16}px, ${y * -16}px)`;
    if (contentRef.current)
      contentRef.current.style.transform = `translate(${x * 11}px, ${y * 9}px)`;
  }

  function handleOpen() {
    enableGyro(); // gesture → unlock device tilt for the cards beneath
    setLeaving(true);
    setTimeout(onOpen, 850);
  }

  return (
    <div
      onPointerMove={onPointerMove}
      style={{ color: settings.text_color }}
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden px-6 text-center transition-all duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        leaving ? "cover-leaving" : "opacity-100"
      }`}
    >
      {/* Background image or tinted gradient (parallax layer) */}
      <div
        ref={bgRef}
        className="absolute inset-0 transition-transform duration-300 ease-out will-change-transform"
      >
        {settings.hero_image_url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.hero_image_url}
              alt=""
              className="absolute inset-0 h-full w-full scale-105 object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, ${settings.background_color}cc, ${settings.background_color}f2)`,
              }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: settings.background_color }}
          />
        )}
      </div>

      {/* Corner flourishes */}
      <span
        className="pointer-events-none absolute left-4 top-4 opacity-50"
        style={{ color: settings.accent_color }}
      >
        <CornerFlourish />
      </span>
      <span
        className="pointer-events-none absolute right-4 top-4 rotate-90 opacity-50"
        style={{ color: settings.accent_color }}
      >
        <CornerFlourish />
      </span>
      <span
        className="pointer-events-none absolute bottom-4 left-4 -rotate-90 opacity-50"
        style={{ color: settings.accent_color }}
      >
        <CornerFlourish />
      </span>
      <span
        className="pointer-events-none absolute bottom-4 right-4 rotate-180 opacity-50"
        style={{ color: settings.accent_color }}
      >
        <CornerFlourish />
      </span>

      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center transition-transform duration-300 ease-out will-change-transform"
      >
        <p
          className="mt-7 text-xs uppercase tracking-[0.45em]"
          style={{ color: settings.accent_color }}
        >
          The Wedding Of
        </p>
        <h1
          className="mt-5 font-serif text-6xl leading-[1.05] sm:text-7xl"
          style={{ color: settings.heading_color }}
        >
          {settings.bride_name}
          <span className="my-1 block text-3xl italic sm:text-4xl">&amp;</span>
          {settings.groom_name}
        </h1>

        <Divider className="mt-6" />

        {dateLabel && (
          <p className="mt-6 text-sm tracking-wide">{dateLabel}</p>
        )}

        <div className="mt-10 rounded-2xl bg-white/30 px-8 py-5 backdrop-blur-sm ring-1 ring-white/40">
          <p className="text-xs uppercase tracking-[0.25em] opacity-80">
            Dear
          </p>
          <p
            className="mt-1.5 font-serif text-2xl"
            style={{ color: settings.heading_color }}
          >
            {guestName ?? "Our Beloved Guest"}
          </p>
        </div>

        <button
          onClick={handleOpen}
          className="animate-pulse-glow mt-9 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium tracking-wide text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{ background: settings.accent_color }}
        >
          <span>Open Invitation</span>
          <span aria-hidden>✦</span>
        </button>
      </div>
    </div>
  );
}
