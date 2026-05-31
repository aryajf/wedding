"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

export function Countdown({ date }: { date: string }) {
  const target = new Date(date).getTime();
  const [t, setT] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (Number.isNaN(target)) return null;

  const units: [string, number][] = [
    ["Days", t.days],
    ["Hours", t.hours],
    ["Minutes", t.minutes],
    ["Seconds", t.seconds],
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 sm:gap-5">
      {units.map(([label, value]) => (
        <div
          key={label}
          className="flex min-w-[70px] flex-col items-center rounded-2xl bg-white/70 px-4 py-4 shadow-md ring-1 ring-black/5 backdrop-blur-sm transition-transform hover:-translate-y-1 sm:min-w-[92px]"
        >
          <span className="font-serif text-5xl tabular-nums text-[color:var(--heading)] sm:text-6xl">
            {String(value).padStart(2, "0")}
          </span>
          <span className="mt-2 text-xs uppercase tracking-[0.25em] text-[color:var(--accent)] sm:text-sm">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
