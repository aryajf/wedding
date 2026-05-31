import { Divider } from "./Ornaments";

export function Quote({
  text,
  source,
}: {
  text: string;
  source: string | null;
}) {
  return (
    <section className="px-6 py-20 sm:py-28">
      <figure className="reveal mx-auto max-w-2xl rounded-3xl bg-white/40 px-8 py-12 text-center shadow-sm ring-1 ring-black/5 backdrop-blur-sm">
        <span
          className="block font-serif text-7xl leading-none"
          style={{ color: "var(--accent)" }}
          aria-hidden
        >
          &ldquo;
        </span>
        <blockquote className="-mt-4 font-serif text-2xl italic leading-relaxed text-[color:var(--heading)] sm:text-3xl">
          {text}
        </blockquote>
        {source && (
          <>
            <Divider className="mt-6" />
            <figcaption className="mt-4 text-sm uppercase tracking-[0.25em] text-[color:var(--accent)]">
              {source}
            </figcaption>
          </>
        )}
      </figure>
    </section>
  );
}
