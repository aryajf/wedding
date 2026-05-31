"use client";

import { useState } from "react";
import type { BankAccount, EWallet } from "@/lib/types";
import { SectionTitle } from "./Ornaments";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105 active:scale-100"
      style={{ background: "var(--accent)" }}
    >
      {copied ? (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Tersalin
        </>
      ) : (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </svg>
          Salin
        </>
      )}
    </button>
  );
}

/** Logo image with a graceful monogram fallback if the image fails to load. */
function MethodLogo({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <span className="flex h-14 w-24 items-center justify-center overflow-hidden rounded-xl bg-white p-2 ring-1 ring-black/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name}
          className="max-h-full max-w-full object-contain"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }
  return (
    <span
      className="flex h-14 w-14 items-center justify-center rounded-xl font-serif text-2xl text-white"
      style={{ background: "var(--accent)" }}
      aria-hidden
    >
      {name.charAt(0)}
    </span>
  );
}

function GiftCard({
  logo,
  name,
  holder,
  number,
  actionUrl,
}: {
  logo?: string;
  name: string;
  holder?: string;
  number?: string;
  actionUrl?: string;
}) {
  return (
    <div className="card-lux reveal flex items-center gap-4 p-6">
      <MethodLogo src={logo} name={name} />
      <div className="min-w-0 flex-1">
        <p className="font-serif text-xl text-[color:var(--heading)]">{name}</p>
        {number && (
          <p className="mt-0.5 truncate font-mono text-lg tracking-wide text-[color:var(--text)]">
            {number}
          </p>
        )}
        {holder && (
          <p className="text-sm text-[color:var(--text)]/65">a.n. {holder}</p>
        )}
      </div>
      {actionUrl ? (
        <a
          href={actionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105"
          style={{ background: "var(--accent)" }}
        >
          Buka
        </a>
      ) : (
        number && (
          <span className="shrink-0">
            <CopyButton value={number} />
          </span>
        )
      )}
    </div>
  );
}

export function GiftSection({
  message,
  banks,
  ewallets,
  address,
}: {
  message: string | null;
  banks: BankAccount[];
  ewallets: EWallet[];
  address: string | null;
}) {
  return (
    <section className="bg-black/[0.03] px-6 py-20 sm:py-28">
      <SectionTitle eyebrow="Tanda kasih" title="Wedding Gift" className="mb-4" />
      <p className="reveal mx-auto mb-12 max-w-xl text-center text-lg leading-relaxed text-[color:var(--text)]/80">
        {message ??
          "Kehadiran dan doa Anda adalah hadiah terindah. Bagi yang ingin berbagi tanda kasih, berikut detailnya."}
      </p>

      <div className="mx-auto grid max-w-2xl gap-4">
        {banks.map((b, i) => (
          <GiftCard
            key={`bank-${i}`}
            logo={b.logo_url}
            name={b.bank}
            holder={b.holder}
            number={b.number}
          />
        ))}

        {ewallets.map((w, i) => (
          <GiftCard
            key={`wallet-${i}`}
            logo={w.logo_url}
            name={w.label}
            number={w.number}
            actionUrl={w.url || undefined}
          />
        ))}

        {address && (
          <div className="card-lux reveal p-6">
            <div className="flex items-center gap-3">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                style={{ background: "var(--accent)" }}
                aria-hidden
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 8l9-5 9 5v11a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="font-serif text-xl text-[color:var(--heading)]">
                Kirim Hadiah
              </p>
            </div>
            <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-[color:var(--text)]/80">
              {address}
            </p>
            <div className="mt-3">
              <CopyButton value={address} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
