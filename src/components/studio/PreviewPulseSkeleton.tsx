import { cn } from "@/lib/utils";

export function PreviewPulseSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="preview-pulse size-3 rounded-full bg-accent/40" />
        <p className="text-sm text-muted">Building preview…</p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-xl border border-border bg-surface p-4">
        <div className="preview-pulse h-4 w-1/3 rounded-md bg-card" />
        <div className="preview-pulse h-3 w-2/3 rounded-md bg-card" />
        <div className="grid flex-1 gap-3 pt-2 sm:grid-cols-3">
          <div className="preview-pulse min-h-24 rounded-lg bg-card" />
          <div className="preview-pulse min-h-24 rounded-lg bg-card" />
          <div className="preview-pulse min-h-24 rounded-lg bg-card" />
        </div>
        <div className="preview-pulse h-10 w-full rounded-lg bg-card" />
      </div>
    </div>
  );
}

export function PreviewPulseOverlay({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex items-end justify-center bg-bg/40 p-4",
        className,
      )}
    >
      <div className="preview-pulse h-2 w-32 rounded-full bg-accent/30" />
    </div>
  );
}
