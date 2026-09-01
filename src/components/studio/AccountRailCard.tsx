import { useRef, useState } from "react";
import { Download, Pencil, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudioRecent } from "@/lib/studio/recents";
import {
  fileToDataUrl,
  formatProfileDate,
  normalizeHandle,
  type StudioProfile,
} from "@/lib/studio/profile";
import { standaloneHtml } from "@/lib/preview/cozy-elements";
import { downloadHtml, slugFromTitle } from "@/lib/studio/export";

function CozyAvatar({
  profile,
  size = "md",
  className,
}: {
  profile: StudioProfile;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim =
    size === "lg" ? "size-12" : size === "sm" ? "size-5" : "size-8";
  if (profile.avatarDataUrl) {
    return (
      <img
        src={profile.avatarDataUrl}
        alt=""
        className={cn(dim, "shrink-0 rounded-full border-2 border-surface object-cover", className)}
      />
    );
  }
  return (
    <span
      className={cn(
        dim,
        "flex shrink-0 items-center justify-center rounded-full border-2 border-surface bg-card font-serif text-accent",
        size === "lg" ? "text-lg" : size === "sm" ? "text-[10px]" : "text-sm",
        className,
      )}
      aria-hidden
    >
      C
    </span>
  );
}

function WarmCover({ coverDataUrl }: { coverDataUrl: string | null }) {
  if (coverDataUrl) {
    return (
      <img
        src={coverDataUrl}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
    );
  }
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(135deg, #f4efe6 0%, #e8dfd0 45%, #d4c4ad 100%)",
      }}
      aria-hidden
    />
  );
}

function PinnedPreview({ html }: { html: string }) {
  if (!html.trim()) {
    return (
      <div className="flex size-full items-center justify-center bg-card text-[10px] text-subtle">
        —
      </div>
    );
  }
  return (
    <iframe
      title=""
      sandbox=""
      srcDoc={html}
      className="pointer-events-none size-full scale-[0.25] origin-top-left"
      style={{ width: "400%", height: "400%" }}
      tabIndex={-1}
    />
  );
}

function EditProfileModal({
  profile,
  onClose,
  onSave,
}: {
  profile: StudioProfile;
  onClose: () => void;
  onSave: (patch: Partial<StudioProfile>) => void;
}) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [handle, setHandle] = useState(profile.handle);
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarDataUrl);
  const [coverPreview, setCoverPreview] = useState<string | null>(profile.coverDataUrl);

  async function pickImage(
    file: File | undefined,
    maxDim: number,
    setter: (url: string) => void,
  ) {
    if (!file?.type.startsWith("image/")) return;
    try {
      setter(await fileToDataUrl(file, maxDim));
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-bg/70 p-2 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Upraviť profil"
        className="max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-xl border border-border bg-surface p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-fg">Upraviť profil</h2>
          <button
            type="button"
            aria-label="Zavrieť"
            onClick={onClose}
            className="rounded-md p-1 text-subtle hover:text-fg"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-subtle">
              Zobrazované meno
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-subtle">
              Handle
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              className="flex-1 rounded-lg border border-border bg-card px-2 py-2 text-xs text-muted hover:text-fg"
            >
              {avatarPreview ? "Zmeniť avatar" : "Pridať avatar"}
            </button>
            <button
              type="button"
              onClick={() => coverRef.current?.click()}
              className="flex-1 rounded-lg border border-border bg-card px-2 py-2 text-xs text-muted hover:text-fg"
            >
              {coverPreview ? "Zmeniť cover" : "Pridať cover"}
            </button>
          </div>
          {avatarPreview || coverPreview ? (
            <button
              type="button"
              onClick={() => {
                setAvatarPreview(null);
                setCoverPreview(null);
              }}
              className="text-xs text-subtle underline hover:text-fg"
            >
              Odstrániť obrázky
            </button>
          ) : null}
        </div>

        <input
          ref={avatarRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => void pickImage(e.target.files?.[0], 128, setAvatarPreview)}
        />
        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => void pickImage(e.target.files?.[0], 640, setCoverPreview)}
        />

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-card"
          >
            Zrušiť
          </button>
          <button
            type="button"
            onClick={() => {
              onSave({
                displayName: displayName.trim() || profile.displayName,
                handle: normalizeHandle(handle),
                avatarDataUrl: avatarPreview,
                coverDataUrl: coverPreview,
              });
              onClose();
            }}
            className="flex-1 rounded-lg bg-accent px-3 py-2 text-sm text-accent-fg hover:opacity-90"
          >
            Uložiť
          </button>
        </div>
      </div>
    </div>
  );
}

