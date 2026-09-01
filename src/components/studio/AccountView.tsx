import { useRef, useState } from "react";
import {
  ChevronDown,
  Eye,
  Heart,
  MessageCircle,
  Pencil,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudioRecent } from "@/lib/studio/recents";
import {
  fileToDataUrl,
  formatMemberSince,
  formatRelativeActive,
  normalizeHandle,
  type StudioProfile,
} from "@/lib/studio/profile";
import { standaloneHtml } from "@/lib/preview/cozy-elements";
import { downloadHtml, slugFromTitle } from "@/lib/studio/export";

export function CozyAvatar({
  profile,
  size = "md",
  variant = "paper",
  className,
}: {
  profile: StudioProfile;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "paper" | "studio";
  className?: string;
}) {
  const dim =
    size === "xl"
      ? "size-24"
      : size === "lg"
        ? "size-16"
        : size === "sm"
          ? "size-5"
          : "size-8";
  const text =
    size === "xl"
      ? "text-4xl"
      : size === "lg"
        ? "text-2xl"
        : size === "sm"
          ? "text-[10px]"
          : "text-sm";

  const ring =
    variant === "studio"
      ? "border-2 border-border bg-card text-accent"
      : "border-4 border-[#faf8f5] bg-[#f4efe6] text-[#c45c38]";

  if (profile.avatarDataUrl) {
    return (
      <img
        src={profile.avatarDataUrl}
        alt=""
        className={cn(dim, "shrink-0 rounded-full object-cover shadow-sm", ring, className)}
      />
    );
  }
  return (
    <span
      className={cn(
        dim,
        "flex shrink-0 items-center justify-center rounded-full font-serif shadow-sm",
        ring,
        text,
        className,
      )}
      aria-hidden
    >
      C
    </span>
  );
}

function DefaultCover() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, #f4efe6 0%, #ebe3d4 40%, #ddd0ba 100%)",
      }}
    >
      <span
        className="select-none font-serif text-7xl text-[#c45c38]/20 sm:text-8xl"
        aria-hidden
      >
        C
      </span>
    </div>
  );
}

