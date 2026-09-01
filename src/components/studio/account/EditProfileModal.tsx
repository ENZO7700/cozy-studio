import { useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fileToDataUrl,
  normalizeHandle,
  type StudioProfile,
} from "@/lib/studio/profile";

export function EditProfileModal({
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-bg/80 p-2 sm:items-center"
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => avatarRef.current?.click()}
            >
              {avatarPreview ? "Zmeniť avatar" : "Pridať avatar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => coverRef.current?.click()}
            >
              {coverPreview ? "Zmeniť cover" : "Pridať cover"}
            </Button>
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
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Zrušiť
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={() => {
              onSave({
                displayName: displayName.trim() || profile.displayName,
                handle: normalizeHandle(handle),
                avatarDataUrl: avatarPreview,
                coverDataUrl: coverPreview,
              });
              onClose();
            }}
          >
            Uložiť
          </Button>
        </div>
      </div>
    </div>
  );
}
