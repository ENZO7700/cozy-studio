import { useRef, useState } from "react";
import {
  ChevronDown,
  Eye,
  Gem,
  Heart,
  MessageCircle,
  Pencil,
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

const PAPER = "#ffffff";
const INK = "#1a1a1a";

export function CozyAvatar({
  profile,
  size = "md",
  variant = "paper",
  className,
}: {
  profile: StudioProfile;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  variant?: "paper" | "studio";
  className?: string;
}) {
  const dim =
    size === "hero"
      ? "size-[7.5rem]"
      : size === "xl"
        ? "size-24"
        : size === "lg"
          ? "size-16"
          : size === "sm"
            ? "size-6"
            : "size-8";
  const text =
    size === "hero"
      ? "text-5xl"
      : size === "xl"
        ? "text-4xl"
        : size === "lg"
          ? "text-2xl"
          : size === "sm"
            ? "text-[10px]"
            : "text-sm";

  const ring =
    variant === "studio"
      ? "border-2 border-border bg-card text-accent"
      : "border-[5px] border-white bg-[#f4efe6] text-[#c45c38] shadow-sm";

  if (profile.avatarDataUrl) {
    return (
      <img
        src={profile.avatarDataUrl}
        alt=""
        className={cn(dim, "shrink-0 rounded-full object-cover", ring, className)}
      />
    );
  }
  return (
    <span
      className={cn(
        dim,
        "flex shrink-0 items-center justify-center rounded-full font-serif",
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

function CozyWordmark({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#e5e5e5] bg-[#faf8f5] font-serif text-base text-[#c45c38]"
        aria-hidden
      >
        C
      </span>
      {!compact ? (
        <span className="text-lg font-semibold tracking-tight text-[#1a1a1a]">
          Cozy Studio
        </span>
      ) : null}
    </div>
  );
}

function DefaultCover() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #eef4fb 0%, #e8f0f8 35%, #f4efe6 100%)",
      }}
    >
      <svg
        className="absolute inset-0 size-full opacity-[0.35]"
        aria-hidden
        preserveAspectRatio="none"
      >
        <path
          d="M-20 80 Q120 20 280 100 T560 60 T840 90"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
        />
        <path
          d="M-40 140 Q200 90 400 150 T800 120"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
      </svg>
      <div className="absolute right-[12%] top-1/2 -translate-y-1/2 opacity-20">
        <span className="font-serif text-[8rem] text-[#c45c38]" aria-hidden>
          C
        </span>
      </div>
    </div>
  );
}

function CardPreview({ html }: { html: string }) {
  if (!html.trim()) {
    return (
      <div className="flex size-full items-center justify-center bg-[#f8f8f8] text-sm text-[#a3a3a3]">
        —
      </div>
    );
  }
  return (
    <iframe
      title=""
      sandbox=""
      srcDoc={html}
      className="pointer-events-none size-full origin-top-left scale-[0.22]"
      style={{ width: "455%", height: "455%" }}
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
        className="max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-[#1a1a1a]">Upraviť profil</h2>
          <button
            type="button"
            aria-label="Zavrieť"
            onClick={onClose}
            className="rounded-md p-1 text-[#737373] hover:text-[#1a1a1a]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-[#737373]">
              Zobrazované meno
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-[#e5e5e5] bg-white px-2.5 py-1.5 text-sm text-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c45c38]/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-[#737373]">
              Handle
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full rounded-lg border border-[#e5e5e5] bg-white px-2.5 py-1.5 text-sm text-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c45c38]/40"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              className="flex-1 rounded-lg border border-[#e5e5e5] px-2 py-2 text-xs text-[#525252] hover:bg-[#fafafa]"
            >
              {avatarPreview ? "Zmeniť avatar" : "Pridať avatar"}
            </button>
            <button
              type="button"
              onClick={() => coverRef.current?.click()}
              className="flex-1 rounded-lg border border-[#e5e5e5] px-2 py-2 text-xs text-[#525252] hover:bg-[#fafafa]"
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
              className="text-xs text-[#737373] underline hover:text-[#1a1a1a]"
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
            className="flex-1 rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm text-[#525252] hover:bg-[#fafafa]"
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
            className="flex-1 rounded-lg bg-[#1a1a1a] px-3 py-2 text-sm text-white hover:opacity-90"
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
        className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f0f0] px-3 py-1 text-sm text-[#525252] hover:bg-[#e8e8e8]"
      >
        Séria {count}
        <ChevronDown className="size-3.5 text-[#737373]" aria-hidden />
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-label="Zavrieť"
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full z-20 mt-1 w-52 rounded-lg border border-[#e5e5e5] bg-white p-3 text-xs text-[#525252] shadow-md">
            <p className="font-medium text-[#1a1a1a]">Lokálna séria</p>
            <p className="mt-1 leading-relaxed">
              {count} generovaní v tomto prehliadači. Každé nové Generate sériu zvýši.
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
        "w-full max-w-md overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white text-left transition-shadow hover:shadow-md",
        running && "opacity-50",
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f8f8f8] p-6">
        <div className="relative mx-auto h-full max-w-[280px] overflow-hidden rounded-lg border border-[#ebebeb] bg-white shadow-sm">
          <CardPreview html={recent.html} />
        </div>
        <span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full border border-[#e5e5e5] bg-white shadow-sm">
          <Star className="size-4 text-[#1a1a1a]" aria-hidden />
        </span>
      </div>
      <div className="space-y-3 px-4 pb-4 pt-1">
        <p className="text-base font-semibold text-[#1a1a1a]">{recent.title}</p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 text-sm text-[#737373]">
            <CozyAvatar profile={profile} size="sm" />
            <span className="truncate">od {profile.displayName}</span>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-sm text-[#737373]">
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="size-4" aria-hidden />0
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="size-4" aria-hidden />
              {views}
            </span>
            <span className="inline-flex items-center gap-1 text-[#e11d48]">
              <Heart className="size-4" fill="currentColor" aria-hidden />1
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function EmptyPinnedSlot() {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-dashed border-[#d4d4d4] bg-[#fafafa]">
      <div className="flex aspect-[4/3] flex-col items-center justify-center p-8 text-center">
        <span className="mb-3 flex size-10 items-center justify-center rounded-full border border-[#e5e5e5] bg-white">
          <Star className="size-5 text-[#d4d4d4]" aria-hidden />
        </span>
        <p className="text-sm text-[#737373]">Pripnite hviezdou v Recents</p>
      </div>
      <div className="space-y-3 px-4 pb-4 opacity-30">
        <div className="h-4 w-3/5 rounded bg-[#e5e5e5]" />
        <div className="flex justify-between">
          <div className="h-3 w-1/3 rounded bg-[#e5e5e5]" />
          <div className="h-3 w-1/4 rounded bg-[#e5e5e5]" />
        </div>
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
    <div
      className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white text-[#1a1a1a]"
      style={{ background: PAPER, color: INK }}
    >
      {/* Top bar — Cozy Studio wordmark, studio nav, user snippet */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-[#ebebeb] bg-white px-4 sm:px-8">
        <CozyWordmark />
        <nav
          className="hidden items-center gap-6 text-sm text-[#525252] md:flex"
          aria-label="Studio"
        >
          <span className="font-medium text-[#1a1a1a]">Profil</span>
          <button
            type="button"
            onClick={onDiscoverRecents}
            className="hover:text-[#1a1a1a]"
          >
            Recents
          </button>
        </nav>
        <div className="flex items-center gap-2.5">
          <span className="hidden truncate text-sm text-[#525252] sm:inline">
            {profile.displayName}
          </span>
          <CozyAvatar profile={profile} size="md" />
        </div>
      </header>

      {/* Banner — full width, light */}
      <div className="relative h-48 w-full shrink-0 sm:h-56">
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

        {/* Upraviť profil — inside banner, bottom-right */}
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-4 py-2 text-sm text-[#1a1a1a] shadow-sm hover:bg-[#fafafa]"
        >
          <Pencil className="size-4" aria-hidden />
          Upraviť profil
        </button>
      </div>

      {/* Profile identity — avatar overlaps banner, name beside avatar */}
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-8">
        <div className="-mt-[3.75rem] flex items-end gap-5 sm:-mt-[4.25rem] sm:gap-6">
          <button
            type="button"
            aria-label="Nastaviť avatar"
            onClick={() => avatarInputRef.current?.click()}
            className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c45c38]/50"
          >
            <CozyAvatar profile={profile} size="hero" />
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => void handleImagePick(e.target.files?.[0], "avatar")}
          />

          <div className="min-w-0 flex-1 pb-1 pt-8 sm:pt-10">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">
                {profile.displayName}
              </h1>
              <StreakPill count={profile.generateCount} />
            </div>
            <p className="mt-1.5 text-sm text-[#737373]">
              {profile.handle}
              {" · "}
              Člen od {formatMemberSince(profile.memberSince)}
              {" · "}
              Aktívny {formatRelativeActive(profile.lastActive)}
            </p>
          </div>
        </div>

        {/* Pripnuté + Vystaviť projekt */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Pripnuté</h2>
          <div className="relative">
            <button
              type="button"
              disabled={!canPublish}
              onClick={() =>
                downloadHtml(slugFromTitle(previewTitle), standaloneHtml(previewHtml))
              }
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white",
                canPublish
                  ? "bg-[#1a1a1a] hover:bg-[#333]"
                  : "cursor-not-allowed bg-[#a3a3a3]",
              )}
            >
              <Gem className="size-4" aria-hidden />
              Vystaviť projekt
            </button>
            {canPublish ? (
              <span
                className="pointer-events-none absolute -right-3 -top-2.5 rotate-12 rounded-md bg-[#f97316] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm"
                aria-hidden
              >
                New
              </span>
            ) : null}
          </div>
        </div>

        {/* Project cards */}
        <div className="mt-6 flex flex-wrap gap-6">
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

        {/* Footer link */}
        <p className="py-12 text-center">
          <button
            type="button"
            onClick={onDiscoverRecents}
            className="text-sm text-[#737373] hover:text-[#1a1a1a]"
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
