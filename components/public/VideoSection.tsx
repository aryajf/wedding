// Renders a prewedding video — embeds YouTube/Vimeo links, otherwise a
// native <video> for direct file URLs.

function toEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function VideoSection({ url }: { url: string }) {
  const embed = toEmbed(url);

  return (
    <section className="px-6 py-20 sm:py-28">
      <h2 className="reveal mb-10 text-center font-serif text-4xl text-[color:var(--heading)] sm:text-5xl">
        Our Film
      </h2>
      <div className="reveal mx-auto max-w-3xl overflow-hidden rounded-2xl shadow-xl">
        <div className="relative aspect-video">
          {embed ? (
            <iframe
              src={embed}
              title="Prewedding video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <video
              src={url}
              controls
              playsInline
              className="absolute inset-0 h-full w-full bg-black object-contain"
            />
          )}
        </div>
      </div>
    </section>
  );
}
