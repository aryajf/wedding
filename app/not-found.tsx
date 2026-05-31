import Link from "next/link";

// On-brand 404: warm cream palette, ring monogram, gentle copy in Indonesian.
export default function NotFound() {
  return (
    <main className="bg-grain relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      {/* soft radial glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, #c08552 22%, transparent), transparent 70%)",
        }}
        aria-hidden
      />

      <span className="animate-float text-[#c08552]" aria-hidden>
        <svg width="76" height="76" viewBox="0 0 512 512">
          <g fill="none" stroke="currentColor" strokeWidth={22}>
            <circle cx="198" cy="320" r="120" />
            <circle cx="314" cy="320" r="120" />
          </g>
          <path d="M314 96 l34 48 -34 50 -34 -50 z" fill="currentColor" />
        </svg>
      </span>

      <p className="mt-8 font-serif text-[clamp(4.5rem,18vw,9rem)] leading-none text-[#7d5a3c]">
        404
      </p>

      <div
        className="mx-auto my-5 flex items-center gap-3 text-[#c08552]"
        aria-hidden
      >
        <span className="h-px w-12 bg-gradient-to-r from-transparent to-current sm:w-20" />
        <svg width="46" height="16" viewBox="0 0 46 16" fill="none">
          <path
            d="M2 8h12M44 8H32M23 2c3 3 3 9 0 12c-3-3-3-9 0-12Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="23" cy="8" r="1.6" fill="currentColor" />
        </svg>
        <span className="h-px w-12 bg-gradient-to-l from-transparent to-current sm:w-20" />
      </div>

      <h1 className="font-serif text-3xl text-[#7d5a3c] sm:text-4xl">
        Halaman tidak ditemukan
      </h1>
      <p className="mx-auto mt-3 max-w-md text-lg leading-relaxed text-[#4a3b2f]/75">
        Maaf, undangan atau halaman yang kamu cari tidak ada. Mungkin tautannya
        keliru, atau acaranya sudah berlalu.
      </p>

      <Link
        href="/"
        className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#c08552] px-7 py-3.5 font-medium text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M3 11l9-8 9 8M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Kembali ke beranda
      </Link>
    </main>
  );
}
