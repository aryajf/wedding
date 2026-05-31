"use client";

import { useMemo, useState } from "react";
import type { TimelineItem } from "@/lib/types";
import { SectionTitle, RingsMark } from "./Ornaments";
import { Lightbox, type Slide } from "./Lightbox";

/**
 * "Our Story" — an alternating timeline with a central spine. Milestone photos
 * are clickable and open the shared Lightbox (only photos with images are
 * collected into the viewer).
 */
export function Timeline({ items }: { items: TimelineItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  // Only items with images become lightbox slides; map item-index → slide-index.
  const { slides, slideIndexOf } = useMemo(() => {
    const slides: Slide[] = [];
    const slideIndexOf = new Map<number, number>();
    items.forEach((it, i) => {
      if (it.image) {
        slideIndexOf.set(i, slides.length);
        slides.push({ url: it.image, caption: it.title, eyebrow: it.date });
      }
    });
    return { slides, slideIndexOf };
  }, [items]);

  return (
    <section className="px-6 py-20 sm:py-28">
      <SectionTitle eyebrow="Once upon a time" title="Our Story" className="mb-16" />

      <div className="relative mx-auto max-w-3xl">
        {/* Central spine (desktop) / left rail (mobile) */}
        <div
          className="absolute bottom-0 left-[19px] top-0 w-[2px] sm:left-1/2 sm:-translate-x-1/2"
          style={{
            background:
              "linear-gradient(180deg, transparent, color-mix(in oklab, var(--accent) 55%, transparent) 12%, color-mix(in oklab, var(--accent) 55%, transparent) 88%, transparent)",
          }}
          aria-hidden
        />

        <div className="space-y-12 sm:space-y-16">
          {items.map((item, i) => {
            const left = i % 2 === 0;
            const slideIdx = slideIndexOf.get(i);
            return (
              <div
                key={i}
                className={`reveal relative pl-14 sm:flex sm:pl-0 ${
                  left ? "sm:justify-start" : "sm:justify-end"
                }`}
              >
                {/* Node with a tiny rings mark */}
                <span
                  className="absolute left-2.5 top-2 z-[1] flex h-[18px] w-[18px] items-center justify-center rounded-full ring-4 ring-[color:var(--bg)] sm:left-1/2 sm:-translate-x-1/2"
                  style={{ background: "var(--accent)" }}
                  aria-hidden
                />

                <article
                  className={`card-lux w-full overflow-hidden sm:w-[calc(50%-2.25rem)] ${
                    left ? "" : "sm:text-right"
                  }`}
                >
                  {item.image && (
                    <button
                      onClick={() =>
                        slideIdx !== undefined && setOpen(slideIdx)
                      }
                      aria-label={`View photo: ${item.title}`}
                      className="group relative block aspect-[5/3] w-full overflow-hidden"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </button>
                  )}

                  <div className="p-6 sm:p-7">
                    <div
                      className={`flex items-center gap-2 ${
                        left ? "" : "sm:flex-row-reverse"
                      }`}
                    >
                      {item.date && (
                        <p
                          className="text-sm font-semibold uppercase tracking-[0.15em]"
                          style={{ color: "var(--accent)" }}
                        >
                          {item.date}
                        </p>
                      )}
                    </div>
                    <h3 className="mt-2 font-serif text-2xl text-[color:var(--heading)]">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="mt-2 text-base leading-relaxed text-[color:var(--text)]/85">
                        {item.description}
                      </p>
                    )}
                  </div>
                </article>
              </div>
            );
          })}
        </div>
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
