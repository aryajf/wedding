"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { subscribeGyro } from "@/lib/gyro";

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Wraps content in an interactive 3D tilt that follows the cursor on desktop
 * and the device gyroscope on phones (shared source in lib/gyro). Pointer
 * input wins for ~1.2s after the last move so the two never fight. Fully
 * disabled under prefers-reduced-motion.
 */
export function Tilt({
  children,
  className = "",
  max = 10,
  scale = 1.02,
  glare = false,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  scale?: number;
  glare?: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const lastPointer = useRef(0);

  function apply(rx: number, ry: number, s: number, gx?: number, gy?: number) {
    const card = inner.current;
    if (!card) return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`;
      if (glare && gx !== undefined && gy !== undefined) {
        card.style.setProperty("--glare-x", `${gx}%`);
        card.style.setProperty("--glare-y", `${gy}%`);
      }
    });
  }

  function onMove(e: React.PointerEvent) {
    if (reduced()) return;
    const el = wrap.current;
    if (!el) return;
    lastPointer.current = Date.now();
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    apply(-(py - 0.5) * 2 * max, (px - 0.5) * 2 * max, scale, px * 100, py * 100);
  }

  const reset = () => apply(0, 0, 1, 50, 50);

  useEffect(() => {
    if (reduced()) return;
    const clamp = (v: number) => Math.max(-max, Math.min(max, v));
    return subscribeGyro(({ beta, gamma }) => {
      if (Date.now() - lastPointer.current < 1200) return; // pointer wins
      apply(clamp(-(beta - 45) * 0.5), clamp(gamma * 0.6), 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={wrap}
      className={`tilt-wrap ${className}`}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      <div ref={inner} className="tilt-inner">
        {children}
        {glare && <span className="tilt-glare" />}
      </div>
    </div>
  );
}
