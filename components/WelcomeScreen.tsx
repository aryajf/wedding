"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { createClient } from "@/lib/supabase/client";
import type { Checkin } from "@/lib/types";

/**
 * "Layar Sapa" — a TV/projector screen for the venue. Subscribes to new
 * check-ins via Supabase Realtime and animates a personal greeting the moment
 * a guest's QR code is scanned in the check-in dashboard.
 */
export function WelcomeScreen({
  coupleName,
  background,
  heading,
  accent,
  text,
  heroImage,
}: {
  coupleName: string;
  background: string;
  heading: string;
  accent: string;
  text: string;
  heroImage: string | null;
}) {
  const [guest, setGuest] = useState<string | null>(null);
  const greetRef = useRef<HTMLDivElement>(null);
  const idleRef = useRef<HTMLDivElement>(null);
  const queue = useRef<string[]>([]);
  const showing = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("welcome-screen")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "checkins" },
        (payload) => {
          const c = payload.new as Checkin;
          queue.current.push(c.guest_name);
          drainQueue();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function drainQueue() {
    if (showing.current) return;
    const next = queue.current.shift();
    if (!next) return;
    showing.current = true;
    setGuest(next);
  }

  // Animate each greeting in, hold, then out; then show the next in queue.
  useEffect(() => {
    if (!guest) return;
    const el = greetRef.current;
    if (!el) return;

    const tl = gsap.timeline({
      onComplete: () => {
        showing.current = false;
        setGuest(null);
        drainQueue();
      },
    });
    tl.fromTo(
      el,
      { opacity: 0, scale: 0.8, y: 40 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "back.out(1.6)" },
    )
      .to(el, { opacity: 1, duration: 6 })
      .to(el, { opacity: 0, scale: 0.9, duration: 0.6, ease: "power2.in" });

    return () => {
      tl.kill();
    };
  }, [guest]);

  useEffect(() => {
    if (!guest && idleRef.current) {
      gsap.fromTo(
        idleRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1 },
      );
    }
  }, [guest]);

  return (
    <main
      className="relative flex min-h-dvh items-center justify-center overflow-hidden p-8 text-center"
      style={{ background, color: text }}
    >
      {heroImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0" style={{ background: `${background}aa` }} />
        </>
      )}

      {guest ? (
        <div ref={greetRef} className="relative z-10">
          <p
            className="text-2xl uppercase tracking-[0.4em] sm:text-3xl"
            style={{ color: accent }}
          >
            Welcome
          </p>
          <h1
            className="mt-8 font-serif text-6xl leading-tight sm:text-8xl md:text-9xl"
            style={{ color: heading }}
          >
            {guest}
          </h1>
          <p className="mt-8 text-xl sm:text-2xl">
            Thank you for celebrating with us 💕
          </p>
        </div>
      ) : (
        <div ref={idleRef} className="relative z-10">
          <p
            className="text-xl uppercase tracking-[0.4em]"
            style={{ color: accent }}
          >
            The Wedding Of
          </p>
          <h1
            className="mt-8 font-serif text-6xl sm:text-8xl"
            style={{ color: heading }}
          >
            {coupleName}
          </h1>
          <p className="mt-8 animate-pulse text-lg opacity-70">
            Waiting for guests to arrive…
          </p>
        </div>
      )}
    </main>
  );
}