function CardPreview({ html }: { html: string }) {
  if (!html.trim()) {
    return (
      <div className="flex size-full items-center justify-center bg-[#f4efe6] text-sm text-[#8a7f70]">
        —
      </div>
    );
  }
  return (
    <iframe
      title=""
      sandbox=""
      srcDoc={html}
      className="pointer-events-none size-full origin-top-left scale-[0.2]"
      style={{ width: "500%", height: "500%" }}
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
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-2 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Upraviť profil"
        className="max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-xl border border-[#ddd0ba] bg-[#faf8f5] p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-[#1c1915]">Upraviť profil</h2>
          <button
            type="button"
            aria-label="Zavrieť"
            onClick={onClose}
            className="rounded-md p-1 text-[#8a7f70] hover:text-[#1c1915]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-[#8a7f70]">
              Zobrazované meno
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-[#ddd0ba] bg-white px-2.5 py-1.5 text-sm text-[#1c1915] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c45c38]/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-[#8a7f70]">
              Handle
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full rounded-lg border border-[#ddd0ba] bg-white px-2.5 py-1.5 text-sm text-[#1c1915] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c45c38]/40"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              className="flex-1 rounded-lg border border-[#ddd0ba] bg-white px-2 py-2 text-xs text-[#4a433a] hover:text-[#1c1915]"
            >
              {avatarPreview ? "Zmeniť avatar" : "Pridať avatar"}
            </button>
            <button
              type="button"
              onClick={() => coverRef.current?.click()}
              className="flex-1 rounded-lg border border-[#ddd0ba] bg-white px-2 py-2 text-xs text-[#4a433a] hover:text-[#1c1915]"
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
              className="text-xs text-[#8a7f70] underline hover:text-[#1c1915]"
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
          onChange={(e) => void pickImage(e.target.files?.[0], 256, setAvatarPreview)}
        />
        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => void pickImage(e.target.files?.[0], 1200, setCoverPreview)}
        />

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-[#ddd0ba] px-3 py-2 text-sm text-[#4a433a] hover:bg-white"
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
            className="flex-1 rounded-lg bg-[#1c1915] px-3 py-2 text-sm text-white hover:opacity-90"
          >
            Uložiť
          </button>
        </div>
      </div>
    </div>
  );
}

function StreakPill({ count }: { count: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-full border border-[#ddd0ba] bg-white px-3 py-1 text-sm text-[#4a433a] hover:bg-[#f4efe6]"
      >
        Séria {count}
        <ChevronDown className="size-3.5" aria-hidden />
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-label="Zavrieť"
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full z-20 mt-1 w-52 rounded-lg border border-[#ddd0ba] bg-white p-3 text-xs text-[#4a433a] shadow-md">
            <p className="font-medium text-[#1c1915]">Lokálna séria</p>
            <p className="mt-1 leading-relaxed">
              {count} generovaní v tomto prehliadači. Každé nové Generate sériu
              zvýši.
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}

function PinnedCard({
  recent,
  profile,
  views,
  running,
  onOpen,
}: {
  recent: StudioRecent;
  profile: StudioProfile;
  views: number;
  running: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      disabled={running}
      onClick={onOpen}
      className={cn(
        "group overflow-hidden rounded-xl border border-[#ddd0ba] bg-white text-left shadow-sm transition-shadow hover:shadow-md",
        running && "opacity-50",
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#f4efe6]">
        <CardPreview html={recent.html} />
        <span className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full border border-[#ddd0ba] bg-white/90">
          <Star className="size-3.5 text-[#c45c38]" fill="currentColor" aria-hidden />
        </span>
      </div>
      <div className="space-y-2 p-3">
        <p className="truncate text-sm font-semibold text-[#1c1915]">{recent.title}</p>
        <div className="flex items-center gap-1.5 text-xs text-[#8a7f70]">
          <CozyAvatar profile={profile} size="sm" className="border-[#faf8f5]" />
          <span className="truncate">od {profile.displayName}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#8a7f70]">
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="size-3.5" aria-hidden />0
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="size-3.5" aria-hidden />
            {views}
          </span>
          <span className="inline-flex items-center gap-1 text-[#c45c38]">
            <Heart className="size-3.5" fill="currentColor" aria-hidden />1
          </span>
        </div>
      </div>
    </button>
  );
}

function EmptyPinnedSlot() {
  return (
    <div className="overflow-hidden rounded-xl border border-dashed border-[#ddd0ba] bg-white/60 shadow-sm">
      <div className="flex aspect-[16/10] flex-col items-center justify-center p-6 text-center">
        <Star className="mb-2 size-6 text-[#ddd0ba]" aria-hidden />
        <p className="text-sm text-[#8a7f70]">Pripnite hviezdou v Recents</p>
      </div>
      <div className="space-y-2 p-3 opacity-40">
        <div className="h-4 w-2/3 rounded bg-[#f4efe6]" />
        <div className="h-3 w-1/2 rounded bg-[#f4efe6]" />
      </div>
    </div>
  );
}

export type AccountViewProps = {
  profile: StudioProfile;
  onProfileChange: (patch: Partial<StudioProfile>) => void;
  recents: StudioRecent[];
  starredIds: Set<string>;
  running: boolean;
  previewHtml: string;
  previewTitle: string;
  onRecent: (recent: StudioRecent) => void;
  onDiscoverRecents: () => void;
};

export function AccountView({
  profile,
  onProfileChange,
  recents,
  starredIds,
  running,
  previewHtml,
  previewTitle,
  onRecent,
  onDiscoverRecents,
}: AccountViewProps) {
  const [editOpen, setEditOpen] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const pinned = recents.filter((r) => starredIds.has(r.id));
  const canPublish = Boolean(previewHtml.trim());

  async function handleImagePick(
    file: File | undefined,
    kind: "avatar" | "cover",
  ) {
    if (!file?.type.startsWith("image/")) return;
    try {
      const url = await fileToDataUrl(file, kind === "avatar" ? 256 : 1200);
      onProfileChange(
        kind === "avatar" ? { avatarDataUrl: url } : { coverDataUrl: url },
      );
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#faf8f5] text-[#1c1915]">
      <div className="relative h-44 sm:h-52">
        <button
          type="button"
          aria-label="Nastaviť cover"
          onClick={() => coverInputRef.current?.click()}
          className="relative block size-full overflow-hidden"
        >
          {profile.coverDataUrl ? (
            <img
              src={profile.coverDataUrl}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <DefaultCover />
          )}
        </button>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => void handleImagePick(e.target.files?.[0], "cover")}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto max-w-4xl px-4 sm:px-6">
          <div className="pointer-events-auto absolute -bottom-12 left-4 sm:left-6">
            <button
              type="button"
              aria-label="Nastaviť avatar"
              onClick={() => avatarInputRef.current?.click()}
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c45c38]/50"
            >
              <CozyAvatar profile={profile} size="xl" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => void handleImagePick(e.target.files?.[0], "avatar")}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-10 pt-14 sm:px-6 sm:pt-16">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#ddd0ba] bg-white px-4 py-2 text-sm text-[#1c1915] shadow-sm hover:bg-[#f4efe6]"
          >
            <Pencil className="size-4" aria-hidden />
            Upraviť profil
          </button>
        </div>

        <div className="mb-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {profile.displayName}
          </h1>
          <StreakPill count={profile.generateCount} />
        </div>

        <p className="mb-8 text-sm text-[#8a7f70]">
          {profile.handle}
          {" · "}
          Člen od {formatMemberSince(profile.memberSince)}
          {" · "}
          Naposledy {formatRelativeActive(profile.lastActive)}
        </p>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium">Pripnuté</h2>
          <div className="relative">
            <button
              type="button"
              disabled={!canPublish}
              onClick={() =>
                downloadHtml(slugFromTitle(previewTitle), standaloneHtml(previewHtml))
              }
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm",
                canPublish
                  ? "bg-[#1c1915] hover:opacity-90"
                  : "cursor-not-allowed bg-[#8a7f70]/60",
              )}
            >
              <Sparkles className="size-4" aria-hidden />
              Vystaviť projekt
            </button>
            {canPublish ? (
              <span className="absolute -right-2 -top-2 rotate-6 rounded bg-[#c45c38] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                New
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pinned.length === 0 ? (
            <EmptyPinnedSlot />
          ) : (
            pinned.map((r) => (
              <PinnedCard
                key={r.id}
                recent={r}
                profile={profile}
                views={profile.generateCount}
                running={running}
                onOpen={() => onRecent(r)}
              />
            ))
          )}
        </div>

        <p className="mt-10 text-center">
          <button
            type="button"
            onClick={onDiscoverRecents}
            className="text-sm text-[#4a433a] underline decoration-[#ddd0ba] underline-offset-4 hover:text-[#1c1915]"
          >
            Objavte ďalšie projekty v Recents →
          </button>
        </p>
      </div>

      {editOpen ? (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSave={onProfileChange}
        />
      ) : null}
    </div>
  );
}
