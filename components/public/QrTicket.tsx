"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

/**
 * Renders a downloadable QR ticket encoding the guest's check-in token.
 * Shown on the public page only when the invite was opened via ?to=<token>.
 */
export function QrTicket({
  token,
  guestName,
}: {
  token: string;
  guestName: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    QRCode.toCanvas(canvas, token, { width: 220, margin: 1 }, () => {
      setDataUrl(canvas.toDataURL("image/png"));
    });
  }, [token]);

  return (
    <div className="mx-auto max-w-xs rounded-2xl bg-white/80 p-6 text-center shadow-lg ring-1 ring-black/5">
      <p className="font-serif text-xl text-[color:var(--heading)]">
        Your Entry Ticket
      </p>
      <p className="mt-1 text-sm text-[color:var(--text)]/70">
        Show this QR at the venue for check-in
      </p>
      <div className="mt-4 flex justify-center">
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>
      <p className="mt-3 text-sm font-medium text-[color:var(--text)]">
        {guestName}
      </p>
      {dataUrl && (
        <a
          href={dataUrl}
          download={`wedding-ticket-${token}.png`}
          className="mt-4 inline-block rounded-lg px-4 py-2 text-sm text-white"
          style={{ background: "var(--accent)" }}
        >
          Download Ticket
        </a>
      )}
    </div>
  );
}
