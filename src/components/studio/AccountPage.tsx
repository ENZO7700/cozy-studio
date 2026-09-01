import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Download, Pencil, Star } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CozyAvatar } from "@/components/studio/account/CozyAvatar";
import { WarmCover } from "@/components/studio/account/WarmCover";
import { PinnedPreview } from "@/components/studio/account/PinnedPreview";
import { EditProfileModal } from "@/components/studio/account/EditProfileModal";
import {
  formatProfileDate,
  fileToDataUrl,
  loadProfile,
  saveProfile,
  type StudioProfile,
} from "@/lib/studio/profile";
import {
  loadRecents,
  loadStarredIds,
  toggleStarred,
  type StudioRecent,
} from "@/lib/studio/recents";
import { standaloneHtml } from "@/lib/preview/cozy-elements";
import { downloadHtml, slugFromTitle } from "@/lib/studio/export";
import { readOfflinePreview } from "@/lib/pwa/offline";

function AccountHeader({ profile }: { profile: StudioProfile }) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border px-4 sm:gap-3 sm:px-8">
      <Link
        to="/"
        className="inline-flex h-10 shrink-0 items-center font-serif text-lg tracking-tight"
      >
        Cozy
      </Link>
      <nav className="flex items-center gap-3 text-sm sm:gap-4" aria-label="Hlavná navigácia">
        <Link to="/studio" className="text-muted transition-colors hover:text-fg">
          Studio
        </Link>
        <Link
          to="/account"
          className="font-medium text-fg"
          aria-current="page"
        >
          Účet
        </Link>
      </nav>
      <div className="flex min-w-0 max-w-[40%] items-center justify-end gap-2 sm:max-w-none">
        <span className="hidden truncate text-sm text-muted sm:inline">
          {profile.displayName}
        </span>
        <CozyAvatar profile={profile} size="md" />
      </div>
    </header>
  );
}

function PinnedCard({
  recent,
  profile,
  starred,
  onOpen,
  onToggleStar,
}: {
  recent: StudioRecent;
  profile: StudioProfile;
  starred: boolean;
  onOpen: () => void;
  onToggleStar: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-accent/40">
      <div className="relative aspect-[16/10] overflow-hidden bg-canvas">
        <button
          type="button"
          onClick={onOpen}
          className="block size-full text-left"
          aria-label={`Otvoriť ${recent.title}`}
        >
          <PinnedPreview html={recent.html} />
        </button>
        <button
          type="button"
          aria-label={starred ? "Odopnúť" : "Pripnúť"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar();
          }}
          className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full border border-border bg-surface/95 shadow-sm transition-colors hover:border-accent/50"
        >
          <Star
            className={cn("size-4", starred ? "text-accent" : "text-subtle")}
            fill={starred ? "currentColor" : "none"}
            aria-hidden
          />
        </button>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="w-full space-y-1.5 p-3 text-left"
      >
        <p className="truncate text-sm font-semibold text-fg">{recent.title}</p>
        <div className="flex items-center gap-1.5 text-xs text-subtle">
          <CozyAvatar profile={profile} size="sm" />
          <span className="truncate">od {profile.displayName}</span>
        </div>
      </button>
    </article>
  );
}

function EmptyPinnedSlot() {
  return (
    <div className="overflow-hidden rounded-xl border border-dashed border-border bg-surface/50">
      <div className="flex aspect-[16/10] flex-col items-center justify-center p-6 text-center">
        <Star className="mb-2 size-6 text-subtle" aria-hidden />
        <p className="text-sm text-muted">Pripnite hviezdou v posledných v Studio.</p>
        <Link
          to="/studio"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3")}
        >
          Otvoriť Studio
        </Link>
      </div>
    </div>
  );
}

