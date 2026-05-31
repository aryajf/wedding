"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { WeddingSettings, Wish } from "@/lib/types";
import { themeToCssVars } from "@/lib/utils";
import { Cover } from "./Cover";
import { MusicPlayer } from "./MusicPlayer";
import { ScrollProgress } from "./ScrollProgress";
import { InvitationBody } from "./InvitationBody";

/**
 * Public invitation wrapper: the opening Cover, theme CSS vars, GSAP scroll
 * reveals, background music and the progress bar. The actual sections live in
 * `InvitationBody`, which the admin live preview reuses so the two never drift.
 */
export function Invitation({
  settings,
  guestName,
  guestToken,
  initialWishes,
}: {
  settings: WeddingSettings;
  guestName: string | null;
  guestToken: string | null;
  initialWishes: Wish[];
}) {
  const root = useRef<HTMLDivElement>(null);

  // Cover gating: if the cover is enabled it overlays until "opened".
  const [opened, setOpened] = useState(!settings.cover_enabled);
  const [musicSignal, setMusicSignal] = useState(0);

  // Lock body scroll while the cover overlay is showing.
  useEffect(() => {
    const locked = settings.cover_enabled && !opened;
    document.body.classList.toggle("cover-open", locked);
    return () => document.body.classList.remove("cover-open");
  }, [opened, settings.cover_enabled]);

  // GSAP entrance + scroll reveals, once opened.
  useEffect(() => {
    if (!opened) return;
    const el = root.current;
    if (!el) return;

    gsap.registerPlugin(ScrollTrigger);
    el.classList.add("gsap-ready");

    const ctx = gsap.context(() => {
      gsap.from(".hero-reveal", {
        opacity: 0,
        y: 30,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      });

      gsap.utils.toArray<HTMLElement>(".reveal").forEach((node) => {
        gsap.fromTo(
          node,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: { trigger: node, start: "top 85%" },
          },
        );
      });
      ScrollTrigger.refresh();
    }, el);

    return () => ctx.revert();
  }, [opened]);

  return (
    <>
      {!opened && settings.cover_enabled && (
        <Cover
          settings={settings}
          guestName={guestName}
          onOpen={() => {
            setOpened(true);
            setMusicSignal((s) => s + 1); // gesture → allowed to autoplay
          }}
        />
      )}

      <div
        ref={root}
        style={themeToCssVars(settings)}
        className="bg-grain min-h-dvh font-sans"
      >
        {opened && <ScrollProgress />}
        {settings.music_url && (
          <MusicPlayer src={settings.music_url} autoplaySignal={musicSignal} />
        )}

        <InvitationBody
          settings={settings}
          guestName={guestName}
          guestToken={guestToken}
          initialWishes={initialWishes}
        />
      </div>
    </>
  );
}
