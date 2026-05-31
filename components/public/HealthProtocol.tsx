"use client";

import { useState } from "react";

/**
 * Dismissible health-protocol popup, themed to the invitation. `docked` makes
 * it absolutely positioned within its container (used by the admin preview so
 * it doesn't overlay the whole admin viewport); otherwise it's fixed to the
 * bottom of the screen on the live page.
 */
export function HealthProtocol({
  text,
  docked = false,
}: {
  text: string;
  docked?: boolean;
}) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div
      className={`${
        docked ? "sticky" : "fixed"
      } inset-x-0 bottom-0 z-50 flex justify-center p-4`}
    >
      <div className="card-lux w-full max-w-md overflow-hidden p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
            style={{ background: "var(--accent)" }}
            aria-hidden
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z" strokeLinejoin="round" />
              <path d="M12 8v5M9.5 10.5h5" strokeLinecap="round" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-xl text-[color:var(--heading)]">
              Protokol Kesehatan
            </h3>
            <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-[color:var(--text)]/85">
              {text}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Tutup"
            className="shrink-0 rounded-full p-1 text-[color:var(--text)]/50 transition-colors hover:text-[color:var(--text)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.01] active:scale-100"
          style={{ background: "var(--accent)" }}
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}
