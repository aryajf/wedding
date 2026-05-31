"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Minimalist floating music control: a clean circular glass button. Shows a
 * play triangle when paused and three slim equalizer bars when playing, with
 * a soft rotating halo while active. `autoplaySignal` — increment to attempt
 * playback (e.g. after the cover opens, which counts as the user gesture
 * browsers require).
 */
export function MusicPlayer({
  src,
  autoplaySignal = 0,
}: {
  src: string;
  autoplaySignal?: number;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = 0.4;
  }, []);

  useEffect(() => {
    if (autoplaySignal <= 0) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [autoplaySignal]);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        /* gesture required; this click counts */
      }
    }
  }

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="none" />
      <button
        onClick={toggle}
        aria-label={playing ? "Pause music" : "Play music"}
        aria-pressed={playing}
        className="group fixed bottom-5 right-5 z-50 grid h-12 w-12 place-items-center rounded-full outline-none transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 active:scale-95"
      >
        {/* Rotating halo (only while playing) */}
        <span
          className={`absolute inset-0 rounded-full ${playing ? "animate-spin-slow" : ""}`}
          style={{
            background: playing
              ? "conic-gradient(from 0deg, color-mix(in oklab, var(--accent) 70%, transparent), transparent 70%)"
              : "transparent",
          }}
          aria-hidden
        />
        {/* Glass disc */}
        <span
          className="absolute inset-[3px] rounded-full border border-white/40 shadow-lg backdrop-blur-sm transition-colors"
          style={{
            background:
              "color-mix(in oklab, var(--accent) 16%, rgba(255,255,255,0.55))",
          }}
          aria-hidden
        />
        {/* Icon */}
        <span
          className="relative flex h-4 w-4 items-end justify-center gap-[2.5px]"
          style={{ color: "var(--accent)" }}
        >
          {playing ? (
            [0, 1, 2].map((n) => (
              <span
                key={n}
                className="w-[3px] rounded-full bg-current"
                style={{
                  animation: `eq 900ms ease-in-out ${n * 160}ms infinite`,
                  height: "45%",
                }}
              />
            ))
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
              className="ml-[2px]"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </span>
      </button>

      <style jsx>{`
        @keyframes eq {
          0%,
          100% {
            height: 25%;
          }
          50% {
            height: 100%;
          }
        }
      `}</style>
    </>
  );
}
