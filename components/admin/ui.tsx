"use client";

import { useState, type ReactNode } from "react";
import { uploadToMedia } from "./upload";

export const inputCls =
  "w-full rounded-lg border border-[#e6cdb3] bg-white px-3 py-2 outline-none focus:border-[#c08552] focus:ring-2 focus:ring-[#c08552]/30";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#e6cdb3]">
      {children}
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-[#e6cdb3] p-3">
      <span className="text-sm font-medium">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 accent-[#c08552]"
      />
    </label>
  );
}

type FieldDef<T> = {
  key: keyof T & string;
  label: string;
  placeholder?: string;
  textarea?: boolean;
  image?: boolean; // render an image URL + upload control
  type?: string;
};

/** Inline image field: URL text box + upload-to-Supabase + thumbnail. */
function ImageField({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  async function up(file: File) {
    setBusy(true);
    try {
      onChange(await uploadToMedia(file));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex items-center gap-2">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="h-12 w-16 shrink-0 rounded-md bg-white object-contain p-1 ring-1 ring-[#e6cdb3]"
        />
      ) : (
        <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md bg-[#f7e1cd] text-[10px] text-[#7d5a3c]/60 ring-1 ring-[#e6cdb3]">
          logo
        </span>
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <input
          className={inputCls}
          placeholder={placeholder ?? "Image URL"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <label className="cursor-pointer rounded-md border border-[#c08552] px-2.5 py-1 text-[11px] text-[#c08552] hover:bg-[#f7e1cd]">
            {busy ? "Uploading…" : "Upload"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => e.target.files?.[0] && up(e.target.files[0])}
            />
          </label>
          {value && (
            <button
              onClick={() => onChange("")}
              className="text-[11px] text-red-600 underline"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Generic editor for an array of structured objects (events, timeline,
 * bank accounts, e-wallets, livestream links). Each item renders its fields;
 * rows can be removed and new (empty) rows appended.
 */
export function ListEditor<T extends Record<string, unknown>>({
  items,
  onChange,
  fields,
  empty,
  addLabel = "Add",
}: {
  items: T[];
  onChange: (items: T[]) => void;
  fields: FieldDef<T>[];
  empty: T;
  addLabel?: string;
}) {
  function update(i: number, key: keyof T & string, value: string) {
    const next = items.map((it, idx) =>
      idx === i ? ({ ...it, [key]: value } as T) : it,
    );
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="space-y-2 rounded-xl border border-[#e6cdb3] bg-[#faf3ea] p-3"
        >
          {fields.map((f) => (
            <div key={f.key}>
              <span className="mb-0.5 block text-xs font-medium text-[#7d5a3c]">
                {f.label}
              </span>
              {f.image ? (
                <ImageField
                  value={String(item[f.key] ?? "")}
                  placeholder={f.placeholder}
                  onChange={(v) => update(i, f.key, v)}
                />
              ) : f.textarea ? (
                <textarea
                  rows={2}
                  className={inputCls}
                  placeholder={f.placeholder}
                  value={String(item[f.key] ?? "")}
                  onChange={(e) => update(i, f.key, e.target.value)}
                />
              ) : (
                <input
                  type={f.type ?? "text"}
                  className={inputCls}
                  placeholder={f.placeholder}
                  value={String(item[f.key] ?? "")}
                  onChange={(e) => update(i, f.key, e.target.value)}
                />
              )}
            </div>
          ))}
          <button
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="text-xs text-red-600 underline"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, { ...empty }])}
        className="rounded-lg border border-[#c08552] px-4 py-2 text-sm text-[#c08552] hover:bg-[#f7e1cd]"
      >
        + {addLabel}
      </button>
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 rounded-xl bg-[#f7e1cd] px-4 py-3 text-center">
      <div className="font-serif text-2xl text-[#7d5a3c]">{value}</div>
      <div className="text-xs uppercase tracking-wide text-[#7d5a3c]/70">
        {label}
      </div>
    </div>
  );
}
