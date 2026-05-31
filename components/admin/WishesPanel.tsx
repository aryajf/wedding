"use client";

import { useTransition } from "react";
import type { Wish } from "@/lib/types";
import { setWishApproved, deleteWish } from "@/app/admin/actions";
import { Card, Stat } from "./ui";

export function WishesPanel({ wishes }: { wishes: Wish[] }) {
  const [pending, startTransition] = useTransition();
  const approved = wishes.filter((w) => w.approved).length;
  const attending = wishes.filter((w) => w.attendance === "yes").length;
  const declined = wishes.filter((w) => w.attendance === "no").length;
  const undecided = wishes.filter((w) => w.attendance === "none").length;

  return (
    <Card>
      <div className="flex flex-wrap gap-3">
        <Stat label="Total" value={wishes.length} />
        <Stat label="Bisa hadir" value={attending} />
        <Stat label="Tidak hadir" value={declined} />
        <Stat label="Belum tahu" value={undecided} />
        <Stat label="Disembunyikan" value={wishes.length - approved} />
      </div>

      {wishes.length === 0 ? (
        <p className="py-6 text-center text-[#7d5a3c]/70">Belum ada ucapan.</p>
      ) : (
        <div className="space-y-2">
          {wishes.map((w) => (
            <div
              key={w.id}
              className={`rounded-xl border p-3 ${
                w.approved ? "border-[#f0e2d2]" : "border-red-200 bg-red-50/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{w.guest_name}</p>
                    <AttendanceTag attendance={w.attendance} />
                  </div>
                  <p className="mt-1 text-sm text-[#4a3b2f]/90">{w.message}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    disabled={pending}
                    onClick={() =>
                      startTransition(() => {
                        void setWishApproved(w.id, !w.approved);
                      })
                    }
                    className="rounded-md border border-[#c08552] px-3 py-1 text-xs text-[#c08552] hover:bg-[#f7e1cd]"
                  >
                    {w.approved ? "Sembunyikan" : "Tampilkan"}
                  </button>
                  <button
                    disabled={pending}
                    onClick={() => {
                      if (confirm("Hapus ucapan ini?"))
                        startTransition(() => {
                          void deleteWish(w.id);
                        });
                    }}
                    className="rounded-md px-2 py-1 text-xs text-red-600 underline"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function AttendanceTag({ attendance }: { attendance: Wish["attendance"] }) {
  if (attendance === "none")
    return (
      <span className="rounded-full bg-[#f0e2d2] px-2 py-0.5 text-[0.7rem] text-[#7d5a3c]">
        Belum tahu
      </span>
    );
  const yes = attendance === "yes";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[0.7rem] ${
        yes ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {yes ? "Bisa hadir" : "Tidak hadir"}
    </span>
  );
}
