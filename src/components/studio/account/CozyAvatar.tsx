import { cn } from "@/lib/utils";
import type { StudioProfile } from "@/lib/studio/profile";

export function CozyAvatar({
  profile,
  size = "md",
  className,
}: {
  profile: StudioProfile;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
}) {
  const dim =
    size === "hero"
      ? "size-24 sm:size-28"
      : size === "lg"
        ? "size-16"
        : size === "sm"
          ? "size-6"
          : "size-8";
  const text =
    size === "hero"
      ? "text-4xl sm:text-5xl"
      : size === "lg"
        ? "text-2xl"
        : size === "sm"
          ? "text-[10px]"
          : "text-sm";

  if (profile.avatarDataUrl) {
    return (
      <img
        src={profile.avatarDataUrl}
        alt=""
        className={cn(
          dim,
          "shrink-0 rounded-full border-4 border-surface object-cover",
          className,
        )}
      />
    );
  }
  return (
    <span
      className={cn(
        dim,
        "flex shrink-0 items-center justify-center rounded-full border-4 border-surface bg-card font-serif text-accent",
        text,
        className,
      )}
      aria-hidden
    >
      C
    </span>
  );
}
