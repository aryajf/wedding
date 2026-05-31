"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Attendance, Wish } from "@/lib/types";

const CHOICES: { value: Attendance; label: string; glyph: string }[] = [
  { value: "yes", label: "Bisa hadir", glyph: "✓" },
  { value: "no", label: "Berhalangan hadir", glyph: "✕" },
  { value: "none", label: "Belum tahu", glyph: "·" },
];

/**
 * Guestbook + attendance. A guest leaves a wish, picks whether they can attend
 * (or leaves it blank), and the board updates live via Supabase Realtime.
 */
export function WishesBoard({
  initial,
  defaultName,
  preview = false,
}: {
  initial: Wish[];
  defaultName: string | null;
  /** Read-only render for the admin live preview: no realtime, no submit. */
  preview?: boolean;
}) {
  const [wishes, setWishes] = useState<Wish[]>(initial);
  const [attendance, setAttendance] = useState<Attendance>("none");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const supabase = useRef(preview ? null : createClient());

  useEffect(() => {
    if (preview || !supabase.current) return;
    const client = supabase.current;
    const channel = client
      .channel("wishes-board")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wishes" },
        (payload) => {
          const w = payload.new as Wish;
          if (w.approved)
            setWishes((prev) =>
              prev.some((p) => p.id === w.id) ? prev : [w, ...prev].slice(0, 100),
            );
        },
      )
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }, [preview]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (preview || !supabase.current) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const guest_name = String(fd.get("guest_name") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    if (!guest_name || !message) return;

    setSending(true);
    const { data } = await supabase.current
      .from("wishes")
      .insert({ guest_name, message, attendance })
      .select()
      .single();
    setSending(false);

    if (data) {
      setWishes((prev) =>
        prev.some((w) => w.id === (data as Wish).id)
          ? prev
          : [data as Wish, ...prev],
      );
      form.reset();
      setAttendance("none");
      setDone(true);
      setTimeout(() => setDone(false), 2600);
    }
  }

  const field =
    "w-full rounded-xl border border-[color:var(--accent)]/25 bg-[color:var(--bg)]/40 px-4 py-3 text-[color:var(--text)] outline-none transition focus:border-[color:var(--accent)] focus:bg-[color:var(--bg)]/70 focus:ring-4 focus:ring-[color:var(--accent)]/15";

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-8">
      {/* Form */}
      <form onSubmit={handleSubmit} className="card-lux h-full p-7 sm:p-8">
        <div className="relative space-y-5">
          <input name="guest_name" placeholder="Nama kamu" defaultValue={defaultName ?? ""} required className={field} />

          <fieldset>
            <legend className="mb-2 text-sm font-medium tracking-wide text-[color:var(--heading)]">
              Apakah kamu hadir?
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {CHOICES.map((c) => {
                const active = attendance === c.value;
                return (
                  <button
                    type="button"
                    key={c.value}
                    onClick={() => setAttendance(c.value)}
                    aria-pressed={active}
                    className="group/att relative overflow-hidden rounded-xl border px-2 py-3 text-center transition"
                    style={{
                      borderColor: active
                        ? "var(--accent)"
                        : "color-mix(in oklab, var(--accent) 25%, transparent)",
                      background: active
                        ? "var(--accent)"
                        : "transparent",
                      color: active ? "#fff" : "var(--text)",
                    }}
                  >
                    <span className="block text-xl leading-none">{c.glyph}</span>
                    <span className="mt-1.5 block text-[0.8rem] leading-tight">
                      {c.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <textarea name="message" rows={4} placeholder="Tulis ucapan & doa untuk kedua mempelai…" required className={field} />

          <button
            type="submit"
            disabled={sending}
            className="group/send relative w-full overflow-hidden rounded-xl px-5 py-3.5 font-medium tracking-wide text-white transition disabled:opacity-60"
            style={{ background: "var(--accent)" }}
          >
            <span className="relative z-10">
              {sending ? "Mengirim…" : done ? "Terkirim, terima kasih! ♥" : "Kirim Ucapan"}
            </span>
            <span
              className="absolute inset-y-0 left-0 z-0 w-1/3 -translate-x-full bg-white/25 blur-md transition-transform duration-700 group-hover/send:translate-x-[320%]"
              aria-hidden
            />
          </button>
        </div>
      </form>

      {/* Live board — matches the form's height on desktop (sejajar). */}
      <div className="card-lux flex max-h-[28rem] flex-col p-6 sm:p-7 lg:max-h-none lg:h-full">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--accent)]">
            Ucapan terbaru
          </p>
          <span className="text-xs text-[color:var(--text)]/55">
            {wishes.length} ucapan
          </span>
        </div>
        <div className="progress-scroll -mr-2 flex-1 space-y-3 overflow-y-auto pr-2">
          {wishes.length === 0 && (
            <p className="py-10 text-center text-sm text-[color:var(--text)]/55">
              Jadilah yang pertama memberi ucapan.
            </p>
          )}
          {wishes.map((w) => (
            <article
              key={w.id}
              className="rounded-2xl border border-[color:var(--accent)]/12 bg-[color:var(--bg)]/35 p-4 transition hover:border-[color:var(--accent)]/30"
            >
              <header className="flex items-center gap-2.5">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ background: "var(--accent)" }}
                  aria-hidden
                >
                  {w.guest_name.charAt(0).toUpperCase()}
                </span>
                <p className="min-w-0 flex-1 truncate font-medium text-[color:var(--heading)]">
                  {w.guest_name}
                </p>
                <AttendanceBadge value={w.attendance} />
              </header>
              <p className="mt-2.5 text-[0.95rem] leading-relaxed text-[color:var(--text)]/90">
                {w.message}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function AttendanceBadge({ value }: { value: Attendance }) {
  if (value === "none") return null;
  const yes = value === "yes";
  return (
    <span
      className="shrink-0 rounded-full px-2.5 py-1 text-[0.7rem] font-medium"
      style={{
        background: yes
          ? "color-mix(in oklab, #2e7d32 16%, transparent)"
          : "color-mix(in oklab, #b23b3b 14%, transparent)",
        color: yes ? "#2e7d32" : "#b23b3b",
      }}
    >
      {yes ? "Hadir" : "Tidak hadir"}
    </span>
  );
}
