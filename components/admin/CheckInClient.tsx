"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Guest } from "@/lib/types";
import { checkInByToken, checkInById } from "@/app/admin/actions";

// Minimal typing for the experimental BarcodeDetector API.
type Detected = { rawValue: string };
type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<Detected[]>;
};
type BarcodeDetectorCtor = new (opts?: {
  formats?: string[];
}) => BarcodeDetectorLike;

export function CheckInClient({ guests }: { guests: Guest[] }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScan = useRef<{ token: string; at: number }>({ token: "", at: 0 });

  const [scanning, setScanning] = useState(false);
  const [banner, setBanner] = useState<{
    kind: "ok" | "warn" | "err";
    text: string;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [manualToken, setManualToken] = useState("");
  const [pending, startTransition] = useTransition();
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" && "BarcodeDetector" in window,
    );
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }

  async function doCheckIn(token: string) {
    const now = Date.now();
    if (lastScan.current.token === token && now - lastScan.current.at < 4000) {
      return; // debounce repeat scans of the same code
    }
    lastScan.current = { token, at: now };

    const res = await checkInByToken(token);
    if (!res.ok) {
      setBanner({ kind: "err", text: `Unknown ticket: ${token}` });
    } else if (res.guest?.alreadyIn) {
      setBanner({
        kind: "warn",
        text: `${res.guest.name} was already checked in`,
      });
    } else {
      setBanner({ kind: "ok", text: `✓ Welcome, ${res.guest?.name}!` });
    }
    router.refresh();
  }

  async function startCamera() {
    setBanner(null);
    const Ctor = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor })
      .BarcodeDetector;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);

      const detector = new Ctor({ formats: ["qr_code"] });
      const tick = async () => {
        if (!streamRef.current || !videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes[0]?.rawValue) {
            await doCheckIn(codes[0].rawValue.trim());
          }
        } catch {
          /* frame not ready */
        }
        if (streamRef.current) window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
    } catch {
      setBanner({ kind: "err", text: "Could not access the camera." });
      setScanning(false);
    }
  }

  const filtered = guests.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-dvh bg-[#faf3ea] p-4 text-[#4a3b2f] sm:p-6">
      <header className="mx-auto mb-6 flex max-w-2xl items-center justify-between">
        <h1 className="font-serif text-2xl text-[#7d5a3c]">Guest Check-in</h1>
        <Link
          href="/admin"
          className="rounded-lg border border-[#e6cdb3] px-3 py-1.5 text-sm hover:bg-[#f7e1cd]"
        >
          ← Dashboard
        </Link>
      </header>

      <div className="mx-auto max-w-2xl space-y-6">
        {banner && (
          <div
            className={`rounded-xl p-4 text-center font-medium ${
              banner.kind === "ok"
                ? "bg-green-100 text-green-800"
                : banner.kind === "warn"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {banner.text}
          </div>
        )}

        {/* Scanner */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#e6cdb3]">
          <h2 className="mb-3 font-serif text-xl text-[#7d5a3c]">QR Scanner</h2>
          <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            {!scanning && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
                Camera off
              </div>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            {!scanning ? (
              <button
                onClick={startCamera}
                disabled={!supported}
                className="rounded-lg bg-[#c08552] px-4 py-2 text-sm text-white hover:bg-[#a8703f] disabled:opacity-50"
              >
                Start camera
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="rounded-lg bg-[#4a3b2f] px-4 py-2 text-sm text-white"
              >
                Stop
              </button>
            )}
          </div>
          {!supported && (
            <p className="mt-2 text-xs text-red-600">
              This browser doesn&apos;t support live QR scanning. Use manual
              check-in or enter the ticket code below.
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <input
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Enter ticket code"
              className="flex-1 rounded-lg border border-[#e6cdb3] px-3 py-2 text-sm outline-none focus:border-[#c08552]"
            />
            <button
              onClick={() =>
                manualToken.trim() && doCheckIn(manualToken.trim())
              }
              className="rounded-lg border border-[#c08552] px-4 py-2 text-sm text-[#c08552] hover:bg-[#f7e1cd]"
            >
              Check in
            </button>
          </div>
        </div>

        {/* Manual list */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#e6cdb3]">
          <h2 className="mb-3 font-serif text-xl text-[#7d5a3c]">
            Manual Check-in
          </h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guest name…"
            className="mb-3 w-full rounded-lg border border-[#e6cdb3] px-3 py-2 text-sm outline-none focus:border-[#c08552]"
          />
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="py-6 text-center text-sm text-[#7d5a3c]/70">
                No guests found.
              </p>
            )}
            {filtered.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#f0e2d2] p-3"
              >
                <div>
                  <p className="font-medium">{g.name}</p>
                  <p className="text-xs text-[#7d5a3c]/70">
                    {g.category ? `${g.category} · ` : ""}
                    {g.invited_count} pax
                  </p>
                </div>
                {g.checked_in ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">
                    Checked in
                  </span>
                ) : (
                  <button
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const res = await checkInById(g.id);
                        if (res.ok)
                          setBanner({
                            kind: "ok",
                            text: `✓ Welcome, ${res.guest?.name}!`,
                          });
                        router.refresh();
                      })
                    }
                    className="rounded-lg bg-[#c08552] px-4 py-1.5 text-sm text-white hover:bg-[#a8703f] disabled:opacity-50"
                  >
                    Check in
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