export function AccountPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudioProfile>(() => loadProfile());
  const [recents, setRecents] = useState<StudioRecent[]>(() => loadRecents());
  const [starredIds, setStarredIds] = useState(() => loadStarredIds());
  const [editOpen, setEditOpen] = useState(false);
  const [downloadable, setDownloadable] = useState<{ html: string; title: string } | null>(
    null,
  );
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const refreshDownloadable = useCallback(() => {
    void readOfflinePreview().then((saved) => {
      if (saved?.html?.trim()) {
        setDownloadable({ html: saved.html, title: saved.title });
        return;
      }
      const recent = loadRecents().find((r) => r.html.trim());
      if (recent) {
        setDownloadable({ html: recent.html, title: recent.title });
      } else {
        setDownloadable(null);
      }
    });
  }, []);

  useEffect(() => {
    setProfile(loadProfile());
    setRecents(loadRecents());
    setStarredIds(loadStarredIds());
    refreshDownloadable();
  }, [refreshDownloadable]);

  const pinned = useMemo(
    () => recents.filter((r) => starredIds.has(r.id)),
    [recents, starredIds],
  );

  function updateProfile(patch: Partial<StudioProfile>) {
    setProfile(saveProfile(patch));
  }

  function unpinRecent(id: string) {
    setStarredIds(toggleStarred(id));
  }

  function openRecentInStudio(recent: StudioRecent) {
    void navigate({ to: "/studio", search: { recent: recent.id } });
  }

  const editButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="bg-surface/95 backdrop-blur-sm"
      onClick={() => setEditOpen(true)}
    >
      <Pencil className="size-4" aria-hidden />
      Upraviť profil
    </Button>
  );

  return (
    <main className="min-h-dvh overflow-x-hidden bg-bg text-fg">
      <AccountHeader profile={profile} />

      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
        <section className="relative">
          <div className="overflow-hidden rounded-3xl">
            <button
              type="button"
              aria-label="Nastaviť cover"
              onClick={() => coverInputRef.current?.click()}
              className="relative block h-40 w-full sm:h-52"
            >
              <WarmCover coverDataUrl={profile.coverDataUrl} />
            </button>
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file?.type.startsWith("image/")) return;
              void fileToDataUrl(file, 1200).then((url) =>
                updateProfile({ coverDataUrl: url }),
              );
              e.target.value = "";
            }}
          />

          <div className="absolute -bottom-11 left-0 z-10 sm:-bottom-12 sm:left-2">
            <button
              type="button"
              aria-label="Nastaviť avatar"
              onClick={() => avatarInputRef.current?.click()}
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              <CozyAvatar profile={profile} size="hero" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file?.type.startsWith("image/")) return;
                void fileToDataUrl(file, 256).then((url) =>
                  updateProfile({ avatarDataUrl: url }),
                );
                e.target.value = "";
              }}
            />
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-3 hidden justify-end px-4 sm:flex">
            <div className="pointer-events-auto">{editButton}</div>
          </div>
        </section>

        <div className="mt-2 flex justify-end sm:hidden">{editButton}</div>

        <section className="mt-12 min-w-0 sm:mt-3 sm:pl-[8.75rem]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              {profile.displayName}
            </h1>
            <span className="rounded-full border border-border bg-card px-3 py-0.5 text-sm text-muted">
              Séria {profile.generateCount}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-subtle">{profile.handle}</p>
          <p className="mt-1 text-sm text-muted">
            Člen od {formatProfileDate(profile.memberSince)}
            {" · "}
            Naposledy {formatProfileDate(profile.lastActive)}
          </p>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Pripnuté</h2>
            <Button
              type="button"
              size="sm"
              disabled={!downloadable}
              onClick={() => {
                if (!downloadable) return;
                downloadHtml(
                  slugFromTitle(downloadable.title),
                  standaloneHtml(downloadable.html),
                );
              }}
            >
              <Download className="size-4" aria-hidden />
              Stiahnuť .html
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pinned.length === 0 ? (
              <EmptyPinnedSlot />
            ) : (
              pinned.map((r) => (
                <PinnedCard
                  key={r.id}
                  recent={r}
                  profile={profile}
                  starred={starredIds.has(r.id)}
                  onOpen={() => openRecentInStudio(r)}
                  onToggleStar={() => unpinRecent(r.id)}
                />
              ))
            )}
          </div>
        </section>

        <p className="mt-12 text-center">
          <Link
            to="/studio"
            className="text-sm text-muted transition-colors hover:text-fg"
          >
            Späť do Studio →
          </Link>
        </p>
      </div>

      {editOpen ? (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSave={(patch) => {
            updateProfile(patch);
            setEditOpen(false);
          }}
        />
      ) : null}
    </main>
  );
}
