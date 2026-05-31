"use client";

import { useState, useTransition } from "react";
import type { Guest } from "@/lib/types";
import { createGuest, deleteGuest, checkInById } from "@/app/admin/actions";
import { Card, Field, inputCls, Stat } from "./ui";

export function GuestsPanel({
  guests,
  coupleName,
  dateLabel,
}: {
  guests: Guest[];
  coupleName: string;
  dateLabel: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [count, setCount] = useState(1);
  const [origin, setOrigin] = useState("");

  // Capture the site origin for building invite links (client-only).
  if (typeof window !== "undefined" && !origin) {
    setOrigin(window.location.origin);
  }

  const checkedIn = guests.filter((g) => g.checked_in).length;

  function inviteLink(g: Guest) {
    return `${origin}/?to=${g.token}`;
  }

  function waMessage(g: Guest) {
    const link = inviteLink(g);
    const text =
      `Dear ${g.name},\n\n` +
      `We joyfully invite you to the wedding of ${coupleName}` +
      (dateLabel ? ` on ${dateLabel}` : "") +
      `.\n\nView your personal invitation, confirm your attendance, and leave your wishes here:\n${link}\n\n` +
      `Your QR entry ticket is on the invitation page. We can't wait to celebrate with you! 💕`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      await createGuest({ name, category, invited_count: count });
      setName("");
      setCategory("");
      setCount(1);
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap gap-4">
          <Stat label="Guests" value={guests.length} />
          <Stat
            label="Invited (pax)"
            value={guests.reduce((s, g) => s + g.invited_count, 0)}
          />
          <Stat label="Checked in" value={checkedIn} />
        </div>
      </Card>

      <Card>
        <h2 className="font-serif text-2xl text-[#7d5a3c]">Add Guest</h2>
        <form onSubmit={add} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[160px] flex-1">
            <Field label="Name">
              <input
                className={inputCls}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
          </div>
          <div className="w-32">
            <Field label="Category">
              <input
                className={inputCls}
                placeholder="VIP / Family"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </Field>
          </div>
          <div className="w-24">
            <Field label="Pax">
              <input
                type="number"
                min={1}
                max={50}
                className={inputCls}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </Field>
          </div>
          <button
            disabled={pending}
            className="rounded-lg bg-[#c08552] px-5 py-2 text-white hover:bg-[#a8703f] disabled:opacity-60"
          >
            Add
          </button>
        </form>
      </Card>

      <Card>
        <h2 className="font-serif text-2xl text-[#7d5a3c]">
          Guest List ({guests.length})
        </h2>
        {guests.length === 0 ? (
          <p className="py-6 text-center text-[#7d5a3c]/70">
            No guests yet. Add one above to generate a personal invite link &
            QR ticket.
          </p>
        ) : (
          <div className="space-y-2">
            {guests.map((g) => (
              <div
                key={g.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#f0e2d2] p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {g.name}{" "}
                    {g.checked_in && (
                      <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                        Checked in
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[#7d5a3c]/70">
                    {g.category ? `${g.category} · ` : ""}
                    {g.invited_count} pax · token {g.token}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => navigator.clipboard?.writeText(inviteLink(g))}
                    className="rounded-md border border-[#e6cdb3] px-3 py-1 text-xs hover:bg-[#f7e1cd]"
                  >
                    Copy link
                  </button>
                  <a
                    href={waMessage(g)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md bg-[#25D366] px-3 py-1 text-xs text-white"
                  >
                    WhatsApp
                  </a>
                  {!g.checked_in && (
                    <button
                      onClick={() =>
                        startTransition(() => {
                          void checkInById(g.id);
                        })
                      }
                      className="rounded-md border border-[#c08552] px-3 py-1 text-xs text-[#c08552] hover:bg-[#f7e1cd]"
                    >
                      Check in
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${g.name}?`))
                        startTransition(() => {
                          void deleteGuest(g.id);
                        });
                    }}
                    className="rounded-md px-2 py-1 text-xs text-red-600 underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
