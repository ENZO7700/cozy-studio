export type StudioProfile = {
  displayName: string;
  handle: string;
  avatarDataUrl: string | null;
  coverDataUrl: string | null;
  memberSince: number;
  lastActive: number;
  generateCount: number;
};

const PROFILE_KEY = "cozy-studio-profile";

const DEFAULTS: StudioProfile = {
  displayName: "Lokálny profil",
  handle: "@local",
  avatarDataUrl: null,
  coverDataUrl: null,
  memberSince: Date.now(),
  lastActive: Date.now(),
  generateCount: 0,
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeProfile(profile: StudioProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* quota */
  }
}

export function loadProfile(): StudioProfile {
  const raw = readJson<Partial<StudioProfile> | null>(PROFILE_KEY, null);
  if (!raw || typeof raw !== "object") {
    const fresh = { ...DEFAULTS, memberSince: Date.now(), lastActive: Date.now() };
    writeProfile(fresh);
    return fresh;
  }
  return {
    displayName: raw.displayName ?? DEFAULTS.displayName,
    handle: normalizeHandle(raw.handle ?? DEFAULTS.handle),
    avatarDataUrl: raw.avatarDataUrl ?? null,
    coverDataUrl: raw.coverDataUrl ?? null,
    memberSince: raw.memberSince ?? Date.now(),
    lastActive: raw.lastActive ?? Date.now(),
    generateCount: raw.generateCount ?? 0,
  };
}

export function saveProfile(patch: Partial<StudioProfile>): StudioProfile {
  const prev = loadProfile();
  const next: StudioProfile = {
    ...prev,
    ...patch,
    handle: patch.handle != null ? normalizeHandle(patch.handle) : prev.handle,
  };
  writeProfile(next);
  return next;
}

/** Record generate or revise activity; increments streak on fresh generate only. */
export function touchProfileActivity(opts?: { generated?: boolean }): StudioProfile {
  const prev = loadProfile();
  return saveProfile({
    lastActive: Date.now(),
    generateCount: opts?.generated ? prev.generateCount + 1 : prev.generateCount,
  });
}

export function normalizeHandle(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "@local";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export function formatProfileDate(ts: number): string {
  return new Intl.DateTimeFormat("sk-SK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(ts));
}

export function formatMemberSince(ts: number): string {
  return new Intl.DateTimeFormat("sk-SK", { month: "long", year: "numeric" }).format(
    new Date(ts),
  );
}

export function formatRelativeActive(ts: number): string {
  const diffMs = Date.now() - ts;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "dnes";
  if (days === 1) return "včera";
  if (days < 7) return `pred ${days} dňami`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `pred ${weeks} týždňami`;
  const months = Math.floor(days / 30);
  if (months < 12) return `pred ${months} mesiacmi`;
  const years = Math.floor(days / 365);
  return `pred ${years} rokmi`;
}

/** Resize image file to a data URL capped for localStorage. */
export async function fileToDataUrl(
  file: File,
  maxDim: number,
  quality = 0.82,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const mime = file.type.startsWith("image/png") ? "image/png" : "image/jpeg";
  return canvas.toDataURL(mime, quality);
}
