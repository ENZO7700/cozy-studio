import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { CozyAvatar } from "@/components/studio/account/CozyAvatar";
import { fileToDataUrl, type StudioProfile } from "@/lib/studio/profile";

export function AccountRailControl({
  profile,
  collapsed,
  onProfileChange,
}: {
  profile: StudioProfile;
  collapsed: boolean;
  onProfileChange: (patch: Partial<StudioProfile>) => void;
}) {
  const avatarInputRef = useRef<HTMLInputElement>(null);

  async function pickAvatar(file: File | undefined) {
    if (!file?.type.startsWith("image/")) return;
    try {
      const url = await fileToDataUrl(file, 128);
      onProfileChange({ avatarDataUrl: url });
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="group flex items-center gap-0.5">
      <Link
        to="/account"
        title={collapsed ? profile.displayName : undefined}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-muted transition-colors hover:bg-card hover:text-fg",
          collapsed && "justify-center px-1.5",
        )}
      >
        <CozyAvatar profile={profile} size="md" />
        {!collapsed ? <span className="truncate">{profile.displayName}</span> : null}
      </Link>
      {!collapsed ? (
        <>
          <button
            type="button"
            aria-label="Nastaviť avatar"
            onClick={() => avatarInputRef.current?.click()}
            className="rounded-md p-1 text-subtle opacity-0 transition-opacity hover:text-fg group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Pencil className="size-3.5" />
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => void pickAvatar(e.target.files?.[0])}
          />
        </>
      ) : null}
    </div>
  );
}