export type AccountRailCardProps = {
  collapsed: boolean;
  profile: StudioProfile;
  onProfileChange: (patch: Partial<StudioProfile>) => void;
  recents: StudioRecent[];
  starredIds: Set<string>;
  running: boolean;
  onRecent: (recent: StudioRecent) => void;
  previewHtml: string;
  previewTitle: string;
};

export function AccountRailCard({
  collapsed,
  profile,
  onProfileChange,
  recents,
  starredIds,
  running,
  onRecent,
  previewHtml,
  previewTitle,
}: AccountRailCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const pinned = recents.filter((r) => starredIds.has(r.id));
  const canDownload = Boolean(previewHtml.trim());

  async function handleImagePick(
    file: File | undefined,
    kind: "avatar" | "cover",
  ) {
    if (!file?.type.startsWith("image/")) return;
    try {
      const url = await fileToDataUrl(file, kind === "avatar" ? 128 : 640);
      onProfileChange(
        kind === "avatar" ? { avatarDataUrl: url } : { coverDataUrl: url },
      );
    } catch {
      /* ignore */
    }
  }

  if (collapsed) {
    return (
      <div className="shrink-0 border-t border-border p-2">
        <button
          type="button"
          title={profile.displayName}
          onClick={() => avatarInputRef.current?.click()}
          className="mx-auto flex justify-center rounded-lg p-1 hover:bg-card"
        >
          <CozyAvatar profile={profile} size="md" className="border-border" />
        </button>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => void handleImagePick(e.target.files?.[0], "avatar")}
        />
      </div>
    );
  }

  return (
    <>
      <div className="shrink-0 border-t border-border">
        <div className="relative mx-2 mt-2 overflow-hidden rounded-lg border border-border">
          <button
            type="button"
            aria-label="Nastaviť cover"
            onClick={() => coverInputRef.current?.click()}
            className="relative block h-14 w-full overflow-hidden"
          >
            <WarmCover coverDataUrl={profile.coverDataUrl} />
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => void handleImagePick(e.target.files?.[0], "cover")}
          />

          <div className="absolute -bottom-5 left-2">
            <button
              type="button"
              aria-label="Nastaviť avatar"
              onClick={() => avatarInputRef.current?.click()}
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              <CozyAvatar profile={profile} size="lg" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => void handleImagePick(e.target.files?.[0], "avatar")}
            />
          </div>

          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-md border border-border bg-surface/95 px-2 py-0.5 text-[10px] text-muted backdrop-blur-sm hover:text-fg"
          >
            <Pencil className="size-3" aria-hidden />
            Upraviť profil
          </button>
        </div>

        <div className="space-y-0.5 px-3 pb-2 pt-7">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-sm font-medium text-fg">{profile.displayName}</p>
            <span className="shrink-0 rounded-full border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted">
              Séria {profile.generateCount}
            </span>
          </div>
          <p className="truncate text-xs text-subtle">{profile.handle}</p>
          <p className="text-[10px] leading-snug text-subtle">
            Člen od {formatProfileDate(profile.memberSince)}
            {" · "}
            Naposledy {formatProfileDate(profile.lastActive)}
          </p>
        </div>

        <div className="px-3 pb-2">
          <div className="mb-1.5 flex items-center justify-between gap-1">
            <p className="text-[10px] font-medium uppercase tracking-widest text-subtle">
              Pripnuté
            </p>
            <button
              type="button"
              disabled={!canDownload}
              onClick={() =>
                downloadHtml(slugFromTitle(previewTitle), standaloneHtml(previewHtml))
              }
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium",
                canDownload
                  ? "bg-fg text-bg hover:opacity-90"
                  : "cursor-not-allowed bg-card text-subtle opacity-60",
              )}
            >
              <Download className="size-3" aria-hidden />
              Stiahnuť .html
            </button>
          </div>

          {pinned.length === 0 ? (
            <p className="text-[11px] text-subtle">
              Pripnite hviezdou v posledných.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {pinned.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    disabled={running}
                    onClick={() => onRecent(r)}
                    className={cn(
                      "group relative w-full overflow-hidden rounded-lg border border-border bg-card text-left transition-colors hover:border-accent/40",
                      running && "opacity-50",
                    )}
                  >
                    <Star
                      className="absolute right-1.5 top-1.5 z-10 size-3 text-accent"
                      fill="currentColor"
                      aria-hidden
                    />
                    <div className="relative h-16 overflow-hidden bg-canvas">
                      <PinnedPreview html={r.html} />
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1.5">
                      <CozyAvatar profile={profile} size="sm" className="border-border" />
                      <span className="min-w-0 truncate text-xs font-medium text-fg">
                        {r.title}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {editOpen ? (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSave={onProfileChange}
        />
      ) : null}
    </>
  );
}
