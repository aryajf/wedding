"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type {
  BankAccount,
  EWallet,
  Guest,
  LinkItem,
  TimelineItem,
  WeddingEvent,
  WeddingSettings,
  Wish,
} from "@/lib/types";
import { toDatetimeLocal, formatEventDate } from "@/lib/utils";
import { FONT_OPTIONS, resolveFont } from "@/lib/fonts";
import { saveSettings } from "@/app/admin/actions";
import { logout } from "@/app/admin/login/actions";
import { uploadToMedia } from "./upload";
import { Card, Field, inputCls, Toggle, ListEditor } from "./ui";
import { GuestsPanel } from "./GuestsPanel";
import { WishesPanel } from "./WishesPanel";
import { LivePreview } from "./LivePreview";

type Tab =
  | "theme"
  | "content"
  | "couple"
  | "media"
  | "gift"
  | "guests"
  | "wishes";

type Draft = Omit<WeddingSettings, "id" | "updated_at" | "event_date"> & {
  event_date_local: string;
};

function toDraft(s: WeddingSettings): Draft {
  const { id: _id, updated_at: _u, event_date, ...rest } = s;
  void _id;
  void _u;
  return { ...rest, event_date_local: toDatetimeLocal(event_date) };
}

export function AdminDashboard({
  settings,
  guests,
  wishes,
}: {
  settings: WeddingSettings;
  guests: Guest[];
  wishes: Wish[];
}) {
  const [tab, setTab] = useState<Tab>("theme");
  const [draft, setDraft] = useState<Draft>(() => toDraft(settings));
  const [saved, setSaved] = useState<null | "ok" | "err">(null);
  const [pending, startTransition] = useTransition();
  // On mobile the preview is hidden behind a toggle (no room for two columns).
  const [showPreview, setShowPreview] = useState(false);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(null);
  }

  function handleSave() {
    setSaved(null);
    startTransition(async () => {
      const { event_date_local, ...rest } = draft;
      const event_date = event_date_local
        ? new Date(event_date_local).toISOString()
        : null;
      const res = await saveSettings({ ...rest, event_date });
      setSaved(res.ok ? "ok" : "err");
    });
  }

  const coupleName = `${draft.bride_name} & ${draft.groom_name}`;
  const dateLabel = formatEventDate(settings.event_date);
  const settingsTabs: Tab[] = ["theme", "content", "couple", "media", "gift"];
  const isSettingsTab = settingsTabs.includes(tab);

  return (
    <div className="min-h-dvh bg-[#faf3ea] text-[#4a3b2f]">
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-[#e6cdb3] bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <span className="text-[#c08552]">
            <svg width="34" height="34" viewBox="0 0 512 512" aria-hidden>
              <g fill="none" stroke="currentColor" strokeWidth={26}>
                <circle cx="198" cy="320" r="118" />
                <circle cx="314" cy="320" r="118" />
              </g>
              <path d="M314 100 l32 46 -32 48 -32 -48 z" fill="currentColor" />
            </svg>
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#c08552]">
              Wedding Builder
            </p>
            <h1 className="font-serif text-xl leading-none">Admin Dashboard</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/checkin"
            className="rounded-lg border border-[#c08552] px-3 py-1.5 text-sm text-[#c08552] hover:bg-[#f7e1cd]"
          >
            📷 Check-in
          </Link>
          <Link
            href="/welcome-screen"
            target="_blank"
            className="rounded-lg border border-[#e6cdb3] px-3 py-1.5 text-sm hover:bg-[#f7e1cd]"
          >
            📺 Welcome screen
          </Link>
          <Link
            href="/"
            target="_blank"
            className="rounded-lg border border-[#e6cdb3] px-3 py-1.5 text-sm hover:bg-[#f7e1cd]"
          >
            View site ↗
          </Link>
          <form action={logout}>
            <button className="rounded-lg bg-[#4a3b2f] px-3 py-1.5 text-sm text-white hover:bg-[#3a2e25]">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-[1700px] px-4 py-6 sm:px-6">
        <nav className="mb-6 flex flex-wrap gap-2">
          {(
            [
              ["theme", "🎨 Theme"],
              ["content", "✍️ Content"],
              ["couple", "💑 Couple"],
              ["media", "🖼️ Media"],
              ["gift", "🎁 Gift"],
              ["guests", `👥 Guests (${guests.length})`],
              ["wishes", `💌 Wishes (${wishes.length})`],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-full px-3.5 py-2 text-sm transition-colors sm:px-4 ${
                tab === key
                  ? "bg-[#c08552] text-white shadow"
                  : "bg-white text-[#4a3b2f] ring-1 ring-[#e6cdb3] hover:bg-[#f7e1cd]"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Split layout: narrow editor (~40% of the preview's width) on the
            left, full live preview filling the right. Single column < lg. */}
        <div
          className={
            isSettingsTab
              ? "lg:grid lg:grid-cols-[minmax(330px,2fr)_5fr] lg:gap-6 xl:gap-8"
              : ""
          }
        >
          {/* ---------------- Editor column ---------------- */}
          <div className="min-w-0">
            {tab === "theme" && <ThemePanel draft={draft} set={set} />}
            {tab === "content" && <ContentPanel draft={draft} set={set} />}
            {tab === "couple" && <CouplePanel draft={draft} set={set} />}
            {tab === "media" && <MediaPanel draft={draft} set={set} />}
            {tab === "gift" && <GiftPanel draft={draft} set={set} />}
            {tab === "guests" && (
              <GuestsPanel
                guests={guests}
                coupleName={coupleName}
                dateLabel={dateLabel}
              />
            )}
            {tab === "wishes" && <WishesPanel wishes={wishes} />}

            {isSettingsTab && (
              <div className="sticky bottom-4 mt-8 flex items-center justify-end gap-3 rounded-xl bg-white/90 p-3 shadow-lg ring-1 ring-[#e6cdb3] backdrop-blur">
                {saved === "ok" && (
                  <span className="text-sm text-green-700">Saved ✓</span>
                )}
                {saved === "err" && (
                  <span className="text-sm text-red-700">Save failed</span>
                )}
                <button
                  onClick={() => setShowPreview(true)}
                  className="rounded-lg border border-[#c08552] px-4 py-2 text-sm text-[#c08552] hover:bg-[#f7e1cd] lg:hidden"
                >
                  👁 Preview
                </button>
                <button
                  onClick={handleSave}
                  disabled={pending}
                  className="rounded-lg bg-[#c08552] px-5 py-2 font-medium text-white hover:bg-[#a8703f] disabled:opacity-60"
                >
                  {pending ? "Saving…" : "Save changes"}
                </button>
              </div>
            )}
          </div>

          {/* ---------------- Preview column (desktop): full pane ---------- */}
          {isSettingsTab && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#7d5a3c]">
                    Live Preview
                  </p>
                  <span className="text-[10px] text-[#7d5a3c]/60">
                    updates as you type
                  </span>
                </div>
                <div className="h-[calc(100dvh-8.5rem)] overflow-hidden rounded-[1.75rem] border-[6px] border-[#2c241d] bg-white shadow-2xl">
                  <LivePreview data={draft} wishes={wishes} />
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* ---------------- Preview overlay (mobile) ---------------- */}
      {isSettingsTab && showPreview && (
        <div className="fixed inset-0 z-40 flex flex-col bg-black/50 p-4 lg:hidden">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-white">Live Preview</p>
            <button
              onClick={() => setShowPreview(false)}
              className="rounded-lg bg-white px-3 py-1.5 text-sm text-[#4a3b2f]"
            >
              Close ✕
            </button>
          </div>
          <div className="mx-auto w-full max-w-sm flex-1 overflow-hidden rounded-3xl bg-white shadow-2xl">
            <LivePreview data={draft} />
          </div>
        </div>
      )}
    </div>
  );
}

type SetFn = <K extends keyof Draft>(k: K, v: Draft[K]) => void;

/* --------------------------------- Theme --------------------------------- */

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const valid = /^#[0-9a-fA-F]{6}$/.test(value);
  return (
    <label className="flex min-w-0 items-center gap-2.5 rounded-lg border border-[#e6cdb3] p-2.5">
      {/* Swatch doubles as the native color input. */}
      <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md ring-1 ring-black/10">
        <span
          className="absolute inset-0"
          style={{ background: valid ? value : "#ffffff" }}
        />
        <input
          type="color"
          value={valid ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label={`${label} color`}
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-xs font-medium text-[#7d5a3c]">
          {label}
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="w-full min-w-0 bg-transparent font-mono text-sm uppercase text-[#4a3b2f] outline-none"
        />
      </span>
    </label>
  );
}

function ThemePanel({ draft, set }: { draft: Draft; set: SetFn }) {
  return (
    <Card>
      <h2 className="font-serif text-2xl text-[#7d5a3c]">Theme &amp; Colors</h2>

      {/* Preset palettes first — fastest path to a complete look. */}
      <div>
        <span className="mb-2 block text-sm font-medium">Preset palettes</span>
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
          {PALETTES.map((p) => {
            const active =
              draft.background_color.toLowerCase() === p.bg.toLowerCase() &&
              draft.accent_color.toLowerCase() === p.accent.toLowerCase();
            return (
              <button
                key={p.name}
                onClick={() => {
                  set("background_color", p.bg);
                  set("text_color", p.text);
                  set("heading_color", p.heading);
                  set("accent_color", p.accent);
                  set("progress_color", p.accent);
                  set("selection_bg_color", p.accent);
                }}
                className={`flex items-center gap-2 rounded-xl border p-2 text-left text-xs transition ${
                  active
                    ? "border-[#c08552] ring-1 ring-[#c08552]"
                    : "border-[#e6cdb3] hover:bg-[#f7e1cd]"
                }`}
                title={p.name}
              >
                <span
                  className="flex h-9 w-9 shrink-0 overflow-hidden rounded-lg ring-1 ring-black/10"
                  style={{ background: p.bg }}
                >
                  <span className="mt-auto h-3 w-full" style={{ background: p.heading }} />
                  <span className="mt-auto h-3 w-1/2" style={{ background: p.accent }} />
                </span>
                <span className="min-w-0 truncate">{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2.5">
        <span className="block text-sm font-medium">Custom colors</span>
        <ColorPicker label="Background" value={draft.background_color} onChange={(v) => set("background_color", v)} />
        <ColorPicker label="Body text" value={draft.text_color} onChange={(v) => set("text_color", v)} />
        <ColorPicker label="Headings" value={draft.heading_color} onChange={(v) => set("heading_color", v)} />
        <ColorPicker label="Accent" value={draft.accent_color} onChange={(v) => set("accent_color", v)} />
      </div>

      <div className="space-y-2.5 rounded-xl border border-dashed border-[#e6cdb3] p-3">
        <p className="text-sm font-medium text-[#7d5a3c]">
          Scroll bar &amp; text selection
        </p>
        <ColorPicker label="Progress bar" value={draft.progress_color} onChange={(v) => set("progress_color", v)} />
        <ColorPicker label="Selection text" value={draft.selection_color} onChange={(v) => set("selection_color", v)} />
        <ColorPicker label="Selection background" value={draft.selection_bg_color} onChange={(v) => set("selection_bg_color", v)} />
        <p
          className="rounded-lg px-3 py-2 text-sm"
          style={{
            background: draft.selection_bg_color,
            color: draft.selection_color,
          }}
        >
          Contoh teks yang terseleksi tampak seperti ini.
        </p>
      </div>

      <Field label="Font style">
        <select
          value={draft.font_family}
          onChange={(e) => set("font_family", e.target.value)}
          className={inputCls}
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.key} value={f.key}>
              {f.label}
            </option>
          ))}
        </select>
      </Field>
      {/* Live type specimen in the chosen pairing. */}
      {(() => {
        const f = resolveFont(draft.font_family);
        return (
          <div className="rounded-xl border border-[#e6cdb3] bg-[#faf3ea] px-4 py-3">
            <p
              className="text-3xl leading-tight text-[#7d5a3c]"
              style={{ fontFamily: f.heading }}
            >
              {draft.bride_name} &amp; {draft.groom_name}
            </p>
            <p
              className="mt-1 text-sm text-[#4a3b2f]/80"
              style={{ fontFamily: f.body }}
            >
              Tanpamu, hari bahagia ini takkan lengkap.
            </p>
          </div>
        );
      })()}
    </Card>
  );
}

const PALETTES = [
  // Warm / classic
  { name: "Warm Cream", bg: "#f7e1cd", text: "#4a3b2f", heading: "#7d5a3c", accent: "#c08552" },
  { name: "Champagne", bg: "#f5ecdf", text: "#4a4031", heading: "#8a6f48", accent: "#c9a96a" },
  { name: "Terracotta", bg: "#f6e6da", text: "#4d362b", heading: "#9c5a3c", accent: "#c2683f" },
  { name: "Blush Rose", bg: "#f7e6e6", text: "#4a3537", heading: "#9a5e62", accent: "#cf8a8e" },
  { name: "Dusty Mauve", bg: "#efe4e6", text: "#43363a", heading: "#7d5560", accent: "#a87584" },
  // Botanical / fresh
  { name: "Sage Garden", bg: "#e8ede2", text: "#3a4334", heading: "#566b4c", accent: "#869a72" },
  { name: "Eucalyptus", bg: "#e4ece8", text: "#324039", heading: "#4d6b5c", accent: "#7ba292" },
  { name: "Olive Grove", bg: "#ede9da", text: "#3f3c2b", heading: "#6b6638", accent: "#9a9450" },
  // Cool / airy
  { name: "Dusty Blue", bg: "#e6edf2", text: "#2f3e46", heading: "#42627a", accent: "#6f97b3" },
  { name: "Lavender", bg: "#ece8f2", text: "#3a3548", heading: "#5e5680", accent: "#8c7fb8" },
  { name: "Powder Sky", bg: "#e8eef0", text: "#34403f", heading: "#4a6566", accent: "#7aa2a0" },
  // Bold / luxe
  { name: "Burgundy", bg: "#f3e7e6", text: "#3e2326", heading: "#7a2f38", accent: "#9c3f4a" },
  { name: "Emerald", bg: "#e6efe9", text: "#26352d", heading: "#2f5c46", accent: "#3f8062" },
  { name: "Navy Gold", bg: "#eceef2", text: "#283142", heading: "#2c3a55", accent: "#b08d4c" },
  { name: "Midnight", bg: "#1e2230", text: "#d8dae3", heading: "#e9c46a", accent: "#c9a24a" },
  { name: "Plum Noir", bg: "#241f2b", text: "#e3dbe6", heading: "#d8a7c4", accent: "#b07ba0" },
];

/* -------------------------------- Content -------------------------------- */

function ContentPanel({ draft, set }: { draft: Draft; set: SetFn }) {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-serif text-2xl text-[#7d5a3c]">The Couple</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Bride's name">
            <input
              className={inputCls}
              value={draft.bride_name}
              onChange={(e) => set("bride_name", e.target.value)}
            />
          </Field>
          <Field label="Groom's name">
            <input
              className={inputCls}
              value={draft.groom_name}
              onChange={(e) => set("groom_name", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Hero message">
          <textarea
            rows={2}
            className={inputCls}
            value={draft.hero_message ?? ""}
            onChange={(e) => set("hero_message", e.target.value)}
          />
        </Field>
        <Field label="Event date & time">
          <input
            type="datetime-local"
            className={inputCls}
            value={draft.event_date_local}
            onChange={(e) => set("event_date_local", e.target.value)}
          />
        </Field>
        <Field label="Closing message">
          <input
            className={inputCls}
            value={draft.closing_message ?? ""}
            onChange={(e) => set("closing_message", e.target.value)}
          />
        </Field>
      </Card>

      <Card>
        <h2 className="font-serif text-2xl text-[#7d5a3c]">
          Events (Ceremony, Reception…)
        </h2>
        <p className="text-sm text-[#7d5a3c]/80">
          Each event shows an embedded Google Map. Paste a Maps link, a Maps
          “Embed a map” URL, or just leave it blank to map the venue + address.
        </p>
        <ListEditor<WeddingEvent>
          items={draft.events}
          onChange={(v) => set("events", v)}
          addLabel="Add event"
          empty={{ title: "", location: "", address: "", maps_url: "" }}
          fields={[
            { key: "title", label: "Title", placeholder: "Akad / Reception" },
            { key: "datetime", label: "Date & time", type: "datetime-local" },
            { key: "location", label: "Venue" },
            { key: "address", label: "Address", textarea: true },
            {
              key: "maps_url",
              label: "Google Maps link / embed (optional)",
              placeholder: "https://maps.google.com/?q=…",
            },
          ]}
        />
      </Card>

      <Card>
        <h2 className="font-serif text-2xl text-[#7d5a3c]">Quote / Verse</h2>
        <Field label="Quote">
          <textarea
            rows={2}
            className={inputCls}
            value={draft.quote_text ?? ""}
            onChange={(e) => set("quote_text", e.target.value)}
          />
        </Field>
        <Field label="Source">
          <input
            className={inputCls}
            value={draft.quote_source ?? ""}
            onChange={(e) => set("quote_source", e.target.value)}
          />
        </Field>
      </Card>

      <Card>
        <h2 className="font-serif text-2xl text-[#7d5a3c]">Love Story</h2>
        <Field label="Story (simple text — used if no timeline below)">
          <textarea
            rows={4}
            className={inputCls}
            value={draft.love_story ?? ""}
            onChange={(e) => set("love_story", e.target.value)}
          />
        </Field>
        <span className="block text-sm font-medium">Timeline</span>
        <ListEditor<TimelineItem>
          items={draft.story_timeline}
          onChange={(v) => set("story_timeline", v)}
          addLabel="Add milestone"
          empty={{ date: "", title: "", description: "", image: "" }}
          fields={[
            { key: "date", label: "Date", placeholder: "Jun 2021" },
            { key: "title", label: "Title", placeholder: "First met" },
            { key: "description", label: "Description", textarea: true },
            { key: "image", label: "Photo", image: true },
          ]}
        />
      </Card>

      <Card>
        <h2 className="font-serif text-2xl text-[#7d5a3c]">Live Streaming</h2>
        <p className="text-sm text-[#7d5a3c]/80">
          YouTube and Instagram links are embedded as live players. Use a
          YouTube watch/live link or an Instagram profile/post/reel URL.
        </p>
        <ListEditor<LinkItem>
          items={draft.livestream}
          onChange={(v) => set("livestream", v)}
          addLabel="Add stream link"
          empty={{ label: "", url: "" }}
          fields={[
            { key: "label", label: "Label", placeholder: "YouTube Live" },
            {
              key: "url",
              label: "YouTube or Instagram URL",
              placeholder: "https://youtube.com/watch?v=… or instagram.com/…",
            },
          ]}
        />
      </Card>

      <Card>
        <h2 className="font-serif text-2xl text-[#7d5a3c]">Health Protocols</h2>
        <Toggle
          label="Show health protocol popup"
          checked={draft.health_enabled}
          onChange={(v) => set("health_enabled", v)}
        />
        <Field label="Protocol text">
          <textarea
            rows={3}
            className={inputCls}
            value={draft.health_protocols ?? ""}
            onChange={(e) => set("health_protocols", e.target.value)}
          />
        </Field>
      </Card>
    </div>
  );
}

/* -------------------------------- Couple --------------------------------- */

function PhotoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
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
    <div className="space-y-2">
      <Field label={label}>
        <input
          className={inputCls}
          placeholder="Photo URL"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </Field>
      <label className="inline-block cursor-pointer rounded-lg border border-[#c08552] px-3 py-1.5 text-xs text-[#c08552] hover:bg-[#f7e1cd]">
        {busy ? "Uploading…" : "Upload photo"}
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => e.target.files?.[0] && up(e.target.files[0])}
        />
      </label>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="h-24 w-24 rounded-full object-cover ring-1 ring-[#e6cdb3]"
        />
      )}
    </div>
  );
}

function CouplePanel({ draft, set }: { draft: Draft; set: SetFn }) {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-serif text-2xl text-[#7d5a3c]">Bride</h2>
        <Field label="Full name">
          <input
            className={inputCls}
            value={draft.bride_full_name ?? ""}
            onChange={(e) => set("bride_full_name", e.target.value)}
          />
        </Field>
        <PhotoField
          label="Photo"
          value={draft.bride_photo_url}
          onChange={(v) => set("bride_photo_url", v)}
        />
        <Field label="Parents">
          <input
            className={inputCls}
            value={draft.bride_parents ?? ""}
            onChange={(e) => set("bride_parents", e.target.value)}
          />
        </Field>
        <Field label="Bio">
          <textarea
            rows={2}
            className={inputCls}
            value={draft.bride_bio ?? ""}
            onChange={(e) => set("bride_bio", e.target.value)}
          />
        </Field>
        <Field label="Instagram (without @)">
          <input
            className={inputCls}
            value={draft.bride_instagram ?? ""}
            onChange={(e) => set("bride_instagram", e.target.value)}
          />
        </Field>
      </Card>

      <Card>
        <h2 className="font-serif text-2xl text-[#7d5a3c]">Groom</h2>
        <Field label="Full name">
          <input
            className={inputCls}
            value={draft.groom_full_name ?? ""}
            onChange={(e) => set("groom_full_name", e.target.value)}
          />
        </Field>
        <PhotoField
          label="Photo"
          value={draft.groom_photo_url}
          onChange={(v) => set("groom_photo_url", v)}
        />
        <Field label="Parents">
          <input
            className={inputCls}
            value={draft.groom_parents ?? ""}
            onChange={(e) => set("groom_parents", e.target.value)}
          />
        </Field>
        <Field label="Bio">
          <textarea
            rows={2}
            className={inputCls}
            value={draft.groom_bio ?? ""}
            onChange={(e) => set("groom_bio", e.target.value)}
          />
        </Field>
        <Field label="Instagram (without @)">
          <input
            className={inputCls}
            value={draft.groom_instagram ?? ""}
            onChange={(e) => set("groom_instagram", e.target.value)}
          />
        </Field>
      </Card>
    </div>
  );
}

/* --------------------------------- Media --------------------------------- */

function MediaPanel({ draft, set }: { draft: Draft; set: SetFn }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [newCaption, setNewCaption] = useState("");

  async function uploadHero(file: File) {
    setBusy(true);
    setErr(null);
    try {
      set("hero_image_url", await uploadToMedia(file));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }
  async function uploadGallery(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const url = await uploadToMedia(file);
      set("gallery", [...draft.gallery, { url }]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }
  function addGalleryUrl() {
    if (!newUrl.trim()) return;
    set("gallery", [
      ...draft.gallery,
      { url: newUrl.trim(), caption: newCaption.trim() || undefined },
    ]);
    setNewUrl("");
    setNewCaption("");
  }

  return (
    <div className="space-y-6">
      {err && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </p>
      )}

      <Card>
        <h2 className="font-serif text-2xl text-[#7d5a3c]">Cover</h2>
        <Toggle
          label="Show opening cover / envelope"
          checked={draft.cover_enabled}
          onChange={(v) => set("cover_enabled", v)}
        />
      </Card>

      <Card>
        <h2 className="font-serif text-2xl text-[#7d5a3c]">Hero Image</h2>
        <p className="text-sm text-[#7d5a3c]/80">
          Upload a file or paste an external link (Google Drive direct link,
          Unsplash, etc.).
        </p>
        <Field label="Image URL">
          <input
            className={inputCls}
            placeholder="https://…"
            value={draft.hero_image_url ?? ""}
            onChange={(e) => set("hero_image_url", e.target.value)}
          />
        </Field>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer rounded-lg border border-[#c08552] px-4 py-2 text-sm text-[#c08552] hover:bg-[#f7e1cd]">
            {busy ? "Uploading…" : "Upload file"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) =>
                e.target.files?.[0] && uploadHero(e.target.files[0])
              }
            />
          </label>
          {draft.hero_image_url && (
            <button
              onClick={() => set("hero_image_url", "")}
              className="text-sm text-red-600 underline"
            >
              Remove
            </button>
          )}
        </div>
        {draft.hero_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={draft.hero_image_url}
            alt="Hero preview"
            className="mt-2 h-40 w-full rounded-lg object-cover ring-1 ring-[#e6cdb3]"
          />
        )}
      </Card>

      <Card>
        <h2 className="font-serif text-2xl text-[#7d5a3c]">
          Prewedding Video & Music
        </h2>
        <Field label="Video URL (YouTube, Vimeo, or direct mp4)">
          <input
            className={inputCls}
            placeholder="https://youtube.com/watch?v=…"
            value={draft.prewedding_video_url ?? ""}
            onChange={(e) => set("prewedding_video_url", e.target.value)}
          />
        </Field>
        <Field label="Background music URL (mp3)">
          <input
            className={inputCls}
            placeholder="https://…/song.mp3"
            value={draft.music_url ?? ""}
            onChange={(e) => set("music_url", e.target.value)}
          />
        </Field>
      </Card>

      <Card>
        <h2 className="font-serif text-2xl text-[#7d5a3c]">
          Photo Gallery ({draft.gallery.length})
        </h2>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1">
            <Field label="Add by URL">
              <input
                className={inputCls}
                placeholder="https://…"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </Field>
          </div>
          <div className="flex-1">
            <Field label="Caption (optional)">
              <input
                className={inputCls}
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
              />
            </Field>
          </div>
          <button
            onClick={addGalleryUrl}
            className="rounded-lg bg-[#c08552] px-4 py-2 text-sm text-white hover:bg-[#a8703f]"
          >
            Add
          </button>
        </div>

        <label className="inline-block cursor-pointer rounded-lg border border-[#c08552] px-4 py-2 text-sm text-[#c08552] hover:bg-[#f7e1cd]">
          {busy ? "Uploading…" : "Upload photo"}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) =>
              e.target.files?.[0] && uploadGallery(e.target.files[0])
            }
          />
        </label>

        {draft.gallery.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {draft.gallery.map((item, i) => (
              <div
                key={`${item.url}-${i}`}
                className="group relative aspect-square overflow-hidden rounded-lg ring-1 ring-[#e6cdb3]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.caption ?? ""}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() =>
                    set(
                      "gallery",
                      draft.gallery.filter((_, idx) => idx !== i),
                    )
                  }
                  className="absolute right-1 top-1 rounded-full bg-red-600/90 px-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove photo"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ---------------------------------- Gift --------------------------------- */

function GiftPanel({ draft, set }: { draft: Draft; set: SetFn }) {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-serif text-2xl text-[#7d5a3c]">Wedding Gift</h2>
        <Toggle
          label="Show gift / angpao section"
          checked={draft.gift_enabled}
          onChange={(v) => set("gift_enabled", v)}
        />
        <Field label="Intro message">
          <textarea
            rows={2}
            className={inputCls}
            value={draft.gift_message ?? ""}
            onChange={(e) => set("gift_message", e.target.value)}
          />
        </Field>
      </Card>

      <Card>
        <h2 className="font-serif text-2xl text-[#7d5a3c]">Bank Accounts</h2>
        <ListEditor<BankAccount>
          items={draft.bank_accounts}
          onChange={(v) => set("bank_accounts", v)}
          addLabel="Add bank account"
          empty={{ bank: "", holder: "", number: "", logo_url: "" }}
          fields={[
            { key: "bank", label: "Bank", placeholder: "BCA" },
            { key: "number", label: "Account number" },
            { key: "holder", label: "Account holder" },
            { key: "logo_url", label: "Bank logo", image: true },
          ]}
        />
      </Card>

      <Card>
        <h2 className="font-serif text-2xl text-[#7d5a3c]">E-Wallets</h2>
        <ListEditor<EWallet>
          items={draft.ewallets}
          onChange={(v) => set("ewallets", v)}
          addLabel="Add e-wallet"
          empty={{ label: "", number: "", url: "", qr_url: "", logo_url: "" }}
          fields={[
            { key: "label", label: "Label", placeholder: "GoPay" },
            { key: "number", label: "Number / ID" },
            { key: "url", label: "Payment link (optional)" },
            { key: "logo_url", label: "Logo / QR image", image: true },
          ]}
        />
      </Card>

      <Card>
        <h2 className="font-serif text-2xl text-[#7d5a3c]">Gift Delivery</h2>
        <Field label="Physical address">
          <textarea
            rows={3}
            className={inputCls}
            value={draft.gift_address ?? ""}
            onChange={(e) => set("gift_address", e.target.value)}
          />
        </Field>
      </Card>
    </div>
  );
}

