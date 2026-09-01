export function WarmCover({ coverDataUrl }: { coverDataUrl: string | null }) {
  if (coverDataUrl) {
    return (
      <img
        src={coverDataUrl}
        alt=""
        className="absolute inset-0 size-full rounded-xl object-cover sm:rounded-3xl"
      />
    );
  }
  return (
    <div
      className="absolute inset-0 rounded-xl sm:rounded-3xl"
      style={{
        background:
          "linear-gradient(135deg, #3d342c 0%, #2a2620 40%, #1c1b18 100%)",
      }}
      aria-hidden
    >
      <span className="absolute right-[10%] top-1/2 -translate-y-1/2 font-serif text-6xl text-accent/15 sm:text-8xl">
        C
      </span>
    </div>
  );
}
