"use client";

import { useState } from "react";
import type { GalleryItem } from "@/lib/types";
import { SectionTitle } from "./Ornaments";
import { Lightbox, type Slide } from "./Lightbox";

/**
 * Masonry-ish gallery grid that opens the shared Lightbox modal on tap.
 * Mobile-friendly: large tap targets, lazy images, swipe inside the viewer.
 */
export function Gallery({ items }: { items: GalleryItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const slides: Slide[] = items.map((it) => ({
    url: it.url,
    caption: it.caption,
  }));

  return (
    <section className="px-6 py-20 sm:py-28">
      <SectionTitle eyebrow="Captured moments" title="Our Gallery" className="mb-12" />

      <div className="gallery3d mx-auto grid max-w-5xl auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[200px] sm:grid-cols-3 sm:gap-4">
        {items.map((item, i) => (
          <button
            key={`${item.url}-${i}`}
            onClick={() => setOpen(i)}
            aria-label={item.caption ?? `Open photo ${i + 1}`}
            className={`gallery3d-tile reveal group relative overflow-hidden rounded-2xl shadow-md ring-1 ring-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${
              i % 5 === 0 ? "row-span-2" : ""
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt={item.caption ?? `Photo ${i + 1}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            {item.caption && (
              <span className="pointer-events-none absolute inset-x-0 bottom-0 p-3 text-left text-xs font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {item.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      <Lightbox
        slides={slides}
        index={open}
        onClose={() => setOpen(null)}
        onIndexChange={setOpen}
      />
    </section>
  );
}
