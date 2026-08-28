import { RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Starter } from "@/lib/preview/starters";

type StarterConfigCanvasProps = {
  starter: Starter;
  selectedAddonIds: ReadonlySet<string>;
  running: boolean;
  online: boolean;
  onToggleAddon: (addonId: string) => void;
  onResetSelection: () => void;
  onGenerate: () => void;
};

export function StarterConfigCanvas({
  starter,
  selectedAddonIds,
  running,
  online,
  onToggleAddon,
  onResetSelection,
  onGenerate,
}: StarterConfigCanvasProps) {
  const selectedCount = selectedAddonIds.size;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-bg p-4 sm:p-6">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <header className="space-y-2 border-b border-border pb-4">
          <p className="text-[10px] font-medium uppercase tracking-widest text-subtle">
            Configure starter
          </p>
          <h2 className="font-serif text-2xl tracking-tight text-fg">{starter.label}</h2>
          <p className="text-sm leading-relaxed text-muted">{starter.description}</p>
        </header>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-medium uppercase tracking-widest text-subtle">
              Add-ons
            </h3>
            <p className="text-xs text-muted">
              {selectedCount} selected
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {starter.addons.map((addon) => {
              const selected = selectedAddonIds.has(addon.id);
              return (
                <button
                  key={addon.id}
                  type="button"
                  disabled={running}
                  aria-pressed={selected}
                  onClick={() => onToggleAddon(addon.id)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left transition-colors",
                    selected
                      ? "border-accent bg-accent/15 text-fg ring-1 ring-accent/40"
                      : "border-border bg-card text-fg hover:border-accent/40 hover:bg-surface",
                    running && "pointer-events-none opacity-50",
                  )}
                >
                  <p className="text-sm font-medium">{addon.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">{addon.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Button type="button" disabled={running} onClick={onGenerate}>
            {online ? "Generate" : "Generate locally"}
            <Send className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={running || selectedCount === 0}
            onClick={onResetSelection}
          >
            Reset selection
            <RotateCcw className="size-4" />
          </Button>
          <p className="w-full text-xs text-subtle sm:w-auto sm:flex-1 sm:text-right">
            Base layout only is fine — add-ons are optional.
          </p>
        </div>
      </div>
    </div>
  );
}
